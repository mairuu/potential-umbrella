import { type Database } from '~/core/database/Database';
import { TransactorResultBuilder } from '~/core/database/Transactor';
import { type ChapterEntity } from '~/data/local/entities/ChapterEntity';
import { type ProjectEntity } from '~/data/local/entities/ProjectEntity';
import {
	CHAPTER_STORE_INDEX_PROJECT,
	CHAPTER_STORE_INDEX_READ,
	CHAPTER_STORE_NAME,
	PROJECT_STORE_NAME,
	type TofuDbSchema
} from '~/data/local/schema/TofuDbSchema';
import { type ChapterApi } from '~/data/remote/apis/ChapterApi';
import { partialAssign } from '~/utils/partialAssign';

export class ChapterService {
	constructor(
		private _db: Database<TofuDbSchema>,
		private _api: ChapterApi
	) {}

	getContent(params: { projectId: number; chapterId: number }) {
		return this._api.getContent(params);
	}

	update(chapterUpdate: Pick<ChapterEntity, 'id'> & Partial<ChapterEntity>) {
		return this._db
			.mutate([CHAPTER_STORE_NAME])
			.handledBy(async (tx) => {
				const chapterStore = tx.objectStore(CHAPTER_STORE_NAME);
				let chapter = await chapterStore.get(chapterUpdate.id);
				if (!chapter) {
					throw new Error(`cannot update chapter id ${chapterUpdate.id}`);
				}
				partialAssign(chapter, chapterUpdate);
				const affeftedChapterId = await chapterStore.put(chapter);
				return new TransactorResultBuilder()
					.withChanges(CHAPTER_STORE_NAME, affeftedChapterId)
					.build();
			})
			.exec();
	}

	subscribeByProjectId(projectId: number) {
		return this._db
			.query([CHAPTER_STORE_NAME])
			.observeOn(CHAPTER_STORE_NAME)
			.handledBy(async (tx) => {
				const chapters = await tx
					.objectStore(CHAPTER_STORE_NAME)
					.index(CHAPTER_STORE_INDEX_PROJECT)
					.getAll(projectId);
				return new TransactorResultBuilder().withValue(chapters).build();
			})
			.$();
	}

	subscribeRead() {
		return this._db
			.query([CHAPTER_STORE_NAME, PROJECT_STORE_NAME])
			.handledBy(async (tx) => {
				const projectsStore = tx.objectStore(PROJECT_STORE_NAME);
				const chaptersStore = tx.objectStore(CHAPTER_STORE_NAME);
				type ProjectChapter = { project: ProjectEntity; chapter: ChapterEntity };

				let set: Set<number> = new Set();
				let arr: ProjectChapter[] = [];
				let cursor = await chaptersStore
					.index(CHAPTER_STORE_INDEX_READ)
					.openCursor(IDBKeyRange.lowerBound(0, true), 'prev');

				while (cursor) {
					if (!set.has(cursor.value.pid)) {
						set.add(cursor.value.pid);
						let project = await projectsStore.get(cursor.value.pid);
						arr.push({ project: project!, chapter: cursor.value });
					}

					cursor = await cursor.continue();
				}

				return new TransactorResultBuilder().withValue(arr).build();
			})
			.$();
	}
}
