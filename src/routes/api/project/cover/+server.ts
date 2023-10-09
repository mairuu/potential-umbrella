import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ url }) => {
	const projectId = url.searchParams.get('pid');

	if (!projectId) {
		throw error(400);
	}

	return fetch(`https://www.osemocphoto.com/collectManga/${projectId}/${projectId}_cover.jpg`, {
		headers: {
			referer: 'https://www.nekopost.net/'
		}
	});
};
