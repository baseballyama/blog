import { Resvg } from '@resvg/resvg-js';
import { error } from '@sveltejs/kit';
import { getPost, getSlugs } from '$lib/posts';
import { LOCALES, isLocale } from '$lib/i18n';
import { buildOgpSvg, ensureFonts } from '$lib/server/ogp';
import type { RequestHandler, EntryGenerator } from './$types';

export const prerender = true;

// 言語ごとにタイトルが違うので、記事 × 言語 の枚数を生成する。
export const entries: EntryGenerator = () => {
	return getSlugs().flatMap((slug) => LOCALES.map((loc) => ({ loc, slug })));
};

export const GET: RequestHandler = async ({ params }) => {
	if (!isLocale(params.loc)) {
		error(404, 'Unknown locale');
	}
	const post = getPost(params.slug, params.loc);
	if (!post) {
		error(404, 'Post not found');
	}
	const fontFiles = await ensureFonts();

	const resvg = new Resvg(buildOgpSvg(post.title, post.date), {
		font: { fontFiles, loadSystemFonts: false },
	});
	const png = resvg.render().asPng();

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=604800',
		},
	});
};
