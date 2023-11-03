<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { tick } from 'svelte';
	import ProjectCard from '../ProjectCard.svelte';
	import FlagsToggler from './FlagsToggler.svelte';
	import type { PageData } from './$types';
	import { remoteToLocalProject, searchProjects } from '~/lib/temp';
	import { db } from '~/module';
	import { PROJECT_STORE_NAME } from '~/data/database/TofuDbSchema';
	import { projectTypes, type ProjectType } from '~/domain/project/ProjectType';
	import { projectGenres, type ProjectGenre } from '~/domain/project/ProjectGenre';

	export let data: PageData;
	$: onSearchParamsChanged(data.searchProjectParams);

	let result: { items: Promise<number[]>; controller: AbortController; filters: string[] } | null =
		null;
	let keyword = '';
	let checkedGenres: boolean[];
	let checkedProjectTypes: boolean[];

	let searchInput: HTMLInputElement;
	let filterDialog: HTMLDialogElement;

	function onSearchParamsChanged(params: PageData['searchProjectParams']) {
		const genres = params?.genres || [];
		const types = params?.types || [];

		keyword = params?.keyword || '';
		checkedGenres = toChecked(genres, projectGenres);
		checkedProjectTypes = toChecked(types, projectTypes);

		result = params ? getSearchResult(keyword, genres, types) : null;
	}

	function getSearchResult(keyword: string, genres: ProjectGenre[], types: ProjectType[]) {
		if (result && !result.controller.signal.aborted) {
			result.controller.abort();
		}

		const controller = new AbortController();
		const filters = [...types, ...genres];
		const items = searchProjects({ genres, keyword, types }, { signal: controller.signal }).then(
			(remotes) => db.mutate([PROJECT_STORE_NAME]).handledBy(remoteToLocalProject(remotes)).exec()
		);

		return { items, controller, filters };
	}

	function onClearFilter() {
		onSearchParamsChanged(undefined);
	}

	function onApplyFilter() {
		const types = fromChecked(checkedProjectTypes, projectTypes);
		const genres = fromChecked(checkedGenres, projectGenres);
		const search = new URLSearchParams();
		keyword.length && search.set('keyword', keyword);
		genres.length && search.set('genres', genres.join('.'));
		types.length && search.set('types', types.join('.'));
		search.sort();

		const query = search.toString();
		if (query && location.search.slice(1) !== query) {
			goto('/search?' + query);
		}
	}

	function fromChecked(checked: boolean[], names: readonly string[]) {
		return checked.reduce((arr, checked, i) => {
			if (checked) arr.push(names[i]);
			return arr;
		}, [] as string[]);
	}

	function toChecked(params: string[], names: readonly string[]) {
		const checked = Array.from(Array(names.length)).fill(false);
		params.forEach((name) => (checked[names.indexOf(name)] = true));
		return checked;
	}

	function showFilterModal() {
		filterDialog?.showModal();
	}

	afterNavigate(async (details) => {
		await tick();

		if (details.type === 'link' && details.from?.route.id === '/(main)') {
			searchInput?.focus();
		}
	});
</script>

<svelte:head>
	<title>Search</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<div class="mx-4 my-6 md:mx-0">
		<h1 class="text-3xl">Search</h1>
	</div>

	<div class="my-6 border-b-4 border-base-content/10" />

	<div class="mx-4 my-6 md:mx-0">
		<div class="flex gap-4">
			<label for="search-input" class="input input-bordered flex w-full items-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-3 h-6 w-6"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
					<path d="M21 21l-6 -6" />
				</svg>

				<input
					bind:this={searchInput}
					bind:value={keyword}
					type="search"
					id="search-input"
					placeholder="keywords"
					class="mr-4 h-12 w-full bg-transparent outline-none"
					on:change={() => {
						onApplyFilter();
					}}
					on:keypress={(ev) => {
						if (ev.key === 'Enter') {
							searchInput.blur();
						}
					}}
				/>
			</label>

			<button class="btn btn-circle btn-ghost" title="search filter" on:click={showFilterModal}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					class="icon icon-tabler icon-tabler-filter"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
					<path
						d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z"
					></path>
				</svg></button
			>
		</div>

		<dialog bind:this={filterDialog} class="modal modal-bottom sm:modal-middle">
			<form method="dialog" class="modal-box">
				<h3 class="text-lg font-bold">Search filters</h3>

				<div class="mt-4 border-b-4 border-base-content/10" />
				<h1 class="my-4">Include Types</h1>
				<FlagsToggler labels={projectTypes} bind:checked={checkedProjectTypes} />

				<div class="mt-4 border-b-4 border-base-content/10" />
				<h1 class="my-4">Include Genres</h1>
				<FlagsToggler labels={projectGenres} bind:checked={checkedGenres} />

				<div class="mt-4 border-b-4 border-base-content/10" />
				<div class="modal-action">
					<button class="btn" on:click={onClearFilter}>Clear</button>
					<button
						class="btn"
						on:click={onApplyFilter}
						disabled={!(
							keyword.length ||
							checkedProjectTypes.some((e) => e) ||
							checkedGenres.some((e) => e)
						)}
					>
						Apply Filters
					</button>
				</div>
			</form>

			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	</div>

	{#if result?.items}
		{#await result.items}
			<div class="my-4 grid place-items-center">
				<span class="loading loading-dots loading-lg" />
			</div>
		{:then ids}
			{#if result.filters.length}
				<div class="mx-4 my-6 flex flex-wrap gap-2 md:mx-0">
					{#each result.filters as filter (filter)}
						<span class="badge">{filter}</span>
					{/each}
				</div>
			{/if}
			<div class="my-6 border-b-4 border-base-content/10" />
			<div class="mx-4 my-6 grid grid-cols-3 gap-x-2 gap-y-8 md:mx-0 md:grid-cols-4 md:gap-x-4">
				{#each ids as id (id)}
					<ProjectCard {id} />
				{/each}
			</div>
		{/await}
	{:else}
			<div class="mx-4 my-6 md:mx-0">
				<div class="flex flex-col items-center pt-[20vh]">
					<span class="inline-block text-4xl"> (＾▽＾) </span>
					<span class="pt-4"> Fill in keywords, Enter, Explore! </span>
				</div>
			</div>
	{/if}
</div>
