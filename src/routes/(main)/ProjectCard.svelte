<script lang="ts">
	import { projectService } from '~/module';

	export let id: number;

	$: project = projectService.subsribeById(id);
</script>

<a class="relative" href="/p/{$project?.id || ''}" title={$project?.name || ''}>
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

	{#if $project?.favorite}
		<span class="badge badge-primary absolute left-1 top-1">In Library</span>
	{/if}
</a>
