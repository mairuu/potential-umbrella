import { CachingDatabase } from './CachingDatabase';
import { IdbDatabaseImpl } from './DatabaseImpl';
import { TofuIdbpProvider } from '~/data/local/providers/TofuIdbpProvider';
import {
	PROJECT_STORE_NAME,
	CHAPTER_STORE_NAME,
} from '~/data/local/schema/TofuDbSchema';

// --- Wiring -----------------------------------------------------------

const provider = new TofuIdbpProvider();
const bc = new BroadcastChannel('tofu-ch');

// IdbDatabaseImpl derives the store list from the provider automatically
const idbDb = new IdbDatabaseImpl(provider, bc);

// Wrap with caching decorator. The cache self-invalidates via the same
// changes$ stream that IdbDatabaseImpl feeds, so cross-tab invalidation
// is automatic — no extra wiring needed.
const db = new CachingDatabase(idbDb);

// --- Usage ------------------------------------------------------------

// Single-key read — result is cached, evicted when that key changes
void db
	.read()
	.observeOn(PROJECT_STORE_NAME, 1)
	.run((tx) => tx.objectStore(PROJECT_STORE_NAME).get(1));

// Range / list read — cache bypassed (not a single exact key), always hits idb
void db
	.read()
	.observeOn(CHAPTER_STORE_NAME)
	.run((tx) => tx.objectStore(CHAPTER_STORE_NAME).getAll());

// Write — passes straight through to idb, then notifyChanges fires:
//   1. local Subject → CachingDatabase's QueryCache evicts the key
//   2. BroadcastChannel → other tabs' QueryCaches evict the same key
void db.write().run(async (tx, track) => {
	const store = tx.objectStore(PROJECT_STORE_NAME);
	const project = await store.get(1);
	if (!project) return;
	project.name = 'updated';
	const key = await store.put(project);
	track(PROJECT_STORE_NAME, key);
});
