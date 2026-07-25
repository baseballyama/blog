// See https://svelte.dev/docs/kit/types#app.d.ts

// App.Platform (ctx / caches / cf) は adapter-cloudflare が ambient 宣言で持っている。
// svelte.config.js 経由では型解決に乗らないので、ここで明示的に取り込む。
/// <reference types="@sveltejs/adapter-cloudflare" />

// import / export を持たないので、このファイル全体がグローバル宣言として扱われる
// （SvelteKit の雛形にある `declare global { ... } export {}` と同じ意味）。
declare namespace App {
	interface Locals {
		/** 英語ページで「日本語でも読めます」の案内を出すか (hooks.server.ts が決める) */
		suggestJa: boolean;
	}
	// バインディング (KV / D1 / R2 など) を足したら、ここで Platform['env'] を宣言する。
	// `wrangler types` が吐く Env インターフェースをそのまま当てるのが楽。
}
