<script lang="ts">
	import {
		CHAPTER_STORE_INDEX_READ,
		CHAPTER_STORE_NAME,
		PROJECT_STORE_NAME
	} from '~/data/database/TofuDbSchema';
	import type { ChapterEntity } from '~/data/database/entities/ChapterEntity';
	import { db } from '~/lib/module';
	import { mapToResource } from '~/lib/temp';
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

	type ProjectChapter = { project: ProjectEntity; chapter: ChapterEntity };

	function getReadChapters() {
		return db.query([CHAPTER_STORE_NAME, PROJECT_STORE_NAME]).handledBy(async (tx) => {
			const projectsStore = tx.objectStore(PROJECT_STORE_NAME);
			const chpatersStore = tx.objectStore(CHAPTER_STORE_NAME);

			let map = new Map<number, ProjectEntity>();
			let arr: ProjectChapter[] = [];
			let cursor = await chpatersStore
				.index(CHAPTER_STORE_INDEX_READ)
				.openCursor(IDBKeyRange.lowerBound(0, true), 'prev');

			while (cursor) {
				let project = map.get(cursor.value.pid);
				if (!project) {
					project = await projectsStore.get(cursor.value.pid);
					map.set(cursor.value.id, project!);
				}

				arr.push({ project: project!, chapter: cursor.value });
				cursor = await cursor.continue();
			}

			return arr;
		});
	}

	function groupBySameDay(pcs: ProjectChapter[]): [Date, ProjectChapter[]][] {
		const arr: [Date, ProjectChapter[]][] = [];

		let currentGroupDate: Date;
		let currentGroupItems: ProjectChapter[];

		pcs.forEach((pc) => {
			const readDate = new Date(pc.chapter.read);

			if (!currentGroupDate || readDate.getDay() !== currentGroupDate.getDay()) {
				currentGroupDate = readDate;
				currentGroupItems = [pc];
				arr.push([currentGroupDate, currentGroupItems]);
			} else {
				currentGroupItems.push(pc);
			}
		});

		return arr;
	}

	const readChapters$ = mapToResource(getReadChapters().$());
	$: readChapters = $readChapters$.data || [];
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
			{#each groupBySameDay(readChapters) as [date, items]}
				<div class="flex items-center">
					<div class="w-16 shrink-0 text-center">{fb.format(date)}</div>
					<div class="ml-3 w-full border-t border-base-content/10" />
				</div>

				{#each items as { chapter, project } (chapter.id)}
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
				{/each}
			{/each}
		</div>
	{:else}
		<div class="mx-4 my-6 md:mx-0">hint</div>
	{/if}
</div>
