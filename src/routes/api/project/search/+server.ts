import type { RequestHandler } from '@sveltejs/kit';

const genreIdLookup = new Map([
	['fantasy', '1'],
	['action', '2'],
	['drama', '3'],
	['sport', '5'],
	['sci-fi', '7'],
	['comedy', '8'],
	['slice of life', '9'],
	['romance', '10'],
	['adventure', '13'],
	['yaoi', '23'],
	['yuri', '24'],
	['trap', '25'],
	['gender blender', '26'],
	['mystery', '32'],
	['doujinshi', '37'],
	['gourmet', '41'],
	['shoujo', '42'],
	['school life', '43'],
	['isekai', '44'],
	['second life', '45'],
	['shounen', '46'],
	['horror', '47'],
	['one shot', '48'],
	['seinen', '49'],
	['harem', '50'],
	['reincanate', '51']
]);

export const GET: RequestHandler = async ({ url }) => {
	const keyword = url.searchParams.get('keyword') || '';
	const genres = (url.searchParams.get('genres') || '')
		.split('.')
		.map((genre) => genre && genreIdLookup.get(genre))
		.filter(Boolean);
	const types = (url.searchParams.get('types') || '')
		.split('.')
		.map((e) => e && e[0].toLocaleLowerCase())
		.filter(Boolean);

	const body = { keyword, genre: genres, type: types, order: 'project' };

	const response = await fetch('https://www.nekopost.net/api/explore/search', {
		headers: { origin: 'https://www.nekopost.net', referer: 'https://www.nekopost.net' },
		method: 'POST',
		body: JSON.stringify(body)
	});

	const model: Array<{
		projectId: number;
		projectName: string;
		projectType: string;
		STATUS: number;
		noChapter: number;
		coverVersion: number;
		info: string;
		views: number;
		lastUpdate: string;
		status: number;
	}> = await response.json();

	const results = model.map((e) => ({ id: e.projectId, name: e.projectName }));

	return Response.json(results, { headers: { 'cache-control': 'public, max-age=3000' } });
};
