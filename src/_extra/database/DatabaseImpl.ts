import type { DBSchema, IDBPTransaction, StoreNames } from 'idb';
import { Subject, type Observable } from 'rxjs';
import { Changes } from './Changes';
import type { Database } from './Database';
import type { IdbpProvider } from './IdbpProvider';
import type { ReadBuilder } from './ReadBuilder';
import { ReadBuilderImpl } from './ReadBuilderImpl';
import type { WriteBuilder } from './WriteBuilder';
import { WriteBuilderImpl } from './WriteBuilderImpl';

type IdbReadTx<S extends DBSchema, Stores extends ArrayLike<StoreNames<S>>> = IDBPTransaction<
	S,
	Stores,
	'readonly'
>;
type IdbWriteTx<S extends DBSchema, Stores extends ArrayLike<StoreNames<S>>> = IDBPTransaction<
	S,
	Stores,
	'readwrite'
>;

export class IdbDatabaseImpl<
	S extends DBSchema,
	Stores extends ArrayLike<StoreNames<S>> = ArrayLike<StoreNames<S>>
> implements Database<IdbReadTx<S, Stores>, IdbWriteTx<S, Stores>>
{
	private _changes$ = new Subject<Changes>();
		private _stores: Promise<Stores>;

	constructor(
		private _provider: IdbpProvider<S>,
		private _bc: BroadcastChannel
	) {
		_bc.onmessage = (ev) => this._changes$.next(Changes.deSerialize(ev.data));
        this._stores = this._provider.getDatabase().then((db) => Array.from(db.objectStoreNames) as unknown as Stores);
	}

	read(): ReadBuilder<IdbReadTx<S, Stores>> {
		return new ReadBuilderImpl(this._changes$.asObservable(), async () => {
			const db = await this._provider.getDatabase();
			return db.transaction(await this._stores, 'readonly');
		});
	}

	write(): WriteBuilder<IdbWriteTx<S, Stores>> {
		return new WriteBuilderImpl(
			async () => {
				const db = await this._provider.getDatabase();
				const tx = db.transaction(await this._stores, 'readwrite');
				return [tx, tx.done];
			},
			(changes: Changes) => {
				this._changes$.next(changes);
				this._bc.postMessage(changes.serialize());
			}
		);
	}

	changes(): Observable<Changes> {
		return this._changes$.asObservable();
	}
}
