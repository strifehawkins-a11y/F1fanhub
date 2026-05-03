import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { generateAndPublishBatch, generateAndPublishTrendingBatch } from "./autoPublish";
import { syncStandingsFromAPI } from "./syncStandings";
import { syncRacesFromAPI } from "./syncRaces";
import { postBatchToReddit } from "./redditPost";
import { postBatchToCommunities } from "./communityPost";
import { postBatchToFacebook, initFacebookTokenRefresh } from "./facebookPost";
import { scheduleDailyReels } from "./videoReel";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));


export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );

  // Graceful shutdown — release the port cleanly so restarts don't cause EADDRINUSE
  const shutdown = () => {
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  // Facebook token — auto-refresh on startup and every 30 days
  initFacebookTokenRefresh(log);

  // Daily video reels — 3 per day at 08:00, 13:00, 19:00 UTC
  scheduleDailyReels(() => storage.getArticles(), log);

  // Daily auto-publish scheduler — fires at 07:00 UTC every day
  function scheduleNextAutoPublish() {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 7, 0, 0, 0));
    if (next.getTime() <= now.getTime()) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    const msUntil = next.getTime() - now.getTime();
    log(`Auto-publish scheduled in ${Math.round(msUntil / 60000)} minutes (${next.toISOString()})`, "scheduler");
    setTimeout(async () => {
      try {
        const result = await generateAndPublishBatch(10);
        if (result.submitted.length > 0) {
          log(`Auto-published batch: ${result.submitted.map(t => `"${t}"`).join(", ")}`, "scheduler");
          if (result.publishedArticles.length > 0) {
            await postBatchToReddit(result.publishedArticles, log);
            await postBatchToCommunities(result.publishedArticles, log);
            await postBatchToFacebook(result.publishedArticles, log);
          }
        } else if (result.noContent) {
          log(`Auto-publish: no fresh content available. ${result.message}`, "scheduler");
        } else {
          log(`Auto-publish skipped: ${result.message}`, "scheduler");
        }
      } catch (err: any) {
        log(`Auto-publish error: ${err?.message}`, "scheduler");
      }
      scheduleNextAutoPublish();
    }, msUntil);
  }
  scheduleNextAutoPublish();

  // Catch-up: if the server starts after 07:00 UTC and no articles were published today, run immediately
  (async () => {
    try {
      const now = new Date();
      if (now.getUTCHours() >= 7) {
        const todayStr = now.toISOString().split("T")[0];
        const allArticles = await storage.getArticles();
        const publishedToday = allArticles.filter((a: any) => {
          const d = a.publishedAt || a.createdAt;
          return d && new Date(d).toISOString().split("T")[0] === todayStr && a.authorId === "seed-admin";
        });
        if (publishedToday.length === 0) {
          log("Startup catch-up: missed today's 07:00 UTC window — running auto-publish now", "scheduler");
          const result = await generateAndPublishBatch(10);
          if (result.submitted.length > 0) {
            log(`Catch-up published: ${result.submitted.map((t: string) => `"${t}"`).join(", ")}`, "scheduler");
            if (result.publishedArticles.length > 0) {
              await postBatchToReddit(result.publishedArticles, log);
              await postBatchToCommunities(result.publishedArticles, log);
              await postBatchToFacebook(result.publishedArticles, log);
            }
          } else {
            log(`Catch-up skipped: ${result.message}`, "scheduler");
          }
        } else {
          log(`Startup catch-up: ${publishedToday.length} article(s) already published today — no catch-up needed`, "scheduler");
        }
      }
    } catch (err: any) {
      log(`Startup catch-up error: ${err?.message}`, "scheduler");
    }
  })();

  // Weekly trending auto-publish — fires every Monday at 07:00 UTC
  function scheduleNextWeeklyTrendingPublish() {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 7, 0, 0, 0));
    // Advance to next Monday
    const daysUntilMonday = (8 - next.getUTCDay()) % 7 || 7;
    if (next.getUTCDay() === 1 && next.getTime() > now.getTime()) {
      // today is Monday and 07:00 hasn't passed yet — fire today
    } else {
      next.setUTCDate(next.getUTCDate() + daysUntilMonday);
    }
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 7);
    const msUntil = next.getTime() - now.getTime();
    log(`Weekly trending publish scheduled in ${Math.round(msUntil / 3600000)}h (${next.toISOString()})`, "scheduler");
    setTimeout(async () => {
      try {
        const result = await generateAndPublishTrendingBatch();
        if (result.submitted.length > 0) {
          log(`Weekly trending: published ${result.submitted.map(t => `"${t}"`).join(", ")}`, "scheduler");
          if (result.publishedArticles.length > 0) {
            await postBatchToCommunities(result.publishedArticles, log);
            await postBatchToFacebook(result.publishedArticles, log);
          }
        } else {
          log(`Weekly trending skipped: ${result.message}`, "scheduler");
        }
      } catch (err: any) {
        log(`Weekly trending error: ${err?.message}`, "scheduler");
      }
      scheduleNextWeeklyTrendingPublish();
    }, msUntil);
  }
  scheduleNextWeeklyTrendingPublish();

  // Daily standings sync — fires every day at 08:00 UTC so points update after every race weekend
  function scheduleNextStandingsSync() {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 0, 0, 0));
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
    const msUntil = next.getTime() - now.getTime();
    log(`Standings sync scheduled in ${Math.round(msUntil / 3600000)}h (${next.toISOString()})`, "scheduler");
    setTimeout(async () => {
      try {
        const result = await syncStandingsFromAPI("current");
        log(`Standings auto-synced: ${result.drivers} drivers, ${result.constructors} constructors`, "scheduler");
      } catch (err: any) {
        log(`Standings sync error: ${err?.message}`, "scheduler");
      }
      scheduleNextStandingsSync();
    }, msUntil);
  }
  scheduleNextStandingsSync();

  // Weekly race schedule sync — fires every Monday at 08:30 UTC
  function scheduleNextRaceSync() {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 30, 0, 0));
    const daysUntilMonday = (8 - next.getUTCDay()) % 7 || 7;
    if (next.getUTCDay() === 1 && next.getTime() > now.getTime()) {
      // today is Monday and 08:30 hasn't passed yet — fire today
    } else {
      next.setUTCDate(next.getUTCDate() + daysUntilMonday);
    }
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 7);
    const msUntil = next.getTime() - now.getTime();
    log(`Race schedule sync scheduled in ${Math.round(msUntil / 3600000)}h (${next.toISOString()})`, "scheduler");
    setTimeout(async () => {
      try {
        const result = await syncRacesFromAPI("current");
        log(`Race schedule synced: ${result.races} races for ${result.season}`, "scheduler");
      } catch (err: any) {
        log(`Race schedule sync error: ${err?.message}`, "scheduler");
      }
      scheduleNextRaceSync();
    }, msUntil);
  }
  scheduleNextRaceSync();
})();
