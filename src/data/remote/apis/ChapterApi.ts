import { ApiClient } from '~/core/api/ApiClient';
import { API_ENDPOINTS } from '../endpoints';
import { type ChapterContentResponse } from '../types/chapter';

export class ChapterApi {
	constructor(private _client: ApiClient) {}

	async getContent(
		params: { projectId: number; chapterId: number },
		{ signal }: { signal?: AbortSignal } = {}
	) {
		return this._client.fetch<ChapterContentResponse>(
			API_ENDPOINTS.chapter.content,
			{
				pid: params.projectId.toString(),
				cid: params.chapterId.toString()
			},
			{ signal }
		);
	}
}
