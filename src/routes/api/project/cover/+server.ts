import { error, type RequestHandler } from '@sveltejs/kit';

const forwardingRequestHeaderNames = ['if-none-match'];
const forwardingResponseHeaderNames = ['content-type', 'content-length', 'etag'];

function filterHeaderAsEntries(headers: Headers, allowHeaderNames: string[]) {
	return allowHeaderNames.map((name) => [name, headers.get(name)]).filter(([_, value]) => !!value);
}

export const GET: RequestHandler = async ({ url, request }) => {
	const projectId = url.searchParams.get('pid');

	if (!projectId) {
		throw error(400);
	}

	const response = await fetch(
		`https://www.osemocphoto.com/collectManga/${projectId}/${projectId}_cover.jpg`,
		{
			headers: new Headers(
				[['referer', 'https://www.nekopost.net/']].concat(
					filterHeaderAsEntries(request.headers, forwardingResponseHeaderNames)
				)
			),
			method: request.method
		}
	);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: new Headers(
			[['cache-control', 'public, max-age=2592000']].concat(
				filterHeaderAsEntries(response.headers, forwardingResponseHeaderNames)
			)
		)
	});
};

export const HEAD = GET;
