import { openDB, type IDBPDatabase } from 'idb';
import type { IdbpProvider } from '~/lib/database/IdbpProvider';
import {
	CHAPTER_STORE_INDEX_PROJECT,
	CHAPTER_STORE_INDEX_PROJECT_KEYPATH,
	CHAPTER_STORE_INDEX_READ,
	CHAPTER_STORE_INDEX_READ_KEYPATH,
	CHAPTER_STORE_KEYPATH,
	CHAPTER_STORE_NAME,
	PROJECT_STORE_INDEX_FAVORITE,
	PROJECT_STORE_INDEX_FAVORITE_KEYPATH,
	PROJECT_STORE_KEYPATH,
	PROJECT_STORE_NAME,
	type TofuDbSchema
} from './TofuDbSchema';

export const TOFU_DB_NAME = 'tofu-db';
export const TOFU_DB_VERSION = 1;

async function openTofuDb() {
	return openDB<TofuDbSchema>(TOFU_DB_NAME, TOFU_DB_VERSION, {
		blocked(currentVersion, blockedVersion, event) {},
		blocking(currentVersion, blockedVersion, event) {},
		terminated() {},
		upgrade(db, oldVersion, newVersion, transaction, event) {
			switch (oldVersion) {
				case 0: {
					const projectStore = db.createObjectStore(PROJECT_STORE_NAME, {
						keyPath: PROJECT_STORE_KEYPATH
					});
					projectStore.createIndex(
						PROJECT_STORE_INDEX_FAVORITE,
						PROJECT_STORE_INDEX_FAVORITE_KEYPATH
					);

					const chapterStore = db.createObjectStore(CHAPTER_STORE_NAME, {
						keyPath: CHAPTER_STORE_KEYPATH
					});
					chapterStore.createIndex(
						CHAPTER_STORE_INDEX_PROJECT,
						CHAPTER_STORE_INDEX_PROJECT_KEYPATH
					);
					chapterStore.createIndex(CHAPTER_STORE_INDEX_READ, CHAPTER_STORE_INDEX_READ_KEYPATH);
				}
			}
		}
	});
}

export class TofuIdbpProvider implements IdbpProvider<TofuDbSchema> {
	private _idbp: Promise<IDBPDatabase<TofuDbSchema>> = openTofuDb();

	getDatabase(): Promise<IDBPDatabase<TofuDbSchema>> {
		return this._idbp;
	}
}
