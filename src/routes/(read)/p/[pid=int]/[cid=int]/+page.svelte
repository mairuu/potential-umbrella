<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { PageData } from './$types';
	import { isResourceSucess } from '~/lib/core/Resouce';
	import {
		mapToResource,
		getProjectById,
		getChaptersByProjectId,
		initializeProject,
		fetchChapterContent
	} from '~/lib/temp';
	import { db } from '~/lib/module';
	import { CHAPTER_STORE_NAME, type TofuDbSchema } from '~/data/database/TofuDbSchema';
	import type { ChapterEntity } from '~/data/database/entities/ChapterEntity';
	import type { Transactor } from '~/lib/database/Transactor';
	import { afterNavigate, beforeNavigate, disableScrollHandling } from '$app/navigation';
	import LazyLoadImage from './LazyLoadImage.svelte';
	import ReadNav from './ReadNav.svelte';

	export let data: PageData;

	$: pid = data.projectId;
	$: cid = data.chapterId;

	$: project$ = mapToResource(getProjectById(pid).$());
	$: chapters$ = mapToResource(getChaptersByProjectId(pid).$());

	$: project = $project$.data || null;
	$: chapters = $chapters$.data?.sort((a, b) => b.no - a.no) || null;

	$: content = fetchChapterContent({ chapterId: cid, projectId: pid });
	$: chapterNavigation = getChapterNavigation(cid, chapters);
	$: progress = chapterNavigation?.current.progress;
	$: if (progress) content.then(() => tick()).then(() => restoreProgress(cid, progress!));

	$: if (isResourceSucess($project$)) {
		const project = $project$.data;

		if (!project || !project.initialized) {
			initializeProject(pid);
		}
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

	function updateChapter(
		id: number,
		updater: (chapter: ChapterEntity) => ChapterEntity
	): Transactor<TofuDbSchema, 'chapters'[], 'readwrite', number | undefined> {
		return async (tx) => {
			const chapterStore = tx.objectStore(CHAPTER_STORE_NAME);
			let chapter = await chapterStore.get(id);
			if (chapter) {
				const putResult = await chapterStore.put(updater(chapter));
				return [putResult, [[CHAPTER_STORE_NAME, [putResult]]]];
			}
			return [undefined];
		};
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
			.handledBy(
				updateChapter(cid, (chapter) => {
					chapter.read = Date.now();
					return chapter;
				})
			)
			.exec();
	});

	beforeNavigate(() => {
		const progress = calculateProgress();

		return db
			.mutate([CHAPTER_STORE_NAME])
			.handledBy(
				updateChapter(cid, (chapter) => {
					chapter.progress = progress;
					return chapter;
				})
			)
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
			<div class="grid place-items-center my-4 pt-16">
				<span class="loading loading-dots loading-lg" />
			</div>
		{:then awaited}
			{#if typeof awaited.content === 'string'}
				<div
					class="prose prose-lg mx-auto max-w-2xl break-words px-8 pt-16 pb-24"
					bind:this={contentContainer}
				>
					{@html awaited.content}
				</div>
			{:else}
				<div class="flex gap-2 flex-col" bind:this={contentContainer}>
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