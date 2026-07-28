import fs from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const srcPath = path.join(srcDir, "resume.md");
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

function renderMarkdownContent(markdown) {
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

  return {
    html: md.renderer.render(tokens, md.options, {}),
    headings
  };
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

function extractFirstHeading(markdown, level) {
  const tokens = md.parse(markdown, {});
  const tag = `h${level}`;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === "heading_open" && token.tag === tag) {
      return tokens[index + 1]?.content?.trim() ?? "";
    }
  }

  return "";
}

function extractSectionParagraph(markdown, headingText) {
  const tokens = md.parse(markdown, {});

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const inlineToken = tokens[index + 1];

    if (token.type !== "heading_open" || inlineToken?.content !== headingText) {
      continue;
    }

    for (let nextIndex = index + 2; nextIndex < tokens.length; nextIndex += 1) {
      const nextToken = tokens[nextIndex];

      if (nextToken.type === "heading_open") {
        break;
      }

      if (nextToken.type === "paragraph_open") {
        return tokens[nextIndex + 1]?.content?.trim() ?? "";
      }
    }
  }

  return "";
}

function buildProjectFileName(sourceFileName, index) {
  const baseName = path.basename(sourceFileName, ".md");
  return `${slugify(baseName) || `project-${index + 1}`}.html`;
}

function buildProjectCardHtml(projects) {
  if (projects.length === 0) {
    return "";
  }

  const cards = projects
    .map(
      (project) => `<a class="project-card" href="/${escapeHtml(project.fileName)}">
  <span class="project-card__label">プロジェクト詳細</span>
  <h3 class="project-card__title">${escapeHtml(project.title)}</h3>
  ${
    project.period
      ? `<p class="project-card__meta">期間：${escapeHtml(project.period)}</p>`
      : ""
  }
  ${
    project.summary
      ? `<p class="project-card__summary">${escapeHtml(project.summary)}</p>`
      : ""
  }
  <span class="project-card__action">詳細を見る</span>
</a>`
    )
    .join("\n");

  return `<section class="project-links" aria-label="プロジェクト詳細リンク">
  <div class="project-card-grid">
${cards}
  </div>
</section>
`;
}

function insertProjectCards(contentHtml, projectCardsHtml) {
  if (!projectCardsHtml) {
    return contentHtml;
  }

  const projectDetailHeading =
    /(<h2 id="0-プロジェクト詳細はこちらから">0．プロジェクト詳細はこちらから<\/h2>)/;

  if (projectDetailHeading.test(contentHtml)) {
    return contentHtml.replace(projectDetailHeading, `$1\n${projectCardsHtml}`);
  }

  return contentHtml.replace(
    /(<h1 id="主なプロジェクト経験">主なプロジェクト経験<\/h1>)/,
    `$1\n<h2 id="0-プロジェクト詳細はこちらから">0．プロジェクト詳細はこちらから</h2>\n${projectCardsHtml}`
  );
}

function renderPage({ title, description, contentHtml, leadingHtml = "" }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="page">
    <article class="resume">
      ${leadingHtml}${contentHtml}
    </article>
  </main>
</body>
</html>
`;
}

async function getProjectPages() {
  const preferredOrder = [
    "resume_projects_minigame.md",
    "resume_projects_own_back copy.md",
    "resume_projects_etc.md"
  ];
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && /^resume_projects_.*\.md$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => {
      const leftOrder = preferredOrder.indexOf(left);
      const rightOrder = preferredOrder.indexOf(right);

      if (leftOrder !== -1 || rightOrder !== -1) {
        return (leftOrder === -1 ? Number.MAX_SAFE_INTEGER : leftOrder) -
          (rightOrder === -1 ? Number.MAX_SAFE_INTEGER : rightOrder);
      }

      return left.localeCompare(right, "ja");
    });

  return Promise.all(
    sourceFiles.map(async (sourceFileName, index) => {
      const markdown = await fs.readFile(path.join(srcDir, sourceFileName), "utf8");
      const title =
        extractFirstHeading(markdown, 2) ||
        extractFirstHeading(markdown, 1) ||
        path.basename(sourceFileName, ".md");

      return {
        sourceFileName,
        fileName: buildProjectFileName(sourceFileName, index),
        title,
        period: extractSectionParagraph(markdown, "期間"),
        summary: extractSectionParagraph(markdown, "プロジェクト経験概要"),
        markdown
      };
    })
  );
}

const projectPages = await getProjectPages();
const markdown = await fs.readFile(srcPath, "utf8");
const { html: contentHtml, headings } = renderMarkdownContent(markdown);
const tocHtml = buildTocHtml(headings);
const projectCardsHtml = buildProjectCardHtml(projectPages);
const renderedHtml = insertProjectCards(
  tocHtml
    ? contentHtml.replace(/(<h2 id="基本情報">基本情報<\/h2>[\s\S]*?<\/table>)/, `$1\n${tocHtml}`)
    : contentHtml,
  projectCardsHtml
);

const html = renderPage({
  title: "職務経歴書",
  description: "サーバーサイドエンジニアの職務経歴書",
  contentHtml: renderedHtml
});

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });

if (await exists(publicDir)) {
  await fs.cp(publicDir, distDir, { recursive: true });
}

await fs.writeFile(path.join(distDir, "index.html"), html, "utf8");

for (const projectPage of projectPages) {
  const { html: projectContentHtml } = renderMarkdownContent(projectPage.markdown);
  const projectHtml = renderPage({
    title: `${projectPage.title} | 職務経歴書`,
    description: `${projectPage.title}の詳細なプロジェクト経験`,
    leadingHtml: '<p class="back-link"><a href="/">職務経歴書へ戻る</a></p>\n',
    contentHtml: projectContentHtml
  });

  await fs.writeFile(path.join(distDir, projectPage.fileName), projectHtml, "utf8");
}

console.log(
  `Build completed: dist/index.html and ${projectPages.length} project detail pages`
);
