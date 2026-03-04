import type { Observable } from 'rxjs';
import { CachingReadBuilder } from './CachingReadBuilder';
import type { Changes } from './Changes';
import type { Database } from './Database';
import type { ReadBuilder } from './ReadBuilder';
import { QueryCache } from './QueryCache';
import type { WriteBuilder } from './WriteBuilder';

export class CachingDatabase<ReadTx, WriteTx> implements Database<ReadTx, WriteTx> {
	private _cache: QueryCache;

	constructor(private _inner: Database<ReadTx, WriteTx>) {
		// Cache subscribes directly to the inner change stream.
		// Both local writes and BroadcastChannel-received changes flow through
		// this same observable, so cross-tab invalidation is automatic.
		this._cache = new QueryCache(_inner.changes());
	}

	read(): ReadBuilder<ReadTx> {
		return new CachingReadBuilder(this._inner.read(), this._cache);
	}

	write(): WriteBuilder<WriteTx> {
		// Writes pass straight through — cache eviction is handled by changes$
		return this._inner.write();
	}

	changes(): Observable<Changes> {
		return this._inner.changes();
	}
}
