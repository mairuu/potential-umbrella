export function groupBy<K extends string | symbol, T>(
	items: T[],
	predicate: (value: T, index: number) => K
): Record<K, T[]> {
	const grouped = {} as Record<K, T[]>;
	items.forEach((value, i) => {
		const key = predicate(value, i);
		(grouped[key] || (grouped[key] = [])).push(value);
	});
	return grouped;
}
