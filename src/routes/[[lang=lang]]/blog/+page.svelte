<script lang="ts">
	import { SITE_URL, SITE_NAME } from '$lib/config';
	import { UI, LOCALE_LABEL, blogPath, postPath, otherLocale, readingTime } from '$lib/i18n';
	import LocaleNotice from '$lib/components/LocaleNotice.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const other = $derived(otherLocale(locale));
	const t = $derived(UI[locale]);
</script>

<svelte:head>
	<title>{t.blogTitle} — {SITE_NAME}</title>
	<meta name="description" content={t.blogNote} />
	<meta property="og:title" content="{t.blogTitle} — {SITE_NAME}" />
	<meta property="og:description" content={t.blogNote} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{SITE_URL}{blogPath(locale)}" />
	<link rel="alternate" hreflang="en" href="{SITE_URL}{blogPath('en')}" />
	<link rel="alternate" hreflang="ja" href="{SITE_URL}{blogPath('ja')}" />
	<link rel="alternate" hreflang="x-default" href="{SITE_URL}{blogPath('en')}" />
</svelte:head>

<div class="section section--first container wide">
	<header class="section-head">
		<h1 class="section-label">{t.blogTitle}</h1>
		<p class="section-note">{t.blogNote}</p>
		<a class="lang-switch" href={blogPath(other)} hreflang={other}>{LOCALE_LABEL[other]}</a>
	</header>
	<div class="section-body">
		{#if locale === 'en'}
			<LocaleNotice
				href={blogPath('ja')}
				text={UI.en.translationBannerListText}
				action={UI.en.translationBannerAction}
			/>
		{/if}
		{#if data.posts.length}
			<ul class="post-list">
				{#each data.posts as post (post.slug)}
					<li>
						<a href={postPath(locale, post.slug)}>
							<span class="post-item-title" lang={post.locale}>{post.title}</span>
							<span class="post-item-date"
								>{post.date} · {readingTime(locale, post.readingMinutes)}</span
							>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">{t.noPosts}</p>
		{/if}
	</div>
</div>
