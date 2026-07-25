import { version } from '$app/environment';
import { LOCALE_NOTICE_COOKIE, prefersJapanese } from '$lib/locale-notice';
// app.html は Vite の minify 対象外で、書いた内容がそのまま全ページに乗る。
// <head> のインラインスクリプトは scripts/build-head-inline.mjs が minify したものを
// ここで差し込む（ソースと解説は src/lib/head-inline/ にあり、配信されない）。
import headInline from '$lib/generated/head-inline.html?raw';
import type { Handle, RequestEvent } from '@sveltejs/kit';

/**
 * エッジに置く控えの寿命。キャッシュキーにビルド version が入っているので、デプロイ
 * すればキー空間ごと入れ替わる。つまり古いものを引くことが原理的に起きず、TTL を
 * 短くする理由がない（用済みのエントリは LRU で落ちる）。
 */
const EDGE_MAX_AGE = 60 * 60 * 24 * 365;
const EDGE_CACHE_CONTROL = `public, max-age=${EDGE_MAX_AGE}, immutable`;

/**
 * ブラウザ側の保持時間。再訪をネットワークに出さないための短い TTL。
 *
 * 当初は `no-cache` にして ETag による 304 を狙っていたが、Cloudflare が
 * `text/html` のレスポンスから **ETag を削除する**ため成立しなかった
 * (`/rss.xml` や画像では残る。HTML 専用の処理を挟むゾーン機能が原因で、
 * Early Hints が有力)。条件付きリクエストが使えない以上、`no-cache` は再訪の
 * たびに本文を丸ごと再取得させるだけになる。短い max-age を与えて
 * ブラウザキャッシュから返す方が速く、転送量も小さい。
 *
 * `private` には 2 つの役割がある。
 *   1. 言語バリアントを含む HTML を共有キャッシュに置かせない。
 *   2. adapter-cloudflare の Worker は worktop 経由で「Cache-Control が付いた
 *      レスポンスを*素の URL*をキーに Cache API へ載せる」処理を内蔵しており、
 *      そのキーは言語バリアントも version も区別しない。`private` はその層の
 *      判定 (`/(private|no-cache|no-store)/i`) に弾かれるので、内蔵キャッシュを
 *      迂回して下の版数付きキーだけが効く。
 *
 * 代償はデプロイ直後の最大 60 秒だけ古い HTML が見えること。エッジ側はキーに
 * version が入っていて常に最新なので、影響はその間に再訪した利用者に限られる。
 */
const CLIENT_MAX_AGE = 60;
const CLIENT_CACHE_CONTROL = `private, max-age=${CLIENT_MAX_AGE}`;

/** SSR したレスポンス用の防御的ヘッダ。_headers は静的アセットにしか効かない */
const SECURITY_HEADERS: Record<string, string> = {
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Frame-Options': 'DENY',
};

/**
 * Cache API のうち、ここで使う分だけを写した型。
 *
 * @cloudflare/workers-types の CacheStorage は自前の Request / Response 型で書かれていて、
 * SvelteKit が扱う標準の Request / Response とは構造的に別物として扱われてしまう。
 * 実体は同じものなので、境界をこの薄いインターフェースで切る。
 */
interface EdgeCache {
	match(request: Request): Promise<Response | undefined>;
	put(request: Request, response: Response): Promise<void>;
}

/**
 * 同じ内容になるリクエストをまとめるためのキー。
 *
 * 記事もプロフィールもビルド時に確定するので、レスポンスの中身は
 * (ビルド version, 言語バリアント, パス) だけで決まる。逆に言えばこの 3 つが同じなら
 * 常に同じものが返る。
 *
 * クエリ文字列も含めている。今はどのページも読んでいないので ?utm_source=... 違いで
 * ミスが増えるだけだが、クエリを見るページを足したときに黙って壊れる方が高くつく。
 */
function cacheKey(event: RequestEvent, variant: string): Request {
	const { pathname, search } = event.url;
	return new Request(`https://edge.cache/${version}/${variant}${pathname}${search}`);
}

/** エッジキャッシュの効き具合を外から確認できるようにする印 */
type CacheState = 'HIT' | 'MISS' | 'BYPASS';

function withClientHeaders(response: Response, etag: string, state: CacheState): Response {
	const out = new Response(response.body, response);
	out.headers.set('cache-control', CLIENT_CACHE_CONTROL);
	out.headers.set('etag', etag);
	out.headers.set('x-edge-cache', state);
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		out.headers.set(name, value);
	}
	return out;
}

export const handle: Handle = async ({ event, resolve }) => {
	// /ja 配下は <html lang="ja"> で出力する。前方一致だけだと /japan-... のような
	// 別のパスまで拾ってしまい、キャッシュのバリアントまでずれるので境界を見る。
	const { pathname } = event.url;
	const lang = pathname === '/ja' || pathname.startsWith('/ja/') ? 'ja' : 'en';

	// 「日本語でも読めます」の案内を出すかどうかをサーバー側で決める。GitHub Pages では
	// navigator.language を見るクライアント JS が要ったが、Workers 上では Accept-Language を
	// そのまま読める。
	event.locals.suggestJa =
		lang === 'en' &&
		event.cookies.get(LOCALE_NOTICE_COOKIE) !== 'dismissed' &&
		prefersJapanese(event.request.headers.get('accept-language'));

	const variant = event.locals.suggestJa ? 'en+ja-hint' : lang;
	const etag = `"${version}-${variant}"`;
	const isGet = event.request.method === 'GET';

	// 中身は (version, variant, パス) で決まるので、ETag が一致するなら本文は要らない。
	// HTML では Cloudflare に ETag を落とされるので実際に効くのは /rss.xml など
	// text/html 以外だけだが、ゾーン設定次第で HTML でも復活するため残しておく。
	if (isGet && event.request.headers.get('if-none-match') === etag) {
		return withClientHeaders(new Response(null, { status: 304 }), etag, 'HIT');
	}

	// 開発サーバーでは platform が居ないことがあるので、無ければ素通しする。
	const cache = event.platform?.caches?.default as EdgeCache | undefined;
	const key = cacheKey(event, variant);

	if (isGet && cache) {
		const hit = await cache.match(key);
		if (hit) return withClientHeaders(hit, etag, 'HIT');
	}

	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%lang%', lang).replace('%head.inline%', headInline),
	});

	// Set-Cookie が付くもの（バナーを閉じた直後の遷移など）は利用者ごとに違うので載せない。
	const storable = isGet && response.status === 200 && !response.headers.has('set-cookie');
	if (cache && storable) {
		const stored = new Response(response.clone().body, response);
		stored.headers.set('cache-control', EDGE_CACHE_CONTROL);
		event.platform?.ctx.waitUntil(cache.put(key, stored));
	}

	return withClientHeaders(response, etag, storable ? 'MISS' : 'BYPASS');
};
