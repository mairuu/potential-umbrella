import type { DBSchema, IDBPTransaction, StoreKey, StoreNames } from 'idb';
import type { LiveQuery } from './LiveQuery';

export interface ReadBuilder<S extends DBSchema, Stores extends ArrayLike<StoreNames<S>>> {
	/**
	 * Constrain reactivity to a specific store, optionally scoped to a key or key range.
	 * Can be called multiple times to observe multiple stores.
	 * If never called, the query re-runs on any change.
	 */
	observeOn<Store extends StoreNames<S>>(
		store: Store,
		key?: StoreKey<S, Store> | IDBKeyRange | null
	): this;

	/**
	 * Provide the read function. Returns a LiveQuery (Svelte store + .once()).
	 */
	run<T>(fn: (tx: IDBPTransaction<S, Stores, 'readonly'>) => Promise<T>): LiveQuery<T>;
}
