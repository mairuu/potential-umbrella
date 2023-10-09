import type { DBSchema, StoreNames } from 'idb';
import type { Observable } from 'rxjs';
import type { Changes } from './Changes';
import type { OpeartionBuilder } from './OperationBuilder';
import type { Query } from './Query';

export interface Database<DbTypes extends DBSchema> {
	query<Stores extends ArrayLike<StoreNames<DbTypes>>>(
		stores: Stores
	): OpeartionBuilder<DbTypes, Stores, 'readonly'>;

	mutate<Stores extends ArrayLike<StoreNames<DbTypes>>>(
		stores: Stores
	): OpeartionBuilder<DbTypes, Stores, 'readwrite'>;

	execQuery<Stores extends ArrayLike<StoreNames<DbTypes>>, Mode extends IDBTransactionMode, Value>(
		query: Query<DbTypes, Stores, Mode, Value>
	): Promise<Value>;

	changes(): Observable<Changes>;

	notifyChanges(changes: Changes): void;
}
