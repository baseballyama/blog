import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// `@sveltejs/vite-plugin-svelte` は pnpm overrides で `@rsvelte/vite-plugin-svelte`
	// (Rust 製 rsvelte コンパイラ経由) に差し替わる。
	preprocess: vitePreprocess(),
	kit: {
		// ビルド成果物は build/ に出力し、CI (GitHub Actions) から GitHub Pages にデプロイする。
		adapter: adapter({
			fallback: undefined,
			precompress: false,
			strict: true,
		}),
		paths: {
			base: '',
		},
	},
};

export default config;
