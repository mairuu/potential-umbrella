<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { PageData } from './$types';
	import {
		mapToResource,
		getProjectById,
		getChaptersByProjectId,
		initializeProject,
		updateChapter
	} from '~/core/temp';
	import { chapterApi, db } from '~/module';
	import { CHAPTER_STORE_NAME } from '~/data/local/schema/TofuDbSchema';
	import type { ChapterEntity } from '~/data/local/entities/ChapterEntity';
	import { afterNavigate, beforeNavigate, disableScrollHandling } from '$app/navigation';
	import LazyLoadImage from './LazyLoadImage.svelte';
	import ReadNav from './ReadNav.svelte';

	export let data: PageData;

	$: pid = data.projectId;
	$: cid = data.chapterId;

	$: project$ = mapToResource(getProjectById(pid).$());
	$: project = $project$.data || null;

	$: chapters$ = mapToResource(getChaptersByProjectId(pid).$());
	$: chapters = $chapters$.data?.sort((a, b) => b.no - a.no) || null;

	$: content = chapterApi.getContent({ chapterId: cid, projectId: pid });
	$: chapterNavigation = getChapterNavigation(cid, chapters);

	$: progress = chapterNavigation?.current.progress;
	$: if (progress) content.then(() => tick()).then(() => restoreProgress(cid, progress!));

	$: needInitilizeProject =
		$project$.isSucess() && (!$project$.data || !$project$.data.initialized);
	$: if (needInitilizeProject) {
		initializeProject(pid);
	}

	let showNav = true;
	let contentContainer: HTMLElement;

	function getChapterNavigation(cid: number, chapters: ChapterEntity[] | null) {
		if (!chapters) return;

		const i = chapters?.findIndex((chapter) => chapter.id === cid);

		if (i === -1) return;

		let current = chapters[i];
		let previous = chapters[i + 1];
		let next = chapters[i - 1];

		return { current, previous, next };
	}

	function calculateProgress() {
		if (!contentContainer) {
			return 0;
		}

		return Math.min(
			1,
			(window.scrollY - contentContainer.offsetTop + 24) /
				(contentContainer.clientHeight - window.innerHeight)
		);
	}

	function restoreProgress(_cid: number, progress: number) {
		if (_cid !== cid || !contentContainer) return;

		const top =
			progress * (contentContainer.clientHeight - window.innerHeight) +
			contentContainer.offsetTop -
			24;

		window.scrollTo({ top });
	}

	afterNavigate(() => {
		db.mutate([CHAPTER_STORE_NAME])
			.handledBy(updateChapter({ id: cid, read: Date.now() }))
			.exec();
	});

	beforeNavigate(() => {
		db.mutate([CHAPTER_STORE_NAME])
			.handledBy(updateChapter({ id: cid, progress: calculateProgress() }))
			.exec();
	});

	onMount(() => {
		disableScrollHandling();
	});
</script>

<svelte:head>
	<title>{project?.name || ''} Ch. {chapterNavigation?.current.no || ''}</title>
</svelte:head>

<ReadNav bind:showNav {chapterNavigation} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={() => (showNav = !showNav)}>
	{#if chapterNavigation?.current && project}
		{#await content}
			<div class="my-4 grid place-items-center pt-16">
				<span class="loading loading-dots loading-lg" />
			</div>
		{:then awaited}
			{#if typeof awaited.content === 'string'}
				<div
					class="prose prose-lg mx-auto max-w-2xl break-words px-8 pb-24 pt-16"
					bind:this={contentContainer}
				>
					{@html awaited.content}
				</div>
			{:else}
				<div class="flex flex-col gap-2" bind:this={contentContainer}>
					{#each awaited.content as item}
						<LazyLoadImage
							class="mx-auto"
							width={item.width}
							height={item.height}
							src="/api/chapter/image?file={chapterNavigation.current.pid}/{chapterNavigation
								.current.id}/{item.name}"
							alt=""
						/>
					{/each}
				</div>
			{/if}
		{/await}
	{/if}
</div>
