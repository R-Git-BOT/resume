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

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const markdown = await fs.readFile(srcPath, "utf8");
const contentHtml = md.render(markdown);

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
      ${contentHtml}
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