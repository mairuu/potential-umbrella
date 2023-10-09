import type { DBSchema, StoreKey, StoreNames } from 'idb';
import type { PreparedOperation } from './PreparedOperation';
import type { Transactor } from './Transactor';

export interface OpeartionBuilder<
	DbTypes extends DBSchema,
	Stores extends ArrayLike<StoreNames<DbTypes>>,
	Mode extends IDBTransactionMode
> {
	observeOn<Store extends StoreNames<DbTypes>>(
		store: Store,
		key?: StoreKey<DbTypes, Store> | IDBKeyRange | null
	): this;

	handledBy<Value>(transactor: Transactor<DbTypes, Stores, Mode, Value>): PreparedOperation<Value>;
}
