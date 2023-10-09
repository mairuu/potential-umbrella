import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ url }) => {
	const file = url.searchParams.get('file');

	if (!file || !file.endsWith('jpg') || file.split('/').length !== 3) {
		throw error(400);
	}

	return fetch(`https://www.osemocphoto.com/collectManga/${file}`, {
		headers: {
			referer: 'https://www.nekopost.net/'
		}
	});
};
