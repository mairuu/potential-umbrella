export interface ProjectEntity {
	id: number;
	name: string;
	type: string;
	genres: string[];
	synopsis: string;
	favorite: number;
	initialized: boolean;
}
