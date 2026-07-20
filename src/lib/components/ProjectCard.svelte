<script lang="ts">
	import type { Project } from '$lib/data/projects';

	let { project }: { project: Project } = $props();
</script>

<li>
	<div class="project-row">
		<span class="project-name">
			{project.name}
			{#if project.stars > 0}<span class="star">★ {project.stars}</span>{/if}
		</span>
		<span class="project-links">
			<span class="project-tag">{project.language}</span>
			{#if project.url}
				<a href={project.url} target="_blank" rel="noopener noreferrer">GitHub</a>
			{:else if project.private}
				<span class="project-tag">private</span>
			{/if}
			{#if project.homepage}
				<a href={project.homepage} target="_blank" rel="noopener noreferrer">Docs</a>
			{/if}
		</span>
	</div>
	<p class="project-desc">{project.description}</p>
</li>
