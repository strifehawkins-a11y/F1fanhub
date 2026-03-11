import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { localCredentials } from "@shared/schema";
import { authStorage } from "./replit_integrations/auth/storage";
import type { Express, Request, Response, NextFunction } from "express";

const SALT_ROUNDS = 12;

function buildSession(userId: string, email: string, displayName: string) {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  return {
    claims: {
      sub: userId,
      email,
      first_name: displayName,
      last_name: "",
      profile_image_url: "",
      exp,
    },
    expires_at: exp,
  };
}

export function setupLocalAuth(app: Express) {
  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const [cred] = await db
            .select()
            .from(localCredentials)
            .where(eq(localCredentials.email, email.toLowerCase()));

          if (!cred) return done(null, false, { message: "Invalid email or password" });

          const valid = await bcrypt.compare(password, cred.passwordHash);
          if (!valid) return done(null, false, { message: "Invalid email or password" });

          return done(null, buildSession(cred.userId, cred.email, cred.displayName));
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Authentication error" });
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.logIn(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ message: "Session error" });
        return res.json({ success: true });
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        displayName: z.string().min(2, "Name must be at least 2 characters").max(50),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { email, password, displayName } = parsed.data;
      const normalizedEmail = email.toLowerCase();

      const [existing] = await db
        .select()
        .from(localCredentials)
        .where(eq(localCredentials.email, normalizedEmail));

      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const userId = `local_${crypto.randomUUID()}`;
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      await db.insert(localCredentials).values({ userId, email: normalizedEmail, passwordHash, displayName });

      await authStorage.upsertUser({
        id: userId,
        email: normalizedEmail,
        firstName: displayName,
        lastName: "",
        profileImageUrl: "",
      });

      const user = buildSession(userId, normalizedEmail, displayName);
      req.logIn(user, (err) => {
        if (err) return res.status(500).json({ message: "Session error" });
        return res.json({ success: true });
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get("/api/auth/local-logout", (req, res) => {
    req.logout(() => res.redirect("/"));
  });
}
