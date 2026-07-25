// src/lib/mermaid-client.ts を単体の ESM として static/generated/ に吐き出す。
//
// サイトは csr = false の MPA なので、SvelteKit のクライアントバンドルは配信されない。
// mermaid だけは描画にブラウザが要るため、Svelte から独立した素の module script として
// 別ビルドし、図を含む記事ページだけが <script type="module"> で読み込む。
import path from 'node:path';
import { build } from 'vite';

const ROOT = path.join(import.meta.dirname, '..');

await build({
	// SvelteKit / rsvelte プラグインを噛ませたくないので設定ファイルは読まない。
	configFile: false,
	root: ROOT,
	logLevel: 'warn',
	build: {
		outDir: path.join(ROOT, 'static/generated'),
		emptyOutDir: true,
		// top-level await と、mermaid が内部で使う動的 import をそのまま出す。
		target: 'esnext',
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

console.log('[mermaid] built static/generated/mermaid.js');
