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

<section class="hero container wide">
	<p class="hero-eyebrow">{profile.title} — {profile.location}</p>
	<h1 class="hero-name">{profile.name}</h1>
	<p class="hero-focus">
		{#each profile.focus as item, i (item)}
			{#if i > 0}<span class="sep" aria-hidden="true">/</span>{/if}<span>{item}</span>
		{/each}
	</p>

	<dl class="facts">
		{#each profile.facts as fact (fact.label)}
			<div class="fact">
				<dt>{fact.label}</dt>
				<dd>
					{#if fact.href}
						<a href={fact.href} target="_blank" rel="noopener noreferrer">{fact.value}</a>
					{:else}
						{fact.value}
					{/if}
				</dd>
			</div>
		{/each}
	</dl>

	<div class="hero-meta">
		<SocialLinks />
	</div>
</section>

<section class="section container wide" id="projects">
	<header class="section-head">
		<h2 class="section-label">Projects</h2>
		<p class="section-note">Open source I build and maintain, grouped by what it is for.</p>
	</header>
	{#each projectGroups as group (group.title)}
		<section class="group">
			<div class="group-head">
				<h3 class="group-title">{group.title}</h3>
				<p class="group-count">
					{group.projects.length}
					{group.projects.length === 1 ? 'project' : 'projects'}
				</p>
				<p class="group-note">{group.note}</p>
			</div>
			<ul class="project-list">
				{#each group.projects as project (project.name)}
					<ProjectCard {project} />
				{/each}
			</ul>
		</section>
	{/each}
</section>

<section class="section container wide" id="writing">
	<header class="section-head">
		<h2 class="section-label">Writing</h2>
		<p class="section-note">Notes on compilers, tooling and building software.</p>
	</header>
	<div class="section-body">
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
			<a class="more-link" href="/blog">All posts →</a>
		{:else}
			<p class="empty">No posts yet.</p>
		{/if}
	</div>
</section>
