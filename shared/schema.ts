import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const userProfile = pgTable("user_profile", {
  userId: varchar("user_id").primaryKey(),
  totalPoints: integer("total_points").default(0).notNull(),
  lifetimePoints: integer("lifetime_points").default(0).notNull(),
  lastDailyClaimAt: timestamp("last_daily_claim_at"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const races = pgTable("races", {
  id: serial("id").primaryKey(),
  season: integer("season").default(2025).notNull(),
  round: integer("round").notNull(),
  name: text("name").notNull(),
  circuit: text("circuit").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  raceDate: text("race_date").notNull(),
  qualifyingDate: text("qualifying_date").notNull(),
  hasSprint: boolean("has_sprint").default(false).notNull(),
  status: text("status").default("upcoming").notNull(),
  flagEmoji: text("flag_emoji"),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  points: integer("points").default(100).notNull(),
  difficulty: text("difficulty").default("medium").notNull(),
  category: text("category").default("general").notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  pointsEarned: integer("points_earned").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  raceId: integer("race_id").notNull(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  authorId: varchar("author_id").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  publishedAt: timestamp("published_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const articleComments = pgTable("article_comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const novelProgress = pgTable("novel_progress", {
  userId: varchar("user_id").primaryKey(),
  currentChapter: integer("current_chapter").default(1).notNull(),
  currentScene: integer("current_scene").default(0).notNull(),
  completedChoices: text("completed_choices").array().default(sql`ARRAY[]::text[]`),
  pointsSpent: integer("points_spent").default(0).notNull(),
  selectedOutfit: text("selected_outfit").array().default(sql`ARRAY[]::text[]`),
  affectionLevel: integer("affection_level").default(0).notNull(),
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true });
export const insertForumCommentSchema = createInsertSchema(forumComments).omit({ id: true, createdAt: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, publishedAt: true, updatedAt: true });
export const insertArticleCommentSchema = createInsertSchema(articleComments).omit({ id: true, createdAt: true });
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, completedAt: true });

export type UserProfile = typeof userProfile.$inferSelect;
export type Race = typeof races.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type ForumComment = typeof forumComments.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type ArticleComment = typeof articleComments.$inferSelect;
export type NovelProgress = typeof novelProgress.$inferSelect;

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertArticleComment = z.infer<typeof insertArticleCommentSchema>;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
