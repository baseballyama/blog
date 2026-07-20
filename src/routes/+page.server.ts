import { getPostMetas } from '$lib/posts';
import { DEFAULT_LOCALE } from '$lib/i18n';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		latestPosts: getPostMetas(DEFAULT_LOCALE).slice(0, 3),
	};
};
