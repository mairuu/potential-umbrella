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

	const resourceUrl = `https://www.nekopost.net/api/project/latest`;

	const body = {
		type: type[0],
		paging: {
			pageNo: parseInt(page),
			pageSize: parseInt(takes)
		}
	};

	console.log(body);

	const response = await fetch(resourceUrl, {
		method: 'POST',
		headers: {
			referer: 'https://www.nekopost.net/',
			'content-type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	const dto: {
		listChapter:
			| {
					noNewChapter: number;
					pid: number;
					projectName: string;
					chapterId: number;
					chapterNo: string;
					chapterName: string;
					releaseDate: string;
					cover: string;
					editorId: number;
					editorName: string;
					coverVersion: number;
					status: string;
					projectType: string;
			  }[]
			| null;
	} = await response.json();

	const latests =
		dto?.listChapter?.map((item) => ({
			id: item.pid,
			name: item.projectName
		})) || [];

	return Response.json(latests, {
		headers: { 'cache-control': 'public, max-age=300' }
	});
};
