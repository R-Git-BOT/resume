import fs from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";

const rootDir = process.cwd();
const srcPath = path.join(rootDir, "src", "resume.md");
const publicDir = path.join(rootDir, "public");
const distDir = path.join(rootDir, "dist");

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const markdown = await fs.readFile(srcPath, "utf8");
const tokens = md.parse(markdown, {});
const headings = [];
const slugCounts = new Map();

for (let index = 0; index < tokens.length; index += 1) {
  const token = tokens[index];

  if (token.type !== "heading_open") {
    continue;
  }

  const inlineToken = tokens[index + 1];
  const text = inlineToken?.content ?? "";
  const level = Number(token.tag.slice(1));

  if (!text || (level === 1 && text === "職務経歴書")) {
    continue;
  }

  const baseSlug = slugify(text) || `section-${headings.length + 1}`;
  const seenCount = slugCounts.get(baseSlug) ?? 0;
  slugCounts.set(baseSlug, seenCount + 1);
  const id = seenCount === 0 ? baseSlug : `${baseSlug}-${seenCount + 1}`;

  token.attrSet("id", id);

  if (text !== "基本情報" && (level === 1 || level === 2)) {
    headings.push({ id, level, text });
  }
}

function buildTocHtml(items) {
  if (items.length === 0) {
    return "";
  }

  const links = items
    .map(
      (item) =>
        `<li class="toc__item toc__item--level-${item.level}"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`
    )
    .join("\n");

  return `<nav class="toc" aria-labelledby="toc-title">
  <h2 id="toc-title" class="toc__title">目次</h2>
  <ol class="toc__list">
${links}
  </ol>
</nav>
`;
}

const tocHtml = buildTocHtml(headings);
const contentHtml = md.renderer.render(tokens, md.options, {});
const renderedHtml = tocHtml
  ? contentHtml.replace(/(<h2 id="基本情報">基本情報<\/h2>[\s\S]*?<\/table>)/, `$1\n${tocHtml}`)
  : contentHtml;

const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>職務経歴書</title>
  <meta name="description" content="サーバーサイドエンジニアの職務経歴書">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="page">
    <article class="resume">
      ${renderedHtml}
    </article>
  </main>
</body>
</html>
`;

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });

if (await exists(publicDir)) {
  await fs.cp(publicDir, distDir, { recursive: true });
}

await fs.writeFile(path.join(distDir, "index.html"), html, "utf8");

console.log("Build completed: dist/index.html");
