import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { error } from '@sveltejs/kit';
import { getPost, getSlugs } from '$lib/posts';
import type { RequestHandler, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return getSlugs().map((slug) => ({ slug }));
};

const FONT_URL =
	'https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf';
const CACHE_DIR = path.join(process.cwd(), '.cache');
const FONT_PATH = path.join(CACHE_DIR, 'NotoSansCJKjp-Bold.otf');

async function ensureFont(): Promise<void> {
	if (fs.existsSync(FONT_PATH)) return;
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	const res = await fetch(FONT_URL);
	if (!res.ok) throw new Error(`Failed to download font: ${res.status}`);
	fs.writeFileSync(FONT_PATH, Buffer.from(await res.arrayBuffer()));
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function buildSvg(title: string): string {
	// タイトルを 1 行約 14 文字で折り返す
	const lines: string[] = [];
	let current = '';
	for (const char of title) {
		current += char;
		if (current.length >= 14) {
			lines.push(current);
			current = '';
		}
	}
	if (current) lines.push(current);

	const textY = 315 - (lines.length - 1) * 45;
	const texts = lines
		.map(
			(line, i) =>
				`<text x="630" y="${textY + i * 90}" text-anchor="middle" font-size="72" font-weight="bold" fill="#1b1815" font-family="Noto Sans CJK JP">${escapeXml(line)}</text>`,
		)
		.join('\n');

	return `<svg width="1260" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1260" height="630" fill="#f6f2e9"/>
  <rect x="20" y="20" width="1220" height="590" fill="#efe9dc" rx="16"/>
  ${texts}
  <text x="630" y="560" text-anchor="middle" font-size="32" fill="#5c554b" font-family="Noto Sans CJK JP">baseballyama's Blog</text>
</svg>`;
}

export const GET: RequestHandler = async ({ params }) => {
	const post = getPost(params.slug);
	if (!post) {
		error(404, 'Post not found');
	}
	await ensureFont();

	const resvg = new Resvg(buildSvg(post.title), {
		font: { fontFiles: [FONT_PATH], loadSystemFonts: false },
	});
	const png = resvg.render().asPng();

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=604800',
		},
	});
};
