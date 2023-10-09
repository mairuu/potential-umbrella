import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	// https://www.nekopost.net/api/project/latestChapter?t=m&p=0&s=12

	const type = url.searchParams.get('type');
	const page = url.searchParams.get('page');
	const takes = url.searchParams.get('takes');

	if (
		type === null ||
		page === null ||
		takes === null ||
		isNaN(parseInt(page)) ||
		isNaN(parseInt(page))
	) {
		throw error(400);
	}

	const resourceUrl = `https://www.nekopost.net/api/project/latestChapter?t=${type[0]}&p=${page}&s=${takes}`;

	const response = await fetch(resourceUrl);
	const model:
		| {
				noNewChapter: string;
				pid: number;
				projectName: string;
				chapterId: number;
				chapterNo: string;
				chapterName: string;
				releaseDate: string;
				cover: string;
				editorID: number;
				editorName: string;
				coverVersion: number;
				status: number;
		  }[]
		| null = await response.json();

	const latests =
		model?.map((item) => ({
			id: item.pid,
			name: item.projectName
		})) || [];

	return Response.json(latests, {
		headers: { 'cache-control': 'public, max-age=300' }
	});
};
