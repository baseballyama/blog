import starCounts from './stars.json';

interface ProjectSource {
	name: string;
	description: string;
	language: string;
	/** GitHub の 'owner/name'。private リポジトリは null */
	repo: string | null;
	/** ドキュメント / デモ / npm へのリンク */
	homepage?: string;
	private?: boolean;
}

interface ProjectGroupSource {
	title: string;
	/** 区分が何を集めたものかの一行説明 */
	note: string;
	projects: ProjectSource[];
}

export interface Project extends ProjectSource {
	url: string | null;
	/** scripts/fetch-stars.mjs がビルド時に更新する */
	stars: number;
}

export interface ProjectGroup extends ProjectGroupSource {
	projects: Project[];
}

// 区分内は概ね注力度・スター数の順。
const groups: ProjectGroupSource[] = [
	{
		title: 'Svelte',
		note: 'Compilers, parsers and tooling for the Svelte ecosystem.',
		projects: [
			{
				name: 'rsvelte',
				description:
					'A Svelte compiler written in Rust. Passes 100% of the official Svelte 5 compiler test suite and integrates natively with the OXC ecosystem. This site is built with it.',
				language: 'Rust',
				repo: 'baseballyama/rsvelte',
				homepage: 'https://baseballyama.github.io/rsvelte/',
			},
			{
				name: 'eslint-plugin-svelte',
				description:
					'The official ESLint plugin for Svelte. I develop and maintain it as a Svelte core team member.',
				language: 'TypeScript',
				repo: 'sveltejs/eslint-plugin-svelte',
				homepage: 'https://sveltejs.github.io/eslint-plugin-svelte/',
			},
			{
				name: 'svelte-eslint-parser',
				description:
					'The official ESLint parser that turns Svelte components into an ESTree-compatible AST.',
				language: 'TypeScript',
				repo: 'sveltejs/svelte-eslint-parser',
				homepage: 'https://sveltejs.github.io/svelte-eslint-parser/',
			},
			{
				name: 'svelte-preprocess-delegate-events',
				description: 'A Svelte preprocessor that delegates events declared with on:*.',
				language: 'JavaScript',
				repo: 'baseballyama/svelte-preprocess-delegate-events',
			},
			{
				name: 'svelte-shaker',
				description:
					'Build-time dead code elimination for Svelte 5, via whole-program partial evaluation.',
				language: 'TypeScript',
				repo: 'baseballyama/svelte-shaker',
				homepage: 'https://baseballyama.github.io/svelte-shaker/',
			},
			{
				name: 'vite-devtools-svelte',
				description: 'DevTools for Svelte 5. Runs as a Vite DevTools plugin or on its own.',
				language: 'Svelte',
				repo: 'baseballyama/vite-devtools-svelte',
				homepage: 'https://baseballyama.github.io/vite-devtools-svelte/',
			},
			{
				name: 'svelte-ast-print-playground',
				description: 'A playground for svelte-ast-print.',
				language: 'Svelte',
				repo: 'baseballyama/svelte-ast-print-playground',
				homepage: 'https://baseballyama.github.io/svelte-ast-print-playground',
			},
		],
	},
	{
		title: 'Linting & language tooling',
		note: 'Parsers and lint rules for languages beyond JavaScript.',
		projects: [
			{
				name: 'eslint-plugin-postgresql',
				description:
					'An ESLint plugin for PostgreSQL files that enforces style, performance and security practices in SQL.',
				language: 'TypeScript',
				repo: 'baseballyama/eslint-plugin-postgresql',
				homepage: 'https://baseballyama.github.io/eslint-plugin-postgresql/',
			},
			{
				name: 'oxlint-plugins',
				description: 'A collection of fast oxlint plugins, built together with @ubugeeei.',
				language: 'Rust',
				repo: 'ubugeeei-prod/oxlint-plugins',
				homepage: 'https://ubugeeei-prod.github.io/oxlint-plugins/',
			},
			{
				name: 'postgresql-eslint-parser',
				description:
					'An ESLint parser that turns PostgreSQL SQL into an ESTree-compatible AST, covering PostgreSQL-specific syntax and extensions.',
				language: 'TypeScript',
				repo: 'baseballyama/postgresql-eslint-parser',
				homepage: 'https://baseballyama.github.io/postgresql-eslint-parser/',
			},
			{
				name: 'jsonnet-eslint-parser',
				description: 'An ESLint parser for Jsonnet and libsonnet, powered by go-jsonnet on WASM.',
				language: 'TypeScript',
				repo: 'baseballyama/jsonnet-eslint-parser',
			},
		],
	},
	{
		title: 'Libraries',
		note: 'General-purpose packages: file formats and native bindings.',
		projects: [
			{
				name: '@office-kit/xlsx',
				description:
					'A JavaScript library for reading and writing Excel (XLSX), inspired by openpyxl.',
				language: 'TypeScript',
				repo: 'office-kit/xlsx',
				homepage: 'https://office-kit.github.io/xlsx/',
			},
			{
				name: '@office-kit/pptx',
				description: 'A JavaScript library for reading and writing PowerPoint (PPTX).',
				language: 'TypeScript',
				repo: 'office-kit/pptx',
				homepage: 'https://office-kit.github.io/pptx/',
			},
			{
				name: '@office-kit/docx',
				description: 'A JavaScript library for reading and writing Word (DOCX).',
				language: 'TypeScript',
				repo: 'office-kit/docx',
				homepage: 'https://office-kit.github.io/docx/',
			},
			{
				name: 'fast-leiden',
				description:
					'Fast Leiden community detection for Node.js, via native igraph and leidenalg bindings.',
				language: 'TypeScript',
				repo: 'baseballyama/fast-leiden',
				homepage: 'https://www.npmjs.com/package/fast-leiden',
			},
		],
	},
	{
		title: 'Tools',
		note: 'Small utilities that each solve one problem.',
		projects: [
			{
				name: 'hono-shaking',
				description: 'Finds unused Hono RPC endpoints by analysing types.',
				language: 'TypeScript',
				repo: 'baseballyama/hono-shaking',
			},
		],
	},
];

const stars: Record<string, number> = starCounts;

export const projectGroups: ProjectGroup[] = groups.map((group) => ({
	title: group.title,
	note: group.note,
	projects: group.projects.map((project) => ({
		name: project.name,
		description: project.description,
		language: project.language,
		repo: project.repo,
		homepage: project.homepage,
		private: project.private,
		url: project.repo ? `https://github.com/${project.repo}` : null,
		stars: project.repo ? (stars[project.repo] ?? 0) : 0,
	})),
}));
