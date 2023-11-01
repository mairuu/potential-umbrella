export abstract class Resource<T> {
	constructor(public data: T | null = null) {}

	isSucess(): this is ResourceSucess<T> {
		return this instanceof ResourceSucess;
	}

	isLoading(): this is ResourceLoading<T> {
		return this instanceof ResourceLoading;
	}

	isError(): this is ResourceError<T> {
		return this instanceof ResourceError;
	}
}

class ResourceSucess<T> extends Resource<T> {
	constructor(public override data: T) {
		super();
	}
}

class ResourceLoading<T> extends Resource<T> {}

class ResourceError<T> extends Resource<T> {
	constructor(
		public error: unknown,
		data: T | null = null
	) {
		super(data);
	}
}

export function resourceSucess<T>(...args: ConstructorParameters<typeof ResourceSucess<T>>) {
	return new ResourceSucess(...args);
}

export function resourceLoading<T>(...args: ConstructorParameters<typeof ResourceLoading<T>>) {
	return new ResourceLoading(...args);
}

export function resourceError<T>(...args: ConstructorParameters<typeof ResourceError<T>>) {
	return new ResourceError(...args);
}
