import type { LiveQuery } from './LiveQuery';
import type { QueryCache } from './QueryCache';
import type { ReadBuilder } from './ReadBuilder';

export class CachingReadBuilder<Tx> implements ReadBuilder<Tx> {
	constructor(
		private _inner: ReadBuilder<Tx>,
		private _cache: QueryCache
	) {}

	observeOn(store: string, key?: IDBValidKey | IDBKeyRange | null): this {
		this._inner.observeOn(store, key);
		return this;
	}

	run<T>(fn: (tx: Tx) => Promise<T>): LiveQuery<T> {
		// Only cache when observeOn was called with a single exact key.
		// A single IDBKeyRange.only() has .lower === .upper and is not open on either bound.
		const cacheEntry = this._resolveCacheEntry();

		if (!cacheEntry) {
			// Range query or unscoped — bypass cache entirely
			return this._inner.run(fn);
		}

		const { storeName, key } = cacheEntry;
		const cache = this._cache;

		return this._inner.run(async (tx) => {
			if (cache.has(storeName, key)) {
				return cache.get<T>(storeName, key) as T;
			}
			const value = await fn(tx);
			cache.set(storeName, key, value);
			return value;
		});
	}

	/**
	 * Returns the single (storeName, key) pair if the builder was configured
	 * with exactly one observeOn pointing at a single key — otherwise null.
	 */
	private _resolveCacheEntry(): { storeName: string; key: IDBValidKey } | null {
		// Access the observing list from the inner impl via a duck-typed check
		const inner = this._inner as unknown as { _observing?: [string, IDBKeyRange | null][] };
		const observing = inner._observing;

		if (!observing || observing.length !== 1) {
			return null;
		}

		const [storeName, range] = observing[0];

		if (!range) {
			return null;
		}

		// IDBKeyRange.only(x) has lower === upper, both bounds closed
		if (range.lower !== range.upper || range.lowerOpen || range.upperOpen) {
			return null;
		}

		return { storeName, key: range.lower as IDBValidKey };
	}
}
