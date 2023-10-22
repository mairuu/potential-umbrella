import type { DBSchema, StoreKey, StoreNames } from 'idb';
import type { Database } from './Database';
import type { OpeartionBuilder } from './OperationBuilder';
import type { PreparedOperation } from './PreparedOperation';
import { PreparedOperationImpl } from './PreparedOperationImpl';
import type { Query } from './Query';
import type { Transactor } from './Transactor';

export class OpeartionBuilderImpl<
	DbTypes extends DBSchema,
	Stores extends ArrayLike<StoreNames<DbTypes>>,
	Mode extends IDBTransactionMode
> implements OpeartionBuilder<DbTypes, Stores, Mode>
{
	private _observing?: [string, IDBKeyRange | null][];

	constructor(private _db: Database<DbTypes>, private _stores: Stores, private mode: Mode) {}

	observeOn<Store extends StoreNames<DbTypes>>(
		store: Store,
		key: StoreKey<DbTypes, Store> | IDBKeyRange | null = null
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

	handledBy<Value>(transactor: Transactor<DbTypes, Stores, Mode, Value>): PreparedOperation<Value> {
		const query: Query<DbTypes, Stores, Mode, Value> = {
			mode: this.mode,
			stores: this._stores,
			transactor
		};

		return new PreparedOperationImpl(this._db, query, this._observing);
	}
}
