export interface ProfileFact {
	label: string;
	value: string;
	href?: string;
}

export interface Profile {
	name: string;
	handle: string;
	/** static/ 配下のプロフィール画像 */
	avatar: string;
	title: string;
	location: string;
	facts: ProfileFact[];
}

export const profile: Profile = {
	name: 'Yuichiro Yamashita',
	handle: 'baseballyama',
	avatar: '/avatar.jpg',
	title: 'Software Engineer',
	location: 'Tokyo, Japan',
	facts: [
		{
			label: 'Work',
			value: 'VP of Technology & Executive Officer at Flyle',
			href: 'https://flyle.io',
		},
		{ label: 'Open source', value: 'Svelte core team', href: 'https://svelte.dev' },
	],
};
