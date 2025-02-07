export class ApiClient {
	async fetch<T>(
		endpoint: string,
		params?: Record<string, string>,
		init?: RequestInit
	): Promise<T> {
		const response = await fetch(this._createUrl(endpoint, params), init);
		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`);
		}
		return response.json();
	}

	private _createUrl(endpoint: string, params?: Record<string, string>) {
		const search = new URLSearchParams(params);
		search.sort();
		return `${endpoint}?${search.toString()}`;
	}
}
