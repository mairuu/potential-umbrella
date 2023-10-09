import type { DBSchema, IDBPTransaction, StoreNames } from 'idb';
import type { Changes } from './Changes';

export interface Transactor<
	DbTypes extends DBSchema,
	Stores extends ArrayLike<StoreNames<DbTypes>>,
	Mode extends IDBTransactionMode,
	Value
> {
	(tx: IDBPTransaction<DbTypes, Stores, Mode>): TransactorResult<Mode, Value>;
}

export type TransactorResult<Mode extends IDBTransactionMode, Value> = Mode extends 'readonly'
	? Promise<Value>
	: Promise<[Value] | [Value, Changes]>;
