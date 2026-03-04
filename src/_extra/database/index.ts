// Core — no idb dependency
export type { Database } from './Database';
export type { ReadBuilder } from './ReadBuilder';
export type { WriteBuilder, Tracker } from './WriteBuilder';
export type { LiveQuery } from './LiveQuery';
export type { Resource, ResourceLoading, ResourceSuccess, ResourceError } from './Resource';
export { resourceLoading, resourceSuccess, resourceError, isLoading, isSuccess, isError } from './Resource';
export { Changes, ChangesBuilder } from './Changes';

// idb-specific implementation
export { IdbDatabaseImpl } from './DatabaseImpl';
export type { IdbpProvider } from './IdbpProvider';
