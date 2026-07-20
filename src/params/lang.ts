import type { ParamMatcher } from '@sveltejs/kit';

/** URL の言語プレフィックス。既定言語 (en) はプレフィックス無しなので ja のみ受ける */
export const match: ParamMatcher = (param) => param === 'ja';
