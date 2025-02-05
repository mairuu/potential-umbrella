import type { DBSchema, IDBPTransaction, StoreNames } from 'idb';
import { ChangesBuilder, type Changes } from './Changes';

export interface Transactor<
	DbTypes extends DBSchema,
	Stores extends ArrayLike<StoreNames<DbTypes>>,
	Mode extends IDBTransactionMode,
	Value
> {
	(tx: IDBPTransaction<DbTypes, Stores, Mode>): Promise<TransactorResult<Value>>;
}

export type TransactorResult<Value> = [Value, Changes];

export class TransactorResultBuilder<Value = void> {
	private _value: any;
	private _changeBuilder = new ChangesBuilder();

	withChanges(storeName: string, key: IDBValidKey) {
		this._changeBuilder.add(storeName, key);
		return this;
	}

	withValue<Value>(value: Value) {
		this._value = value;
		return this as unknown as TransactorResultBuilder<Value>;
	}

	build(): TransactorResult<Value> {
		return [this._value, this._changeBuilder.build()];
	}
}
