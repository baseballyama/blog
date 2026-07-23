import { getPost, getPostMetas } from '$lib/posts';
import { DEFAULT_LOCALE, blogPath, isLocale, postPath, rssPath } from '$lib/i18n';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '$lib/config';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

// /rss.xml (en) と /ja/rss.xml の両方を静的生成する。
export const entries: EntryGenerator = () => [{ lang: '' }, { lang: 'ja' }];

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = ({ params }) => {
	const locale = params.lang && isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;

	const items = getPostMetas(locale)
		.map((meta) => {
			const post = getPost(meta.slug, locale);
			if (!post) return '';
			const url = `${SITE_URL}${postPath(locale, meta.slug)}`;
			const pubDate = new Date(`${meta.date}T00:00:00Z`).toUTCString();
			return `		<item>
			<title>${escapeXml(post.title)}</title>
			<link>${url}</link>
			<guid>${url}</guid>
			<pubDate>${pubDate}</pubDate>
			<author>${escapeXml(post.author)}</author>
			<description>${escapeXml(post.description)}</description>
			<content:encoded><![CDATA[${post.html}]]></content:encoded>
		</item>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escapeXml(SITE_NAME)}</title>
		<link>${SITE_URL}${blogPath(locale)}</link>
		<atom:link href="${SITE_URL}${rssPath(locale)}" rel="self" type="application/rss+xml" />
		<description>${escapeXml(SITE_DESCRIPTION)}</description>
		<language>${locale}</language>
${items}
	</channel>
</rss>
`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
