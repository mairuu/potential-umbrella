import type { ProjectType } from '~/services/project/projectTypes';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const type = params.type as ProjectType;
	return { type };
};
