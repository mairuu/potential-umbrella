<script lang="ts">
	import { onMount } from 'svelte';
	import type { ChapterEntity } from '~/data/database/entities/ChapterEntity';

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
	<div class="flex h-14 items-center md:justify-between">
		<a href="." class="btn btn-ghost no-animation h-full rounded-none px-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-7 w-7"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M4 6l16 0" />
				<path d="M4 12l16 0" />
				<path d="M4 18l16 0" />
			</svg>
		</a>
		<div class="md:line-clamp-1 md:max-w-[60vw]">
			<span class="text-sm text-base-content/60 md:inline-block md:text-base">
				Ch. {chapterNavigation?.current?.no ?? ''} - {chapterNavigation?.current?.name ?? ''}
			</span>
		</div>
		<div class="md:w-16" />
	</div>
</div>

<div
	class="pb-safe fixed bottom-0 left-0 right-0 border-t border-base-content/10 bg-base-100 transition-transform"
	class:hide-bot={!showNav}
>
	<div class="flex h-14 items-center justify-end gap-4 px-4">
		<div class="join gap-1">
			<a
				href={chapterNavigation?.previous ? `./${chapterNavigation.previous.id}` : '.'}
				class:btn-disabled={!chapterNavigation?.previous}
				class="btn join-item btn-sm">Previous</a
			>
			<a
				href={chapterNavigation?.next ? `./${chapterNavigation.next.id}` : '.'}
				class:btn-disabled={!chapterNavigation?.next}
				class="btn join-item btn-sm">Next</a
			>
		</div>
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
