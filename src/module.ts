import type { TofuDbSchema } from '~/data/local/schema/TofuDbSchema';
import { TofuIdbpProvider } from '~/data/local/providers/TofuIdbpProvider';
import type { Database } from './core/database/Database';
import { DatabaseImpl } from './core/database/DatabaseImpl';
import { ProjectApi } from './data/remote/apis/ProjectApi';
import { ApiClient } from './core/api/ApiClient';
import { ChapterApi } from './data/remote/apis/ChapterApi';

const tofuIdbpProvider = new TofuIdbpProvider();
const tofuBroadcast = new BroadcastChannel('tofo-ch');
export const db: Database<TofuDbSchema> = new DatabaseImpl(tofuIdbpProvider, tofuBroadcast);

const apiClient = new ApiClient();
export const projectApi = new ProjectApi(apiClient);
export const chapterApi = new ChapterApi(apiClient);
