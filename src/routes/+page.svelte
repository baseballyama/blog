<script lang="ts">
	import { profile } from '$lib/data/profile';
	import { projectGroups } from '$lib/data/projects';
	import { talkYears, primaryUrl } from '$lib/data/talks';
	import { DEFAULT_LOCALE, blogPath, postPath } from '$lib/i18n';
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
	<div class="hero-main">
		<img
			class="hero-avatar"
			src={profile.avatar}
			alt={profile.name}
			width="96"
			height="96"
			decoding="async"
		/>
		<p class="hero-eyebrow">{profile.title} — {profile.location}</p>
		<h1 class="hero-name">{profile.name}</h1>

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
	</div>

	<aside class="hero-side">
		<h2 class="side-label">Latest writing</h2>
		{#if data.latestPosts.length}
			<ul class="side-list">
				{#each data.latestPosts as post (post.slug)}
					<li>
						<a href={postPath(DEFAULT_LOCALE, post.slug)}>
							<span class="side-date">{post.date}</span>
							<span class="side-title">{post.title}</span>
						</a>
					</li>
				{/each}
			</ul>
			<a class="more-link" href={blogPath(DEFAULT_LOCALE)}>All posts →</a>
		{:else}
			<p class="empty">No posts yet.</p>
		{/if}
	</aside>
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

<section class="section container wide" id="speaking">
	<header class="section-head">
		<h2 class="section-label">Speaking</h2>
		<p class="section-note">Conference and meetup talks, newest first.</p>
	</header>
	{#each talkYears as year (year.year)}
		<section class="group">
			<div class="group-head">
				<h3 class="group-title">{year.year}</h3>
				<p class="group-count">
					{year.talks.length}
					{year.talks.length === 1 ? 'talk' : 'talks'}
				</p>
			</div>
			<ul class="talk-list">
				{#each year.talks as talk (talk.title)}
					{@const primary = primaryUrl(talk)}
					<li class="talk">
						<p class="talk-meta">
							<time datetime={talk.date}>{talk.date}</time>
							{#if talk.eventUrl}
								<a
									class="talk-event"
									href={talk.eventUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{talk.event}
								</a>
							{:else}
								<span class="talk-event">{talk.event}</span>
							{/if}
							{#if talk.slidesUrl && talk.videoUrl}
								<a class="talk-link" href={talk.videoUrl} target="_blank" rel="noopener noreferrer">
									Video
								</a>
							{/if}
							{#if talk.repoUrl}
								<a class="talk-link" href={talk.repoUrl} target="_blank" rel="noopener noreferrer">
									Source
								</a>
							{/if}
						</p>
						{#if primary}
							<a class="talk-title" href={primary} target="_blank" rel="noopener noreferrer">
								{talk.title}
							</a>
						{:else}
							<span class="talk-title">{talk.title}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</section>
