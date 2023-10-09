import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const type = params.type;

	return { type };
};
