// <head> にインラインで置くものを minify して src/lib/generated/head-inline.html に吐く。
//
// app.html は SvelteKit / Vite の minify 対象外で、書いた内容がそのまま全ページに乗る。
// テーマ初期化スクリプトをコメント付きで直接書くと、その解説文まで毎リクエスト配ることに
// なるので、ソースは src/lib/head-inline/ に置いてここでビルドし、hooks.server.ts が
// app.html の %head.inline% に差し込む。
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';

const ROOT = path.join(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'src/lib/generated');
const TMP_DIR = path.join(ROOT, '.cache/head-inline');

/**
 * 投機的プリレンダリング。ドキュメント遷移でも SPA 並みの体感にするためのもので、
 * eagerness: moderate はリンクのホバー/ポインタダウンが起点なので無差別な先読みには
 * ならない。未対応ブラウザでは単に無視される。
 */
const SPECULATION_RULES = {
	prerender: [{ where: { href_matches: '/*' }, eagerness: 'moderate' }],
};

// ES modules は defer 扱いになり「最初のペイント前」に間に合わないので、
// 従来型スクリプトとして評価される IIFE で出す。
await build({
	// SvelteKit / rsvelte プラグインを噛ませたくないので設定ファイルは読まない。
	configFile: false,
	root: ROOT,
	logLevel: 'warn',
	build: {
		outDir: TMP_DIR,
		emptyOutDir: true,
		target: 'es2018',
		minify: 'esbuild',
		lib: {
			entry: path.join(ROOT, 'src/lib/head-inline/theme.ts'),
			formats: ['iife'],
			name: '__theme',
			fileName: () => 'theme.js',
		},
	},
});

const theme = fs.readFileSync(path.join(TMP_DIR, 'theme.js'), 'utf8').trim();

const html = `<script>${theme}</script><script type="speculationrules">${JSON.stringify(SPECULATION_RULES)}</script>`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'head-inline.html'), html);

console.log(`[head-inline] ${Buffer.byteLength(html)} bytes`);
