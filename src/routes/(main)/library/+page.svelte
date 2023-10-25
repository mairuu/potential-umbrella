<script lang="ts">
	import { PROJECT_STORE_INDEX_FAVORITE, PROJECT_STORE_NAME } from '~/data/database/TofuDbSchema';
	import { db } from '~/module';
	import { mapToResource } from '~/lib/temp';
	import LibraryCard from './LibraryCard.svelte';

	function getAllFavorites() {
		return db
			.query([PROJECT_STORE_NAME])
			.observeOn(PROJECT_STORE_NAME)
			.handledBy((tx) =>
				tx
					.objectStore(PROJECT_STORE_NAME)
					.index(PROJECT_STORE_INDEX_FAVORITE)
					.getAllKeys(IDBKeyRange.lowerBound(0, true))
			);
	}

	const projectIds$ = mapToResource(getAllFavorites().$());
	$: projectIdsResource = $projectIds$;
	$: projectIds = projectIdsResource.data || [];
</script>

<svelte:head>
	<title>Library</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<div class="mx-4 my-6 md:mx-0">
		<h1 class="text-3xl">Library</h1>
	</div>

	<div class="my-6 border-b-4 border-base-content/10" />

	{#if projectIds.length}
		<div class="mx-4 my-6 grid grid-cols-3 gap-x-2 gap-y-8 md:mx-0 md:grid-cols-4 md:gap-x-4">
			{#each projectIds as id (id)}
				<LibraryCard {id} />
			{/each}
		</div>
	{:else}
		<div class="mx-4 my-6 md:mx-0">hint</div>
	{/if}
</div>
