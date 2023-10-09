import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const projectId = parseInt(url.searchParams.get('pid') || '');
	const chapterId = parseInt(url.searchParams.get('cid') || '');

	if (isNaN(projectId) || isNaN(chapterId)) {
		throw error(400);
	}

	const response = await fetch(
		`https://www.osemocphoto.com/collectManga/${projectId}/${chapterId}/${projectId}_${chapterId}.json`,
		{ headers: { referer: 'https://www.nekopost.net/' } }
	);
	const model: {
		projectId: string;
		projectType: string;
		chapterId: string;
		chapterNo: string;
		coverType: string;
		otherCover: string;
		status: string;
		createById: string;
		createDate: string;
		publishDate: any;
		pageItem?: Array<{
			id: number;
			pageNo: number;
			pageName: string;
			fileName: string;
			title: string;
			width: number;
			height: number;
		}>;
		novelContent?: string;
		pageText?: string;
	} = await response.json();

	if (!(model.novelContent || model.pageText) && !model.pageItem) {
		throw error(500, { message: 'no content' });
	}

	return Response.json(
		{
			content:
				(model.novelContent || model.pageText)?.replaceAll(/style="[^"]*"/g, '') ||
				model.pageItem!.map((page) => ({
					name: page.pageName || page.fileName,
					width: page.width,
					height: page.height
				}))
		},
		{ headers: { 'cache-control': 'public, max-age=3000' } }
	);
};
