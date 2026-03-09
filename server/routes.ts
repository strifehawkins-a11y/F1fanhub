import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { insertForumPostSchema, insertForumCommentSchema, insertArticleSchema, insertArticleCommentSchema } from "@shared/schema";
import { seedDatabase } from "./seed";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

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

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticleById(Number(req.params.id));
      if (!article) return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch article" });
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

  // Seed the database on startup
  await seedDatabase();

  return httpServer;
}
