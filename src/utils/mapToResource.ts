import { map, startWith, type Observable, catchError, of } from 'rxjs';
import { resourceSucess, type Resource, resourceLoading, resourceError } from '~/utils/resource';

export function mapToResource<T>(observable: Observable<T>): Observable<Resource<T>> {
	return observable.pipe(
		map(resourceSucess),
		startWith(resourceLoading<T>(null)),
		catchError((err) => of(resourceError<T>(err)))
	);
}
