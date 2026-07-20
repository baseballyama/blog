<script lang="ts">
	import { onMount } from 'svelte';
	import { SITE_URL, SITE_NAME } from '$lib/config';
	import { UI, LOCALE_LABEL, blogPath, postPath, otherLocale } from '$lib/i18n';
	import LocaleNotice from '$lib/components/LocaleNotice.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);
	const locale = $derived(data.locale);
	const other = $derived(otherLocale(locale));
	const t = $derived(UI[locale]);
	const hasTranslation = $derived(post.locales.includes(other));
	const ogImage = $derived(`${SITE_URL}/ogp/${post.locale}/${post.slug}.png`);

	onMount(async () => {
		if (!post.hasMermaid) return;
		// mermaid は CDN から動的に読み込み、クライアントでのみ描画する。
		// URL を変数に切り出して TS のモジュール解決対象から外す (型は any になる)。
		const mermaidUrl = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
		const mermaid = (await import(/* @vite-ignore */ mermaidUrl)).default;
		const isDark = document.documentElement.dataset.theme === 'dark';
		mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'neutral' });
		await mermaid.run({ querySelector: 'pre.mermaid' });
	});
</script>

<svelte:head>
	<title>{post.title} — {SITE_NAME}</title>
	<meta name="description" content={post.description} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="{SITE_URL}{postPath(locale, post.slug)}" />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1260" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImage} />
	{#each post.locales as available (available)}
		<link
			rel="alternate"
			hreflang={available}
			href="{SITE_URL}{postPath(available, post.slug)}"
		/>
	{/each}
	<link rel="alternate" hreflang="x-default" href="{SITE_URL}{postPath('en', post.slug)}" />
</svelte:head>

<article class="container">
	{#if locale === 'en' && hasTranslation}
		<LocaleNotice
			href={postPath('ja', post.slug)}
			text={UI.en.translationBannerText}
			action={UI.en.translationBannerAction}
		/>
	{/if}

	<header class="article-header">
		<h1 class="article-title" lang={post.locale}>{post.title}</h1>
		<p class="article-meta">
			{post.date} /
			<a href="https://github.com/{post.author}" target="_blank" rel="noopener noreferrer"
				>{post.author}</a
			>
			{#if hasTranslation}
				<a class="lang-switch" href={postPath(other, post.slug)} hreflang={other}>
					{LOCALE_LABEL[other]}
				</a>
			{/if}
		</p>
		{#if post.isFallback}
			<p class="fallback-notice">{t.fallbackNotice}</p>
		{/if}
	</header>

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="prose" lang={post.locale}>
		{@html post.html}
	</div>

	<a class="back-link" href={blogPath(locale)}>{t.backToBlog}</a>
</article>
