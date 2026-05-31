import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// `@sveltejs/vite-plugin-svelte` は pnpm overrides で `@rsvelte/vite-plugin-svelte`
	// (Rust 製 rsvelte コンパイラ経由) に差し替わる。
	preprocess: vitePreprocess(),
	kit: {
		// GitHub Pages は `docs/` を配信するため、ビルド成果物を docs/ に出力する。
		adapter: adapter({
			pages: 'docs',
			assets: 'docs',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		paths: {
			base: ''
		}
	}
};

export default config;
