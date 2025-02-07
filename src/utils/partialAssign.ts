export function partialAssign<T extends object>(target: T, partial: Partial<T>) {
	for (const prop in partial) {
		if (prop in target) {
			target[prop] = partial[prop]!;
		}
	}
	return target;
}
