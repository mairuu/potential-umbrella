import { error, type RequestHandler } from '@sveltejs/kit';

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

	const response = await fetch(`https://api.osemocphoto.com/frontAPI/getProjectInfo/${projectId}`, {
		headers: {
			referer: 'https://www.nekopost.net/'
		}
	});
	const dto: {
		code: number;
		desc: string;
		projectInfo?: {
			projectId: string;
			projectName: string;
			aliasName: string;
			website: string;
			author: string;
			authorName: string;
			artist: string;
			artistName: string;
			info: string;
			status: string;
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
			views: string;
			imageVersion: string;
		};
		listCate: {
			cateCode: string;
			cateName: string;
			cateLink: string;
		}[];
		listChapter: {
			chapterId: string;
			chapterNo: string;
			chapterName: string;
			status: string;
			publishDate: string;
			createDate: string;
			view: string;
			ownerId: string;
			providerName: string;
		}[];
		listProvider: {
			userId: string;
			displayName: string;
		}[];
	} = await response.json();

	if (!dto.projectInfo) {
		throw error(404, { message: 'project not found' });
	}

	const project = {
		id: parseInt(dto.projectInfo.projectId),
		name: dto.projectInfo.projectName,
		type: projectTypeRecognition(dto.projectInfo.projectType),
		genres: dto.listCate.map((cate) => cate.cateName.toLowerCase()),
		synopsis: dto.projectInfo.info
	};

	const chapters = dto.listChapter.map((chapter) => ({
		id: parseInt(chapter.chapterId),
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
