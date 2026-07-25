import { error } from '@sveltejs/kit';
import { getPost } from '$lib/posts';
import { DEFAULT_LOCALE, isLocale } from '$lib/i18n';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const locale = params.lang && isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
	const post = getPost(params.slug, locale);
	if (!post) {
		error(404, 'Post not found');
	}
	return { locale, post };
};
