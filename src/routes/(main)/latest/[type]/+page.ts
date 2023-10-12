import type { ProjectType } from '~/domain/project/ProjectType';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const type = params.type as ProjectType;
	return { type };
};
