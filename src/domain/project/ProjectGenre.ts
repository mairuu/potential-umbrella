// noinspection SpellCheckingInspection

export type ProjectGenre = (typeof projectGenres)[number];

export const projectGenreIdLookup = new Map([
	['fantasy', '1'],
	['action', '2'],
	['drama', '3'],
	['sport', '5'],
	['sci-fi', '7'],
	['comedy', '8'],
	['slice of life', '9'],
	['romance', '10'],
	['adventure', '13'],
	['yaoi', '23'],
	['yuri', '24'],
	['trap', '25'],
	['gender blender', '26'],
	['mystery', '32'],
	['doujinshi', '37'],
	['gourmet', '41'],
	['shoujo', '42'],
	['school life', '43'],
	['isekai', '44'],
	['second life', '45'],
	['shounen', '46'],
	['horror', '47'],
	['one shot', '48'],
	['seinen', '49'],
	['harem', '50'],
	['reincanate', '51']
] as const);

export const projectGenres = Array.from(projectGenreIdLookup.keys());

export function isProjectGenre(value?: string): value is ProjectGenre {
	return !!value && projectGenres.includes(value as ProjectGenre);
}
