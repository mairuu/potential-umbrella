import { ApiClient } from '~/core/api/ApiClient';
import type {
	ProjectDetailResponse,
	SearchProjectParams,
	ProjectEntriesResponse
} from '../types/project';
import { API_ENDPOINTS } from '../endpoints';
import { type ProjectType } from '~/services/project/projectTypes';

export class ProjectApi {
	constructor(private _client: ApiClient) {}

	async search(params: SearchProjectParams, { signal }: { signal?: AbortSignal } = {}) {
		const searchParams: Record<string, string> = {};

		if (params.keyword?.length) {
			searchParams.keyword = params.keyword;
		}
		if (params.genres?.length) {
			searchParams.genres = params.genres.join('.');
		}
		if (params.types?.length) {
			searchParams.types = params.types.join('.');
		}

		return this._client.fetch<ProjectEntriesResponse>(API_ENDPOINTS.project.search, searchParams, {
			signal
		});
	}

	async getLatest(
		params: { type: ProjectType; page?: number; takes?: number },
		{ signal }: { signal?: AbortSignal } = {}
	) {
		return this._client.fetch<ProjectEntriesResponse>(
			API_ENDPOINTS.project.latest,
			{
				type: params.type,
				page: (params.page ?? 0).toString(),
				takes: (params.takes ?? 12).toString()
			},
			{ signal }
		);
	}

	async getDetail(projectId: number, { signal }: { signal?: AbortSignal } = {}) {
		return this._client.fetch<ProjectDetailResponse>(
			API_ENDPOINTS.project.detail,
			{ pid: projectId.toString() },
			{ signal }
		);
	}
}
