<script lang="ts">
	import { SITE_URL, SITE_NAME } from '$lib/config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog — {SITE_NAME}</title>
	<meta name="description" content="baseballyama の技術ブログ記事一覧。" />
	<meta property="og:title" content="Blog — {SITE_NAME}" />
	<meta property="og:description" content="baseballyama の技術ブログ記事一覧。" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{SITE_URL}/blog" />
</svelte:head>

<section class="section container">
	<div class="section-head">
		<h1 class="section-title">Blog</h1>
	</div>
	{#if data.posts.length}
		<ul class="post-list">
			{#each data.posts as post (post.slug)}
				<li>
					<a href="/posts/{post.slug}">
						<div class="post-item-title">{post.title}</div>
						<div class="post-item-date">{post.date}</div>
						<p class="post-item-desc">{post.description}</p>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p>まだ記事がありません。</p>
	{/if}
</section>
