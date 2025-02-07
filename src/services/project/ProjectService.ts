import { type Database } from '~/core/database/Database';
import { TransactorResultBuilder } from '~/core/database/Transactor';
import { type ChapterEntity } from '~/data/local/entities/ChapterEntity';
import { type ProjectEntity } from '~/data/local/entities/ProjectEntity';
import {
	CHAPTER_STORE_INDEX_PROJECT,
	CHAPTER_STORE_NAME,
	PROJECT_STORE_INDEX_FAVORITE,
	PROJECT_STORE_NAME,
	type TofuDbSchema
} from '~/data/local/schema/TofuDbSchema';
import { ProjectApi } from '~/data/remote/apis/ProjectApi';
import { type ProjectEntriesResponse } from '~/data/remote/types/project';
import { partialAssign } from '~/utils/partialAssign';

export class ProjectService {
	constructor(
		private _db: Database<TofuDbSchema>,
		private _api: ProjectApi
	) {}

	private _prepareGet(projectId: number) {
		return this._db
			.query([PROJECT_STORE_NAME])
			.observeOn(PROJECT_STORE_NAME, projectId)
			.handledBy(async (tx) => {
				const project = await tx.objectStore(PROJECT_STORE_NAME).get(projectId);
				return new TransactorResultBuilder().withValue(project).build();
			});
	}

	getById(projectId: number) {
		return this._prepareGet(projectId).exec();
	}

	subsribeById(projectId: number) {
		return this._prepareGet(projectId).$();
	}

	update(projectUpdate: Pick<ProjectEntity, 'id'> & Partial<ProjectEntity>) {
		return this._db
			.mutate([PROJECT_STORE_NAME])
			.handledBy(async (tx) => {
				const projectStore = tx.objectStore(PROJECT_STORE_NAME);
				const project = await projectStore.get(projectUpdate.id);
				if (!project) {
					throw new Error(`cannot update project id ${projectUpdate.id}`);
				}
				partialAssign(project, projectUpdate);
				const affectedProjectId = await projectStore.put(project);
				return new TransactorResultBuilder()
					.withChanges(PROJECT_STORE_NAME, affectedProjectId)
					.build();
			})
			.exec();
	}

	async remotesToLocals(remoteProjects: ProjectEntriesResponse) {
		return this._db
			.mutate([PROJECT_STORE_NAME])
			.handledBy(async (tx) => {
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
			})
			.exec();
	}

	async initialize(projectId: number) {
		// Todo: Guard the initialization somehow.
		const detail = await this._api.getDetail(projectId);

		await this._db
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

	async sync(projectId: number) {
		const detail = await this._api.getDetail(projectId);

		await this._db
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
				const localChapters = await chapterStore
					.index(CHAPTER_STORE_INDEX_PROJECT)
					.getAll(projectId);
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

	subsribeAllFavorites() {
		return this._db
			.query([PROJECT_STORE_NAME])
			.observeOn(PROJECT_STORE_NAME)
			.handledBy(async (tx) => {
				const result = await tx
					.objectStore(PROJECT_STORE_NAME)
					.index(PROJECT_STORE_INDEX_FAVORITE)
					.getAllKeys(IDBKeyRange.lowerBound(0, true));

				return new TransactorResultBuilder().withValue(result).build();
			})
			.$();
	}
}
