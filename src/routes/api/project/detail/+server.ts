import { error, type RequestHandler } from '@sveltejs/kit';
import { decryptResponseAsJson } from '~/lib/util/Decode';

function projectTypeRecognition(type: string) {
	switch (type) {
		case 'm':
		case 'manga':
			return 'manga';
		case 'n':
		case 'novel':
		case 'f':
		case 'fiction':
			return 'novel';
	}

	throw new Error(`unrecognized project type! (${type})`);
}

export const GET: RequestHandler = async ({ url }) => {
	const projectId = parseInt(url.searchParams.get('pid') || '');
	if (isNaN(projectId)) {
		throw error(404);
	}

	const response = await fetch(`https://www.nekopost.net/api/project/detail?pid=${projectId}`, {
		headers: {
			referer: 'https://www.nekopost.net/'
		}
	});
	const model: {
		project: Array<{
			pid: number;
			projectName: string;
			aliasName: string;
			website: string;
			author: number;
			authorName: string;
			artist: number;
			artistName: string;
			info: string;
			status: number;
			flgMature: string;
			flgIntense: string;
			flgViolent: string;
			flgGlue: string;
			flgReligion: string;
			flgHidemeta: string;
			mainCategory: string;
			goingType: string;
			projectType: string;
			readerGroup: string;
			releaseDate: string;
			updateDate: string;
			views: number;
			imageVersion: number;
		}>;
		listCate: Array<{
			cateCode: number;
			cateName: string;
			cateLink: string;
		}>;
		listChapter: Array<{
			chapterId: number;
			chapterNo: number;
			chapterName: string;
			status: number;
			publishDate: string;
			createDate: string;
			view: string;
			ownerId: number;
			providerName: string;
		}>;
		listOtherMedia: Array<{
			fileName: string;
			title: string;
			category: number;
		}>;
	} = await decryptResponseAsJson(response);

	if (!model.project[0]) {
		throw error(404, { message: 'project not found' });
	}

	const project = {
		id: model.project[0].pid,
		name: model.project[0].projectName,
		type: projectTypeRecognition(model.project[0].projectType),
		genres: model.listCate.map((cate) => cate.cateName.toLowerCase()),
		synopsis: model.project[0].info
	};

	const chapters = model.listChapter.map((chapter) => ({
		id: chapter.chapterId,
		no: chapter.chapterNo,
		name: chapter.chapterName,
		provider: chapter.providerName,
		create: new Date(chapter.createDate).getTime()
	}));

	return Response.json(
		{ project, chapters },
		{ headers: { 'cache-control': 'public, max-age=300' } }
	);
};
