export interface Talk {
	/** 登壇日 (YYYY-MM-DD) */
	date: string;
	/** イベント名 */
	event: string;
	/** イベント公式ページ。無いものは null */
	eventUrl: string | null;
	/** 発表タイトル */
	title: string;
	/** スライド (Speaker Deck / GitHub Pages) */
	slidesUrl?: string;
	/** 録画 */
	videoUrl?: string;
	/** スライドのソース (slidev リポジトリ) */
	repoUrl?: string;
}

export interface TalkYear {
	year: string;
	talks: Talk[];
}

// 新しい順。
const talks: Talk[] = [
	{
		date: '2025-11-21',
		event: 'アーキテクチャConference 2025',
		eventUrl: 'https://architecture-con.findy-tools.io/2025',
		title: 'AI駆動開発を実現するためのアーキテクチャと取り組み',
		slidesUrl:
			'https://speakerdeck.com/baseballyama/aiqu-dong-kai-fa-woshi-xian-surutamenoakitekutiyatoqu-rizu-mi',
	},
	{
		date: '2025-11-16',
		event: 'JSConf JP 2025',
		eventUrl: 'https://jsconf.jp/2025/ja/talks/javascript-parser-using-support',
		title: 'JavaScript パーサーに using 対応をする過程で与えたエコシステムへの影響',
		slidesUrl:
			'https://speakerdeck.com/baseballyama/javascript-pasani-using-dui-ying-wosuruguo-cheng-deyu-etaekosisutemuhenoying-xiang',
	},
	{
		date: '2025-09-06',
		event: 'フロントエンドカンファレンス北海道 2025',
		eventUrl:
			'https://fortee.jp/frontend-conf-hokkaido-2025/proposal/dcfe5a4c-ce9c-4be1-9634-525a4c0df6a1',
		title: 'ES2026 対応: acorn への Explicit Resource Management 構文サポート実装',
		slidesUrl:
			'https://speakerdeck.com/baseballyama/acorn-heno-explicit-resource-management-gou-wen-sapotoshi-zhuang',
	},
	{
		date: '2025-04-09',
		event: 'プレイド・フライル・STUDIO 共催イベント',
		eventUrl: 'https://studio.connpass.com/event/349248/',
		title: 'PostgreSQL の CHECK 制約で JavaScript を解析する仕組み',
	},
	{
		date: '2025-03-28',
		event: 'Vue.js v-tokyo Meetup #22',
		eventUrl: 'https://vuejs-meetup.connpass.com/event/343338/',
		title: 'A Deep Dive into Reactivity (Svelte 5)',
	},
	{
		date: '2024-12-06',
		event: 'PostgreSQL Conference Japan 2024',
		eventUrl: 'https://www.postgresql.jp/jpug-pgcon2024',
		title: 'MySQL 8.0 から PostgreSQL 16 への移行と RLS 導入までの道のりと学び',
		slidesUrl:
			'https://speakerdeck.com/baseballyama/mysql-8-dot-0-kara-postgresql-16-henoyi-xing-to-rls-dao-ru-madenodao-noritoxue-bi',
	},
	{
		date: '2024-10-19',
		event: 'Vue Fes Japan 2024',
		eventUrl: 'https://vuefes.jp/2024/sessions/baseballyama',
		title: 'Vue 3 と Svelte 5 のランタイムを比較する 〜技術を一段深く理解する〜',
	},
	{
		date: '2024-08-30',
		event: 'Svelte Japan Online Meetup #4',
		eventUrl: 'https://svelte-jp.connpass.com/event/322663/',
		title: 'Svelte 5 まとめ',
	},
	{
		date: '2024-05-28',
		event: 'Vue.js v-tokyo Meetup #20',
		eventUrl: 'https://vuejs-meetup.connpass.com/event/318066/',
		title: 'ちょっとしたリアクティブユーティリティのご紹介',
	},
	{
		date: '2024-04-24',
		event: 'TechFeed Experts Night #27',
		eventUrl: 'https://techfeed.connpass.com/event/316148/',
		title: 'Svelte 5 — Runes',
		slidesUrl:
			'https://speakerdeck.com/baseballyama/techfeed-experts-night-number-27-hurontoendohuremuwakuzui-qian-xian-svelte',
		repoUrl: 'https://github.com/baseballyama/techfeed-20240424-svelte5',
	},
	{
		date: '2023-11-19',
		event: 'JSConf JP 2023',
		eventUrl: 'https://jsconf.jp/2023/talk/baseballyama-1/',
		title: 'LLM (大規模言語モデル) 全盛時代の開発プラクティス',
		slidesUrl:
			'https://speakerdeck.com/baseballyama/jsconf-jp-2023-llm-da-gui-mo-yan-yu-moderu-quan-sheng-shi-dai-nokai-fa-purakuteisu',
	},
	{
		date: '2023-10-28',
		event: 'Vue Fes Japan 2023',
		eventUrl: 'https://vuefes.jp/2023/sessions/baseballyama',
		title: '18営業日で350コンポーネント規模のVueアプリにデザインシステムを導入する方法',
		slidesUrl:
			'https://speakerdeck.com/baseballyama/vue-fes-2023-18ying-ye-ri-de350konponentogui-mo-novueapurinidezainsisutemuwodao-ru-surufang-fa',
	},
	{
		date: '2023-02-19',
		event: 'Vercel Meetup #0 with CEO',
		eventUrl: 'https://vercel.connpass.com/event/274772/',
		title: 'Svelte メンテナから見た Rich Harris と Svelte 日本コミュニティの状況',
	},
	{
		date: '2022-11-26',
		event: 'JSConf JP 2022',
		eventUrl: 'https://jsconf.jp/2022/talk/svelte-runtime-101/',
		title: 'Svelte Runtime 101',
		slidesUrl: 'https://speakerdeck.com/baseballyama/svelte-runtime-101-jsconf-jp-2022',
	},
	{
		date: '2022-10-28',
		event: 'Server-Side Kotlin Meetup vol.6',
		eventUrl: 'https://server-side-kotlin-meetup.connpass.com/event/262538/',
		title: 'Kotlin と Java 徹底比較 (バイトコード編)',
	},
	{
		date: '2022-08-17',
		event: 'TechFeed Experts Night #2',
		eventUrl: 'https://techfeed.io/events/techfeed-experts-night-2',
		title: '部分的に Svelte を導入する方法',
		videoUrl: 'https://www.youtube.com/watch?v=plVz43kl6go',
	},
	{
		date: '2022-04-15',
		event: 'Server-Side Kotlin Meetup vol.2',
		eventUrl: 'https://server-side-kotlin-meetup.connpass.com/event/239291/',
		title: 'Kotlin 1.5 で stable になった value class を深掘りする',
	},
	{
		date: '2022-02-03',
		event: 'Svelte 日本 Meetup',
		eventUrl: null,
		title: 'Svelte のデバッグ方法',
		videoUrl: 'https://www.youtube.com/watch?v=DaATvPkIFFY',
	},
];

/** タイトルから辿れる一次資料。スライド → 録画 → イベントページ の順 */
export function primaryUrl(talk: Talk): string | null {
	return talk.slidesUrl ?? talk.videoUrl ?? talk.eventUrl;
}

/** 年ごとにまとめる（新しい年が先） */
export const talkYears: TalkYear[] = talks.reduce<TalkYear[]>((years, talk) => {
	const year = talk.date.slice(0, 4);
	const last = years.at(-1);
	if (last && last.year === year) {
		last.talks.push(talk);
	} else {
		years.push({ year, talks: [talk] });
	}
	return years;
}, []);

export const talkCount = talks.length;
