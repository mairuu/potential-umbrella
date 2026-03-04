import type { Observable } from 'rxjs';
import type { Changes } from './Changes';
import { LiveQueryImpl } from './LiveQueryImpl';
import type { ReadBuilder } from './ReadBuilder';
import type { LiveQuery } from './LiveQuery';

export class ReadBuilderImpl<Tx> implements ReadBuilder<Tx> {
	private _observing?: [string, IDBKeyRange | null][];

	constructor(
		private _changes$: Observable<Changes>,
		private _openTx: () => Promise<Tx>
	) {}

	observeOn(store: string, key: IDBValidKey | IDBKeyRange | null = null): this {
		if (!this._observing) {
			this._observing = [];
		}
		this._observing.push([
			store,
			key instanceof IDBKeyRange ? key : key === null ? null : IDBKeyRange.only(key)
		]);
		return this;
	}

	run<T>(fn: (tx: Tx) => Promise<T>): LiveQuery<T> {
		const exec = async (): Promise<T> => fn(await this._openTx());
		return new LiveQueryImpl(this._changes$, this._observing, exec);
	}
}
