export type Resource<T> = ResourceLoading<T> | ResourceSuccess<T> | ResourceError<T>;

export interface ResourceLoading<T> {
	readonly status: 'loading';
	readonly data: T | null;
}

export interface ResourceSuccess<T> {
	readonly status: 'success';
	readonly data: T;
}

export interface ResourceError<T> {
	readonly status: 'error';
	readonly data: T | null;
	readonly error: unknown;
}

export function resourceLoading<T>(data: T | null = null): ResourceLoading<T> {
	return { status: 'loading', data };
}

export function resourceSuccess<T>(data: T): ResourceSuccess<T> {
	return { status: 'success', data };
}

export function resourceError<T>(error: unknown, data: T | null = null): ResourceError<T> {
	return { status: 'error', data, error };
}

export function isLoading<T>(r: Resource<T>): r is ResourceLoading<T> {
	return r.status === 'loading';
}

export function isSuccess<T>(r: Resource<T>): r is ResourceSuccess<T> {
	return r.status === 'success';
}

export function isError<T>(r: Resource<T>): r is ResourceError<T> {
	return r.status === 'error';
}
