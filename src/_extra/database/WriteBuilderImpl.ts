import { ChangesBuilder } from './Changes';
import type { WriteBuilder, Tracker } from './WriteBuilder';
import type { Changes } from './Changes';

export class WriteBuilderImpl<Tx> implements WriteBuilder<Tx> {
	constructor(
		private _openTx: () => Promise<[Tx, Promise<void>]>,
		private _notify: (changes: Changes) => void
	) {}

	async run<T>(fn: (tx: Tx, track: Tracker) => Promise<T>): Promise<T> {
		const [tx, done] = await this._openTx();
		const builder = new ChangesBuilder();

		const track: Tracker = (storeName, key) => {
			builder.add(storeName, key);
		};

		const value = await fn(tx, track);

		const changes = builder.build();
		if (changes.valid()) {
			done.then(() => this._notify(changes));
		}

		return value;
	}
}
