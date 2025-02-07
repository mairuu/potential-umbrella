import type { Observable } from 'rxjs';

export interface PreparedOperation<Value> {
	$(): Observable<Value>;
	exec(): Promise<Value>;
}
