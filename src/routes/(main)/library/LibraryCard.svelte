<script lang="ts">
	import { getProjectById } from '~/core/temp';

	export let id: number;

	$: project = getProjectById(id).$();
</script>

<a class="relative" href="/p/{$project?.id || ''}">
	<div class="mb-2 aspect-[5/7]">
		<img
			alt=""
			class="block h-full w-full rounded-md object-cover"
			src={$project?.id ? `/api/project/cover?pid=${$project.id}` : ''}
		/>
	</div>
	<div class="min-h-12 line-clamp-2">
		{$project?.name || ''}
	</div>
</a>
