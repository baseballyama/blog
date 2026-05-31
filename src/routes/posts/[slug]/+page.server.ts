import { error } from '@sveltejs/kit';
import { getPost, getSlugs } from '$lib/posts';
import type { PageServerLoad, EntryGenerator } from './$types';

export const entries: EntryGenerator = () => {
	return getSlugs().map((slug) => ({ slug }));
};

export const load: PageServerLoad = ({ params }) => {
	const post = getPost(params.slug);
	if (!post) {
		error(404, 'Post not found');
	}
	return { post };
};
