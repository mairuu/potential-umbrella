import type { DBSchema, IDBPTransaction, StoreKey, StoreNames } from 'idb';
import type { Observable } from 'rxjs';
import type { Changes } from './Changes';
import type { IdbpProvider } from './IdbpProvider';
import { LiveQueryImpl } from './LiveQueryImpl';
import type { ReadBuilder } from './ReadBuilder';
import type { LiveQuery } from './LiveQuery';

export class ReadBuilderImpl<S extends DBSchema, Stores extends ArrayLike<StoreNames<S>>>
	implements ReadBuilder<S, Stores>
{
	private _observing?: [string, IDBKeyRange | null][];

	constructor(
		private _provider: IdbpProvider<S>,
		private _changes$: Observable<Changes>,
		private _stores: Stores
	) {}

	observeOn<Store extends StoreNames<S>>(
		store: Store,
		key: StoreKey<S, Store> | IDBKeyRange | null = null
	): this {
		if (!this._observing) {
			this._observing = [];
		}
		this._observing.push([
			store as string,
			key instanceof IDBKeyRange ? key : key === null ? null : IDBKeyRange.only(key)
		]);
		return this;
	}

	run<T>(fn: (tx: IDBPTransaction<S, Stores, 'readonly'>) => Promise<T>): LiveQuery<T> {
		const exec = async (): Promise<T> => {
			const db = await this._provider.getDatabase();
			const tx = db.transaction(this._stores, 'readonly');
			return fn(tx);
		};
		return new LiveQueryImpl(this._changes$, this._observing, exec);
	}
}
