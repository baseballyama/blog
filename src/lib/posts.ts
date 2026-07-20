import { Marked } from 'marked';
import { AUTHOR } from './config';
import { DEFAULT_LOCALE, isLocale, otherLocale, type Locale } from './i18n';

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
				text: `<pre class="mermaid">${token.text}</pre>\n`,
			});
		}
	},
});

// posts/<slug>/<locale>.md をビルド時に読み込む（raw 文字列）。
const rawPosts = import.meta.glob('/posts/*/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

export interface PostMeta {
	slug: string;
	/** この記事データが実際に何語か */
	locale: Locale;
	title: string;
	date: string;
	author: string;
	description: string;
	/** 翻訳が存在する言語 */
	locales: Locale[];
	/** 要求された言語が無く、別言語で代替していれば true */
	isFallback: boolean;
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

type Entry = Omit<Post, 'locales' | 'isFallback'>;

/** slug → 言語 → 記事 */
const bySlug = new Map<string, Map<Locale, Entry>>();

for (const [path, raw] of Object.entries(rawPosts)) {
	// path は /posts/<slug>/<locale>.md
	const segments = path.split('/');
	const localeName = segments.pop()!.replace(/\.md$/, '');
	const slug = segments.pop()!;
	if (!isLocale(localeName)) continue;

	const { meta, body } = parseFrontmatter(raw);
	// walkTokens で code→html を同期変換しているため parse() は同期的に文字列を返す。
	const html = marked.parse(body) as string;
	const description =
		meta.description ||
		body
			.replace(/[#*`\n]/g, ' ')
			.slice(0, 120)
			.trim();

	const entry: Entry = {
		slug,
		locale: localeName,
		title: meta.title || slug,
		date: meta.date || '',
		author: meta.author || AUTHOR,
		description,
		html,
		hasMermaid: html.includes('class="mermaid"'),
	};

	const translations = bySlug.get(slug) ?? new Map<Locale, Entry>();
	translations.set(localeName, entry);
	bySlug.set(slug, translations);
}

/** 要求された言語で解決する。無ければ他言語にフォールバックする */
function resolve(slug: string, locale: Locale): Post | undefined {
	const translations = bySlug.get(slug);
	if (!translations) return undefined;

	const locales = [...translations.keys()].toSorted((a, b) =>
		a === DEFAULT_LOCALE ? -1 : b === DEFAULT_LOCALE ? 1 : a.localeCompare(b),
	);
	const entry = translations.get(locale) ?? translations.get(otherLocale(locale));
	if (!entry) return undefined;

	return { ...entry, locales, isFallback: entry.locale !== locale };
}

const slugsByDate = [...bySlug.keys()].toSorted((a, b) => {
	const dateA = resolve(a, DEFAULT_LOCALE)?.date ?? '';
	const dateB = resolve(b, DEFAULT_LOCALE)?.date ?? '';
	return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
});

/** 一覧表示用のメタ情報のみ（本文 HTML を含まない）。日付の降順 */
export function getPostMetas(locale: Locale): PostMeta[] {
	return slugsByDate.flatMap((slug) => {
		const post = resolve(slug, locale);
		if (!post) return [];
		const { html: _html, hasMermaid: _hasMermaid, ...meta } = post;
		return [meta];
	});
}

export function getPost(slug: string, locale: Locale): Post | undefined {
	return resolve(slug, locale);
}

export function getSlugs(): string[] {
	return slugsByDate;
}
