import { error, type RequestHandler } from '@sveltejs/kit';
import { filterRequestHeaders, filterResponseHeaders } from '~/utils/imageForward';

export const GET: RequestHandler = async ({ url, request }) => {
	const projectId = url.searchParams.get('pid');

	if (!projectId) {
		throw error(400, 'Project ID is required');
	}

	const imageUrl = `https://www.osemocphoto.com/collectManga/${projectId}/${projectId}_cover.jpg`;

	const response = await fetch(imageUrl, {
		headers: new Headers([
			['referer', 'https://www.nekopost.net/'],
			...filterRequestHeaders(request.headers)
		]),
		method: request.method
	});

	if (!response.ok) {
		throw error(response.status, response.statusText);
	}

	const contentType = response.headers.get('content-type');
	if (!contentType?.startsWith('image/')) {
		throw error(400, 'Invalid content type received');
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: new Headers([
			['cache-control', 'public, max-age=2592000, stale-while-revalidate=86400'],
			...filterResponseHeaders(response.headers)
		])
	});
};

export const HEAD: RequestHandler = GET;
