import type { DBSchema, StoreNames } from 'idb';
import { Subject, type Observable } from 'rxjs';
import { Changes } from './Changes';
import type { Database } from './Database';
import type { IdbpProvider } from './IdbpProvider';
import type { OpeartionBuilder } from './OperationBuilder';
import { OpeartionBuilderImpl } from './OperationBuilderImpl';
import type { Query } from './Query';

export class DatabaseImpl<DbTypes extends DBSchema> implements Database<DbTypes> {
	private _changes$ = new Subject<Changes>();

	constructor(
		private _provider: IdbpProvider<DbTypes>,
		private _bc: BroadcastChannel
	) {
		_bc.onmessage = (ev) => this._changes$.next(Changes.deSerialize(ev.data));
	}

	query<Stores extends ArrayLike<StoreNames<DbTypes>>>(
		stores: Stores
	): OpeartionBuilder<DbTypes, Stores, 'readonly'> {
		return new OpeartionBuilderImpl(this, stores, 'readonly');
	}

	mutate<Stores extends ArrayLike<StoreNames<DbTypes>>>(
		stores: Stores
	): OpeartionBuilder<DbTypes, Stores, 'readwrite'> {
		return new OpeartionBuilderImpl(this, stores, 'readwrite');
	}

	async execQuery<
		Stores extends ArrayLike<StoreNames<DbTypes>>,
		Mode extends IDBTransactionMode,
		Value
	>(query: Query<DbTypes, Stores, Mode, Value>): Promise<Value> {
		const db = await this._provider.getDatabase();
		const tx = db.transaction(query.stores, query.mode);
		const [value, changes] = await query.transactor(tx);

		if (changes.valid()) {
			tx.done.then(() => {
				this.notifyChanges(changes);
			});
		}

		return value;
	}

	changes(): Observable<Changes> {
		return this._changes$.asObservable();
	}

	notifyChanges(changes: Changes): void {
		this._changes$.next(changes);
		this._bc.postMessage(changes.serialize());
	}
}
