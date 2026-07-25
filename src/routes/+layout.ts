// MPA として配信する。ページ遷移はすべてドキュメント遷移で、Svelte のクライアント
// ランタイムもルーターも配信しない。動きが要る箇所 (テーマ切替・mermaid) だけ、
// フレームワークに依存しない素の JS を個別に読み込む。
export const csr = false;

// HTML は Worker 上で SSR し、hooks.server.ts のエッジキャッシュ層で受ける。
// ビルド時にしか作れないもの (OGP 画像) は SvelteKit の外で生成して static/ に置く。
export const prerender = false;

export const trailingSlash = 'never';
