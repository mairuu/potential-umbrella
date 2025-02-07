import { map, startWith, type Observable, catchError, of } from 'rxjs';
import {
	CHAPTER_STORE_INDEX_PROJECT,
	CHAPTER_STORE_NAME,
	PROJECT_STORE_NAME,
	type TofuDbSchema
} from '~/data/schema/TofuDbSchema';
import type { ChapterEntity } from '~/data/entities/ChapterEntity';
import { TransactorResultBuilder, type Transactor } from './database/Transactor';
import { db } from '~/module';
import type { ProjectType } from '~/services/project/projectTypes';
import type { ProjectGenre } from '~/services/project/projectGenres';
import type { ProjectEntity } from '~/data/entities/ProjectEntity';
import { resourceSucess, type Resource, resourceLoading, resourceError } from '~/utils/resource';

export function groupBy<K extends string | symbol, T>(
	items: T[],
	predicate: (value: T, index: number) => K
): Record<K, T[]> {
	const grouped = {} as Record<K, T[]>;
	items.forEach((value, i) => {
		const key = predicate(value, i);
		(grouped[key] || (grouped[key] = [])).push(value);
	});
	return grouped;
}

export function partialAssign<T extends object>(target: T, partial: Partial<T>) {
	for (const prop in partial) {
		if (prop in target) {
			target[prop] = partial[prop]!;
		}
	}
	return target;
}

export function mapToResource<T>(observable: Observable<T>): Observable<Resource<T>> {
	return observable.pipe(
		map(resourceSucess),
		startWith(resourceLoading<T>(null)),
		catchError((err) => of(resourceError<T>(err)))
	);
}

export function getProjectById(projectId: number) {
	return db
		.query([PROJECT_STORE_NAME])
		.observeOn(PROJECT_STORE_NAME, projectId)
		.handledBy(async (tx) => {
			const project = await tx.objectStore(PROJECT_STORE_NAME).get(projectId);
			return new TransactorResultBuilder().withValue(project).build();
		});
}

export function getChaptersByProjectId(projectId: number) {
	return db
		.query([CHAPTER_STORE_NAME])
		.observeOn(CHAPTER_STORE_NAME)
		.handledBy(async (tx) => {
			const chapters = await tx
				.objectStore(CHAPTER_STORE_NAME)
				.index(CHAPTER_STORE_INDEX_PROJECT)
				.getAll(projectId);
			return new TransactorResultBuilder().withValue(chapters).build();
		});
}

export async function searchProjects(
	{
		keyword = '',
		genres = [],
		types = []
	}: { keyword?: string | null; genres?: ProjectGenre[] | null; types?: ProjectType[] | null },
	{ signal }: { signal?: AbortSignal } = {}
) {
	const search = new URLSearchParams();
	keyword?.length && search.set('keyword', keyword);
	genres?.length && search.set('genres', genres.join('.'));
	types?.length && search.set('types', types.join('.'));
	search.sort();

	const response = await fetch('/api/project/search?' + search.toString(), {
		signal
	});
	const items: { id: number; name: string }[] = await response.json();
	return items;
}

export async function fetchLatestProjects(
	{ type, page = 0, takes = 12 }: { type: ProjectType; page?: number; takes?: number },
	{ signal }: { signal?: AbortSignal } = {}
) {
	const search = new URLSearchParams();
	search.set('type', type);
	search.set('page', page.toString());
	search.set('takes', takes.toString());
	search.sort();

	const response = await fetch('/api/project/latest?' + search.toString(), {
		signal
	});
	const model: { id: number; name: string }[] = await response.json();
	return model;
}

export async function fetchProjectDetail(
	{ projectId }: { projectId: number },
	{ signal }: { signal?: AbortSignal } = {}
) {
	const search = new URLSearchParams();
	search.set('pid', projectId.toString());
	search.sort();

	const response = await fetch('/api/project/detail?' + search.toString(), {
		signal
	});
	const model: {
		project: {
			id: number;
			name: string;
			type: string;
			genres: string[];
			synopsis: string;
		};
		chapters: Array<{
			id: number;
			no: number;
			name: string;
			provider: string;
			create: number;
		}>;
	} = await response.json();
	return model;
}

export async function fetchChapterContent(
	{ projectId, chapterId }: { chapterId: number; projectId: number },
	{ signal }: { signal?: AbortSignal } = {}
) {
	const serach = new URLSearchParams();
	serach.set('pid', projectId.toString());
	serach.set('cid', chapterId.toString());
	serach.sort();

	const response = await fetch(`/api/chapter/content?` + serach.toString(), {
		signal
	});
	const model: {
		content: string | { name: string; width: number; height: number }[];
	} = await response.json();
	return model;
}

export async function initializeProject(projectId: number) {
	// Todo: Guard the initialization somehow.

	const detail = await fetchProjectDetail({ projectId });

	await db
		.mutate([PROJECT_STORE_NAME, CHAPTER_STORE_NAME])
		.handledBy(async (tx) => {
			const projectStore = tx.objectStore(PROJECT_STORE_NAME);
			const chapterStore = tx.objectStore(CHAPTER_STORE_NAME);

			let project = await projectStore.get(detail.project.id);

			if (!project) {
				project = {
					id: 0,
					name: '',
					type: '',
					genres: [],
					synopsis: '',
					favorite: 0,
					initialized: false
				};
			}

			project.id = detail.project.id;
			project.name = detail.project.name;
			project.type = detail.project.type;
			project.genres = detail.project.genres;
			project.synopsis = detail.project.synopsis;
			project.initialized = true;

			const putProjectResult = projectStore.put(project);

			const putChapterResults = Promise.all(
				detail.chapters.map((sChapter) => {
					const chapter: ChapterEntity = {
						id: 0,
						pid: 0,
						no: 0,
						name: '',
						read: 0,
						create: 0,
						progress: 0,
						provider: ''
					};

					chapter.id = sChapter.id;
					chapter.pid = detail.project.id;
					chapter.no = sChapter.no;
					chapter.name = sChapter.name;
					chapter.create = sChapter.create;
					chapter.provider = sChapter.provider;

					return chapterStore.put(chapter);
				})
			);

			return new TransactorResultBuilder()
				.withChanges(PROJECT_STORE_NAME, await putProjectResult)
				.withChanges(CHAPTER_STORE_NAME, await putChapterResults)
				.build();
		})
		.exec();
}

export async function syncProject(projectId: number) {
	const detail = await fetchProjectDetail({ projectId });

	await db
		.mutate([PROJECT_STORE_NAME, CHAPTER_STORE_NAME])
		.handledBy(async (tx) => {
			const projectStore = tx.objectStore(PROJECT_STORE_NAME);
			const chapterStore = tx.objectStore(CHAPTER_STORE_NAME);

			const localProject = await projectStore.get(projectId);
			if (!localProject) {
				return new TransactorResultBuilder().build();
			}

			const affeftedProjectIds: number[] = [];
			const affeftedChapterIds: number[] = [];
			const jobs: Promise<unknown>[] = [];

			// update project
			const remoteProject = detail.project;
			if (
				localProject.name !== remoteProject.name ||
				localProject.type !== remoteProject.type ||
				localProject.genres.toString() !== remoteProject.genres.toString() ||
				localProject.synopsis !== remoteProject.synopsis
			) {
				localProject.name = remoteProject.name;
				localProject.type = remoteProject.type;
				localProject.genres = remoteProject.genres;
				localProject.synopsis = remoteProject.synopsis;

				affeftedProjectIds.push(localProject.id);
				jobs.push(projectStore.put(localProject));
			}

			// update chapters
			const localChapters = await chapterStore.index(CHAPTER_STORE_INDEX_PROJECT).getAll(projectId);
			const remoteChapters = detail.chapters;

			const localChapterById = new Map<ChapterEntity['id'], ChapterEntity>();
			for (const localChapter of localChapters) {
				localChapterById.set(localChapter.id, localChapter);
			}

			const toAdds = [];
			const toUpdates = [];

			for (const remoteChapter of remoteChapters) {
				const localChapter = localChapterById.get(remoteChapter.id);
				if (!localChapter) {
					toAdds.push(remoteChapter);
					continue;
				}
				localChapterById.delete(localChapter.id);

				if (
					localChapter.name !== remoteChapter.name ||
					localChapter.provider !== remoteChapter.provider
				) {
					toUpdates.push([localChapter, remoteChapter] as const);
				}
			}

			const toDeletes = [...localChapterById.values()];

			// dispatch

			for (const toAdd of toAdds) {
				const chapter: ChapterEntity = {
					id: 0,
					pid: 0,
					no: 0,
					name: '',
					read: 0,
					create: 0,
					progress: 0,
					provider: ''
				};

				chapter.id = toAdd.id;
				chapter.pid = detail.project.id;
				chapter.no = toAdd.no;
				chapter.name = toAdd.name;
				chapter.create = toAdd.create;
				chapter.provider = toAdd.provider;

				affeftedChapterIds.push(chapter.id);
				jobs.push(chapterStore.put(chapter));
			}

			for (const [local, remote] of toUpdates) {
				local.name = remote.name;
				local.provider = remote.provider;
				affeftedChapterIds.push(local.id);
				jobs.push(chapterStore.put(local));
			}

			for (const toDelete of toDeletes) {
				affeftedChapterIds.push(toDelete.id);
				jobs.push(chapterStore.delete(toDelete.id));
			}

			await Promise.all(jobs);

			return new TransactorResultBuilder()
				.withChanges(PROJECT_STORE_NAME, affeftedProjectIds)
				.withChanges(CHAPTER_STORE_NAME, affeftedChapterIds)
				.build();
		})
		.exec();
}

export function remoteToLocalProject(
	remoteProjects: { id: number; name: string }[]
): Transactor<TofuDbSchema, (typeof PROJECT_STORE_NAME)[], 'readwrite', number[]> {
	return async (tx) => {
		const projectStore = tx.objectStore(PROJECT_STORE_NAME);
		const putResults = remoteProjects.map(async (remoteProject) => {
			let project = await projectStore.get(remoteProject.id);

			if (!project) {
				project = {
					id: remoteProject.id,
					name: remoteProject.name,
					type: '',
					genres: [],
					synopsis: '',
					favorite: 0,
					initialized: false
				};

				await projectStore.put(project);
			}
			return project.id;
		});

		const affeftedProjectIds = await Promise.all(putResults);

		return (
			new TransactorResultBuilder()
				// silence
				// .withChanges(PROJECT_STORE_NAME, affeftedProjectIds)
				.withValue(affeftedProjectIds)
				.build()
		);
	};
}

export function updateProject(
	projectUpdate: Pick<ProjectEntity, 'id'> & Partial<ProjectEntity>
): Transactor<TofuDbSchema, (typeof PROJECT_STORE_NAME)[], 'readwrite', void> {
	return async (tx) => {
		const projectStore = tx.objectStore(PROJECT_STORE_NAME);
		let project = await projectStore.get(projectUpdate.id);
		if (!project) {
			throw new Error(`cannot update project id ${projectUpdate.id}`);
		}
		partialAssign(project, projectUpdate);
		const affectedProjectId = await projectStore.put(project);
		return new TransactorResultBuilder().withChanges(PROJECT_STORE_NAME, affectedProjectId).build();
	};
}

export function updateChapter(
	chapterUpdate: Pick<ChapterEntity, 'id'> & Partial<ChapterEntity>
): Transactor<TofuDbSchema, (typeof CHAPTER_STORE_NAME)[], 'readwrite', void> {
	return async (tx) => {
		const chapterStore = tx.objectStore(CHAPTER_STORE_NAME);
		let chapter = await chapterStore.get(chapterUpdate.id);
		if (!chapter) {
			throw new Error(`cannot update chapter id ${chapterUpdate.id}`);
		}
		partialAssign(chapter, chapterUpdate);
		const affeftedChapterId = await chapterStore.put(chapter);
		return new TransactorResultBuilder().withChanges(PROJECT_STORE_NAME, affeftedChapterId).build();
	};
}
