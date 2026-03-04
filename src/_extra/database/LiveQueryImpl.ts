import { from, startWith, filter, switchMap, map, catchError, of, type Observable } from 'rxjs';
import type { Changes } from './Changes';
import type { LiveQuery } from './LiveQuery';
import { resourceLoading, resourceSuccess, resourceError, type Resource } from './Resource';

export class LiveQueryImpl<T> implements LiveQuery<T> {
	constructor(
		private _changes$: Observable<Changes>,
		private _observing: [string, IDBKeyRange | null][] | undefined,
		private _exec: () => Promise<T>
	) {}

	subscribe(run: (value: Resource<T>) => void): () => void {
		const subscription = this._toObservable().subscribe(run);
		return () => subscription.unsubscribe();
	}

	once(): Promise<T> {
		return this._exec();
	}

	private _toObservable(): Observable<Resource<T>> {
		return this._changes$.pipe(
			startWith(null),
			filter((changes) => this._shouldUpdate(changes)),
			switchMap(() =>
				// Error boundary is per-emission: a failed query emits ResourceError
				// but does NOT terminate the outer stream, so future changes still re-fetch.
				from(this._exec()).pipe(
					map((value) => resourceSuccess(value)),
					catchError((err) => of(resourceError<T>(err)))
				)
			),
			startWith(resourceLoading<T>())
		);
	}

	private _shouldUpdate(changes: Changes | null): boolean {
		if (!changes) {
			return true;
		}

		if (!changes.valid()) {
			return false;
		}

		if (!this._observing) {
			return true;
		}

		for (const [storeName, range] of this._observing) {
			const keys = changes.get(storeName);
			if (!keys) {
				continue;
			}
			const matches = range === null || keys.some((key) => range.includes(key));
			if (matches) {
				return true;
			}
		}

		return false;
	}
}

