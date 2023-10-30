<script lang="ts">
	import {
		CHAPTER_STORE_INDEX_READ,
		CHAPTER_STORE_NAME,
		PROJECT_STORE_NAME
	} from '~/data/database/TofuDbSchema';
	import type { ChapterEntity } from '~/data/database/entities/ChapterEntity';
	import { db } from '~/module';
	import { mapToResource, updateChapter } from '~/lib/temp';
	import type { ProjectEntity } from '~/data/database/entities/ProjectEntity';

	const fa = new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: 'numeric'
	});

	const fb = new Intl.DateTimeFormat(undefined, {
		day: 'numeric',
		month: 'numeric',
		year: '2-digit'
	});

	const readChapters$ = mapToResource(getReadChapters().$());
	$: readChapters = $readChapters$.data || [];

	type ProjectChapter = { project: ProjectEntity; chapter: ChapterEntity };

	function getReadChapters() {
		return db.query([CHAPTER_STORE_NAME, PROJECT_STORE_NAME]).handledBy(async (tx) => {
			const projectsStore = tx.objectStore(PROJECT_STORE_NAME);
			const chaptersStore = tx.objectStore(CHAPTER_STORE_NAME);

			let set = new Set<number>();
			let arr: ProjectChapter[] = [];
			let cursor = await chaptersStore
				.index(CHAPTER_STORE_INDEX_READ)
				.openCursor(IDBKeyRange.lowerBound(0, true), 'prev');

			while (cursor) {
				if (!set.has(cursor.value.pid)) {
					set.add(cursor.value.pid);
					let project = await projectsStore.get(cursor.value.pid);
					arr.push({ project: project!, chapter: cursor.value });
				}

				cursor = await cursor.continue();
			}

			return arr;
		});
	}

	function groupBy<T>(
		items: T[],
		predicate: (value: T, index: number) => string
	): Record<string, T[]> {
		const grouped: Record<string, T[]> = {};
		items.forEach((value, i) => {
			const key = predicate(value, i);
			(grouped[key] || (grouped[key] = [])).push(value);
		});
		return grouped;
	}

	function onDeleteHistory(pc: ProjectChapter) {
		db.mutate([CHAPTER_STORE_NAME])
			.handledBy(
				updateChapter(pc.chapter.id, (chapter) => {
					chapter.read = 0;
					chapter.progress = 0;
					return chapter;
				})
			)
			.exec();
	}
</script>

<svelte:head>
	<title>History</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<div class="mx-4 my-6 md:mx-0">
		<h1 class="text-3xl">History</h1>
	</div>

	<div class="my-6 border-b-4 border-base-content/10" />

	{#if readChapters.length}
		<div class="mx-4 my-6 flex flex-col gap-3 md:mx-0">
			{#each Object.entries(groupBy(readChapters, ({ chapter }) => {
					let readDate = new Date(chapter.read);
					return `${readDate.getFullYear()}-${readDate.getMonth()}-${readDate.getDate()}`;
				})) as [date, items] (date)}
				<div class="flex items-center">
					<div class="w-16 shrink-0 text-center">{fb.format(new Date(date))}</div>
					<div class="ml-3 w-full border-t border-base-content/10" />
				</div>

				{#each items as item (item.chapter.id)}
					{@const { chapter, project } = item}
					<div class="flex">
						<a
							class="relative flex flex-1 gap-x-3"
							href="/p/{project.id}/{chapter.id}"
							title={`${project.name} Ch.${chapter.no} - ${chapter.name}`}
						>
							<img
								alt=""
								src="/api/project/cover?pid={project.id}"
								class="block aspect-[2/3] w-16 rounded-md object-cover object-top"
							/>

							<div class="flex-1 self-center text-sm">
								<span class="line-clamp-2">
									{project.name}
								</span>
								<span class="block pt-1 text-base-content/60">
									Ch. {chapter.no} - {fa.format(chapter.read)}
								</span>
							</div>
						</a>
						<button
							class="btn btn-circle btn-ghost flex-shrink-0 self-center"
							on:click={() => onDeleteHistory(item)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								fill="none"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<path d="M4 7h16" />
								<path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
								<path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
								<path d="M10 12l4 4m0 -4l-4 4" />
							</svg>
						</button>
					</div>
				{/each}
			{/each}
		</div>
	{:else}
		<div class="mx-4 my-6 md:mx-0">hint</div>
	{/if}
</div>
