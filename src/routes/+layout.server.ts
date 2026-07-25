import type { LayoutServerLoad } from './$types';

// 言語案内バナーを出すかどうかは hooks.server.ts が Accept-Language と cookie から
// 決めている。ここでは全ページ共通のデータとして流すだけ。
export const load: LayoutServerLoad = ({ locals }) => {
	return { suggestJa: locals.suggestJa };
};
