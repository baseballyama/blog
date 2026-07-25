// 最初のペイント前に走らせる必要がある唯一のスクリプト。
//
// このサイトは csr = false の MPA で、Svelte のクライアントランタイムは配信されない。
// テーマ (light/dark) だけはブラウザ側の状態なので、ここに閉じた素の JS で扱う。
// テーマを HTML に焼き込まずクライアント側に残すことで、エッジキャッシュのエントリが
// テーマ違いで分裂しない ([[hooks.server.ts]] のキャッシュキーを参照)。
//
// このファイルは scripts/build-head-inline.mjs が minify 済みの IIFE にビルドし、
// hooks.server.ts が app.html の %head.inline% に差し込む。つまりここのコメントは
// 配信されない。app.html に直接書くと、コメントごと全ページに乗ってしまう。

const root = document.documentElement;

function apply(theme: string) {
	root.dataset.theme = theme;
}

// FOUC 防止。localStorage が使えない環境では light に倒す。
try {
	const stored = localStorage.getItem('theme');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	apply(stored || (prefersDark ? 'dark' : 'light'));
} catch {
	apply('light');
}

// data-js は「JS が動いている」印。押しても何も起きないトグルボタンを出さないよう、
// CSS 側 (`[data-js] .theme-toggle`) がこれを見て表示を決める。
root.dataset.js = 'on';

// トグルボタンはまだ描画されていないので、document への委譲で受ける。
document.addEventListener('click', (event) => {
	const target = event.target;
	if (!(target instanceof Element)) return;
	if (!target.closest('[data-theme-toggle]')) return;

	const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
	apply(next);
	try {
		localStorage.setItem('theme', next);
	} catch {
		// 保存できなくても、そのセッション限りの切り替えとしては成立する
	}
});
