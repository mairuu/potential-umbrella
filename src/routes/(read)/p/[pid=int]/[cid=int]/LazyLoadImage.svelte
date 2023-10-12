<script lang="ts" context="module">
	const callbacks = new WeakMap<object, () => void>();

	const obs = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					callbacks.get(entry.target)?.();
					unobserve(entry.target);
				}
			});
		},
		{ rootMargin: '1600px' }
	);

	function unobserve(element: Element) {
		callbacks.delete(element);
		obs.unobserve(element);
	}

	function observe(element: Element, callback: () => void) {
		obs.observe(element);

		callbacks.set(element, callback);

		return () => unobserve(element);
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import type { HTMLImgAttributes } from 'svelte/elements';

	interface $$Props extends HTMLImgAttributes {
		src: string;
		width: number;
		height: number;
	}

	export let src: string;
	export let width: number;
	export let height: number;

	let holder: Element;
	let intersected = false;

	function onIntersecting() {
		intersected = true;
	}

	onMount(() => {
		return observe(holder, onIntersecting);
	});
</script>

{#if intersected}
	<!-- svelte-ignore a11y-missing-attribute -->
	<img {src} {width} {height} {...$$restProps} />
{:else}
	<span
		bind:this={holder}
		class="inline-block max-w-full"
		style:width={width + 'px'}
		style:aspect-ratio={`${width} / ${height}`}
	/>
{/if}
