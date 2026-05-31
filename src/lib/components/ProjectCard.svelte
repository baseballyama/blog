<script lang="ts">
	import type { Project } from '$lib/data/projects';

	let { project }: { project: Project } = $props();
</script>

<article class="project-card" class:featured={project.featured}>
	<div class="project-head">
		<h3>{project.name}</h3>
		{#if project.featured}<span class="badge">This site runs on it</span>{/if}
		{#if project.private}<span class="badge">Private</span>{/if}
	</div>

	<p class="project-desc">{project.description}</p>

	<div class="project-meta">
		<span class="lang">
			<span class="lang-dot" data-lang={project.language}></span>
			{project.language}
		</span>
		{#if project.stars > 0}
			<span class="stars">★ {project.stars}</span>
		{/if}
		<span class="spacer"></span>
		{#if project.url}
			<a href={project.url} target="_blank" rel="noopener noreferrer">GitHub →</a>
		{/if}
		{#if project.homepage}
			<a href={project.homepage} target="_blank" rel="noopener noreferrer">Docs →</a>
		{/if}
	</div>
</article>
