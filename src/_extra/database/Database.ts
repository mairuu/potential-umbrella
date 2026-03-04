import type { DBSchema, StoreNames } from 'idb';
import type { Observable } from 'rxjs';
import type { Changes } from './Changes';
import type { ReadBuilder } from './ReadBuilder';
import type { WriteBuilder } from './WriteBuilder';

export interface Database<S extends DBSchema> {
	read<Stores extends ArrayLike<StoreNames<S>>>(stores: Stores): ReadBuilder<S, Stores>;
	write<Stores extends ArrayLike<StoreNames<S>>>(stores: Stores): WriteBuilder<S, Stores>;
	changes(): Observable<Changes>;
}
