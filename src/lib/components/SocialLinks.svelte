<script lang="ts">
	import { socials } from '$lib/data/socials';
</script>

<ul class="socials">
	{#each socials as social (social.label)}
		<li>
			<a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d={social.icon} /></svg>
				<span>{social.label}</span>
			</a>
		</li>
	{/each}
</ul>
