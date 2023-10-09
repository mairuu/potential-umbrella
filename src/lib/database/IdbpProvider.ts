import type { DBSchema, IDBPDatabase } from 'idb';

export interface IdbpProvider<DbTypes extends DBSchema> {
	idbp: Promise<IDBPDatabase<DbTypes>>;
}
