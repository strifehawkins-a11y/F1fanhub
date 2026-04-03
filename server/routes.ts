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

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  setupLocalAuth(app);
  setupFacebookAuth(app);

  // ---- ROBOTS.TXT ----
  app.get("/robots.txt", (req, res) => {
    const siteUrl = `https://${req.hostname}`;
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    );
  });

  // ---- SITEMAP.XML ----
  app.get("/sitemap.xml", async (req, res) => {
    const siteUrl = `https://${req.hostname}`;
    const today = new Date().toISOString().split("T")[0];

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/articles", priority: "0.9", changefreq: "daily" },
      { url: "/standings", priority: "0.8", changefreq: "weekly" },
      { url: "/forum", priority: "0.8", changefreq: "daily" },
      { url: "/polls", priority: "0.7", changefreq: "weekly" },
      { url: "/about", priority: "0.7", changefreq: "monthly" },
      { url: "/privacy", priority: "0.5", changefreq: "monthly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
    ];

    let articleEntries = "";
    try {
      const articles = await storage.getArticles();
      for (const a of articles) {
        const slug = (a as any).slug || a.id;
        const lastmod = a.updatedAt ? new Date(a.updatedAt).toISOString().split("T")[0] : today;
        articleEntries += `  <url>\n    <loc>${siteUrl}/articles/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    } catch {}

    const staticEntries = staticPages.map(p =>
      `  <url>\n    <loc>${siteUrl}${p.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    ).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries}\n${articleEntries}</urlset>`;
    res.type("application/xml").send(xml);
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

  // ---- SERVE CLOUD IMAGES ----
  app.get("/api/images/:objectId", async (req, res) => {
    try {
      const { bucketName, prefix } = getPublicBucketInfo();
      const objectName = `${prefix}/images/${req.params.objectId}`;
      const file = objectStorageClient.bucket(bucketName).file(objectName);
      const [exists] = await file.exists();
      if (!exists) return res.status(404).json({ error: "Image not found" });
      const [metadata] = await file.getMetadata();
      res.set("Content-Type", (metadata.contentType as string) || "image/jpeg");
      res.set("Cache-Control", "public, max-age=31536000");
      file.createReadStream().on("error", () => res.status(500).end()).pipe(res);
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
      const posts = await storage.getAllForumPosts();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum/race/:raceId", async (req, res) => {
    try {
      const posts = await storage.getForumPostsByRace(Number(req.params.raceId));
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch forum posts" });
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

  app.get("/api/forum/posts/:id/comments", async (req, res) => {
    try {
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
