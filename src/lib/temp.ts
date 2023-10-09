import { map, startWith, type Observable } from 'rxjs';
import {
	CHAPTER_STORE_INDEX_PROJECT,
	CHAPTER_STORE_NAME,
	PROJECT_STORE_NAME,
	type TofuDbSchema
} from '~/data/database/TofuDbSchema';
import type { ChapterEntity } from '~/data/database/entities/ChapterEntity';
import { resourcePending, resourceSucess, type Resource } from './core/Resouce';
import type { Transactor } from './database/Transactor';
import { db } from './module';

export function mapToResource<T>(observable: Observable<T>): Observable<Resource<T>> {
	return observable.pipe(map(resourceSucess), startWith(resourcePending(null)));
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

export async function serachProjcts(
	{
		keyword = '',
		genres = [],
		types = []
	}: { keyword?: string | null; genres?: string[] | null; types?: string[] | null },
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
	{ type, page = 0, takes = 12 }: { type: string; page?: number; takes?: number },
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
	const serach = new URLSearchParams();
	serach.set('pid', projectId.toString());
	serach.sort();

	const response = await fetch('/api/project/detail?' + serach.toString(), {
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

	db.mutate([PROJECT_STORE_NAME, CHAPTER_STORE_NAME])
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
