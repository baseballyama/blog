import { getPostMetas } from '$lib/posts';
import { DEFAULT_LOCALE, isLocale } from '$lib/i18n';
import type { PageServerLoad, EntryGenerator } from './$types';

// /blog (en) と /ja/blog の両方を静的生成する。
export const entries: EntryGenerator = () => [{ lang: '' }, { lang: 'ja' }];

export const load: PageServerLoad = ({ params }) => {
	const locale = params.lang && isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
	return {
		locale,
		posts: getPostMetas(locale),
	};
};
