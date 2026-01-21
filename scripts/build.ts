import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { Resvg } from "@resvg/resvg-js";

const ROOT = path.join(import.meta.dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const POSTS_DIR = path.join(ROOT, "posts");
const OUT_DIR = path.join(ROOT, "docs");
const BASE_URL = "https://blog.baseballyama.com";

interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  content: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { meta, body: match[2] };
}

function loadPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts: Post[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    const description = meta.description || body.replace(/[#*`\n]/g, " ").slice(0, 120).trim();
    posts.push({
      slug: file.replace(/\.md$/, ""),
      title: meta.title || file.replace(/\.md$/, ""),
      date: meta.date || "",
      author: meta.author || "baseballyama",
      description,
      content: marked(body) as string,
    });
  }

  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}

function render(template: string, vars: Record<string, string>): string {
  let html = template;
  for (const [key, value] of Object.entries(vars)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return html;
}

function generateOgImage(title: string, outputPath: string): void {
  // タイトルを折り返し（1行約14文字）
  const lines: string[] = [];
  let current = "";
  for (const char of title) {
    current += char;
    if (current.length >= 14) {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);

  const textY = 315 - (lines.length - 1) * 45;
  const textElements = lines
    .map((line, i) => `<text x="630" y="${textY + i * 90}" text-anchor="middle" font-size="72" font-weight="bold" fill="#1f2328">${escapeXml(line)}</text>`)
    .join("\n");

  const svg = `<svg width="1260" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1260" height="630" fill="#ffffff"/>
  <rect x="20" y="20" width="1220" height="590" fill="#f6f8fa" rx="16"/>
  ${textElements}
  <text x="630" y="560" text-anchor="middle" font-size="32" fill="#656d76">baseballyama's Blog</text>
</svg>`;

  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();
  fs.writeFileSync(outputPath, png);
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function build(): void {
  const template = fs.readFileSync(path.join(SRC_DIR, "template.html"), "utf-8");
  const indexTemplate = fs.readFileSync(path.join(SRC_DIR, "index.html"), "utf-8");
  const posts = loadPosts();

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT_DIR, "posts"), { recursive: true });
  fs.mkdirSync(path.join(OUT_DIR, "ogp"), { recursive: true });
  fs.mkdirSync(path.join(SRC_DIR, "ogp"), { recursive: true });

  // 記事ページ
  for (const post of posts) {
    // OGP 画像生成（src/ogp/ に保存、存在しなければ生成）
    const ogpSrc = path.join(SRC_DIR, "ogp", `${post.slug}.png`);
    if (!fs.existsSync(ogpSrc)) {
      generateOgImage(post.title, ogpSrc);
    }
    // docs/ogp/ にコピー
    fs.copyFileSync(ogpSrc, path.join(OUT_DIR, "ogp", `${post.slug}.png`));

    const html = render(template, {
      title: post.title,
      date: post.date,
      author: post.author,
      description: post.description,
      content: post.content,
      slug: post.slug,
      "base-url": BASE_URL,
    });
    fs.writeFileSync(path.join(OUT_DIR, "posts", `${post.slug}.html`), html);
  }

  // トップページ
  const listItems = posts
    .map(
      (p) =>
        `<li><a href="${BASE_URL}/posts/${p.slug}.html"><div class="post-title">${p.title}</div><div class="post-date">${p.date}</div></a></li>`
    )
    .join("\n");
  const indexHtml = render(indexTemplate, {
    "post-list": `<ul class="post-list">${listItems}</ul>`,
    "base-url": BASE_URL,
  });
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), indexHtml);

  // CSS をコピー
  fs.copyFileSync(path.join(SRC_DIR, "style.css"), path.join(OUT_DIR, "style.css"));

  // Favicon をコピー
  fs.copyFileSync(path.join(SRC_DIR, "favicon.png"), path.join(OUT_DIR, "favicon.png"));

  // CNAME をコピー
  const cnamePath = path.join(SRC_DIR, "CNAME");
  if (fs.existsSync(cnamePath)) {
    fs.copyFileSync(cnamePath, path.join(OUT_DIR, "CNAME"));
  }

  console.log(`Built ${posts.length} posts`);
}

// Main
build();

if (process.argv.includes("--watch")) {
  console.log("Watching for changes...");
  fs.watch(POSTS_DIR, { recursive: true }, () => {
    build();
  });
}
