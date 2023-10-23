<script lang="ts">
	import { PROJECT_STORE_NAME } from '~/data/database/TofuDbSchema';
	import { db } from '~/module';

	export let id: number;

	$: project = db
		.query([PROJECT_STORE_NAME])
		.observeOn(PROJECT_STORE_NAME, id)
		.handledBy((tx) => tx.objectStore(PROJECT_STORE_NAME).get(id))
		.$();

	$: cover = $project?.id ? `/api/project/cover?pid=${$project.id}` : '';
</script>

<a class="relative" href="/p/{$project?.id || ''}">
	<div class="mb-2 aspect-[5/7]">
		<img alt="" class="block h-full w-full rounded-md object-cover" src={cover} />
	</div>
	<div class="min-h-12 line-clamp-2">
		{$project?.name || ''}
	</div>
</a>
