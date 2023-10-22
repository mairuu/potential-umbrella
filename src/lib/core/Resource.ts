export type Resource<T> = ResourceSuccess<T> | ResourcePending<T>;

export interface ResourcePending<T> {
	type: ResourceType.Pending;
	data: T | null;
}

export interface ResourceSuccess<T> {
	type: ResourceType.Success;
	data: T;
}

export enum ResourceType {
	Pending,
	Success
}

export function resourcePending<T>(data: T | null = null): ResourcePending<T> {
	return { type: ResourceType.Pending, data };
}

export function resourceSuccess<T>(data: T): ResourceSuccess<T> {
	return { type: ResourceType.Success, data };
}

export function isResourcePending<T>(resource?: Resource<T>): resource is ResourcePending<T> {
	return resource?.type === ResourceType.Pending;
}

export function isResourceSuccess<T>(resource?: Resource<T>): resource is ResourceSuccess<T> {
	return resource?.type === ResourceType.Success;
}
