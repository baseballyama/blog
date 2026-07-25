// 記事 Markdown の frontmatter パーサ。SvelteKit 側 (posts.ts) とビルドスクリプト
// (scripts/build-ogp.mjs) の両方から使うので、Vite にも Node にも依存しない素の ESM
// として置いている。

/**
 * `---` で囲まれた frontmatter を `key: value` の平坦なマップとして取り出す。
 * frontmatter が無ければ全文を本文として返す。
 *
 * @param {string} raw
 * @returns {{ meta: Record<string, string>; body: string }}
 */
export function parseFrontmatter(raw) {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { meta: {}, body: raw };

	/** @type {Record<string, string>} */
	const meta = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx > 0) {
			meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
		}
	}
	return { meta, body: match[2] };
}
