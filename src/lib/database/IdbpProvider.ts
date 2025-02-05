import type { DBSchema, IDBPDatabase } from 'idb';

export interface IdbpProvider<DbTypes extends DBSchema> {
	getDatabase(): Promise<IDBPDatabase<DbTypes>>;
}
