<script lang="ts">
	import { mapToResource } from '~/utils/mapToResource';
	import LibraryCard from './LibraryCard.svelte';
	import { projectService } from '~/module';

	const projectIds$ = mapToResource(projectService.subsribeAllFavorites());
</script>

<svelte:head>
	<title>Library</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<div class="mx-4 my-6 md:mx-0">
		<h1 class="text-3xl">Library</h1>
	</div>

	<div class="my-6 border-b-4 border-base-content/10" />

	{#if $projectIds$.isSucess()}
		{#if $projectIds$.data.length}
			<div class="mx-4 my-6 grid grid-cols-3 gap-x-2 gap-y-8 md:mx-0 md:grid-cols-4 md:gap-x-4">
				{#each $projectIds$.data as id (id)}
					<LibraryCard {id} />
				{/each}
			</div>
		{:else}
			<div class="mx-4 my-6 md:mx-0">
				<div class="flex flex-col items-center pt-[20vh]">
					<span class="inline-block text-4xl"> ( ´･_･`) </span>
					<span class="pt-4"> Your library is empty </span>
				</div>
			</div>
		{/if}
	{/if}
</div>
