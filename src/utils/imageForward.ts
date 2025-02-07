const forwardingRequestHeaderNames = [
	'if-none-match',
	'if-modified-since',
	'cache-control',
	'accept',
	'accept-encoding'
];

const forwardingResponseHeaderNames = [
	'content-type',
	'content-length',
	'etag',
	'last-modified',
	'cache-control',
	'expires',
	'vary'
];

function filterHeaderAsEntries(headers: Headers, allowHeaderNames: string[]): [string, string][] {
	return allowHeaderNames
		.map((name): [string, string | null] => [name, headers.get(name)])
		.filter((entry): entry is [string, string] => entry[1] !== null);
}

export function filterRequestHeaders(headers: Headers) {
	return filterHeaderAsEntries(headers, forwardingRequestHeaderNames);
}

export function filterResponseHeaders(headers: Headers) {
	return filterHeaderAsEntries(headers, forwardingResponseHeaderNames);
}
