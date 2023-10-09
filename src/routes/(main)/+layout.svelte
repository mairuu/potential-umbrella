<script lang="ts">
	import { page } from '$app/stores';
</script>

<slot />

<div class="pb-16" />

<div class="fixed inset-x-0 bottom-0 border-t border-base-content/10 bg-base-100">
	<div class="nav mx-auto max-w-3xl">
		<a href="/" title="Home" class="nav-item" class:active={$page.url.pathname === '/'}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
				/>
			</svg>
			<span class="nav-label">Home</span>
		</a>
		<a
			href="/history"
			title="History"
			class="nav-item"
			class:active={$page.url.pathname === '/history'}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M12 8l0 4l2 2" />
				<path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
			</svg>

			<span class="nav-label">History</span>
		</a>
		<a
			href="/library"
			title="Library"
			class="nav-item"
			class:active={$page.url.pathname === '/library'}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
				<path d="M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
				<path d="M5 8h4" />
				<path d="M9 16h4" />
				<path
					d="M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z"
				/>
				<path d="M14 9l4 -1" />
				<path d="M16 16l3.923 -.98" />
			</svg>
			<span class="nav-label">Library</span>
		</a>
	</div>
</div>

<style>
	.nav {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-around;
		padding-bottom: env(safe-area-inset-bottom);
		height: 4rem /* 64px */;
	}
	.nav-item {
		position: relative;
		display: flex;
		height: 100%;
		flex-basis: 100%;
		cursor: pointer;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem /* 4px */;
		border-top-width: 2px;
		border-color: transparent;
	}
	.nav-item.active {
		border-color: currentColor;
	}
	.nav-label {
		line-height: 1;
		font-size: 10px;
	}
</style>
