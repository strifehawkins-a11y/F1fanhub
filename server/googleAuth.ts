import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { authStorage } from "./replit_integrations/auth/storage";

export function setupGoogleAuth(app: Express) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    return;
  }

  const callbackURL = process.env.GOOGLE_CALLBACK_URL ||
    `${process.env.REPLIT_DEPLOYMENT_URL || "http://localhost:5000"}/api/auth/google/callback`;

  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ["profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const firstName = profile.name?.givenName || profile.displayName || "";
          const lastName = profile.name?.familyName || "";
          const profileImageUrl = profile.photos?.[0]?.value || "";
          const userId = `google_${profile.id}`;

          await authStorage.upsertUser({
            id: userId,
            email,
            firstName,
            lastName,
            profileImageUrl,
          });

          const user = {
            claims: {
              sub: userId,
              email,
              first_name: firstName,
              last_name: lastName,
              profile_image_url: profileImageUrl,
              exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            },
          };

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/?error=google_auth_failed" }),
    (req, res) => {
      res.redirect("/");
    }
  );
}

export function isGoogleAuthEnabled(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
