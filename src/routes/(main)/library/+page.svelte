<script lang="ts">
	import { PROJECT_STORE_INDEX_FAVORITE, PROJECT_STORE_NAME } from '~/data/schema/TofuDbSchema';
	import { db } from '~/module';
	import { mapToResource } from '~/core/temp';
	import LibraryCard from './LibraryCard.svelte';
	import { TransactorResultBuilder } from '~/core/database/Transactor';

    function getAllFavorites() {
        return db
            .query([PROJECT_STORE_NAME])
            .observeOn(PROJECT_STORE_NAME)
            .handledBy(async (tx) => {
                const result = await tx
                    .objectStore(PROJECT_STORE_NAME)
                    .index(PROJECT_STORE_INDEX_FAVORITE)
                    .getAllKeys(IDBKeyRange.lowerBound(0, true))

                return new TransactorResultBuilder()
                    .withValue(result)
                    .build()
            }
            );
    }

	const projectIds$ = mapToResource(getAllFavorites().$());
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
