export interface ProfileFact {
	label: string;
	value: string;
	href?: string;
}

export interface Profile {
	name: string;
	handle: string;
	title: string;
	location: string;
	/** 専門領域。ヒーローで区切って並べる */
	focus: string[];
	facts: ProfileFact[];
}

export const profile: Profile = {
	name: 'Yuichiro Yamashita',
	handle: 'baseballyama',
	title: 'Software Engineer',
	location: 'Tokyo, Japan',
	focus: ['Compilers', 'Parsers', 'Static analysis'],
	facts: [
		{
			label: 'Work',
			value: 'VP of Technology & Executive Officer at flyle',
			href: 'https://flyle.io',
		},
		{ label: 'Open source', value: 'Svelte core team', href: 'https://svelte.dev' },
	],
};
