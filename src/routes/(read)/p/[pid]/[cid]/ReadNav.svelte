<script lang="ts">
	import { onMount } from 'svelte';
	import type { ChapterEntity } from '~/data/database/entities/ChapterEntity';
	import type { ProjectEntity } from '~/data/database/entities/ProjectEntity';

	export let project: ProjectEntity | null;
	export let chapterNavigation: Record<'previous' | 'current' | 'next', ChapterEntity> | undefined;

	export let showNav: boolean;
	let allowNavToBeHidden = false;

	function onScroll() {
		if (!allowNavToBeHidden) {
			return;
		}

		if (isScrollAtBottom()) {
			showNav = true;
			return;
		}

		if (showNav) {
			showNav = false;
		}
	}

	function isScrollAtBottom() {
		const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
		const scrolledToBottom = window.scrollY + 1 >= scrollableHeight;

		return scrolledToBottom;
	}

	onMount(() => {
		const timerId = setTimeout(() => {
			allowNavToBeHidden = true;
		}, 100);

		return () => {
			clearTimeout(timerId);
		};
	});
</script>

<svelte:window on:scroll={onScroll} />
<div
	class="pt-safe fixed left-0 right-0 top-0 border-b border-base-content/10 bg-base-100 transition-transform"
	class:hide-top={!showNav}
>
	<div class="mx-auto flex h-14 max-w-2xl items-center gap-4 px-8">
		<a href="." class="btn-sm btn">Back</a>
		<div>
			<div class="line-clamp-1 text-sm">
				{project?.name ?? ''}
			</div>
			<div class="line-clamp-1 text-xs text-base-content/60">
				{chapterNavigation?.current?.no ?? ''} - {chapterNavigation?.current?.name ?? ''}
			</div>
		</div>
	</div>
</div>

<div
	class="pb-safe fixed bottom-0 left-0 right-0 border-t border-base-content/10 bg-base-100 px-6 transition-transform"
	class:hide-bot={!showNav}
>
	<div class="mx-auto flex h-14 max-w-2xl items-center justify-end gap-4">
		<a
			href={chapterNavigation?.previous ? `./${chapterNavigation.previous.id}` : '.'}
			class:btn-disabled={!chapterNavigation?.previous}
			class="btn-sm btn">Previous</a
		>
		<a
			href={chapterNavigation?.next ? `./${chapterNavigation.next.id}` : '.'}
			class:btn-disabled={!chapterNavigation?.next}
			class="btn-sm btn">Next</a
		>
	</div>
</div>

<style>
	.pt-safe {
		padding-top: env(safe-area-inset-top);
	}

	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom);
	}

	.hide-top {
		transform: translateY(calc(-1 * (env(safe-area-inset-top) + 3.5rem)));
	}

	.hide-bot {
		transform: translateY(calc((env(safe-area-inset-bottom) + 3.5rem)));
	}
</style>
