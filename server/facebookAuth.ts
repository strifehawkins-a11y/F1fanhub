import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import type { Express } from "express";
import { authStorage } from "./replit_integrations/auth/storage";

export function setupFacebookAuth(app: Express) {
  const appID = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appID || !appSecret) {
    return;
  }

  const callbackURL =
    process.env.FACEBOOK_CALLBACK_URL ||
    `${process.env.REPLIT_DEPLOYMENT_URL || "http://localhost:5000"}/api/auth/facebook/callback`;

  passport.use(
    "facebook",
    new FacebookStrategy(
      {
        clientID: appID,
        clientSecret: appSecret,
        callbackURL,
        profileFields: ["id", "emails", "name", "picture"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || `fb_${profile.id}@facebook.local`;
          const firstName = profile.name?.givenName || profile.displayName || "";
          const lastName = profile.name?.familyName || "";
          const profileImageUrl = profile.photos?.[0]?.value || "";
          const userId = `facebook_${profile.id}`;
          const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

          await authStorage.upsertUser({ id: userId, email, firstName, lastName, profileImageUrl });

          return done(null, {
            claims: {
              sub: userId,
              email,
              first_name: firstName,
              last_name: lastName,
              profile_image_url: profileImageUrl,
              exp,
            },
            expires_at: exp,
          });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

  app.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/?error=facebook_auth_failed" }),
    (_req, res) => res.redirect("/")
  );
}

export function isFacebookAuthEnabled(): boolean {
  return !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
}
