<script lang="ts">
	export let labels: string[];
	export let checked: boolean[];
</script>

<div class="flex gap-2 flex-wrap">
	{#each labels as label, i}
		<label class="btn btn-xs" class:btn-success={checked[i]}>
			<span>
				<span class="inline-block w-2">{checked[i] ? '-' : '+'}</span>
				{label}
			</span>
			<input type="checkbox" bind:checked={checked[i]} class="hidden" />
		</label>
	{/each}
</div>
