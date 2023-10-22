export type Changes = [string, IDBValidKey[]][];

export function hasChanged(changes: Changes) {
	return changes.some((change) => change[1].length !== 0);
}
