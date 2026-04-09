import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { insertForumPostSchema, insertForumCommentSchema, insertArticleSchema, insertArticleCommentSchema } from "@shared/schema";
import { seedDatabase } from "./seed";
import { setupFacebookAuth, isFacebookAuthEnabled } from "./facebookAuth";
import { setupLocalAuth } from "./localAuth";
import multer from "multer";
import { randomUUID } from "crypto";
import { objectStorageClient } from "./replit_integrations/object_storage";
import sharp from "sharp";
import { generateAndPublishArticle } from "./autoPublish";

function getPublicBucketInfo() {
  const raw = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",")[0].trim();
  const clean = raw.startsWith("/") ? raw.slice(1) : raw;
  const parts = clean.split("/");
  return { bucketName: parts[0], prefix: parts.slice(1).join("/") };
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ---- LIVE VIEWER COUNT (SSE) ----
const viewers = new Set<any>();
function broadcastViewerCount() {
  const data = `data: ${viewers.size}\n\n`;
  viewers.forEach(res => { try { res.write(data); } catch {} });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  setupLocalAuth(app);
  setupFacebookAuth(app);

  app.get("/api/viewers", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    viewers.add(res);
    broadcastViewerCount();
    req.on("close", () => {
      viewers.delete(res);
      broadcastViewerCount();
    });
  });

  // ---- GOOGLE SEARCH CONSOLE VERIFICATION ----
  app.get("/google839aabed702b84d7.html", (_req, res) => {
    res.type("text/html").send("google-site-verification: google839aabed702b84d7.html");
  });
  app.get("/google8d169d83e8d41613.html", (_req, res) => {
    res.type("text/html").send("google-site-verification: google8d169d83e8d41613.html");
  });

  // ---- ROBOTS.TXT ----
  app.get("/robots.txt", (_req, res) => {
    const siteUrl = "https://www.f1fanhub.net";
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/rss.xml\n`
    );
  });

  // ---- SITEMAP.XML ----
  app.get("/sitemap.xml", async (_req, res) => {
    const siteUrl = "https://www.f1fanhub.net";
    const today = new Date().toISOString().split("T")[0];

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/articles", priority: "0.9", changefreq: "daily" },
      { url: "/standings", priority: "0.8", changefreq: "weekly" },
      { url: "/forum", priority: "0.8", changefreq: "daily" },
      { url: "/quiz", priority: "0.7", changefreq: "monthly" },
      { url: "/polls", priority: "0.7", changefreq: "weekly" },
      { url: "/leaderboard", priority: "0.6", changefreq: "daily" },
      { url: "/novel", priority: "0.6", changefreq: "monthly" },
      { url: "/about", priority: "0.7", changefreq: "monthly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
      { url: "/privacy", priority: "0.5", changefreq: "monthly" },
    ];

    let articleEntries = "";
    let forumEntries = "";
    try {
      const articles = await storage.getArticles();
      for (const a of articles) {
        const slug = (a as any).slug || a.id;
        const lastmod = a.updatedAt ? new Date(a.updatedAt).toISOString().split("T")[0] : today;
        articleEntries += `  <url>\n    <loc>${siteUrl}/articles/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    } catch {}
    try {
      const races = await storage.getAllRaces();
      for (const r of races) {
        forumEntries += `  <url>\n    <loc>${siteUrl}/forum/${r.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    } catch {}

    const staticEntries = staticPages.map(p =>
      `  <url>\n    <loc>${siteUrl}${p.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    ).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries}\n${articleEntries}${forumEntries}</urlset>`;
    res.type("application/xml").send(xml);
  });

  // ---- RSS FEED ----
  app.get("/rss.xml", async (_req, res) => {
    const siteUrl = "https://www.f1fanhub.net";
    const escape = (s: string) =>
      (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

    let items = "";
    try {
      const articles = await storage.getArticles();
      for (const a of articles) {
        const slug = (a as any).slug || a.id;
        const link = `${siteUrl}/articles/${slug}`;
        const pubDate = a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString();
        const tags = Array.isArray((a as any).tags) ? (a as any).tags : [];
        const categories = tags.map((t: string) => `        <category>${escape(t)}</category>`).join("\n");
        const image = a.imageUrl ? `        <enclosure url="${siteUrl}${a.imageUrl}" type="image/jpeg" length="0" />\n` : "";
        items += `    <item>
      <title>${escape(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escape(a.excerpt || "")}</description>
      <pubDate>${pubDate}</pubDate>
      <author>strifehawkins@gmail.com (${escape((a as any).username || "F1 Fan Hub")})</author>
${categories}
${image}    </item>\n`;
      }
    } catch {}

    const buildDate = new Date().toUTCString();
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>F1 Paddock – Formula 1 News &amp; Race Reports</title>
    <link>${siteUrl}</link>
    <description>The latest Formula 1 news, race reports, paddock updates, and driver standings from F1 Paddock.</description>
    <language>en-gb</language>
    <ttl>60</ttl>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <managingEditor>strifehawkins@gmail.com (Lansanah Junior Marah)</managingEditor>
    <webMaster>strifehawkins@gmail.com (Lansanah Junior Marah)</webMaster>
    <copyright>© ${new Date().getFullYear()} F1 Paddock</copyright>
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>F1 Paddock</title>
      <link>${siteUrl}</link>
    </image>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}  </channel>
</rss>`;

    res.set("Cache-Control", "public, max-age=3600");
    res.type("application/rss+xml; charset=utf-8").send(feed);
  });

  app.get("/api/auth/config", (_req, res) => {
    res.json({ facebookAuthEnabled: isFacebookAuthEnabled() });
  });

  // ---- IMAGE UPLOAD (cloud storage) ----
  app.post("/api/upload", isAuthenticated, upload.single("image"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ message: "No image file provided or invalid file type" });
    try {
      const { bucketName, prefix } = getPublicBucketInfo();
      const objectId = randomUUID();
      const ext = req.file.mimetype === "image/png" ? ".png" : req.file.mimetype === "image/gif" ? ".gif" : req.file.mimetype === "image/webp" ? ".webp" : ".jpg";
      const objectName = `${prefix}/images/${objectId}${ext}`;
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(req.file.buffer, { contentType: req.file.mimetype, resumable: false });
      res.json({ url: `/api/images/${objectId}${ext}` });
    } catch (err) {
      console.error("Cloud upload error:", err);
      res.status(500).json({ message: "Failed to upload image to cloud storage" });
    }
  });

  // ---- SERVE CLOUD IMAGES (with WebP conversion + resizing) ----
  app.get("/api/images/:objectId", async (req, res) => {
    try {
      const { bucketName, prefix } = getPublicBucketInfo();
      const objectName = `${prefix}/images/${req.params.objectId}`;
      const file = objectStorageClient.bucket(bucketName).file(objectName);
      const [exists] = await file.exists();
      if (!exists) return res.status(404).json({ error: "Image not found" });

      const acceptsWebP = (req.headers.accept || "").includes("image/webp");
      const width = req.query.w ? parseInt(req.query.w as string, 10) : undefined;
      const quality = req.query.q ? parseInt(req.query.q as string, 10) : 80;
      const needsProcessing = acceptsWebP || !!width;

      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("Vary", "Accept");

      if (needsProcessing) {
        const chunks: Buffer[] = [];
        const stream = file.createReadStream();
        stream.on("error", () => res.status(500).end());
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", async () => {
          try {
            let pipeline = sharp(Buffer.concat(chunks));
            if (width) pipeline = pipeline.resize(width, undefined, { withoutEnlargement: true });
            if (acceptsWebP) {
              res.set("Content-Type", "image/webp");
              const out = await pipeline.webp({ quality }).toBuffer();
              res.send(out);
            } else {
              res.set("Content-Type", "image/jpeg");
              const out = await pipeline.jpeg({ quality }).toBuffer();
              res.send(out);
            }
          } catch {
            res.status(500).end();
          }
        });
      } else {
        const [metadata] = await file.getMetadata();
        res.set("Content-Type", (metadata.contentType as string) || "image/jpeg");
        file.createReadStream().on("error", () => res.status(500).end()).pipe(res);
      }
    } catch (err) {
      console.error("Image serve error:", err);
      res.status(500).json({ error: "Failed to serve image" });
    }
  });

  // ---- USER PROFILE ----
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.upsertUserProfile(userId);
      res.json(profile);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile/claim-daily", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.claimDailyPoints(userId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to claim daily points" });
    }
  });

  // ---- RACES ----
  app.get("/api/races", async (req, res) => {
    try {
      const season = req.query.season ? Number(req.query.season) : undefined;
      const allRaces = await storage.getAllRaces(season);
      res.json(allRaces);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch races" });
    }
  });

  app.get("/api/races/:id", async (req, res) => {
    try {
      const race = await storage.getRaceById(Number(req.params.id));
      if (!race) return res.status(404).json({ message: "Race not found" });
      res.json(race);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch race" });
    }
  });

  // ---- QUIZ ----
  app.get("/api/quiz/questions", isAuthenticated, async (_req, res) => {
    try {
      const questions = await storage.getQuizQuestions(10);
      res.json(questions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  app.post("/api/quiz/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { score, totalQuestions, pointsEarned } = req.body;
      if (typeof score !== "number" || typeof totalQuestions !== "number" || typeof pointsEarned !== "number") {
        return res.status(400).json({ message: "Invalid quiz submission" });
      }
      const attempt = await storage.submitQuizAttempt({ userId, score, totalQuestions, pointsEarned });
      const profile = await storage.getUserProfile(userId);
      res.json({ attempt, profile });
    } catch (err) {
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // ---- LEADERBOARD ----
  app.get("/api/leaderboard", async (_req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // ---- FORUM ----
  app.get("/api/forum/posts", async (_req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store");
      const posts = await storage.getAllForumPosts();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum/race/:raceId", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store");
      const posts = await storage.getForumPostsByRace(Number(req.params.raceId));
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum/general", async (_req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store");
      const posts = await storage.getGeneralForumPosts();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch general forum posts" });
    }
  });

  app.post("/api/forum/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertForumPostSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) return res.status(400).json({ message: "Invalid post data" });
      const post = await storage.createForumPost(parsed.data);
      res.json(post);
    } catch (err) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.delete("/api/forum/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteForumComment(Number(req.params.id), userId);
      if (!deleted) return res.status(403).json({ message: "Not authorized or comment not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.delete("/api/forum/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteForumPost(Number(req.params.id), userId);
      if (!deleted) return res.status(403).json({ message: "Not authorized or post not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.patch("/api/admin/forum/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const { title, content } = req.body;
      if (!title || !content) return res.status(400).json({ message: "Title and content required" });
      const post = await storage.adminUpdateForumPost(Number(req.params.id), { title, content });
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/admin/forum/posts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      await storage.adminDeleteForumPost(Number(req.params.id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.get("/api/forum/posts/:id/comments", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store");
      const comments = await storage.getForumComments(Number(req.params.id));
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/forum/posts/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertForumCommentSchema.safeParse({ ...req.body, postId: Number(req.params.id), userId });
      if (!parsed.success) return res.status(400).json({ message: "Invalid comment data" });
      const comment = await storage.createForumComment(parsed.data);
      res.json(comment);
    } catch (err) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // ---- ARTICLES ----
  app.get("/api/articles", async (_req, res) => {
    try {
      const allArticles = await storage.getArticles();
      res.json(allArticles);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const pending = await storage.getPendingArticles();
      res.json(pending);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch pending articles" });
    }
  });

  app.post("/api/articles/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertArticleSchema.safeParse({ ...req.body, authorId: userId });
      if (!parsed.success) return res.status(400).json({ message: "Invalid article data", errors: parsed.error.errors });
      const article = await storage.submitArticle(parsed.data);
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: "Failed to submit article" });
    }
  });

  app.patch("/api/articles/:id/approve", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const article = await storage.approveArticle(Number(req.params.id));
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: "Failed to approve article" });
    }
  });

  app.patch("/api/articles/:id/reject", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const ok = await storage.rejectArticle(Number(req.params.id));
      if (!ok) return res.status(404).json({ message: "Article not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to reject article" });
    }
  });

  app.get("/api/articles/:idOrSlug", async (req, res) => {
    try {
      const param = req.params.idOrSlug;
      const isNumeric = /^\d+$/.test(param);
      const article = isNumeric
        ? await storage.getArticleById(Number(param))
        : await storage.getArticleBySlug(param);
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/articles/:id/view", async (req, res) => {
    try {
      const articleId = Number(req.params.id);
      const visitorId = (req.headers["x-visitor-id"] as string) || "anonymous";
      if (!visitorId) return res.status(400).json({ message: "Missing visitor id" });
      await storage.recordArticleView(articleId, visitorId);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  app.post("/api/articles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const parsed = insertArticleSchema.safeParse({ ...req.body, authorId: userId });
      if (!parsed.success) return res.status(400).json({ message: "Invalid article data" });
      const article = await storage.createArticle(parsed.data);
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.patch("/api/articles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const article = await storage.updateArticle(Number(req.params.id), req.body);
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const deleted = await storage.deleteArticle(Number(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Article not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  app.post("/api/admin/auto-publish", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const result = await generateAndPublishArticle();
      if (result.success) {
        res.json({ success: true, title: result.title });
      } else {
        res.status(409).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Auto-publish failed" });
    }
  });

  app.get("/api/articles/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getArticleComments(Number(req.params.id));
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/articles/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertArticleCommentSchema.safeParse({ ...req.body, articleId: Number(req.params.id), userId });
      if (!parsed.success) return res.status(400).json({ message: "Invalid comment data" });
      const comment = await storage.createArticleComment(parsed.data);
      res.json(comment);
    } catch (err) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete("/api/articles/:articleId/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteArticleComment(Number(req.params.id), userId);
      if (!deleted) return res.status(403).json({ message: "Not authorized" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // ---- POLLS ----
  app.get("/api/polls", async (req, res) => {
    try {
      const allPolls = await storage.getPolls();
      res.json(allPolls);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch polls" });
    }
  });

  app.get("/api/polls/:id", async (req, res) => {
    try {
      const poll = await storage.getPollById(Number(req.params.id));
      if (!poll) return res.status(404).json({ message: "Poll not found" });
      res.json(poll);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch poll" });
    }
  });

  app.get("/api/polls/:id/my-vote", async (req, res) => {
    try {
      const visitorId = (req.headers["x-visitor-id"] as string) || "anonymous";
      const vote = await storage.getVisitorVote(Number(req.params.id), visitorId);
      res.json({ optionIndex: vote });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch vote" });
    }
  });

  app.post("/api/polls/:id/vote", async (req, res) => {
    try {
      const pollId = Number(req.params.id);
      const visitorId = (req.headers["x-visitor-id"] as string) || "anonymous";
      const { optionIndex } = req.body;
      if (typeof optionIndex !== "number") return res.status(400).json({ message: "Invalid option" });
      const existingVote = await storage.getVisitorVote(pollId, visitorId);
      if (existingVote !== null) return res.status(409).json({ message: "Already voted" });
      await storage.voteOnPoll(pollId, visitorId, optionIndex);
      const updated = await storage.getPollById(pollId);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to record vote" });
    }
  });

  app.post("/api/polls", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const { question, options, isActive, closesAt } = req.body;
      if (!question || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: "Question and at least 2 options required" });
      }
      const poll = await storage.createPoll({ question, options, isActive: isActive ?? true, closesAt: closesAt || null, authorId: userId });
      res.json(poll);
    } catch (err) {
      res.status(500).json({ message: "Failed to create poll" });
    }
  });

  app.patch("/api/polls/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const pollId = Number(req.params.id);
      const updated = await storage.updatePoll(pollId, req.body);
      if (!updated) return res.status(404).json({ message: "Poll not found" });
      // Auto-reward winners when poll is closed
      if (req.body.isActive === false && !updated.winnersRewarded) {
        const rewarded = await storage.rewardPollWinners(pollId);
        return res.json({ ...updated, rewardedCount: rewarded });
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update poll" });
    }
  });

  app.delete("/api/polls/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      await storage.deletePoll(Number(req.params.id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete poll" });
    }
  });

  // ---- NOVEL ----
  app.get("/api/novel/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let progress = await storage.getNovelProgress(userId);
      if (!progress) {
        progress = await storage.upsertNovelProgress(userId, {
          currentChapter: 1, currentScene: 0,
          completedChoices: [], pointsSpent: 0,
          selectedOutfit: ["suit_default", "casual_default"],
          affectionLevel: 0,
        });
      }
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch novel progress" });
    }
  });

  app.post("/api/novel/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { choiceKey, pointCost, affectionGain, advanceScene, advanceChapter, outfit } = req.body;

      if (pointCost && pointCost > 0) {
        const profile = await storage.getUserProfile(userId);
        if (!profile || profile.totalPoints < pointCost) {
          return res.status(400).json({ message: "Not enough points" });
        }
        await storage.spendPoints(userId, pointCost);
      }

      const current = await storage.getNovelProgress(userId);
      const completedChoices = current?.completedChoices || [];
      if (choiceKey && !completedChoices.includes(choiceKey)) {
        completedChoices.push(choiceKey);
      }

      const updateData: any = {
        completedChoices,
        affectionLevel: (current?.affectionLevel || 0) + (affectionGain || 0),
        pointsSpent: (current?.pointsSpent || 0) + (pointCost || 0),
      };

      if (outfit) updateData.selectedOutfit = outfit;
      if (advanceScene) updateData.currentScene = (current?.currentScene || 0) + 1;
      if (advanceChapter) {
        updateData.currentChapter = (current?.currentChapter || 1) + 1;
        updateData.currentScene = 0;
      }

      const progress = await storage.upsertNovelProgress(userId, updateData);
      const newProfile = await storage.getUserProfile(userId);
      res.json({ progress, profile: newProfile });
    } catch (err) {
      res.status(500).json({ message: "Failed to update novel progress" });
    }
  });

  app.delete("/api/novel/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.upsertNovelProgress(userId, {
        currentChapter: 1,
        currentScene: 0,
        completedChoices: [],
        pointsSpent: 0,
        selectedOutfit: ["suit_default", "casual_default", "helmet_default", "hair_default", "acc_default"],
        affectionLevel: 0,
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to reset story" });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.logout(() => res.json({ success: true }));
  });

  // ---- ADMIN ----
  app.post("/api/admin/set-role", isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const admin = await storage.isAdmin(requesterId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const { userId, isAdmin } = req.body;
      await storage.setAdminStatus(userId, isAdmin);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // ---- STANDINGS ----
  app.get("/api/standings/drivers", async (req, res) => {
    try {
      const season = req.query.season ? Number(req.query.season) : 2026;
      const standings = await storage.getDriverStandings(season);
      res.json(standings);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch driver standings" });
    }
  });

  app.get("/api/standings/constructors", async (req, res) => {
    try {
      const season = req.query.season ? Number(req.query.season) : 2026;
      const standings = await storage.getConstructorStandings(season);
      res.json(standings);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch constructor standings" });
    }
  });

  app.patch("/api/standings/drivers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const updated = await storage.updateDriverStanding(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update driver standing" });
    }
  });

  app.patch("/api/standings/constructors/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const updated = await storage.updateConstructorStanding(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update constructor standing" });
    }
  });

  app.patch("/api/races/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.isAdmin(userId);
      if (!admin) return res.status(403).json({ message: "Admin access required" });
      const updated = await storage.updateRace(Number(req.params.id), req.body);
      if (!updated) return res.status(404).json({ message: "Race not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update race" });
    }
  });

  // Seed the database on startup
  await seedDatabase();

  return httpServer;
}
