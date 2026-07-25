// src/lib/mermaid-client.ts を単体の ESM として static/generated/ に吐き出す。
//
// サイトは csr = false の MPA なので、SvelteKit のクライアントバンドルは配信されない。
// mermaid だけは描画にブラウザが要るため、Svelte から独立した素の module script として
// 別ビルドし、図を含む記事ページだけが <script type="module"> で読み込む。
import path from 'node:path';
import { build } from 'vite';

const ROOT = path.join(import.meta.dirname, '..');

/**
 * 空白除去まで含めた minify を強制する。
 *
 * vite 8 (rolldown) の `build.minify: true` は oxc の mangle と compress は掛けるが、
 * **空白と `//#region` コメントを残す**。識別子がリネームされるので出力は一見 minify
 * 済みに見えるが、実際にはタブインデントも `node_modules/.pnpm/...` を含む region
 * コメントもそのまま配信される（この構成で raw 4.4MB / gzip 1020KB、除去すると
 * raw 3.4MB / gzip 914KB）。
 *
 * 空白除去は rolldown の output オプション `minify.removeWhitespace` だが、vite は
 * `rollupOptions.output.minify` を `never` として型で塞いでいる（"Use build.minify
 * instead"）。そこで outputOptions フックで直接指定する。
 */
const forceMinify = {
	name: 'force-minify',
	outputOptions(options) {
		return { ...options, minify: { mangle: true, compress: true, removeWhitespace: true } };
	},
};

await build({
	// SvelteKit / rsvelte プラグインを噛ませたくないので設定ファイルは読まない。
	configFile: false,
	root: ROOT,
	logLevel: 'warn',
	plugins: [forceMinify],
	build: {
		// emptyOutDir がここを丸ごと消すので、他の生成物と同居させない。
		// static/generated/ 直下に置くと build-avatar.mjs の出力を巻き添えにする。
		outDir: path.join(ROOT, 'static/generated/mermaid'),
		emptyOutDir: true,
		// top-level await と、mermaid が内部で使う動的 import をそのまま出す。
		target: 'esnext',
		minify: true,
		lib: {
			entry: path.join(ROOT, 'src/lib/mermaid-client.ts'),
			formats: ['es'],
			fileName: () => 'mermaid.js',
		},
		rollupOptions: {
			output: {
				// mermaid は図の種類ごとに動的 import する。分割チャンクも同じ
				// ディレクトリに並ぶので、/generated/ 配下で相対解決できる。
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]',
			},
		},
	},
});

console.log('[mermaid] built static/generated/mermaid/mermaid.js');
