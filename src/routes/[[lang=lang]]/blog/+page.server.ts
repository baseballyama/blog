import { getPostMetas } from '$lib/posts';
import { DEFAULT_LOCALE, isLocale } from '$lib/i18n';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const locale = params.lang && isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
	return {
		locale,
		posts: getPostMetas(locale),
	};
};
