import { error, type RequestHandler } from '@sveltejs/kit';
import { filterRequestHeaders, filterResponseHeaders } from '~/utils/image_forward';

export const GET: RequestHandler = async ({ url, request }) => {
	const file = url.searchParams.get('file');

	if (!file || !file.endsWith('jpg') || file.split('/').length !== 3) {
		throw error(400);
	}

	const imageUrl = `https://www.osemocphoto.com/collectManga/${file}`;

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

export const HEAD = GET;
