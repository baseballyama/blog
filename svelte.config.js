import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// `@sveltejs/vite-plugin-svelte` は pnpm overrides で `@rsvelte/vite-plugin-svelte`
	// (Rust 製 rsvelte コンパイラ経由) に差し替わる。
	preprocess: vitePreprocess(),
	kit: {
		// Cloudflare Workers (Static Assets) 向けに出力する。出力先と Worker の
		// エントリは wrangler.jsonc の `main` / `assets.directory` に従う。
		adapter: adapter(),
	},
};

export default config;
