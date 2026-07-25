import { redirect } from '@sveltejs/kit';
import { LOCALE_NOTICE_COOKIE } from '$lib/locale-notice';
import type { RequestHandler } from './$types';

/** 1 年。閉じた判断はそのくらい覚えていてよい */
const MAX_AGE = 60 * 60 * 24 * 365;

/**
 * 言語案内バナーの「閉じる」。JS 無しのネイティブフォーム送信で叩かれるので、
 * cookie を立てて元のページへ 303 で戻す。
 *
 * GET ではなく POST なのは、投機的プリレンダリング (app.html の speculationrules) や
 * クローラのリンク先読みで勝手に閉じられないようにするため。
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const target = (await request.formData()).get('redirect');

	// オープンリダイレクト回避。`//evil.example` や `/\evil.example` は
	// ブラウザによっては別オリジンとして解釈されるので弾く。
	const location = typeof target === 'string' && /^\/(?![/\\])/.test(target) ? target : '/';

	cookies.set(LOCALE_NOTICE_COOKIE, 'dismissed', {
		path: '/',
		maxAge: MAX_AGE,
		httpOnly: true,
		sameSite: 'lax',
	});

	redirect(303, location);
};
