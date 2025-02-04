import type { RequestHandler } from '@sveltejs/kit';
import { projectGenreIdLookup, type ProjectGenre } from '~/domain/project/ProjectGenre';
import { decryptResponseAsJson } from '~/lib/util/Decode';

export const GET: RequestHandler = async ({ url }) => {
	const keyword = url.searchParams.get('keyword') || '';
	const genres = (url.searchParams.get('genres') || '')
		.split('.')
		.map((genre) => genre && projectGenreIdLookup.get(genre as ProjectGenre))
		.filter(Boolean);
	const types = (url.searchParams.get('types') || '')
		.split('.')
		.map((e) => e && e[0].toLocaleLowerCase())
		.filter(Boolean);

	const body = {
		keyword,
		genre: genres,
		type: types,
		order: 'project',
		// it's good enough.
		pageNo: 1
	};

	const response = await fetch('https://www.nekopost.net/api/explore/search', {
		headers: { origin: 'https://www.nekopost.net', referer: 'https://www.nekopost.net' },
		method: 'POST',
		body: JSON.stringify(body)
	});

	const model: {
		listProject: {
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
		}[];
	} = await decryptResponseAsJson(response);

	const results = model.listProject.map((e) => ({ id: e.projectId, name: e.projectName }));

	return Response.json(results, { headers: { 'cache-control': 'public, max-age=3000' } });
};
