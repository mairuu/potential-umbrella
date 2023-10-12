import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const projectId = parseInt(params.pid);
	const chapterId = parseInt(params.cid);

	return { projectId, chapterId };
};
