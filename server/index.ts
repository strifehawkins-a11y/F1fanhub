import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { generateAndPublishBatch, generateAndPublishTrendingBatch } from "./autoPublish";
import { syncStandingsFromAPI } from "./syncStandings";
import { postBatchToReddit } from "./redditPost";
import { postBatchToCommunities } from "./communityPost";

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
        const result = await generateAndPublishBatch(5);
        if (result.submitted.length > 0) {
          log(`Auto-published batch: ${result.submitted.map(t => `"${t}"`).join(", ")}`, "scheduler");
          if (result.publishedArticles.length > 0) {
            await postBatchToReddit(result.publishedArticles, log);
            await postBatchToCommunities(result.publishedArticles, log);
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

  // Weekly standings sync — fires every Monday at 08:00 UTC (after race weekends)
  function scheduleNextStandingsSync() {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 0, 0, 0));
    // Advance to next Monday
    const daysUntilMonday = (8 - next.getUTCDay()) % 7 || 7;
    next.setUTCDate(next.getUTCDate() + (next.getTime() <= now.getTime() ? daysUntilMonday : daysUntilMonday === 7 ? 0 : daysUntilMonday));
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 7);
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
})();
