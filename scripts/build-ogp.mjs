// 記事ごとの OGP 画像を static/ogp/<locale>/<slug>.png に書き出す。
//
// 以前は SvelteKit の /ogp/[loc]/[slug].png ルートを prerender して作っていたが、
// デプロイ先が Cloudflare Workers になり、@resvg/resvg-js (ネイティブ addon) や
// node:fs を Worker バンドルに混ぜられなくなったため、ビルド前の独立した
// Node スクリプトに切り出した。URL は据え置きなので、既に共有されたリンクは
// そのまま生きる。
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { parseFrontmatter } from '../src/lib/frontmatter.js';
import { buildOgpSvg } from './ogp-svg.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const OUT_DIR = path.join(ROOT, 'static', 'ogp');
const CACHE_DIR = path.join(ROOT, '.cache');

const FONT_BASE = 'https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/Japanese';
const FONTS = ['NotoSansCJKjp-Bold.otf', 'NotoSansCJKjp-Regular.otf'];

/** フォントは巨大なので .cache/ に置いて再ダウンロードを避ける */
async function ensureFonts() {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	return Promise.all(
		FONTS.map(async (file) => {
			const dest = path.join(CACHE_DIR, file);
			if (!fs.existsSync(dest)) {
				const res = await fetch(`${FONT_BASE}/${file}`);
				if (!res.ok) throw new Error(`Failed to download ${file}: ${res.status}`);
				fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
			}
			return dest;
		}),
	);
}

function loadAvatarDataUri() {
	const avatar = path.join(ROOT, 'static', 'avatar.jpg');
	if (!fs.existsSync(avatar)) return null;
	return `data:image/jpeg;base64,${fs.readFileSync(avatar).toString('base64')}`;
}

/**
 * posts/<slug>/<locale>.md を列挙する。実在する翻訳の分だけ生成すればよい
 * （記事ページが参照するのは解決済みの post.locale なので、フォールバック分の
 * 重複生成は不要）。
 */
function collectPosts() {
	const entries = [];
	for (const dir of fs.readdirSync(POSTS_DIR, { withFileTypes: true })) {
		if (!dir.isDirectory()) continue;
		for (const file of fs.readdirSync(path.join(POSTS_DIR, dir.name))) {
			if (!file.endsWith('.md')) continue;
			const raw = fs.readFileSync(path.join(POSTS_DIR, dir.name, file), 'utf8');
			const { meta } = parseFrontmatter(raw);
			entries.push({
				slug: dir.name,
				locale: file.replace(/\.md$/, ''),
				title: meta.title || dir.name,
				date: meta.date || '',
			});
		}
	}
	return entries;
}

const [fontFiles, posts] = await Promise.all([ensureFonts(), Promise.resolve(collectPosts())]);
const avatar = loadAvatarDataUri();

// 記事が消えたときに古い画像が残らないよう、毎回作り直す。
fs.rmSync(OUT_DIR, { recursive: true, force: true });

for (const post of posts) {
	const svg = buildOgpSvg(post.title, post.date, avatar);
	const png = new Resvg(svg, { font: { fontFiles, loadSystemFonts: false } }).render().asPng();
	const dest = path.join(OUT_DIR, post.locale, `${post.slug}.png`);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.writeFileSync(dest, png);
}

console.log(`[ogp] generated ${posts.length} images`);
