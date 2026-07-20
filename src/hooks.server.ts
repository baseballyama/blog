import type { Handle } from '@sveltejs/kit';

// /ja 配下は <html lang="ja"> で出力する。プリレンダリング時にも適用される。
export const handle: Handle = ({ event, resolve }) => {
	const lang = event.url.pathname.startsWith('/ja') ? 'ja' : 'en';
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang),
	});
};
