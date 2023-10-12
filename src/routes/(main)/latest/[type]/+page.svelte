<script lang="ts">
	import { tick } from 'svelte';
	import type { PageData, Snapshot } from './$types';
	import { fetchLatestProjects, remoteToLocalProject } from '~/lib/temp';
	import { PROJECT_STORE_NAME } from '~/data/database/TofuDbSchema';
	import { db } from '~/lib/module';
	import ProjectCard from '../../ProjectCard.svelte';
	import { afterNavigate, disableScrollHandling } from '$app/navigation';
	import type { ProjectType } from '~/domain/project/ProjectType';

	export let data: PageData;

	$: type = data.type;

	let pages: number[][] = [];
	let appending = false;

	export const snapshot: Snapshot<{ pages: number[][]; scrollTop: number }> = {
		capture: () => {
			return { pages, scrollTop: window.scrollY };
		},
		restore: (snapshot) => {
			if (appending) return;
			appending = true;
			pages = snapshot.pages;
			tick().then(() => {
				appending = false;
				window.scrollTo({ top: snapshot.scrollTop });
			});
		}
	};

	async function fetchAndAppend(type: ProjectType, page: number) {
		if (appending) return;
		appending = true;

		const ids = await fetchPage(type, page);
		pages = [...pages, ids];

		await tick();
		appending = false;
	}

	async function fetchPage(type: ProjectType, page: number) {
		const remoteProjects = await fetchLatestProjects({ type, page });
		const ids = await db
			.mutate([PROJECT_STORE_NAME])
			.handledBy(remoteToLocalProject(remoteProjects))
			.exec();
		return ids;
	}

	function onScroll() {
		const shouldAppend =
			window.scrollY + 2 * window.innerHeight > document.documentElement.scrollHeight;

		if (shouldAppend) {
			const page = pages.length;
			fetchAndAppend(type, page);
		}
	}

	afterNavigate(() => {
		disableScrollHandling();
		fetchAndAppend(type, 0);
	});
</script>

<svelte:window on:scroll={onScroll} />

<svelte:head>
	<title />
</svelte:head>

<div class="mx-auto max-w-3xl">
	<div class="mx-4 my-6 md:mx-0">
		<h1 class="text-3xl">Latest {type[0].toUpperCase() + type.slice(1)}</h1>
	</div>

	<div class="my-6 border-b-4 border-base-content/10" />

	<div
		class="mx-4 my-6 grid grid-cols-3 gap-x-2 gap-y-8 overflow-hidden md:mx-0 md:grid-cols-4 md:gap-x-4"
	>
		{#each pages as page (page)}
			{#each page as id}
				<ProjectCard {id} />
			{/each}
		{/each}
	</div>

	{#if appending}
		<div class="grid place-items-center my-4">
			<span class="loading loading-dots loading-lg" />
		</div>
	{/if}
</div>
