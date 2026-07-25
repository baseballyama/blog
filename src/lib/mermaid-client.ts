// mermaid 図の描画。csr = false の MPA なので Svelte のクライアントランタイムは
// 一切読み込まれない。このファイルは scripts/build-mermaid.mjs が単体の ESM
// (static/generated/mermaid.js) にバンドルし、図を含む記事ページだけが
// <script type="module"> で読み込む。

import mermaid from 'mermaid';

/** 描画待ちで隠しているブロックを、ソース表示に戻す */
function revealSource() {
	for (const node of document.querySelectorAll('pre.mermaid:not([data-processed])')) {
		node.setAttribute('data-processed', 'error');
	}
}

// 描画が返ってこない場合に備えた保険。白紙のままにはしない。
const failsafe = setTimeout(revealSource, 5000);

try {
	const isDark = document.documentElement.dataset.theme === 'dark';
	mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'neutral' });
	await mermaid.run({ querySelector: 'pre.mermaid' });
} catch {
	// 握りつぶす。下の revealSource() でソースを見せる
} finally {
	clearTimeout(failsafe);
	// 描画されなかったブロックが残っていればソースを表示する
	revealSource();
}
