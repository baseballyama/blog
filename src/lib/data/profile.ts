export interface Profile {
	name: string;
	handle: string;
	title: string;
	location: string;
	tagline: string;
	bio: string[];
}

export const profile: Profile = {
	name: 'Yuichiro Yamashita',
	handle: 'baseballyama',
	title: 'Software Engineer',
	location: 'Tokyo, Japan',
	tagline: 'コンパイラ・パーサー・静的解析を軸に、開発の"足回り"を整えるのが好きです。',
	bio: [
		'スタートアップ flyle でテックリードとして、技術方針の意思決定を担っています。',
		'UI フレームワーク Svelte のコアチームメンバーとして、コンパイラ・パーサー・静的検査といった言語処理系の領域に取り組んでいます。',
		'このサイト自体、私が開発している Rust 製 Svelte コンパイラ rsvelte でビルドしています。',
	],
};
