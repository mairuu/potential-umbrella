export class Changes extends Map<string, IDBValidKey[]> {
	valid() {
		return this.size > 0;
	}

	serialize(): string {
		return JSON.stringify(Object.fromEntries(this.entries()));
	}

	static deSerialize(serialized: string): Changes {
		const changes = new Changes();
		const parsed: Record<string, IDBValidKey[]> = JSON.parse(serialized);
		for (const [key, value] of Object.entries(parsed)) {
			changes.set(key, value);
		}
		return changes;
	}
}

export class ChangesBuilder {
	private _changes = new Changes();

	add(storeName: string, key: IDBValidKey): this {
		let existing = this._changes.get(storeName);
		if (!existing) {
			existing = [];
			this._changes.set(storeName, existing);
		}
		// Guard against compound keys (IDBValidKey can itself be an array)
		if (Array.isArray(key) && key.every((k) => !Array.isArray(k))) {
			for (const k of key as IDBValidKey[]) {
				existing.push(k);
			}
		} else {
			existing.push(key);
		}
		return this;
	}

	build(): Changes {
		return this._changes;
	}
}
