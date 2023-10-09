<script lang="ts">
	import HomeGallery from './HomeGallery.svelte';

	const types = ['manga', 'novel'];

	let w = 0;
	$: n = w < 768 ? 6 : 8;
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="mx-auto max-w-3xl" bind:clientWidth={w}>
	<div class="mx-auto max-w-3xl">
		<div class="mx-4 my-6 flex items-center md:mx-0">
			<h1 class="text-3xl">Home</h1>

			<a href="/search" class="btn-sm btn-circle btn ml-auto" title="Search">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
					<path d="M21 21l-6 -6" />
				</svg>
			</a>
		</div>
	</div>

	{#each types as type}
		<div class="my-6 border-b-4 border-base-content/10" />

		<div class="mx-4 my-6 flex items-baseline justify-between md:mx-0">
			<h1 class="font-semi text-xl">{type[0].toUpperCase() + type.slice(1)}</h1>
			<a href="/latest/{type}" class="underline">More</a>
		</div>

		<HomeGallery {n} {type} />
	{/each}
</div>
