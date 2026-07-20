import { error } from '@sveltejs/kit';
import { getPost, getSlugs } from '$lib/posts';
import { DEFAULT_LOCALE, isLocale } from '$lib/i18n';
import type { PageServerLoad, EntryGenerator } from './$types';

// 記事ごとに /posts/<slug> (en) と /ja/posts/<slug> を静的生成する。
export const entries: EntryGenerator = () => {
	return getSlugs().flatMap((slug) => [
		{ lang: '', slug },
		{ lang: 'ja', slug },
	]);
};

export const load: PageServerLoad = ({ params }) => {
	const locale = params.lang && isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
	const post = getPost(params.slug, locale);
	if (!post) {
		error(404, 'Post not found');
	}
	return { locale, post };
};
