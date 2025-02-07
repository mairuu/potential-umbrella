import { type ProjectGenre } from "~/services/project/projectGenres";
import { type ProjectType } from "~/services/project/projectTypes";

export type SearchProjectParams = {
	keyword?: string;
	genres?: ProjectGenre[];
	types?: ProjectType[];
};

export type ProjectEntriesResponse = {
	id: number;
	name: string;
}[];

export type ProjectDetailResponse = {
	project: {
		id: number;
		name: string;
		type: string;
		genres: string[];
		synopsis: string;
	};
	chapters: Array<{
		id: number;
		no: number;
		name: string;
		provider: string;
		create: number;
	}>;
};
