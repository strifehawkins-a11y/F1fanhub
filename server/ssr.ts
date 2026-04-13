/**
 * Server-Side Meta Injection (SSR-lite)
 *
 * Intercepts page requests before the Vite/static catch-all and injects
 * page-specific <title>, <meta name="description">, and Open Graph / Twitter
 * Card tags into index.html.  Google, WhatsApp, Twitter and other crawlers
 * receive a fully-populated HTML document; real users still load the fast
 * React SPA which hydrates immediately.
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

function excerpt(text: string, maxLen = 160): string {
  const clean = stripMarkdown(text);
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).replace(/\s+\S*$/, "") + "…";
}

interface PageMeta {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "website" | "article";
  publishedAt?: string;
  author?: string;
  structuredData?: object;
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

  if (meta.structuredData) {
    tags += `\n  <script type="application/ld+json">${JSON.stringify(meta.structuredData)}</script>`;
  }

  return tags;
}

function injectMeta(html: string, meta: PageMeta): string {
  const tags = buildMetaTags(meta);

  // Strip all static meta that we will replace with page-specific values
  let result = html
    .replace(/<title>[^<]*<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*\/?>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*\/?>/gi, "")
    .replace(/<!-- Primary SEO -->/g, "")
    // Remove ALL existing OG and Twitter card tags so we have no duplicates
    .replace(/<meta\s+property="og:[^"]*"[^>]*\/?>/gi, "")
    .replace(/<meta\s+property="article:[^"]*"[^>]*\/?>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?>/gi, "")
    // Remove static block comments
    .replace(/<!-- Open Graph \/ Facebook -->/g, "")
    .replace(/<!-- Twitter Card -->/g, "")
    // Remove any existing ld+json structured data blocks that duplicate ours
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

  // Inject right after <head> so SSR tags are first thing crawlers see
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
      // Let React handle 404
      const html = readTemplate(dev);
      return res.status(200).set("Content-Type", "text/html").end(html);
    }

    const url = `${SITE_URL}/articles/${article.slug || article.id}`;
    const desc = article.excerpt
      ? esc(article.excerpt.slice(0, 160))
      : excerpt(article.content || "", 160);
    const authorName = article.username || "F1 Paddock";
    const publishedAt = article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined;
    const tags: string[] = Array.isArray(article.tags) ? article.tags : [];

    const meta: PageMeta = {
      title: `${esc(article.title)} | ${SITE_NAME}`,
      description: desc,
      image: article.imageUrl || DEFAULT_IMAGE,
      url,
      type: "article",
      publishedAt,
      author: authorName,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.excerpt || "",
        image: [article.imageUrl || DEFAULT_IMAGE],
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
      },
    };

    const html = injectMeta(readTemplate(dev), meta);
    res.status(200).set("Content-Type", "text/html").end(html);
  } catch (err) {
    console.error("[ssr] article error:", err);
    res.status(200).set("Content-Type", "text/html").end(readTemplate(dev));
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
  // Article detail — highest SEO priority
  app.get("/articles/:slugOrId", (req, res) => handleArticle(req, res, dev));

  // Static pages
  for (const [routePath, meta] of Object.entries(STATIC_PAGES)) {
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
