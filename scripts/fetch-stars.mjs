// ビルド前に GitHub のスター数を取得し、src/lib/data/stars.json に書き出す。
//
// - 対象リポジトリは projects.ts の `repo: 'owner/name'` から抽出する。
// - ネットワーク障害・レート制限時は既存の stars.json の値を維持し、常に exit 0 で終了する
//   （スター数のためにビルドを落とさない）。
// - GITHUB_TOKEN があれば認証付きで叩く（未認証は 60 req/h 制限）。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const PROJECTS_FILE = path.join(ROOT, 'src/lib/data/projects.ts');
const STARS_FILE = path.join(ROOT, 'src/lib/data/stars.json');
const CONCURRENCY = 5;

function readExistingStars() {
	try {
		return JSON.parse(fs.readFileSync(STARS_FILE, 'utf8'));
	} catch {
		return {};
	}
}

function collectRepos() {
	const source = fs.readFileSync(PROJECTS_FILE, 'utf8');
	const repos = new Set();
	for (const match of source.matchAll(/repo:\s*'([^']+)'/g)) {
		repos.add(match[1]);
	}
	return [...repos];
}

async function fetchStars(repo) {
	const headers = {
		accept: 'application/vnd.github+json',
		'user-agent': 'baseballyama-blog-build',
	};
	if (process.env.GITHUB_TOKEN) {
		headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
	}

	const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	const json = await res.json();
	if (typeof json.stargazers_count !== 'number') throw new Error('no stargazers_count');
	return json.stargazers_count;
}

async function mapWithConcurrency(items, limit, fn) {
	const results = [];
	let cursor = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (cursor < items.length) {
			const index = cursor++;
			// ワーカーごとに逐次処理し、全体の同時実行数を limit に抑える。
			// eslint-disable-next-line no-await-in-loop
			results[index] = await fn(items[index]);
		}
	});
	await Promise.all(workers);
	return results;
}

const previous = readExistingStars();
const repos = collectRepos().toSorted();
const stars = {};
let failures = 0;

await mapWithConcurrency(repos, CONCURRENCY, async (repo) => {
	try {
		stars[repo] = await fetchStars(repo);
	} catch (err) {
		failures++;
		if (repo in previous) stars[repo] = previous[repo];
		console.warn(`[stars] ${repo}: ${err.message} (keeping previous value)`);
	}
});

const ordered = Object.fromEntries(repos.filter((repo) => repo in stars).map((r) => [r, stars[r]]));
fs.writeFileSync(STARS_FILE, `${JSON.stringify(ordered, null, '\t')}\n`);
console.log(`[stars] updated ${repos.length - failures}/${repos.length} repositories`);
