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
		private _observings?: [string, IDBKeyRange | null][]
	) {}

	$(): Observable<Value> {
		return this._db.changes().pipe(
			startWith(null),
			filter((changes) => {
				if (!this._observings || !changes) {
					return true;
				}

				const observings = this._observings;

				return changes.some(([affectedStoreName, affectedKeys]) => {
					return observings.some(([observingStoreName, observingRange]) => {
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
