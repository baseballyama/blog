<script lang="ts">
	import { profile } from '$lib/data/profile';
	import { projectGroups } from '$lib/data/projects';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '$lib/config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{profile.name} — {SITE_NAME}</title>
	<meta name="description" content={SITE_DESCRIPTION} />
	<meta property="og:title" content="{profile.name} (@{profile.handle})" />
	<meta property="og:description" content={SITE_DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE_URL} />
</svelte:head>

<section class="hero container">
	<h1 class="hero-name">
		{profile.name}<span class="hero-handle">@{profile.handle}</span>
	</h1>
	<p class="hero-title">{profile.title}</p>
	<p class="hero-tagline">{profile.tagline}</p>
	<div class="hero-bio">
		{#each profile.bio as line}<p>{line}</p>{/each}
	</div>
	<div class="hero-meta">
		<SocialLinks />
	</div>
</section>

<section class="section container">
	<div class="section-head">
		<h2 class="section-title">Projects</h2>
	</div>
	{#each projectGroups as group (group.title)}
		<div class="project-group">
			<h3 class="project-group-title">{group.title}</h3>
			<ul class="project-list">
				{#each group.projects as project (project.name)}
					<ProjectCard {project} />
				{/each}
			</ul>
		</div>
	{/each}
</section>

<section class="section container">
	<div class="section-head">
		<h2 class="section-title">Latest posts</h2>
		<a class="section-link" href="/blog">すべての記事 →</a>
	</div>
	{#if data.latestPosts.length}
		<ul class="post-list">
			{#each data.latestPosts as post (post.slug)}
				<li>
					<a href="/posts/{post.slug}">
						<span class="post-item-title">{post.title}</span>
						<span class="post-item-date">{post.date}</span>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p>まだ記事がありません。</p>
	{/if}
</section>
