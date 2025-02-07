import type { TofuDbSchema } from '~/data/local/schema/TofuDbSchema';
import { TofuIdbpProvider } from '~/data/local/providers/TofuIdbpProvider';
import type { Database } from './core/database/Database';
import { DatabaseImpl } from './core/database/DatabaseImpl';
import { ProjectApi } from './data/remote/apis/ProjectApi';
import { ApiClient } from './core/api/ApiClient';
import { ChapterApi } from './data/remote/apis/ChapterApi';
import { ProjectService } from './services/project/ProjectService';
import { ChapterService } from './services/chapter/ChapterService';

const tofuIdbpProvider = new TofuIdbpProvider();
const tofuBroadcast = new BroadcastChannel('tofo-ch');
const db: Database<TofuDbSchema> = new DatabaseImpl(tofuIdbpProvider, tofuBroadcast);

const apiClient = new ApiClient();
export const projectApi = new ProjectApi(apiClient);
export const chapterApi = new ChapterApi(apiClient);

export const projectService = new ProjectService(db, projectApi);
export const chapterService = new ChapterService(db, chapterApi);
