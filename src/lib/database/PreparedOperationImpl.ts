import type { DBSchema, StoreNames } from 'idb';
import { filter, startWith, switchMap, type Observable } from 'rxjs';
import type { Database } from './Database';
import type { PreparedOperation } from './PreparedOperation';
import type { Query } from './Query';

export class PreparedOperationImpl<
	DbTypes extends DBSchema,
	Stores extends ArrayLike<StoreNames<DbTypes>>,
	Mode extends IDBTransactionMode,
	Value
> implements PreparedOperation<Value>
{
	constructor(
		private _db: Database<DbTypes>,
		private _query: Query<DbTypes, Stores, Mode, Value>,
		private _observing?: [string, IDBKeyRange | null][]
	) {}

	$(): Observable<Value> {
		return this._db.changes().pipe(
			startWith(null),
			filter((changes) => {
				if (!this._observing || !changes) {
					return true;
				}

				const observing = this._observing;

				return changes.some(([affectedStoreName, affectedKeys]) => {
					return observing.some(([observingStoreName, observingRange]) => {
						return (
							affectedStoreName === observingStoreName &&
							(observingRange === null || affectedKeys.some((key) => observingRange.includes(key)))
						);
					});
				});
			}),
			switchMap(() => this.exec())
		);
	}

	exec(): Promise<Value> {
		return this._db.execQuery(this._query);
	}
}
