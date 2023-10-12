import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const projectId = parseInt(params.pid);
	return { projectId };
};
