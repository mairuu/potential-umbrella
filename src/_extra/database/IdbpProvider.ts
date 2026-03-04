import type { DBSchema, IDBPDatabase } from 'idb';

export interface IdbpProvider<S extends DBSchema> {
	getDatabase(): Promise<IDBPDatabase<S>>;
}
