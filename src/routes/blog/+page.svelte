<script lang="ts">
	import { SITE_URL, SITE_NAME } from '$lib/config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const description = 'Posts on compilers, tooling and building software.';
</script>

<svelte:head>
	<title>Blog — {SITE_NAME}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Blog — {SITE_NAME}" />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{SITE_URL}/blog" />
</svelte:head>

<div class="section section--first container wide">
	<header class="section-head">
		<h1 class="section-label">Blog</h1>
		<p class="section-note">{description}</p>
	</header>
	<div class="section-body">
		{#if data.posts.length}
			<ul class="post-list">
				{#each data.posts as post (post.slug)}
					<li>
						<a href="/posts/{post.slug}">
							<span class="post-item-title">{post.title}</span>
							<span class="post-item-date">{post.date}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">No posts yet.</p>
		{/if}
	</div>
</div>
