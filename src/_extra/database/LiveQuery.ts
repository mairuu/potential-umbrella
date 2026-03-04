import type { Resource } from './Resource';

/**
 * A reactive query result that implements the Svelte readable store contract.
 * Use `$liveQuery` directly in a Svelte template.
 * Use `.once()` for a one-shot Promise when reactivity is not needed.
 */
export interface LiveQuery<T> {
	/** Svelte readable store contract. */
	subscribe(run: (value: Resource<T>) => void): () => void;

	/** Execute once and return the raw value as a Promise (no Resource wrapping). */
	once(): Promise<T>;
}
