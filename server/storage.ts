import { db } from "./db";
import { eq, desc, asc, and, sql, isNull } from "drizzle-orm";
import {
  userProfile, races, quizQuestions, quizAttempts,
  forumPosts, forumComments, articles, articleComments, articleViews, novelProgress,
  driverStandings, constructorStandings, polls, pollVotes,
  type UserProfile, type Race, type QuizQuestion, type QuizAttempt,
  type ForumPost, type ForumComment, type Article, type ArticleComment,
  type NovelProgress, type InsertForumPost, type InsertForumComment,
  type InsertArticle, type InsertArticleComment,
  type DriverStanding, type ConstructorStanding,
  type Poll, type InsertPoll,
} from "@shared/schema";
import { users, type User } from "@shared/models/auth";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let slug = base;
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await db.select({ id: articles.id }).from(articles)
      .where(eq(articles.slug, candidate));
    if (existing.length === 0 || (existing.length === 1 && existing[0].id === excludeId)) return candidate;
    suffix++;
  }
}

export interface IStorage {
  // User profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(userId: string): Promise<UserProfile>;
  addPoints(userId: string, points: number): Promise<UserProfile>;
  spendPoints(userId: string, points: number): Promise<UserProfile>;
  claimDailyPoints(userId: string): Promise<{ success: boolean; message: string; profile?: UserProfile }>;

  // Users (for leaderboard / display names)
  getUserById(id: string): Promise<User | undefined>;

  // Races
  getAllRaces(season?: number): Promise<Race[]>;
  getRaceById(id: number): Promise<Race | undefined>;
  upsertRace(race: Omit<Race, "id">): Promise<Race>;

  // Quiz
  getQuizQuestions(limit?: number): Promise<QuizQuestion[]>;
  submitQuizAttempt(attempt: { userId: string; score: number; totalQuestions: number; pointsEarned: number }): Promise<QuizAttempt>;
  getLeaderboard(): Promise<Array<{ userId: string; username: string | null; profileImageUrl: string | null; lifetimePoints: number; attempts: number }>>;

  // Forum
  getAllForumPosts(): Promise<Array<ForumPost & { username: string | null; profileImageUrl: string | null; commentCount: number }>>;
  getForumPostsByRace(raceId: number): Promise<Array<ForumPost & { username: string | null; profileImageUrl: string | null; commentCount: number }>>;
  getGeneralForumPosts(): Promise<Array<ForumPost & { username: string | null; profileImageUrl: string | null; commentCount: number }>>;
  getForumPostById(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumComments(postId: number): Promise<Array<ForumComment & { username: string | null; profileImageUrl: string | null }>>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  deleteForumPost(id: number, userId: string): Promise<boolean>;
  deleteForumComment(id: number, userId: string): Promise<boolean>;
  adminUpdateForumPost(id: number, data: { title: string; content: string }): Promise<ForumPost | undefined>;
  adminDeleteForumPost(id: number): Promise<boolean>;

  // Articles
  getArticles(): Promise<Array<Article & { username: string | null; profileImageUrl: string | null; commentCount: number; viewCount: number }>>;
  getPendingArticles(): Promise<Array<Article & { username: string | null; profileImageUrl: string | null }>>;
  getArticleById(id: number): Promise<(Article & { username: string | null; profileImageUrl: string | null; viewCount: number }) | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  submitArticle(article: InsertArticle): Promise<Article>;
  approveArticle(id: number): Promise<Article | undefined>;
  rejectArticle(id: number): Promise<boolean>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  getArticleComments(articleId: number): Promise<Array<ArticleComment & { username: string | null; profileImageUrl: string | null }>>;
  getAllArticleComments(): Promise<Array<ArticleComment & { username: string | null; profileImageUrl: string | null; articleTitle: string | null }>>;
  createArticleComment(comment: InsertArticleComment): Promise<ArticleComment>;
  deleteArticleComment(id: number, userId: string): Promise<boolean>;
  deleteArticleCommentById(id: number): Promise<boolean>;
  recordArticleView(articleId: number, visitorId: string): Promise<void>;

  // Novel
  getNovelProgress(userId: string): Promise<NovelProgress | undefined>;
  upsertNovelProgress(userId: string, data: Partial<NovelProgress>): Promise<NovelProgress>;

  // Admin
  setAdminStatus(userId: string, isAdmin: boolean): Promise<void>;
  isAdmin(userId: string): Promise<boolean>;

  // Standings
  getDriverStandings(season?: number): Promise<DriverStanding[]>;
  updateDriverStanding(id: number, data: Partial<DriverStanding>): Promise<DriverStanding | undefined>;
  replaceDriverStandings(season: number, rows: Omit<DriverStanding, "id">[]): Promise<void>;
  getConstructorStandings(season?: number): Promise<ConstructorStanding[]>;
  updateConstructorStanding(id: number, data: Partial<ConstructorStanding>): Promise<ConstructorStanding | undefined>;
  replaceConstructorStandings(season: number, rows: Omit<ConstructorStanding, "id">[]): Promise<void>;

  // Race updates
  updateRace(id: number, data: Partial<Race>): Promise<Race | undefined>;

  // Polls
  getPolls(): Promise<Array<Poll & { votes: number[]; totalVotes: number }>>;
  rewardPollWinners(pollId: number): Promise<number>;
  getPollById(id: number): Promise<(Poll & { votes: number[]; totalVotes: number }) | undefined>;
  createPoll(poll: InsertPoll): Promise<Poll>;
  updatePoll(id: number, data: Partial<InsertPoll>): Promise<Poll | undefined>;
  deletePoll(id: number): Promise<boolean>;
  voteOnPoll(pollId: number, visitorId: string, optionIndex: number): Promise<boolean>;
  getVisitorVote(pollId: number, visitorId: string): Promise<number | null>;
}

export class DatabaseStorage implements IStorage {
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfile).where(eq(userProfile.userId, userId));
    return profile;
  }

  async upsertUserProfile(userId: string): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfile)
      .values({ userId, totalPoints: 0, lifetimePoints: 0, isAdmin: false })
      .onConflictDoUpdate({ target: userProfile.userId, set: { userId } })
      .returning();
    return profile;
  }

  async addPoints(userId: string, points: number): Promise<UserProfile> {
    await this.upsertUserProfile(userId);
    const [profile] = await db
      .update(userProfile)
      .set({
        totalPoints: sql`${userProfile.totalPoints} + ${points}`,
        lifetimePoints: sql`${userProfile.lifetimePoints} + ${points}`,
      })
      .where(eq(userProfile.userId, userId))
      .returning();
    return profile;
  }

  async spendPoints(userId: string, points: number): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfile)
      .set({ totalPoints: sql`GREATEST(0, ${userProfile.totalPoints} - ${points})` })
      .where(eq(userProfile.userId, userId))
      .returning();
    return profile;
  }

  async claimDailyPoints(userId: string): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
    await this.upsertUserProfile(userId);
    const profile = await this.getUserProfile(userId);
    if (!profile) return { success: false, message: "User not found" };

    if (profile.lastDailyClaimAt) {
      const lastClaim = new Date(profile.lastDailyClaimAt);
      const now = new Date();
      const hoursSince = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        const hoursLeft = Math.ceil(24 - hoursSince);
        return { success: false, message: `Come back in ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}` };
      }
    }

    const [updated] = await db
      .update(userProfile)
      .set({
        totalPoints: sql`${userProfile.totalPoints} + 5000`,
        lifetimePoints: sql`${userProfile.lifetimePoints} + 5000`,
        lastDailyClaimAt: new Date(),
      })
      .where(eq(userProfile.userId, userId))
      .returning();

    return { success: true, message: "Claimed 5,000 points!", profile: updated };
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllRaces(season?: number): Promise<Race[]> {
    if (season) {
      return db.select().from(races).where(eq(races.season, season)).orderBy(asc(races.round));
    }
    return db.select().from(races).orderBy(asc(races.season), asc(races.round));
  }

  async getRaceById(id: number): Promise<Race | undefined> {
    const [race] = await db.select().from(races).where(eq(races.id, id));
    return race;
  }

  async upsertRace(race: Omit<Race, "id">): Promise<Race> {
    const [result] = await db
      .insert(races)
      .values(race)
      .onConflictDoUpdate({ target: races.round, set: race })
      .returning();
    return result;
  }

  async updateRace(id: number, data: Partial<Race>): Promise<Race | undefined> {
    const { id: _id, ...updateData } = data as any;
    const [result] = await db.update(races).set(updateData).where(eq(races.id, id)).returning();
    return result;
  }

  async getQuizQuestions(limit = 10): Promise<QuizQuestion[]> {
    return db.select().from(quizQuestions).orderBy(sql`RANDOM()`).limit(limit);
  }

  async submitQuizAttempt(attempt: { userId: string; score: number; totalQuestions: number; pointsEarned: number }): Promise<QuizAttempt> {
    const [result] = await db.insert(quizAttempts).values(attempt).returning();
    await this.addPoints(attempt.userId, attempt.pointsEarned);
    return result;
  }

  async getLeaderboard() {
    const results = await db
      .select({
        userId: userProfile.userId,
        lifetimePoints: userProfile.lifetimePoints,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(userProfile)
      .leftJoin(users, eq(userProfile.userId, users.id))
      .orderBy(desc(userProfile.lifetimePoints))
      .limit(50);

    const attempts = await db
      .select({ userId: quizAttempts.userId, count: sql<number>`count(*)` })
      .from(quizAttempts)
      .groupBy(quizAttempts.userId);

    const attemptMap = new Map(attempts.map((a) => [a.userId, Number(a.count)]));

    return results.map((r) => ({
      userId: r.userId,
      username: r.firstName ? `${r.firstName} ${r.lastName || ""}`.trim() : null,
      profileImageUrl: r.profileImageUrl,
      lifetimePoints: r.lifetimePoints,
      attempts: attemptMap.get(r.userId) || 0,
    }));
  }

  async getAllForumPosts() {
    const posts = await db
      .select({
        id: forumPosts.id,
        raceId: forumPosts.raceId,
        userId: forumPosts.userId,
        title: forumPosts.title,
        content: forumPosts.content,
        createdAt: forumPosts.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .orderBy(desc(forumPosts.createdAt))
      .limit(20);

    const commentCounts = await db
      .select({ postId: forumComments.postId, count: sql<number>`count(*)` })
      .from(forumComments)
      .groupBy(forumComments.postId);

    const countMap = new Map(commentCounts.map((c) => [c.postId, Number(c.count)]));

    return posts.map((p) => ({
      id: p.id,
      raceId: p.raceId,
      userId: p.userId,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      username: p.firstName ? `${p.firstName} ${p.lastName || ""}`.trim() : "Pilot",
      profileImageUrl: p.profileImageUrl,
      commentCount: countMap.get(p.id) || 0,
    }));
  }

  async getForumPostsByRace(raceId: number) {
    const posts = await db
      .select({
        id: forumPosts.id,
        raceId: forumPosts.raceId,
        userId: forumPosts.userId,
        title: forumPosts.title,
        content: forumPosts.content,
        createdAt: forumPosts.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.raceId, raceId))
      .orderBy(desc(forumPosts.createdAt));

    const commentCounts = await db
      .select({ postId: forumComments.postId, count: sql<number>`count(*)` })
      .from(forumComments)
      .groupBy(forumComments.postId);

    const countMap = new Map(commentCounts.map((c) => [c.postId, Number(c.count)]));

    return posts.map((p) => ({
      id: p.id,
      raceId: p.raceId,
      userId: p.userId,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      username: p.firstName ? `${p.firstName} ${p.lastName || ""}`.trim() : "Pilot",
      profileImageUrl: p.profileImageUrl,
      commentCount: countMap.get(p.id) || 0,
    }));
  }

  async getGeneralForumPosts() {
    const posts = await db
      .select({
        id: forumPosts.id,
        raceId: forumPosts.raceId,
        userId: forumPosts.userId,
        title: forumPosts.title,
        content: forumPosts.content,
        createdAt: forumPosts.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(isNull(forumPosts.raceId))
      .orderBy(desc(forumPosts.createdAt));

    const commentCounts = await db
      .select({ postId: forumComments.postId, count: sql<number>`count(*)` })
      .from(forumComments)
      .groupBy(forumComments.postId);

    const countMap = new Map(commentCounts.map((c) => [c.postId, Number(c.count)]));

    return posts.map((p) => ({
      id: p.id,
      raceId: p.raceId,
      userId: p.userId,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      username: p.firstName ? `${p.firstName} ${p.lastName || ""}`.trim() : "Pilot",
      profileImageUrl: p.profileImageUrl,
      commentCount: countMap.get(p.id) || 0,
    }));
  }

  async getForumPostById(id: number): Promise<ForumPost | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    return post;
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [result] = await db.insert(forumPosts).values(post).returning();
    return result;
  }

  async getForumComments(postId: number) {
    const results = await db
      .select({
        id: forumComments.id,
        postId: forumComments.postId,
        userId: forumComments.userId,
        content: forumComments.content,
        createdAt: forumComments.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(forumComments)
      .leftJoin(users, eq(forumComments.userId, users.id))
      .where(eq(forumComments.postId, postId))
      .orderBy(asc(forumComments.createdAt));

    return results.map((r) => ({
      id: r.id,
      postId: r.postId,
      userId: r.userId,
      content: r.content,
      createdAt: r.createdAt,
      username: r.firstName ? `${r.firstName} ${r.lastName || ""}`.trim() : "Pilot",
      profileImageUrl: r.profileImageUrl,
    }));
  }

  async createForumComment(comment: InsertForumComment): Promise<ForumComment> {
    const [result] = await db.insert(forumComments).values(comment).returning();
    return result;
  }

  async deleteForumPost(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(forumPosts).where(and(eq(forumPosts.id, id), eq(forumPosts.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteForumComment(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(forumComments).where(and(eq(forumComments.id, id), eq(forumComments.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async adminUpdateForumPost(id: number, data: { title: string; content: string }): Promise<ForumPost | undefined> {
    const [result] = await db.update(forumPosts).set({ title: data.title, content: data.content }).where(eq(forumPosts.id, id)).returning();
    return result;
  }

  async adminDeleteForumPost(id: number): Promise<boolean> {
    await db.delete(forumComments).where(eq(forumComments.postId, id));
    const result = await db.delete(forumPosts).where(eq(forumPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getArticles() {
    const results = await db
      .select({
        id: articles.id,
        title: articles.title,
        content: articles.content,
        excerpt: articles.excerpt,
        imageUrl: articles.imageUrl,
        authorId: articles.authorId,
        tags: articles.tags,
        section: articles.section,
        slug: articles.slug,
        status: articles.status,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
        sortOrder: articles.sortOrder,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt));

    const [commentCounts, viewCounts] = await Promise.all([
      db
        .select({ articleId: articleComments.articleId, count: sql<number>`count(*)` })
        .from(articleComments)
        .groupBy(articleComments.articleId),
      db
        .select({ articleId: articleViews.articleId, count: sql<number>`count(distinct visitor_id)` })
        .from(articleViews)
        .groupBy(articleViews.articleId),
    ]);

    const commentMap = new Map(commentCounts.map((c) => [c.articleId, Number(c.count)]));
    const viewMap = new Map(viewCounts.map((v) => [v.articleId, Number(v.count)]));

    return results.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      excerpt: a.excerpt,
      imageUrl: a.imageUrl,
      authorId: a.authorId,
      tags: a.tags,
      section: a.section,
      slug: a.slug,
      status: a.status,
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      sortOrder: a.sortOrder,
      username: a.firstName ? `${a.firstName} ${a.lastName || ""}`.trim() : "Admin",
      profileImageUrl: a.profileImageUrl,
      commentCount: commentMap.get(a.id) || 0,
      viewCount: viewMap.get(a.id) || 0,
    }));
  }

  async getPendingArticles() {
    const results = await db
      .select({
        id: articles.id,
        title: articles.title,
        content: articles.content,
        excerpt: articles.excerpt,
        imageUrl: articles.imageUrl,
        authorId: articles.authorId,
        tags: articles.tags,
        section: articles.section,
        slug: articles.slug,
        status: articles.status,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.status, "pending"))
      .orderBy(desc(articles.publishedAt));

    return results.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      excerpt: a.excerpt,
      imageUrl: a.imageUrl,
      authorId: a.authorId,
      tags: a.tags,
      section: a.section,
      slug: a.slug,
      status: a.status,
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      username: a.firstName ? `${a.firstName} ${a.lastName || ""}`.trim() : null,
      profileImageUrl: a.profileImageUrl,
    }));
  }

  async getArticleById(id: number) {
    const [result] = await db
      .select({
        id: articles.id,
        title: articles.title,
        content: articles.content,
        excerpt: articles.excerpt,
        imageUrl: articles.imageUrl,
        authorId: articles.authorId,
        tags: articles.tags,
        section: articles.section,
        slug: articles.slug,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, id));

    if (!result) return undefined;

    const [viewResult] = await db
      .select({ count: sql<number>`count(distinct visitor_id)` })
      .from(articleViews)
      .where(eq(articleViews.articleId, id));

    return {
      ...result,
      username: result.firstName ? `${result.firstName} ${result.lastName || ""}`.trim() : "Admin",
      viewCount: Number(viewResult?.count || 0),
    };
  }

  async recordArticleView(articleId: number, visitorId: string): Promise<void> {
    // Insert only if this visitor hasn't already viewed this article
    await db
      .insert(articleViews)
      .values({ articleId, visitorId })
      .onConflictDoNothing();
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const slug = await uniqueSlug(toSlug(article.title));
    const [result] = await db.insert(articles).values({ ...article, slug, status: "published" }).returning();
    return result;
  }

  async submitArticle(article: InsertArticle): Promise<Article> {
    const slug = await uniqueSlug(toSlug(article.title));
    const [result] = await db.insert(articles).values({ ...article, slug, status: "pending", section: "news" }).returning();
    return result;
  }

  async approveArticle(id: number): Promise<Article | undefined> {
    const [result] = await db
      .update(articles)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return result;
  }

  async rejectArticle(id: number): Promise<boolean> {
    const result = await db
      .update(articles)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(articles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const updates: any = { ...article, updatedAt: new Date() };
    if (article.title) {
      updates.slug = await uniqueSlug(toSlug(article.title), id);
    }
    const [result] = await db.update(articles).set(updates).where(eq(articles.id, id)).returning();
    return result;
  }

  async getArticleBySlug(slug: string) {
    const [result] = await db
      .select({
        id: articles.id,
        title: articles.title,
        content: articles.content,
        excerpt: articles.excerpt,
        imageUrl: articles.imageUrl,
        authorId: articles.authorId,
        tags: articles.tags,
        section: articles.section,
        slug: articles.slug,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.slug, slug));

    if (!result) return undefined;

    const [viewResult] = await db
      .select({ count: sql<number>`count(distinct visitor_id)` })
      .from(articleViews)
      .where(eq(articleViews.articleId, result.id));

    const [commentResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(articleComments)
      .where(eq(articleComments.articleId, result.id));

    return {
      ...result,
      username: result.firstName ? `${result.firstName} ${result.lastName || ""}`.trim() : "Admin",
      viewCount: Number(viewResult?.count || 0),
      commentCount: Number(commentResult?.count || 0),
    };
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getArticleComments(articleId: number) {
    const results = await db
      .select({
        id: articleComments.id,
        articleId: articleComments.articleId,
        userId: articleComments.userId,
        content: articleComments.content,
        createdAt: articleComments.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(articleComments)
      .leftJoin(users, eq(articleComments.userId, users.id))
      .where(eq(articleComments.articleId, articleId))
      .orderBy(asc(articleComments.createdAt));

    return results.map((r) => ({
      id: r.id,
      articleId: r.articleId,
      userId: r.userId,
      content: r.content,
      createdAt: r.createdAt,
      username: r.firstName ? `${r.firstName} ${r.lastName || ""}`.trim() : "Pilot",
      profileImageUrl: r.profileImageUrl,
    }));
  }

  async createArticleComment(comment: InsertArticleComment): Promise<ArticleComment> {
    const [result] = await db.insert(articleComments).values(comment).returning();
    return result;
  }

  async deleteArticleComment(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(articleComments).where(and(eq(articleComments.id, id), eq(articleComments.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllArticleComments() {
    const results = await db
      .select({
        id: articleComments.id,
        articleId: articleComments.articleId,
        userId: articleComments.userId,
        content: articleComments.content,
        createdAt: articleComments.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        articleTitle: articles.title,
      })
      .from(articleComments)
      .leftJoin(users, eq(articleComments.userId, users.id))
      .leftJoin(articles, eq(articleComments.articleId, articles.id))
      .orderBy(desc(articleComments.createdAt));

    return results.map((r) => ({
      id: r.id,
      articleId: r.articleId,
      userId: r.userId,
      content: r.content,
      createdAt: r.createdAt,
      username: r.firstName ? `${r.firstName} ${r.lastName || ""}`.trim() : "Pilot",
      profileImageUrl: r.profileImageUrl,
      articleTitle: r.articleTitle,
    }));
  }

  async deleteArticleCommentById(id: number): Promise<boolean> {
    const result = await db.delete(articleComments).where(eq(articleComments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getNovelProgress(userId: string): Promise<NovelProgress | undefined> {
    const [progress] = await db.select().from(novelProgress).where(eq(novelProgress.userId, userId));
    return progress;
  }

  async upsertNovelProgress(userId: string, data: Partial<NovelProgress>): Promise<NovelProgress> {
    const [result] = await db
      .insert(novelProgress)
      .values({ userId, ...data })
      .onConflictDoUpdate({ target: novelProgress.userId, set: { ...data, lastPlayedAt: new Date() } })
      .returning();
    return result;
  }

  async setAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    await this.upsertUserProfile(userId);
    await db.update(userProfile).set({ isAdmin }).where(eq(userProfile.userId, userId));
  }

  async isAdmin(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return profile?.isAdmin ?? false;
  }

  async getDriverStandings(season: number = 2026): Promise<DriverStanding[]> {
    return db.select().from(driverStandings)
      .where(eq(driverStandings.season, season))
      .orderBy(asc(driverStandings.position));
  }

  async updateDriverStanding(id: number, data: Partial<DriverStanding>): Promise<DriverStanding | undefined> {
    const [result] = await db.update(driverStandings).set(data).where(eq(driverStandings.id, id)).returning();
    return result;
  }

  async getConstructorStandings(season: number = 2026): Promise<ConstructorStanding[]> {
    return db.select().from(constructorStandings)
      .where(eq(constructorStandings.season, season))
      .orderBy(asc(constructorStandings.position));
  }

  async updateConstructorStanding(id: number, data: Partial<ConstructorStanding>): Promise<ConstructorStanding | undefined> {
    const [result] = await db.update(constructorStandings).set(data).where(eq(constructorStandings.id, id)).returning();
    return result;
  }

  async replaceDriverStandings(season: number, rows: Omit<DriverStanding, "id">[]): Promise<void> {
    await db.delete(driverStandings).where(eq(driverStandings.season, season));
    if (rows.length > 0) {
      await db.insert(driverStandings).values(rows as any);
    }
  }

  async replaceConstructorStandings(season: number, rows: Omit<ConstructorStanding, "id">[]): Promise<void> {
    await db.delete(constructorStandings).where(eq(constructorStandings.season, season));
    if (rows.length > 0) {
      await db.insert(constructorStandings).values(rows as any);
    }
  }

  private async buildPollWithVotes(poll: Poll) {
    const votesRows = await db
      .select({ optionIndex: pollVotes.optionIndex, count: sql<number>`count(*)` })
      .from(pollVotes)
      .where(eq(pollVotes.pollId, poll.id))
      .groupBy(pollVotes.optionIndex);
    const votes = poll.options.map((_, i) => {
      const row = votesRows.find(r => r.optionIndex === i);
      return Number(row?.count || 0);
    });
    return { ...poll, votes, totalVotes: votes.reduce((a, b) => a + b, 0) };
  }

  async getPolls() {
    const allPolls = await db.select().from(polls).orderBy(desc(polls.createdAt));
    return Promise.all(allPolls.map(p => this.buildPollWithVotes(p)));
  }

  async rewardPollWinners(pollId: number): Promise<number> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
    if (!poll || poll.winnersRewarded) return 0;

    const votesRows = await db
      .select({ optionIndex: pollVotes.optionIndex, count: sql<number>`count(*)` })
      .from(pollVotes)
      .where(eq(pollVotes.pollId, pollId))
      .groupBy(pollVotes.optionIndex);

    if (votesRows.length === 0) return 0;

    const counts = poll.options.map((_, i) => {
      const row = votesRows.find(r => r.optionIndex === i);
      return Number(row?.count || 0);
    });
    const winnerIndex = counts.indexOf(Math.max(...counts));

    const winnerVotes = await db
      .select({ visitorId: pollVotes.visitorId })
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.optionIndex, winnerIndex)));

    let rewarded = 0;
    for (const { visitorId } of winnerVotes) {
      const [profile] = await db.select().from(userProfile).where(eq(userProfile.userId, visitorId));
      if (profile) {
        await db.update(userProfile)
          .set({
            totalPoints: sql`${userProfile.totalPoints} + 500`,
            lifetimePoints: sql`${userProfile.lifetimePoints} + 500`,
          })
          .where(eq(userProfile.userId, visitorId));
        rewarded++;
      }
    }

    await db.update(polls).set({ winnersRewarded: true }).where(eq(polls.id, pollId));
    return rewarded;
  }

  async getPollById(id: number) {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    if (!poll) return undefined;
    return this.buildPollWithVotes(poll);
  }

  async createPoll(poll: InsertPoll): Promise<Poll> {
    const [result] = await db.insert(polls).values(poll).returning();
    return result;
  }

  async updatePoll(id: number, data: Partial<InsertPoll>): Promise<Poll | undefined> {
    const [result] = await db.update(polls).set(data).where(eq(polls.id, id)).returning();
    return result;
  }

  async deletePoll(id: number): Promise<boolean> {
    await db.delete(pollVotes).where(eq(pollVotes.pollId, id));
    const result = await db.delete(polls).where(eq(polls.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async voteOnPoll(pollId: number, visitorId: string, optionIndex: number): Promise<boolean> {
    try {
      await db.insert(pollVotes).values({ pollId, visitorId, optionIndex }).onConflictDoNothing();
      return true;
    } catch {
      return false;
    }
  }

  async getVisitorVote(pollId: number, visitorId: string): Promise<number | null> {
    const [row] = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.visitorId, visitorId)));
    return row?.optionIndex ?? null;
  }
}

export const storage = new DatabaseStorage();
