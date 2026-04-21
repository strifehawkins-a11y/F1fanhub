/**
 * Server-Side Rendering (SSR) for F1 Paddock
 *
 * Article pages: generates a COMPLETE HTML document from Node.js.
 * Google / crawlers receive fully-rendered HTML with all article content.
 * React then loads in the browser and takes over the page for interactivity.
 *
 * Static pages: injects meta tags into the React SPA template as before.
 */

import fs from "fs";
import path from "path";
import { type Express, type Request, type Response } from "express";
import { storage } from "./storage";

const SITE_NAME = "F1 Paddock";
const SITE_URL  = "https://www.f1fanhub.net";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;
const DEFAULT_DESC  = "Your home for Formula 1 news, standings, race forums, polls, quizzes, and fan community. Follow the 2026 F1 season live.";

/* ── helpers ──────────────────────────────────────────────────────────── */

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

/**
 * Lightweight markdown → semantic HTML converter.
 * Handles headings, bold, italic, images, links, lists, blockquotes, code, hr.
 */
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  const inlineConvert = (line: string): string =>
    line
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;display:block;margin:1em 0" loading="lazy">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      closeLists(); out.push("<hr>"); continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      closeLists();
      const level = headingMatch[1].length;
      out.push(`<h${level}>${inlineConvert(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (line.startsWith("> ")) {
      closeLists();
      out.push(`<blockquote>${inlineConvert(line.slice(2))}</blockquote>`);
      continue;
    }

    const ulMatch = line.match(/^[-*+]\s+(.*)/);
    if (ulMatch) {
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${inlineConvert(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (!inOl) { out.push("<ol>"); inOl = true; }
      out.push(`<li>${inlineConvert(olMatch[1])}</li>`);
      continue;
    }

    if (line === "") {
      closeLists(); out.push(""); continue;
    }

    closeLists();
    out.push(inlineConvert(line));
  }

  closeLists();

  const raw = out.join("\n");
  const blocks = raw.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const b = block.trim();
      if (!b) return "";
      if (/^<(h[1-6]|ul|ol|li|blockquote|hr|img|pre|figure)/.test(b)) return b;
      return `<p>${b.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

function excerpt(text: string, maxLen = 160): string {
  const clean = stripMarkdown(text);
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).replace(/\s+\S*$/, "") + "…";
}

/* ── bundle tag extraction ─────────────────────────────────────────────
 * In production, read the built index.html and pull out the hashed
 * CSS/JS asset tags so we can include them in the SSR page.
 * In dev, Vite serves assets dynamically via the module entrypoint.
 * ──────────────────────────────────────────────────────────────────── */

interface BundleTags { css: string; js: string; }

function getBundleTags(dev: boolean): BundleTags {
  if (dev) {
    // Vite dev server: inject JS as a module; CSS is handled by JS
    return {
      css: "",
      js: `<script type="module" src="/src/main.tsx"></script>`,
    };
  }

  try {
    const distIndex = path.resolve(__dirname, "public", "index.html");
    const builtHtml = fs.readFileSync(distIndex, "utf-8");

    const cssLinks = (builtHtml.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || []).join("\n  ");
    const jsScripts = (builtHtml.match(/<script[^>]+type=["']module["'][^>]+src=["'][^"']*assets[^"']*["'][^>]*><\/script>/gi) || []).join("\n  ");

    return { css: cssLinks, js: jsScripts };
  } catch {
    return { css: "", js: "" };
  }
}

/* ── complete article HTML generator ─────────────────────────────────── */

function buildCompleteArticleHtml(article: any, bundles: BundleTags): string {
  const tags: string[] = Array.isArray(article.tags) ? article.tags : [];
  const authorName = article.username || "F1 Paddock";
  const publishedAt = article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined;
  const publishedDateStr = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const url = `${SITE_URL}/articles/${article.slug || article.id}`;
  const desc = article.excerpt
    ? article.excerpt.slice(0, 160)
    : excerpt(article.content || "", 160);
  const img = article.imageUrl || DEFAULT_IMAGE;
  const articleHtml = markdownToHtml(article.content || "");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || "",
    image: [img],
    datePublished: publishedAt,
    dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : publishedAt,
    author: [{ "@type": "Person", name: authorName }],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon-512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: tags.join(", "),
    articleSection: "Formula 1",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Primary SEO -->
  <title>${esc(article.title)} | ${SITE_NAME}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${esc(url)}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="${esc(authorName)}" />
  ${tags.length ? `<meta name="keywords" content="${esc(tags.join(", "))}, Formula 1, F1 2026" />` : ""}

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:title" content="${esc(article.title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${esc(img)}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  ${publishedAt ? `<meta property="article:published_time" content="${esc(publishedAt)}" />` : ""}
  <meta property="article:section" content="Formula 1" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(article.title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${esc(img)}" />

  <!-- JSON-LD NewsArticle -->
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>

  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#C41230" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

  <!-- Google AdSense -->
  <meta name="google-adsense-account" content="ca-pub-7082186694183581" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7082186694183581" crossorigin="anonymous"></script>

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-HQEY0YNS0Q"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-HQEY0YNS0Q');</script>

  <!-- Google Subscribe with Google -->
  <script defer type="application/javascript" src="https://news.google.com/swg/js/v1/swg-basic.js"></script>
  <script>window.addEventListener('load',function(){(self.SWG_BASIC=self.SWG_BASIC||[]).push(function(s){s.init({type:"NewsArticle",isPartOfType:["Product"],isPartOfProductId:"CAowgYDLDA:openaccess",clientOptions:{theme:"light",lang:"en-GB"}});});});</script>

  ${article.imageUrl ? `<link rel="preload" as="image" href="${esc(article.imageUrl)}" fetchpriority="high" />` : ""}

  <!-- App CSS bundle (production) -->
  ${bundles.css}

  <!-- Fallback article styles for crawlers / no-JS -->
  <style>
    body{margin:0;font-family:Georgia,serif;background:#fff;color:#111}
    .ssr-article{max-width:860px;margin:0 auto;padding:1.5rem 1rem 4rem}
    .ssr-nav{font-size:.85rem;margin-bottom:1.5rem}
    .ssr-nav a{color:#e10600;text-decoration:none}
    .ssr-nav a:hover{text-decoration:underline}
    .ssr-article h1{font-size:2rem;font-weight:800;line-height:1.2;margin:0 0 .75rem;color:#111}
    .ssr-article h2{font-size:1.4rem;font-weight:700;margin:2rem 0 .5rem;color:#111}
    .ssr-article h3{font-size:1.15rem;font-weight:700;margin:1.5rem 0 .4rem;color:#222}
    .ssr-article p{margin:.75rem 0;line-height:1.75;font-size:1.05rem}
    .ssr-article ul,.ssr-article ol{margin:.75rem 0;padding-left:1.5rem;line-height:1.75}
    .ssr-article li{margin:.3rem 0}
    .ssr-article blockquote{border-left:4px solid #e10600;margin:1.5rem 0;padding:.5rem 1rem;color:#444;font-style:italic}
    .ssr-article img{max-width:100%;height:auto;border-radius:8px;margin:1.25rem 0;display:block}
    .ssr-article code{background:#f4f4f4;padding:.15em .35em;border-radius:3px;font-size:.9em}
    .ssr-article hr{border:none;border-top:1px solid #eee;margin:2rem 0}
    .ssr-meta{color:#666;font-size:.9rem;margin-bottom:1.5rem;display:flex;flex-wrap:wrap;gap:.4rem .75rem;align-items:center}
    .ssr-hero{width:100%;max-height:480px;object-fit:cover;border-radius:10px;margin:1.25rem 0 2rem;display:block}
    .ssr-tag{display:inline-block;background:#fff0f0;color:#e10600;border:1px solid #fcc;border-radius:20px;padding:.15rem .6rem;font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
  </style>
</head>
<body>
  <div id="root">
    <!-- Pre-rendered article — Google indexes this fully; React replaces on load -->
    <div class="ssr-article">
      <nav class="ssr-nav">
        <a href="/">F1 Paddock</a>
        <span style="color:#bbb;margin:0 .3rem">›</span>
        <a href="/articles">Articles</a>
      </nav>
      <article itemscope itemtype="https://schema.org/NewsArticle">
        <h1 itemprop="headline">${esc(article.title)}</h1>
        <div class="ssr-meta">
          ${publishedDateStr ? `<time itemprop="datePublished" datetime="${publishedAt || ""}">${publishedDateStr}</time>` : ""}
          ${authorName !== "F1 Paddock" ? `<span>·</span><span itemprop="author">${esc(authorName)}</span>` : ""}
          ${tags.map(t => `<span class="ssr-tag">${esc(t)}</span>`).join("")}
        </div>
        ${article.imageUrl ? `<img itemprop="image" class="ssr-hero" src="${esc(article.imageUrl)}" alt="${esc(article.title)}" loading="eager" fetchpriority="high">` : ""}
        <div itemprop="articleBody" class="ssr-body">
${articleHtml}
        </div>
      </article>
    </div>
  </div>
  <!-- React SPA bundle — loads and replaces the pre-rendered content -->
  ${bundles.js}
</body>
</html>`;
}

/* ── complete homepage HTML generator ────────────────────────────────── */

function buildCompleteHomepageHtml(articles: any[], bundles: BundleTags): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESC,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/articles?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const firstImg = articles[0]?.imageUrl || DEFAULT_IMAGE;

  const articleCards = articles.slice(0, 12).map((a) => {
    const slug = a.slug || a.id;
    const tags: string[] = Array.isArray(a.tags) ? a.tags : [];
    const dateStr = a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })
      : "";
    const ex = a.excerpt ? a.excerpt.slice(0, 140) : excerpt(a.content || "", 140);
    return `
    <article class="hp-card" itemscope itemtype="https://schema.org/NewsArticle">
      ${a.imageUrl ? `<a href="/articles/${esc(slug)}"><img src="${esc(a.imageUrl)}" alt="${esc(a.title)}" class="hp-card-img" loading="lazy" itemprop="image"></a>` : ""}
      <div class="hp-card-body">
        ${tags[0] ? `<span class="hp-tag">${esc(tags[0].toUpperCase())}</span>` : ""}
        <h2 class="hp-card-title" itemprop="headline"><a href="/articles/${esc(slug)}">${esc(a.title)}</a></h2>
        <p class="hp-card-excerpt" itemprop="description">${esc(ex)}</p>
        ${dateStr ? `<time class="hp-card-date" itemprop="datePublished" datetime="${a.publishedAt ? new Date(a.publishedAt).toISOString() : ""}">${dateStr}</time>` : ""}
      </div>
    </article>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Primary SEO -->
  <title>${SITE_NAME} – The Ultimate F1 Fan Experience</title>
  <meta name="description" content="${esc(DEFAULT_DESC)}" />
  <link rel="canonical" href="${SITE_URL}/" />
  <meta name="robots" content="index, follow" />
  <meta name="keywords" content="Formula 1, F1 news, F1 standings, F1 2026, Formula One, race reports, F1 community, Grand Prix" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}/" />
  <meta property="og:title" content="${SITE_NAME} – The Ultimate F1 Fan Experience" />
  <meta property="og:description" content="${esc(DEFAULT_DESC)}" />
  <meta property="og:image" content="${esc(firstImg)}" />
  <meta property="og:site_name" content="${SITE_NAME}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${SITE_NAME} – The Ultimate F1 Fan Experience" />
  <meta name="twitter:description" content="${esc(DEFAULT_DESC)}" />
  <meta name="twitter:image" content="${esc(firstImg)}" />

  <!-- JSON-LD WebSite -->
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>

  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#C41230" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

  <!-- Google AdSense -->
  <meta name="google-adsense-account" content="ca-pub-7082186694183581" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7082186694183581" crossorigin="anonymous"></script>

  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-HQEY0YNS0Q"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-HQEY0YNS0Q');</script>

  <!-- Google Subscribe with Google -->
  <script defer type="application/javascript" src="https://news.google.com/swg/js/v1/swg-basic.js"></script>
  <script>window.addEventListener('load',function(){(self.SWG_BASIC=self.SWG_BASIC||[]).push(function(s){s.init({type:"NewsArticle",isPartOfType:["Product"],isPartOfProductId:"CAowgYDLDA:openaccess",clientOptions:{theme:"light",lang:"en-GB"}});});});</script>

  ${firstImg !== DEFAULT_IMAGE ? `<link rel="preload" as="image" href="${esc(firstImg)}" fetchpriority="high" />` : ""}

  <!-- App CSS bundle (production) -->
  ${bundles.css}

  <!-- Homepage SSR styles for crawlers / no-JS -->
  <style>
    body{margin:0;font-family:Georgia,serif;background:#fff;color:#111}
    .hp-wrap{max-width:1100px;margin:0 auto;padding:1.5rem 1rem 4rem}
    .hp-header{border-bottom:3px solid #e10600;padding-bottom:1rem;margin-bottom:2rem}
    .hp-logo{font-size:1.8rem;font-weight:900;color:#e10600;text-decoration:none;letter-spacing:-.02em}
    .hp-nav{margin-top:.75rem;display:flex;flex-wrap:wrap;gap:.5rem 1.5rem}
    .hp-nav a{color:#333;text-decoration:none;font-size:.9rem;font-weight:600}
    .hp-nav a:hover{color:#e10600}
    .hp-intro{background:#fff5f5;border-left:4px solid #e10600;padding:1rem 1.25rem;margin-bottom:2.5rem;border-radius:0 8px 8px 0}
    .hp-intro h1{font-size:1.4rem;font-weight:800;margin:0 0 .4rem;color:#111}
    .hp-intro p{margin:0;color:#444;line-height:1.6;font-size:.95rem}
    .hp-section-title{font-size:1.1rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#e10600;margin:0 0 1.25rem;padding-bottom:.4rem;border-bottom:2px solid #fee}
    .hp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;margin-bottom:3rem}
    .hp-card{border:1px solid #eee;border-radius:10px;overflow:hidden;background:#fff}
    .hp-card-img{width:100%;height:180px;object-fit:cover;display:block}
    .hp-card-body{padding:1rem}
    .hp-tag{display:inline-block;background:#fff0f0;color:#e10600;border:1px solid #fcc;border-radius:20px;padding:.1rem .55rem;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem}
    .hp-card-title{font-size:1rem;font-weight:700;margin:.3rem 0 .5rem;line-height:1.3}
    .hp-card-title a{color:#111;text-decoration:none}
    .hp-card-title a:hover{color:#e10600}
    .hp-card-excerpt{font-size:.85rem;color:#555;margin:0 0 .6rem;line-height:1.5}
    .hp-card-date{font-size:.78rem;color:#999}
    .hp-sections{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-bottom:3rem}
    .hp-section-link{display:block;padding:1rem 1.25rem;border:1px solid #eee;border-radius:10px;text-decoration:none;color:#111;font-weight:700;font-size:.95rem;text-align:center;transition:border-color .2s}
    .hp-section-link:hover{border-color:#e10600;color:#e10600}
    .hp-section-link span{display:block;font-size:1.5rem;margin-bottom:.3rem}
  </style>
</head>
<body>
  <div id="root">
    <!-- Pre-rendered homepage — Google indexes this fully; React replaces on load -->
    <div class="hp-wrap">
      <header class="hp-header">
        <a href="/" class="hp-logo">F1 Paddock</a>
        <nav class="hp-nav" aria-label="Main navigation">
          <a href="/articles">News</a>
          <a href="/standings">Standings</a>
          <a href="/forum">Forum</a>
          <a href="/polls">Polls</a>
          <a href="/quiz">Quiz</a>
          <a href="/about">About</a>
        </nav>
      </header>

      <div class="hp-intro">
        <h1>The Ultimate F1 Fan Experience – 2026 Season</h1>
        <p>Your home for Formula 1 news, race reports, driver and constructor standings, fan polls, trivia quizzes, and race forum discussion. Follow every lap of the 2026 F1 season with the F1 Paddock community.</p>
      </div>

      <h2 class="hp-section-title">Latest F1 News &amp; Articles</h2>
      <div class="hp-grid" itemscope itemtype="https://schema.org/ItemList">
        ${articleCards}
      </div>

      <h2 class="hp-section-title">Explore F1 Paddock</h2>
      <div class="hp-sections">
        <a href="/standings" class="hp-section-link"><span>🏆</span>Driver &amp; Constructor Standings</a>
        <a href="/forum" class="hp-section-link"><span>💬</span>Race Discussion Forum</a>
        <a href="/polls" class="hp-section-link"><span>📊</span>Fan Polls &amp; Predictions</a>
        <a href="/quiz" class="hp-section-link"><span>🧠</span>F1 Trivia Quiz</a>
      </div>
    </div>
  </div>
  <!-- SSR initial data — pre-populates TanStack Query cache so React shows articles immediately -->
  <script>window.__INITIAL_DATA__=${JSON.stringify({ articles }).replace(/<\/script>/gi, "<\\/script>")};</script>
  <!-- React SPA bundle — loads and replaces the pre-rendered content -->
  ${bundles.js}
</body>
</html>`;
}

/* ── SPA meta injection (non-article pages) ───────────────────────────── */

interface PageMeta {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "website" | "article";
  publishedAt?: string;
  author?: string;
  structuredData?: object;
  preloadImage?: string;
}

function buildMetaTags(meta: PageMeta): string {
  const img = esc(meta.image || DEFAULT_IMAGE);
  const desc = esc(meta.description || DEFAULT_DESC);
  const title = esc(meta.title);
  const url = esc(meta.url);
  const type = meta.type || "website";

  let tags = `
  <!-- SSR-injected meta -->
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="${esc(SITE_NAME)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${img}" />`;

  if (type === "article") {
    if (meta.publishedAt) tags += `\n  <meta property="article:published_time" content="${esc(meta.publishedAt)}" />`;
    if (meta.author) tags += `\n  <meta property="article:author" content="${esc(meta.author)}" />`;
    tags += `\n  <meta property="article:section" content="Formula 1" />`;
  }

  if (meta.preloadImage) {
    tags += `\n  <link rel="preload" as="image" href="${esc(meta.preloadImage)}" fetchpriority="high" />`;
  }

  if (meta.structuredData) {
    tags += `\n  <script type="application/ld+json">${JSON.stringify(meta.structuredData)}</script>`;
  }

  return tags;
}

function injectMeta(html: string, meta: PageMeta): string {
  const tags = buildMetaTags(meta);

  let result = html
    .replace(/<title>[^<]*<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*\/?>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*\/?>/gi, "")
    .replace(/<!-- Primary SEO -->/g, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*\/?>/gi, "")
    .replace(/<meta\s+property="article:[^"]*"[^>]*\/?>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?>/gi, "")
    .replace(/<!-- Open Graph \/ Facebook -->/g, "")
    .replace(/<!-- Twitter Card -->/g, "")
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

  result = result.replace(/(<head[^>]*>)/, `$1\n${tags}`);
  return result;
}

function readTemplate(dev: boolean): string {
  const p = dev
    ? path.resolve(process.cwd(), "client", "index.html")
    : path.resolve(__dirname, "public", "index.html");
  return fs.readFileSync(p, "utf-8");
}

/* ── route handlers ───────────────────────────────────────────────────── */

async function handleArticle(req: Request, res: Response, dev: boolean) {
  try {
    const slugOrId = req.params.slugOrId;
    let article: any;

    const numericId = parseInt(slugOrId, 10);
    if (!isNaN(numericId)) {
      article = await storage.getArticleById(numericId);
    }
    if (!article) {
      article = await storage.getArticleBySlug(slugOrId);
    }

    if (!article) {
      // Unknown article — let React handle the 404
      const html = injectMeta(readTemplate(dev), {
        title: `Article Not Found | ${SITE_NAME}`,
        description: DEFAULT_DESC,
        url: `${SITE_URL}${req.path}`,
      });
      return res.status(200).set("Content-Type", "text/html").end(html);
    }

    // Generate a COMPLETE HTML document — not relying on React template or regex
    const bundles = getBundleTags(dev);
    const html = buildCompleteArticleHtml(article, bundles);

    console.log(`[ssr] article "${article.slug}" served — ${html.length} chars`);
    res.status(200).set("Content-Type", "text/html").end(html);
  } catch (err) {
    console.error("[ssr] article error:", err);
    // Fallback to plain template so the page still loads for users
    try {
      res.status(200).set("Content-Type", "text/html").end(readTemplate(dev));
    } catch {
      res.status(500).send("Internal Server Error");
    }
  }
}

/* ── static page meta definitions ────────────────────────────────────── */

const STATIC_PAGES: Record<string, PageMeta> = {
  "/": {
    title: `${SITE_NAME} – The Ultimate F1 Fan Experience`,
    description: DEFAULT_DESC,
    url: SITE_URL,
    type: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/articles?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  },
  "/articles": {
    title: `F1 News & Articles 2026 | ${SITE_NAME}`,
    description: "Latest Formula 1 news, race reports, and analysis for the 2026 season. Read expert F1 coverage and fan opinion on F1 Paddock.",
    url: `${SITE_URL}/articles`,
    type: "website",
  },
  "/standings": {
    title: `F1 Driver & Constructor Standings 2026 | ${SITE_NAME}`,
    description: "Live Formula 1 driver and constructor championship standings for the 2026 season. Updated after every Grand Prix.",
    url: `${SITE_URL}/standings`,
    type: "website",
  },
  "/forum": {
    title: `F1 Race Discussion Forum | ${SITE_NAME}`,
    description: "Join the Formula 1 fan discussion. Debate race results, driver performances, and team strategies with thousands of F1 fans.",
    url: `${SITE_URL}/forum`,
    type: "website",
  },
  "/polls": {
    title: `F1 Fan Polls & Predictions | ${SITE_NAME}`,
    description: "Vote in Formula 1 fan polls. Predict race results, choose the best driver, and see what the F1 community thinks.",
    url: `${SITE_URL}/polls`,
    type: "website",
  },
  "/quiz": {
    title: `F1 Trivia Quiz – Test Your Knowledge | ${SITE_NAME}`,
    description: "Take the ultimate Formula 1 quiz. Test your F1 knowledge across drivers, teams, history, and race facts.",
    url: `${SITE_URL}/quiz`,
    type: "website",
  },
  "/about": {
    title: `About F1 Paddock | ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME}, the Formula 1 fan community. Our mission, team, and values.`,
    url: `${SITE_URL}/about`,
    type: "website",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `${SITE_NAME} privacy policy. How we collect, use and protect your data on our F1 community platform.`,
    url: `${SITE_URL}/privacy`,
    type: "website",
  },
  "/terms": {
    title: `Terms of Service | ${SITE_NAME}`,
    description: `${SITE_NAME} terms of service. Rules and conditions for using our F1 news, community and fan platform.`,
    url: `${SITE_URL}/terms`,
    type: "website",
  },
  "/leaderboard": {
    title: `F1 Fan Leaderboard | ${SITE_NAME}`,
    description: "See the top F1 Paddock fans ranked by points earned through quizzes, polls and community activity.",
    url: `${SITE_URL}/leaderboard`,
    type: "website",
  },
};

/* ── register ─────────────────────────────────────────────────────────── */

export function registerSSRRoutes(app: Express, dev = true) {
  // Article detail — full Node.js SSR, no React template dependency
  app.get("/articles/:slugOrId", (req, res) => handleArticle(req, res, dev));

  // Homepage — full Node.js SSR with latest articles pre-rendered for crawlers
  app.get("/", async (_req, res) => {
    try {
      const articles = await storage.getArticles();
      const list = Array.isArray(articles) ? articles.filter((a: any) => a.status === "published" || a.publishedAt) : [];
      const bundles = getBundleTags(dev);
      const html = buildCompleteHomepageHtml(list, bundles);
      console.log(`[ssr] homepage served — ${list.length} articles, ${html.length} chars`);
      res.status(200).set("Content-Type", "text/html").end(html);
    } catch (err) {
      console.error("[ssr] homepage error:", err);
      try {
        res.status(200).set("Content-Type", "text/html").end(readTemplate(dev));
      } catch {
        res.status(500).send("Internal Server Error");
      }
    }
  });

  // Static pages
  for (const [routePath, meta] of Object.entries(STATIC_PAGES)) {
    if (routePath === "/") continue;
    app.get(routePath, (_req, res) => {
      try {
        const html = injectMeta(readTemplate(dev), meta);
        res.status(200).set("Content-Type", "text/html").end(html);
      } catch (err) {
        console.error(`[ssr] error for ${routePath}:`, err);
        res.status(200).set("Content-Type", "text/html").end(readTemplate(dev));
      }
    });
  }
}
