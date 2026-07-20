<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';

	const path = $derived(page.url.pathname);
</script>

<header class="site-header">
	<div class="container">
		<a href="/" class="brand">baseballyama</a>
		<nav class="site-nav">
			<a href="/" aria-current={path === '/' ? 'page' : undefined}>Home</a>
			<a href="/blog" aria-current={path.startsWith('/blog') || path.startsWith('/posts') ? 'page' : undefined}>Blog</a>
			<ThemeToggle />
		</nav>
	</div>
</header>
