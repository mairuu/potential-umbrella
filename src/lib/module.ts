import type { TofuDbSchema } from '~/data/database/TofuDbSchema';
import { TofuIdbpProvider } from '~/data/database/TofuIdbpProvider';
import type { Database } from './database/Database';
import { DatabaseImpl } from './database/DatabaseImpl';

const tofuIdbpProvider = new TofuIdbpProvider();
const tofuBroadcast = new BroadcastChannel('tofo-ch');
export const db: Database<TofuDbSchema> = new DatabaseImpl(tofuIdbpProvider, tofuBroadcast);
