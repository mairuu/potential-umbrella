import { isProjectGenre } from '~/domain/project/ProjectGenre';
import { isProjectType } from '~/domain/project/ProjectType';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const search = url.searchParams;

	const keyword = search.get('keyword');
	const genres = search.get('genres')?.split('.')?.filter(isProjectGenre) || null;
	const types = search.get('types')?.split('.')?.filter(isProjectType) || null;

	if (keyword === null && genres === null && types === null) {
		return {};
	}

	return { searchProjectParams: { keyword, genres, types } };
};
