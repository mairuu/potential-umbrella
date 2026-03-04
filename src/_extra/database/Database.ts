import type { Observable } from 'rxjs';
import type { Changes } from './Changes';
import type { ReadBuilder } from './ReadBuilder';
import type { WriteBuilder } from './WriteBuilder';

export interface Database<ReadTx, WriteTx> {
	read(): ReadBuilder<ReadTx>;
	write(): WriteBuilder<WriteTx>;
	changes(): Observable<Changes>;
}
