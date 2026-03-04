import type { Observable } from 'rxjs';
import type { Changes } from './Changes';

function cacheKey(storeName: string, key: IDBValidKey): string {
	return `${storeName}::${JSON.stringify(key)}`;
}

export class QueryCache {
	private _store = new Map<string, unknown>();

	constructor(changes$: Observable<Changes>) {
		changes$.subscribe((changes) => {
			for (const [storeName, keys] of changes) {
				for (const key of keys) {
					this._store.delete(cacheKey(storeName, key));
				}
			}
		});
	}

    // todo: add ttl
	get<T>(storeName: string, key: IDBValidKey): T | undefined {
		return this._store.get(cacheKey(storeName, key)) as T | undefined;
	}

    // todo: add ttl
	set<T>(storeName: string, key: IDBValidKey, value: T): void {
		this._store.set(cacheKey(storeName, key), value);
	}

    // todo: add ttl
	has(storeName: string, key: IDBValidKey): boolean {
		return this._store.has(cacheKey(storeName, key));
	}
}
