export interface Project {
	name: string;
	/** 日本語の短い説明 */
	description: string;
	language: string;
	stars: number;
	/** GitHub URL。private の場合は null */
	url: string | null;
	/** ドキュメント / デモ / npm へのリンク */
	homepage?: string | null;
	private?: boolean;
	/** トップで大きく強調するか */
	featured?: boolean;
}

// stars はビルド時点のスナップショット（手動更新）。
export const projects: Project[] = [
	{
		name: 'rsvelte',
		description:
			'Rust 製の Svelte コンパイラ。公式 Svelte 5 コンパイラのテストスイートを 100% パスし、OXC エコシステムへのネイティブ統合を目指す。このサイトも rsvelte でビルドしています。',
		language: 'Rust',
		stars: 30,
		url: 'https://github.com/baseballyama/rsvelte',
		homepage: 'https://baseballyama.github.io/rsvelte/',
		featured: true
	},
	{
		name: 'svelte-preprocess-delegate-events',
		description: 'on:* でイベントを委譲できる Svelte プリプロセッサ。',
		language: 'JavaScript',
		stars: 53,
		url: 'https://github.com/baseballyama/svelte-preprocess-delegate-events'
	},
	{
		name: 'eslint-plugin-postgresql',
		description:
			'PostgreSQL ファイル向けの ESLint プラグイン。SQL のスタイル・性能・セキュリティのベストプラクティスを強制する。',
		language: 'TypeScript',
		stars: 11,
		url: 'https://github.com/baseballyama/eslint-plugin-postgresql',
		homepage: 'https://baseballyama.github.io/eslint-plugin-postgresql/'
	},
	{
		name: 'xlsx-kit',
		description: 'openpyxl にインスパイアされた、Excel (XLSX) 操作の JavaScript ライブラリ。',
		language: 'TypeScript',
		stars: 10,
		url: 'https://github.com/baseballyama/xlsx-kit',
		homepage: 'https://baseballyama.github.io/xlsx-kit/'
	},
	{
		name: 'postgresql-eslint-parser',
		description:
			'PostgreSQL SQL を ESTree 互換 AST に変換する ESLint パーサー。PostgreSQL 固有の構文・拡張に対応。',
		language: 'TypeScript',
		stars: 7,
		url: 'https://github.com/baseballyama/postgresql-eslint-parser',
		homepage: 'https://baseballyama.github.io/postgresql-eslint-parser/'
	},
	{
		name: 'kumiki',
		description: 'Svelte 5 向けの、ヘッドレスで合成可能・高アクセシビリティな UI プリミティブ。',
		language: 'TypeScript',
		stars: 4,
		url: 'https://github.com/baseballyama/kumiki',
		homepage: 'https://baseballyama.github.io/kumiki/'
	},
	{
		name: 'vite-devtools-svelte',
		description: 'Svelte 5 DevTools。Vite DevTools プラグインとしても、単体としても動作する。',
		language: 'Svelte',
		stars: 4,
		url: 'https://github.com/baseballyama/vite-devtools-svelte',
		homepage: 'https://baseballyama.github.io/vite-devtools-svelte/'
	},
	{
		name: 'hono-shaking',
		description: 'Hono RPC 向けの、型を解析して使われていないエンドポイントを検出するツール。',
		language: 'TypeScript',
		stars: 2,
		url: 'https://github.com/baseballyama/hono-shaking'
	},
	{
		name: 'svelte-ast-print-playground',
		description: 'svelte-ast-print のプレイグラウンド。',
		language: 'Svelte',
		stars: 1,
		url: 'https://github.com/baseballyama/svelte-ast-print-playground',
		homepage: 'https://baseballyama.github.io/svelte-ast-print-playground'
	},
	{
		name: 'pptx-kit',
		description: 'PowerPoint (PPTX) 操作の JavaScript ライブラリ。',
		language: 'TypeScript',
		stars: 0,
		url: 'https://github.com/baseballyama/pptx-kit',
		homepage: 'https://baseballyama.github.io/pptx-kit/'
	},
	{
		name: 'fast-leiden',
		description:
			'ネイティブ igraph/leidenalg バインディングによる、高速な Leiden コミュニティ検出 (Node.js)。',
		language: 'TypeScript',
		stars: 0,
		url: 'https://github.com/baseballyama/fast-leiden',
		homepage: 'https://www.npmjs.com/package/fast-leiden'
	},
	{
		name: 'jsonnet-eslint-parser',
		description: 'go-jsonnet (WASM) を用いた、Jsonnet / libsonnet 向けの ESLint パーサー。',
		language: 'TypeScript',
		stars: 0,
		url: null,
		private: true
	},
	{
		name: 'vue3-eslint-parser',
		description: 'より高速で強力な、Vue 3 向けの ESLint パーサー。',
		language: 'TypeScript',
		stars: 0,
		url: null,
		private: true
	},
	{
		name: 'svelte-shaker',
		description: 'Svelte コンポーネントの TreeShaker。',
		language: 'TypeScript',
		stars: 0,
		url: null,
		private: true
	}
];
