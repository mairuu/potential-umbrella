import type { TofuDbSchema } from '~/data/schema/TofuDbSchema';
import { TofuIdbpProvider } from '~/data/providers/TofuIdbpProvider';
import type { Database } from './core/database/Database';
import { DatabaseImpl } from './core/database/DatabaseImpl';

const tofuIdbpProvider = new TofuIdbpProvider();
const tofuBroadcast = new BroadcastChannel('tofo-ch');
export const db: Database<TofuDbSchema> = new DatabaseImpl(tofuIdbpProvider, tofuBroadcast);
