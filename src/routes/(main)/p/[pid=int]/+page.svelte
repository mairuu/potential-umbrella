<script lang="ts">
	import { PROJECT_STORE_NAME } from '~/data/database/TofuDbSchema';
	import { db } from '~/module';
	import type { PageData } from './$types';
	import { fade } from 'svelte/transition';
	import {
		mapToResource,
		getProjectById,
		getChaptersByProjectId,
		initializeProject,
		updateProject
	} from '~/lib/temp';
	import type { ChapterEntity } from '~/data/database/entities/ChapterEntity';
	import type { ProjectEntity } from '~/data/database/entities/ProjectEntity';

	export let data: PageData;

	$: pid = data.projectId;

	$: project$ = mapToResource(getProjectById(pid).$());
	$: project = $project$.data;

	$: chapters$ = mapToResource(getChaptersByProjectId(pid).$());
	$: chapters = $chapters$.data?.sort((a, b) => b.no - a.no);
	$: continuation = getContinuationChapter(chapters);

	$: inLibrary = project?.favorite ? project.favorite !== 0 : false;
	$: cover = project ? `/api/project/cover?pid=${project.id}` : '';
	$: needInitilizeProject =
		$project$.isSucess() && (!$project$.data || !$project$.data.initialized);
	$: if (needInitilizeProject) {
		initializeProject(pid);
	}

	function getContinuationChapter(chapters: ChapterEntity[] | undefined) {
		let i = chapters?.findIndex((chapter) => chapter.read !== 0);
		let label = '';
		let chapter = chapters?.at(i || -1);

		if (i && chapter?.progress === 1) {
			chapter = chapters?.at(i - 1);
		}

		if (chapter?.progress) {
			label = `continue reading chapter ${chapter.no}`;
		} else if (chapter) {
			label = `start reading chapter ${chapter.no}`;
		}

		return {
			label,
			href: chapter ? `/p/${chapter.pid}/${chapter.id}` : '.',
			disabled: label === ''
		};
	}

	const dateFormat = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric'
	});

	const now = new Date();

	function isToday(e: number) {
		const date = new Date(e);
		return (
			date.getDate() === now.getDate() &&
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear()
		);
	}

	function handleLibraryBtn() {
		project && toggleFavorite(project);
	}

	function toggleFavorite(project: ProjectEntity) {
		db.mutate([PROJECT_STORE_NAME])
			.handledBy(updateProject({ id: project.id, favorite: project.favorite ? 0 : Date.now() }))
			.exec();
	}
</script>

<svelte:head>
	<title>{project?.name || ''}</title>
</svelte:head>

{#if needInitilizeProject}
	<div class="fixed left-1/2 top-4 z-10 -translate-x-5" transition:fade={{ duration: 150 }}>
		<span class="loading loading-dots loading-lg" />
	</div>
{/if}

<div class="absolute top-0 h-60 w-full overflow-hidden">
	<div
		class="absolute inset-0 bg-cover bg-[0_30%] blur-sm brightness-[.6] contrast-125 grayscale-[0.2]"
		style="background-image: url({cover})"
	/>
	<div class="absolute inset-0 bg-gradient-to-b from-transparent to-base-100" />
</div>

<div class="relative mx-auto max-w-3xl pb-8">
	<div class="mx-4 mt-6 flex gap-2">
		<div class="aspect-[5/7] w-[22vw] min-w-[7rem] max-w-[10rem] flex-shrink-0">
			<img class="block h-full w-full rounded object-cover" src={cover} alt="" />
		</div>

		<h1 class="mt-auto">
			{project?.name || ''}
		</h1>
	</div>

	<div class="m-4">
		<button
			class="btn no-animation btn-sm min-w-[10rem]"
			disabled={!project?.initialized}
			on:click={handleLibraryBtn}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill={inLibrary ? 'currentColor' : 'none'}
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path
					d="M19.5 12.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
				/>
			</svg>
			<span>{inLibrary ? 'in library' : 'add to library'}</span>
		</button>
	</div>

	<div class="m-4 text-sm text-base-content/60">
		{project?.synopsis || ''}
	</div>

	<div class="m-4 flex flex-wrap gap-2">
		{#each project?.genres || [] as genre}
			<a href="/search?genres={genre}" class="badge">{genre}</a>
		{/each}
	</div>

	<div class="m-4">
		<a
			href={continuation.href}
			class="btn btn-primary btn-sm btn-block rounded-2xl"
			class:btn-disabled={continuation.disabled}
		>
			{continuation.label}
		</a>
	</div>

	<div class="flex border-b border-base-content/10 py-4 font-semibold">
		<span class="grid w-12 shrink-0 place-items-center">{chapters?.length ?? ''}</span>
		<span>chapter{chapters?.length === 1 ? '' : 's'}</span>
	</div>

	<div class="grid">
		{#each chapters || [] as chapter (chapter.id)}
			<a
				class="flex items-center border-b border-base-content/10 py-2 pr-4 text-sm"
				class:text-primary={chapter.read && chapter.progress !== 1}
				class:text-success={chapter.progress === 1}
				href="/p/{chapter.pid}/{chapter.id}"
				title={`Ch.${chapter.no} - ${chapter.name}`}
			>
				<div class="grid w-12 shrink-0 place-items-center">{chapter.no}</div>
				<div class="flex-1">
					<span class="block">
						{chapter.name}
					</span>
					<span class="block items-baseline text-sm text-base-content/60">
						{chapter.provider} · {dateFormat.format(chapter.create)}
					</span>
				</div>

				{#if isToday(chapter.create)}
					<div class="flex-0 pl-1 text-center italic text-success">new</div>
				{/if}
			</a>
		{/each}
	</div>
</div>
