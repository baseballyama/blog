import { Marked } from 'marked';
import { AUTHOR } from './config';
import { parseFrontmatter } from './frontmatter.js';
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
	/** 本文から見積もった読了時間（分） */
	readingMinutes: number;
	/** mermaid 図を含むか。含むページだけ描画スクリプトを読む */
	hasMermaid: boolean;
	/** 翻訳が存在する言語 */
	locales: Locale[];
	/** 要求された言語が無く、別言語で代替していれば true */
	isFallback: boolean;
}

export interface Post extends PostMeta {
	/** marked でレンダリング済みの本文 HTML */
	html: string;
}

/** 日本語は 1 分あたりの文字数、英語は 1 分あたりの語数で見積もる */
const CJK_CHARS_PER_MINUTE = 500;
const WORDS_PER_MINUTE = 220;
/** ひらがな・カタカナ・漢字・半角カナ */
const CJK = /[぀-ヿ㐀-鿿ｦ-ﾟ]/g;

/**
 * 本文から読了時間を分で見積もる。日英が混在するので、CJK は文字数・それ以外は語数で
 * 別々に数えて合算する。mermaid は図として読むので文字数には数えない。
 */
function estimateReadingMinutes(body: string): number {
	const text = body.replace(/```mermaid[\s\S]*?```/g, ' ').replace(/[#*`~>|[\]()]/g, ' ');
	const chars = text.match(CJK)?.length ?? 0;
	const words = text.replace(CJK, ' ').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(chars / CJK_CHARS_PER_MINUTE + words / WORDS_PER_MINUTE));
}

/** 本文 HTML を持たない記事本体。html は要求されたときに初めて生成する */
interface Entry extends Omit<PostMeta, 'locales' | 'isFallback'> {
	body: string;
}

/**
 * Markdown → HTML の変換は記事 1 本あたり数 ms かかる。Worker のコールドスタートごとに
 * 全記事を変換するのは無駄なので、実際に本文が要る記事だけ変換してメモ化する。
 * 一覧ページ (getPostMetas) はここを一切踏まない。
 */
const htmlCache = new WeakMap<Entry, string>();

function renderHtml(entry: Entry): string {
	const cached = htmlCache.get(entry);
	if (cached !== undefined) return cached;
	// walkTokens で code→html を同期変換しているため parse() は同期的に文字列を返す。
	const html = marked.parse(entry.body) as string;
	htmlCache.set(entry, html);
	return html;
}

/** slug → 言語 → 記事 */
const bySlug = new Map<string, Map<Locale, Entry>>();

for (const [path, raw] of Object.entries(rawPosts)) {
	// path は /posts/<slug>/<locale>.md
	const segments = path.split('/');
	const localeName = segments.pop()!.replace(/\.md$/, '');
	const slug = segments.pop()!;
	if (!isLocale(localeName)) continue;

	const { meta, body } = parseFrontmatter(raw);
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
		readingMinutes: estimateReadingMinutes(body),
		hasMermaid: /^ {0,3}`{3,}mermaid\s*$/m.test(body),
		body,
	};

	const translations = bySlug.get(slug) ?? new Map<Locale, Entry>();
	translations.set(localeName, entry);
	bySlug.set(slug, translations);
}

/** 要求された言語で解決する。無ければ他言語にフォールバックする */
function resolve(slug: string, locale: Locale): { entry: Entry; meta: PostMeta } | undefined {
	const translations = bySlug.get(slug);
	if (!translations) return undefined;

	const locales = [...translations.keys()].toSorted((a, b) =>
		a === DEFAULT_LOCALE ? -1 : b === DEFAULT_LOCALE ? 1 : a.localeCompare(b),
	);
	const entry = translations.get(locale) ?? translations.get(otherLocale(locale));
	if (!entry) return undefined;

	const { body: _body, ...rest } = entry;
	return { entry, meta: { ...rest, locales, isFallback: entry.locale !== locale } };
}

const slugsByDate = [...bySlug.keys()].toSorted((a, b) => {
	const dateA = resolve(a, DEFAULT_LOCALE)?.meta.date ?? '';
	const dateB = resolve(b, DEFAULT_LOCALE)?.meta.date ?? '';
	return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
});

/** 一覧表示用のメタ情報のみ（本文 HTML を含まない）。日付の降順 */
export function getPostMetas(locale: Locale): PostMeta[] {
	return slugsByDate.flatMap((slug) => {
		const resolved = resolve(slug, locale);
		return resolved ? [resolved.meta] : [];
	});
}

export function getPost(slug: string, locale: Locale): Post | undefined {
	const resolved = resolve(slug, locale);
	if (!resolved) return undefined;
	return { ...resolved.meta, html: renderHtml(resolved.entry) };
}
