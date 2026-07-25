<script lang="ts">
	import type { Project } from '$lib/data/projects';

	let { project }: { project: Project } = $props();
</script>

<li class="project">
	<div class="project-row">
		{#if project.url}
			<a class="project-name" href={project.url} target="_blank" rel="noopener noreferrer">
				{project.name}
			</a>
		{:else}
			<span class="project-name is-private">{project.name}</span>
		{/if}
		<span class="project-meta">
			<span class="project-lang">{project.language}</span>
			{#if project.url}
				<span class="project-stars">
					<span class="star-glyph" aria-hidden="true">★</span>
					<span class="visually-hidden">stars:</span>
					{project.stars}
				</span>
			{:else if project.private}
				<span class="project-private">private</span>
			{/if}
			{#if project.homepage}
				<!--
					見た目は "Docs" で揃えるが、リンク先はプロジェクトごとに違う。同じ文言の
					リンクが並ぶとスクリーンリーダー利用者には行き先が区別できないので、
					アクセシブル名にはプロジェクト名を含める。
				-->
				<a
					class="project-docs"
					href={project.homepage}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="{project.name} Docs"
				>
					Docs
				</a>
			{/if}
		</span>
	</div>
	<p class="project-desc">{project.description}</p>
</li>
