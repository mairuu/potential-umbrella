import type { DBSchema, StoreNames } from 'idb';
import { Subject, type Observable } from 'rxjs';
import { Changes } from './Changes';
import type { Database } from './Database';
import type { IdbpProvider } from './IdbpProvider';
import type { ReadBuilder } from './ReadBuilder';
import { ReadBuilderImpl } from './ReadBuilderImpl';
import type { WriteBuilder } from './WriteBuilder';
import { WriteBuilderImpl } from './WriteBuilderImpl';

export class DatabaseImpl<S extends DBSchema> implements Database<S> {
	private _changes$ = new Subject<Changes>();

	constructor(
		private _provider: IdbpProvider<S>,
		private _bc: BroadcastChannel
	) {
		_bc.onmessage = (ev) => this._changes$.next(Changes.deSerialize(ev.data));
	}

	read<Stores extends ArrayLike<StoreNames<S>>>(stores: Stores): ReadBuilder<S, Stores> {
		return new ReadBuilderImpl(this._provider, this._changes$.asObservable(), stores);
	}

	write<Stores extends ArrayLike<StoreNames<S>>>(stores: Stores): WriteBuilder<S, Stores> {
		return new WriteBuilderImpl(this._provider, stores, (changes: Changes) => {
			this._changes$.next(changes);
			this._bc.postMessage(changes.serialize());
		});
	}

	changes(): Observable<Changes> {
		return this._changes$.asObservable();
	}
}
