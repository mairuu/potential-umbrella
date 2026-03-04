import type { DBSchema, IDBPTransaction, StoreNames } from 'idb';
import { ChangesBuilder } from './Changes';
import type { IdbpProvider } from './IdbpProvider';
import type { WriteBuilder, Tracker } from './WriteBuilder';
import type { Changes } from './Changes';

export class WriteBuilderImpl<S extends DBSchema, Stores extends ArrayLike<StoreNames<S>>>
	implements WriteBuilder<S, Stores>
{
	constructor(
		private _provider: IdbpProvider<S>,
		private _stores: Stores,
		private _notify: (changes: Changes) => void
	) {}

	async run<T>(
		fn: (tx: IDBPTransaction<S, Stores, 'readwrite'>, track: Tracker) => Promise<T>
	): Promise<T> {
		const db = await this._provider.getDatabase();
		const tx = db.transaction(this._stores, 'readwrite');
		const builder = new ChangesBuilder();

		const track: Tracker = (storeName, key) => {
			builder.add(storeName, key);
		};

		const value = await fn(tx, track);

		const changes = builder.build();
		if (changes.valid()) {
			tx.done.then(() => this._notify(changes));
		}

		return value;
	}
}
