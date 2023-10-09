export type Resource<T> = ResourceSucess<T> | ResourcePending<T>;

export interface ResourcePending<T> {
	type: ResourceType.Pending;
	data: T | null;
}

export interface ResourceSucess<T> {
	type: ResourceType.Sucess;
	data: T;
}

export enum ResourceType {
	Pending,
	Sucess
}

export function resourcePending<T>(data: T | null = null): ResourcePending<T> {
	return { type: ResourceType.Pending, data };
}

export function resourceSucess<T>(data: T): ResourceSucess<T> {
	return { type: ResourceType.Sucess, data };
}

export function isResourcePending<T>(resource?: Resource<T>): resource is ResourcePending<T> {
	return resource?.type === ResourceType.Pending;
}

export function isResourceSucess<T>(resource?: Resource<T>): resource is ResourceSucess<T> {
	return resource?.type === ResourceType.Sucess;
}
