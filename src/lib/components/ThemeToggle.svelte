<script lang="ts">
	import { onMount } from 'svelte';

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		// app.html のインラインスクリプトが設定済みの値を読み取る
		const current = document.documentElement.dataset.theme;
		theme = current === 'dark' ? 'dark' : 'light';
	});

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('theme', theme);
		} catch {
			// localStorage が使えない環境では無視する
		}
	}
</script>

<button class="theme-toggle" onclick={toggle} aria-label="Toggle theme" title="Toggle theme">
	{#if theme === 'dark'}
		<!-- sun -->
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<circle cx="12" cy="12" r="4" />
			<path
				d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
				stroke-linecap="round"
			/>
		</svg>
	{:else}
		<!-- moon -->
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
		</svg>
	{/if}
</button>
