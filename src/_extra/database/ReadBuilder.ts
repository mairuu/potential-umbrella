import type { LiveQuery } from './LiveQuery';

export interface ReadBuilder<Tx> {
	/**
	 * Constrain reactivity to a specific store, optionally scoped to a key or key range.
	 * Can be called multiple times to observe multiple stores/keys.
	 * If never called, the query re-runs on any change.
	 */
	observeOn(store: string, key?: IDBValidKey | IDBKeyRange | null): this;

	/**
	 * Provide the read function. Returns a LiveQuery (Svelte store + .once()).
	 */
	run<T>(fn: (tx: Tx) => Promise<T>): LiveQuery<T>;
}
