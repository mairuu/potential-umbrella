import type { DBSchema, StoreNames } from 'idb';
import type { Transactor } from './Transactor';

export interface Query<
	DbTypes extends DBSchema,
	Stores extends ArrayLike<StoreNames<DbTypes>>,
	Mode extends IDBTransactionMode,
	Value
> {
	mode: Mode;
	stores: Stores;
	transactor: Transactor<DbTypes, Stores, Mode, Value>;
}
