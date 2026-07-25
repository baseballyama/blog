// トップページのアバターを表示サイズに合わせて WebP へ書き出す。
//
// 元画像 static/avatar.jpg は 460x460 / 41KB あるが、ページ上での表示は 96px
// (640px 以下では 76px)。そのまま配ると Lighthouse の指摘どおり 39KB が無駄になり、
// LCP にも効いてくる。DPR 1/2/3 相当の 3 枚を出して srcset でブラウザに選ばせる。
//
// 元画像は OGP 画像 (scripts/build-ogp.mjs) でも 68px にリサイズして使うので、
// static/avatar.jpg 自体は原寸のまま残しておく。
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'static', 'avatar.jpg');
const OUT_DIR = path.join(ROOT, 'static', 'generated', 'avatar');

/** CSS 上の表示は最大 96px。DPR 1 / 2 / 3 を賄う */
const WIDTHS = [96, 192, 288];

fs.mkdirSync(OUT_DIR, { recursive: true });

const sizes = await Promise.all(
	WIDTHS.map(async (width) => {
		const buffer = await sharp(SOURCE)
			.resize(width, width, { fit: 'cover' })
			.webp({ quality: 82 })
			.toBuffer();
		fs.writeFileSync(path.join(OUT_DIR, `avatar-${width}.webp`), buffer);
		return `${width}px:${buffer.length}B`;
	}),
);

console.log(`[avatar] ${sizes.join(' ')}`);
