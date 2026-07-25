// OGP 画像の SVG を組み立てる。resvg でラスタライズする前段で、描画そのものは
// ここに閉じている（Node API に触らないので単体で試しやすい）。

function escapeXml(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** 全角 = 1 とした概算幅。左寄せなので厳密でなくてよい */
function measure(text) {
	let width = 0;
	for (const char of text) {
		const code = char.codePointAt(0) ?? 0;
		if (char === ' ') width += 0.3;
		else if (code <= 0x2000) width += 0.55;
		else width += 1;
	}
	return width;
}

/** 行頭に来てはいけない文字(簡易禁則) */
const NO_LINE_START = /^[、。,.，．!?！?…ー〜)）」』】>≫\]]/;

/** Segmenter はカタカナ複合語(例: ツールチェーン)を分割するので、連続するカタカナはつなぐ */
const KATAKANA_EDGE = /[゠-ヿ]$/;
const KATAKANA_START = /^[゠-ヿ]/;

/** 単語境界を尊重しつつ maxUnits(全角換算)で折り返す */
function wrapTitle(title, maxUnits) {
	const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
	const words = [];
	for (const { segment } of segmenter.segment(title)) {
		const prev = words.at(-1);
		if (
			prev !== undefined &&
			(NO_LINE_START.test(segment) || (KATAKANA_EDGE.test(prev) && KATAKANA_START.test(segment)))
		) {
			words[words.length - 1] += segment;
		} else {
			words.push(segment);
		}
	}

	const lines = [];
	let current = '';
	for (const word of words) {
		if (current && measure(current + word) > maxUnits) {
			lines.push(current.trimEnd());
			current = word.trimStart();
		} else {
			current += word;
		}
	}
	if (current) lines.push(current.trimEnd());
	return lines;
}

const WIDTH = 1260;
const HEIGHT = 630;
const MARGIN = 90;

/**
 * @param {string} title
 * @param {string} date
 * @param {string | null} avatarDataUri `data:image/jpeg;base64,...`。無ければ名前だけ出す
 */
export function buildOgpSvg(title, date, avatarDataUri) {
	// 収まるフォントサイズを探す。72px なら 2 行まで、それ以下は 3 行まで許容する
	let fontSize = 52;
	let lines = [title];
	for (const size of [72, 64, 58, 52]) {
		const wrapped = wrapTitle(title, (WIDTH - MARGIN * 2) / size);
		fontSize = size;
		lines = wrapped;
		if (wrapped.length <= (size >= 72 ? 2 : 3)) break;
	}

	const lineHeight = Math.round(fontSize * 1.42);
	const centerY = 316;
	const firstY = centerY - ((lines.length - 1) * lineHeight) / 2 + Math.round(fontSize * 0.35);
	const titleTexts = lines
		.map(
			(line, i) =>
				`<text x="${MARGIN}" y="${firstY + i * lineHeight}" font-size="${fontSize}" font-weight="700" fill="#1b1815" font-family="Noto Sans CJK JP">${escapeXml(line)}</text>`,
		)
		.join('\n  ');

	const footerY = 520;
	const avatarMarkup = avatarDataUri
		? `<clipPath id="avatar-clip"><circle cx="${MARGIN + 34}" cy="${footerY}" r="34"/></clipPath>
  <image href="${avatarDataUri}" x="${MARGIN}" y="${footerY - 34}" width="68" height="68" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip)"/>
  <circle cx="${MARGIN + 34}" cy="${footerY}" r="34" fill="none" stroke="#c1b7a3" stroke-width="1.5"/>`
		: '';
	const nameX = avatarDataUri ? MARGIN + 86 : MARGIN;
	const dateMarkup = date
		? `<text x="${WIDTH - MARGIN}" y="${footerY + 10}" text-anchor="end" font-size="26" font-weight="400" fill="#6f685c" font-family="Noto Sans CJK JP">${escapeXml(date.replaceAll('-', '.'))}</text>`
		: '';

	return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="mottle-a" cx="18%" cy="12%" r="70%">
      <stop offset="0%" stop-color="#a38c62" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#a38c62" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mottle-b" cx="85%" cy="90%" r="70%">
      <stop offset="0%" stop-color="#78846e" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#78846e" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.055" intercept="0"/></feComponentTransfer>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#f6f2e9"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#mottle-a)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#mottle-b)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#grain)"/>
  <rect x="28" y="28" width="${WIDTH - 56}" height="${HEIGHT - 56}" rx="14" fill="none" stroke="#c1b7a3" stroke-width="1.5" opacity="0.8"/>
  <rect x="${MARGIN}" y="96" width="16" height="16" fill="#ff3e00"/>
  <text x="${MARGIN + 30}" y="111" font-size="27" font-weight="400" letter-spacing="1" fill="#5c554b" font-family="Noto Sans CJK JP">baseballyama&apos;s Blog</text>
  ${titleTexts}
  ${avatarMarkup}
  <text x="${nameX}" y="${footerY + 10}" font-size="28" font-weight="700" fill="#1b1815" font-family="Noto Sans CJK JP">baseballyama</text>
  ${dateMarkup}
</svg>`;
}
