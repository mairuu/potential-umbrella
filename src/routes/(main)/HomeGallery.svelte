<script lang="ts">
	import { projectApi, projectService } from '~/module';
	import ProjectCard from './ProjectCard.svelte';
	import type { ProjectType } from '~/services/project/projectTypes';

	export let n: number;
	export let type: ProjectType;

	let items: number[] = [];
	let exists = new Set<number>();

	$: projectApi
		.getLatest({ type })
		.then((latests) => projectService.remotesToLocals(latests))
		.then((ids) => {
			items = ids.filter((id) => {
				if (!exists.has(id)) {
					exists.add(id);
					return true;
				}
				return false;
			});
		});
</script>

<div class="mx-4 my-6 grid grid-cols-3 gap-x-2 gap-y-8 md:mx-0 md:grid-cols-4 md:gap-x-4">
	{#if items.length}
		{#each items.slice(0, n) as id (id)}
			<ProjectCard {id} />
		{/each}
	{:else}
		{#each Array(n) as _}
			<div class="">
				<div class="mb-2 aspect-[5/7]" />
				<div class="min-h-12" />
			</div>
		{/each}
	{/if}
</div>
