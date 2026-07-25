/**
 * 「日本語でも読めます」バナーの表示判定。
 *
 * GitHub Pages ではサーバーが居なかったので navigator.language を見るクライアント JS で
 * 出していたが、Cloudflare Workers 上でレンダリングするようになったので Accept-Language を
 * 直接見て HTML に焼き込む。結果として、この機能のためのクライアント JS はゼロになった。
 */

/** 「もう出さない」を覚えておく cookie */
export const LOCALE_NOTICE_COOKIE = 'locale-notice';

/**
 * Accept-Language の最優先言語が日本語かどうか。
 * 「日本語も分かる」ではなく「日本語が第一希望」に限る（en を第一希望にしている
 * 日本語話者にまで英語ページで日本語のバナーを出さないため）。
 */
export function prefersJapanese(header: string | null | undefined): boolean {
	if (!header) return false;

	let bestTag = '';
	let bestQuality = -1;

	// 例: `ja,en-US;q=0.9,en;q=0.8`
	for (const part of header.split(',')) {
		const [rawTag, ...params] = part.split(';');
		const tag = rawTag.trim().toLowerCase();
		if (!tag) continue;

		const qParam = params.map((p) => /^\s*q=([\d.]+)\s*$/.exec(p)).find((m) => m !== null);
		const quality = qParam ? Number.parseFloat(qParam[1]) : 1;
		// 同じ q なら先に書かれている方が優先なので、真に大きいときだけ更新する。
		if (Number.isNaN(quality) || quality <= bestQuality) continue;

		bestTag = tag;
		bestQuality = quality;
	}

	return bestTag === 'ja' || bestTag.startsWith('ja-');
}
