import type { DBSchema, IDBPTransaction, StoreNames } from 'idb';

/**
 * Call `track(storeName, key)` inside a write function to declare which
 * records were mutated. This drives downstream LiveQuery invalidation.
 */
export type Tracker = (storeName: string, key: IDBValidKey) => void;

export interface WriteBuilder<S extends DBSchema, Stores extends ArrayLike<StoreNames<S>>> {
	/**
	 * Provide the write function. `track` must be called for every record
	 * that is inserted, updated, or deleted so that dependent LiveQueries
	 * are notified. Returns a Promise of the value returned by `fn`.
	 */
	run<T>(fn: (tx: IDBPTransaction<S, Stores, 'readwrite'>, track: Tracker) => Promise<T>): Promise<T>;
}
