<script lang="ts">
	import { mapToResource } from '~/utils/mapToResource';
	import { chapterService } from '~/module';
	import { groupBy } from '~/utils/groupBy';

	const fa = new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: 'numeric'
	});

	const fb = new Intl.DateTimeFormat(undefined, {
		day: 'numeric',
		month: 'numeric',
		year: '2-digit'
	});

	const readChapters$ = mapToResource(chapterService.subscribeRead());

	function onDeleteHistory(chapterId: number) {
		chapterService.update({
			id: chapterId,
			read: 0,
			progress: 0
		});
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

	{#if $readChapters$.isSucess()}
		{@const readChapters = $readChapters$.data}
		{#if readChapters.length}
			<div class="mx-4 my-6 flex flex-col gap-3 md:mx-0">
				{#each Object.entries(groupBy(readChapters, ({ chapter }) => {
						let readDate = new Date(chapter.read);
						return new Date(readDate.getFullYear(), readDate.getMonth(), readDate.getDate())
							.getTime()
							.toString();
					})) as [date, items] (date)}
					<div class="flex items-center">
						<div class="w-16 shrink-0 text-center">{fb.format(parseInt(date))}</div>
						<div class="ml-3 w-full border-t border-base-content/10" />
					</div>

					{#each items as { project, chapter } (chapter.id)}
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
								on:click={() => onDeleteHistory(chapter.id)}
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
			<div class="mx-4 my-6 md:mx-0">
				<div class="flex flex-col items-center pt-[20vh]">
					<span class="inline-block text-4xl"> (○´ ― `)ゞ </span>
					<span class="pt-4"> Nothing read recently </span>
				</div>
			</div>
		{/if}
	{/if}
</div>
