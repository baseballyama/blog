import { Marked } from 'marked';
import { AUTHOR } from './config';

// mermaid コードブロックは <pre class="mermaid"> に変換し、クライアントで描画する。
// renderer から false を返すと marked が非同期モードになり parse() が Promise を返す
// （→ {@html} が空になる）ため、walkTokens で同期的に code → html トークンへ書き換える。
const marked = new Marked({
	walkTokens(token) {
		if (token.type === 'code' && token.lang === 'mermaid') {
			Object.assign(token, {
				type: 'html',
				block: true,
				pre: false,
				text: `<pre class="mermaid">${token.text}</pre>\n`
			});
		}
	}
});

// posts/*.md をビルド時に読み込む（raw 文字列）。
const rawPosts = import.meta.glob('/posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export interface PostMeta {
	slug: string;
	title: string;
	date: string;
	author: string;
	description: string;
}

export interface Post extends PostMeta {
	/** marked でレンダリング済みの本文 HTML */
	html: string;
	hasMermaid: boolean;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { meta: {}, body: raw };

	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx > 0) {
			meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
		}
	}
	return { meta, body: match[2] };
}

const posts: Post[] = Object.entries(rawPosts)
	.map(([path, raw]) => {
		const slug = path.split('/').pop()!.replace(/\.md$/, '');
		const { meta, body } = parseFrontmatter(raw);
		// walkTokens で code→html を同期変換しているため parse() は同期的に文字列を返す。
		const html = marked.parse(body) as string;
		const description =
			meta.description || body.replace(/[#*`\n]/g, ' ').slice(0, 120).trim();
		return {
			slug,
			title: meta.title || slug,
			date: meta.date || '',
			author: meta.author || AUTHOR,
			description,
			html,
			hasMermaid: html.includes('class="mermaid"')
		} satisfies Post;
	})
	.sort((a, b) => (b.date > a.date ? 1 : -1));

/** 本文を含む全記事（日付の降順） */
export function getAllPosts(): Post[] {
	return posts;
}

/** 一覧表示用のメタ情報のみ（本文 HTML を含まない） */
export function getPostMetas(): PostMeta[] {
	return posts.map(({ slug, title, date, author, description }) => ({
		slug,
		title,
		date,
		author,
		description
	}));
}

export function getPost(slug: string): Post | undefined {
	return posts.find((p) => p.slug === slug);
}

export function getSlugs(): string[] {
	return posts.map((p) => p.slug);
}
