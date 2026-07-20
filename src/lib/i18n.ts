/** 記事は英語を既定とし、日本語は /ja 配下に置く */
export const LOCALES = ['en', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}

/** URL の言語プレフィックス。既定言語は付けない */
export function localePrefix(locale: Locale): string {
	return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

export function blogPath(locale: Locale): string {
	return `${localePrefix(locale)}/blog`;
}

export function postPath(locale: Locale, slug: string): string {
	return `${localePrefix(locale)}/posts/${slug}`;
}

export const otherLocale = (locale: Locale): Locale => (locale === 'en' ? 'ja' : 'en');

/** 言語切り替えボタンなどに出す表示名（その言語自身の表記） */
export const LOCALE_LABEL: Record<Locale, string> = {
	en: 'English',
	ja: '日本語',
};

/** UI 文言。記事本文は Markdown 側で持つ */
export const UI = {
	en: {
		blogTitle: 'Blog',
		blogNote: 'Posts on compilers, tooling and building software.',
		latestWriting: 'Latest writing',
		allPosts: 'All posts →',
		noPosts: 'No posts yet.',
		backToBlog: '← Back to blog',
		readInOther: 'Read this in 日本語',
		translationBannerText: 'この記事は日本語でも読めます。',
		translationBannerListText: 'このブログは日本語でも読めます。',
		translationBannerAction: '日本語で読む',
		dismiss: 'Dismiss',
		fallbackNotice: 'This post has not been translated yet. Showing the Japanese original.',
	},
	ja: {
		blogTitle: 'ブログ',
		blogNote: 'コンパイラ・ツール・ソフトウェア開発についての記事。',
		latestWriting: '最新の記事',
		allPosts: '記事一覧 →',
		noPosts: 'まだ記事がありません。',
		backToBlog: '← 記事一覧へ戻る',
		readInOther: 'Read this in English',
		translationBannerText: '',
		translationBannerListText: '',
		translationBannerAction: '',
		dismiss: '閉じる',
		fallbackNotice: 'この記事はまだ翻訳されていません。英語版を表示しています。',
	},
} satisfies Record<Locale, Record<string, string>>;
