<script lang="ts">
	import { version } from '$app/environment';
	import { SITE_URL, SITE_NAME } from '$lib/config';
	import {
		UI,
		LOCALE_LABEL,
		blogPath,
		postPath,
		otherLocale,
		readingTime,
		rssPath,
	} from '$lib/i18n';
	import LocaleNotice from '$lib/components/LocaleNotice.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);
	const locale = $derived(data.locale);
	const other = $derived(otherLocale(locale));
	const t = $derived(UI[locale]);
	const hasTranslation = $derived(post.locales.includes(other));
	const ogImage = $derived(`${SITE_URL}/ogp/${post.locale}/${post.slug}.png`);
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
		<link rel="alternate" hreflang={available} href="{SITE_URL}{postPath(available, post.slug)}" />
	{/each}
	<link rel="alternate" hreflang="x-default" href="{SITE_URL}{postPath('en', post.slug)}" />
	<link
		rel="alternate"
		type="application/rss+xml"
		title={SITE_NAME}
		href="{SITE_URL}{rssPath(locale)}"
	/>
	{#if post.hasMermaid}
		<!--
			図のある記事だけが mermaid を読む。csr = false なので Svelte のクライアント
			バンドルは無く、これは scripts/build-mermaid.mjs が別に吐いた素の ESM。
			?v= はデプロイごとのキャッシュバスターで、$app/environment の version を使う。
		-->
		<script type="module" src="/generated/mermaid.js?v={version}"></script>
	{/if}
</svelte:head>

<article class="container">
	{#if locale === 'en' && hasTranslation && data.suggestJa}
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
			/ {readingTime(locale, post.readingMinutes)}
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

	<div class="prose" lang={post.locale}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html post.html}
	</div>

	<a class="back-link" href={blogPath(locale)}>{t.backToBlog}</a>
</article>
