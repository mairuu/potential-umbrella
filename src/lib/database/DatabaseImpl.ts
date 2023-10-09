import type { DBSchema, StoreNames } from 'idb';
import { Subject, type Observable } from 'rxjs';
import type { Changes } from './Changes';
import type { Database } from './Database';
import type { IdbpProvider } from './IdbpProvider';
import type { OpeartionBuilder } from './OperationBuilder';
import { OpeartionBuilderImpl } from './OperationBuilderImpl';
import type { Query } from './Query';
import type { TransactorResult } from './Transactor';

export class DatabaseImpl<DbTypes extends DBSchema> implements Database<DbTypes> {
	private _changes$ = new Subject<Changes>();

	constructor(private _provider: IdbpProvider<DbTypes>, private _bc: BroadcastChannel) {
		_bc.onmessage = (ev) => this._changes$.next(ev.data);
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
		const db = await this._provider.idbp;
		const tx = db.transaction(query.stores, query.mode);
		const result = await query.transactor(tx);

		if (tx.mode === 'readonly') {
			return result as Awaited<TransactorResult<'readonly', Value>>;
		} else {
			const [value, changes] = result as Awaited<TransactorResult<'readwrite', Value>>;

			if (changes) {
				tx.done.then(() => {
					this.notifyChanges(changes);
				});
			}

			return value;
		}
	}

	changes(): Observable<Changes> {
		return this._changes$.asObservable();
	}

	notifyChanges(changes: Changes): void {
		this._changes$.next(changes);
		this._bc.postMessage(changes);
	}
}
