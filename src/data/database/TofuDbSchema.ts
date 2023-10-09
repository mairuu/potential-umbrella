import type { DBSchema } from 'idb';
import type { ChapterEntity } from './entities/ChapterEntity';
import type { ProjectEntity } from './entities/ProjectEntity';

export const PROJECT_STORE_NAME = 'projects' as const;
export const PROJECT_STORE_KEYPATH = 'id' as const;
export const PROJECT_STORE_INDEX_FAVORITE = 'by-favorite' as const;
export const PROJECT_STORE_INDEX_FAVORITE_KEYPATH = 'favorite' as const;

export const CHAPTER_STORE_NAME = 'chapters' as const;
export const CHAPTER_STORE_KEYPATH = 'id' as const;
export const CHAPTER_STORE_INDEX_PROJECT = 'by-project' as const;
export const CHAPTER_STORE_INDEX_PROJECT_KEYPATH = 'pid' as const;
export const CHAPTER_STORE_INDEX_READ = 'by-read' as const;
export const CHAPTER_STORE_INDEX_READ_KEYPATH = 'read' as const;

export interface TofuDbSchema extends DBSchema {
	[PROJECT_STORE_NAME]: {
		key: ProjectEntity[typeof PROJECT_STORE_KEYPATH];
		value: ProjectEntity;
		indexes: {
			[PROJECT_STORE_INDEX_FAVORITE]: ProjectEntity[typeof PROJECT_STORE_INDEX_FAVORITE_KEYPATH];
		};
	};

	[CHAPTER_STORE_NAME]: {
		key: ChapterEntity[typeof CHAPTER_STORE_KEYPATH];
		value: ChapterEntity;
		indexes: {
			[CHAPTER_STORE_INDEX_PROJECT]: ChapterEntity[typeof CHAPTER_STORE_INDEX_PROJECT_KEYPATH];
			[CHAPTER_STORE_INDEX_READ]: ChapterEntity[typeof CHAPTER_STORE_INDEX_READ_KEYPATH];
		};
	};
}
