export class Changes extends Map<string, IDBValidKey[]> {
	valid() {
		return this.size > 0;
	}

	serialize(): string {
		const serializedMap: Record<string, IDBValidKey[]> = {};

		for (const [key, valueSet] of this.entries()) {
			serializedMap[JSON.stringify(key)] = valueSet;
		}

		return JSON.stringify(serializedMap);
	}

	static deSerialize(serializedString: string): Changes {
		const changes = new Changes();

		const parsedMap: Record<string, IDBValidKey[]> = JSON.parse(serializedString);

		for (const [key, valueArray] of Object.entries(parsedMap)) {
			const parsedKey = JSON.parse(key);
			changes.set(parsedKey, valueArray);
		}

		return changes;
	}
}

export class ChangesBuilder {
	private _changes: Changes = new Changes();

	add(storeName: string, key: IDBValidKey) {
		let change = this._changes.get(storeName);
		if (!change) {
			change = [];
			this._changes.set(storeName, change);
		}
		if (!Array.isArray(key)) {
			key = [key];
		}
		for (const i of key) {
			change.push(i);
		}
		return this;
	}

	build(): Changes {
		return this._changes;
	}
}
