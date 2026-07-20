<script lang="ts">
	import { page } from '$app/state';
	import { DEFAULT_LOCALE, blogPath, isLocale, type Locale } from '$lib/i18n';
	import ThemeToggle from './ThemeToggle.svelte';

	const path = $derived(page.url.pathname);
	// /ja/... を見ているあいだはナビゲーションも日本語側に留める。
	const locale = $derived.by<Locale>(() => {
		const first = path.split('/')[1] ?? '';
		return isLocale(first) ? first : DEFAULT_LOCALE;
	});
	const isBlog = $derived(/^\/(ja\/)?(blog|posts)/.test(path));
</script>

<header class="site-header">
	<div class="container">
		<a href="/" class="brand">baseballyama</a>
		<nav class="site-nav">
			<a href="/" aria-current={path === '/' ? 'page' : undefined}>Home</a>
			<a href={blogPath(locale)} aria-current={isBlog ? 'page' : undefined}>Blog</a>
			<ThemeToggle />
		</nav>
	</div>
</header>
