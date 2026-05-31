import { getPostMetas } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		latestPosts: getPostMetas().slice(0, 3)
	};
};
