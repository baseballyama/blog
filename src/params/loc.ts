import type { ParamMatcher } from '@sveltejs/kit';
import { isLocale } from '$lib/i18n';

/** OGP 画像など、言語を明示するパスで使う */
export const match: ParamMatcher = (param) => isLocale(param);
