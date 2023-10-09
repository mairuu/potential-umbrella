<script>
	import { onMount, tick } from 'svelte';
	import '~/app.css';

	onMount(() => {
		const _html = document.documentElement;
		const propertyName = 'background-color';
		_html.style.removeProperty(propertyName);

		tick().then(() => {
			const propertyValue = getComputedStyle(_html).getPropertyValue(propertyName);
			window.localStorage.setItem(propertyName, propertyValue);
		});
	});
</script>

<slot />
