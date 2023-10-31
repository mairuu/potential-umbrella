import { map, startWith, type Observable } from 'rxjs';
import {
	CHAPTER_STORE_INDEX_PROJECT,
	CHAPTER_STORE_NAME,
	PROJECT_STORE_NAME,
	type TofuDbSchema
} from '~/data/database/TofuDbSchema';
import type { ChapterEntity } from '~/data/database/entities/ChapterEntity';
import { resourcePending, resourceSuccess, type Resource } from './core/Resource';
import type { Transactor } from './database/Transactor';
import { db } from '~/module';
import type { ProjectType } from '~/domain/project/ProjectType';
import type { ProjectGenre } from '~/domain/project/ProjectGenre';
import type { ProjectEntity } from '~/data/database/entities/ProjectEntity';

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
	return observable.pipe(map(resourceSuccess), startWith(resourcePending(null)));
}

export function getProjectById(projectId: number) {
	return db
		.query([PROJECT_STORE_NAME])
		.observeOn(PROJECT_STORE_NAME, projectId)
		.handledBy((tx) => tx.objectStore(PROJECT_STORE_NAME).get(projectId));
}

export function getChaptersByProjectId(id: number) {
	return db
		.query([CHAPTER_STORE_NAME])
		.observeOn(CHAPTER_STORE_NAME)
		.handledBy(async (tx) =>
			tx.objectStore(CHAPTER_STORE_NAME).index(CHAPTER_STORE_INDEX_PROJECT).getAll(id)
		);
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

			return [
				undefined,
				[
					[PROJECT_STORE_NAME, [await putProjectResult]],
					[CHAPTER_STORE_NAME, await putChapterResults]
				]
			];
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

		return [await Promise.all(putResults) /* silence */];
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
		let putResult = await projectStore.put(project);
		return [void 0, [[PROJECT_STORE_NAME, [putResult]]]];
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
		let putResult = await chapterStore.put(chapter);
		return [void 0, [[CHAPTER_STORE_NAME, [putResult]]]];
	};
}
