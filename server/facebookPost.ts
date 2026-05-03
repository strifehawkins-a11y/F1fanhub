const SITE_URL = "https://www.f1fanhub.net";
const GRAPH = "https://graph.facebook.com/v19.0";

// globalThis survives Vite HMR module re-evaluations within the same process
const g = globalThis as any;

// Called once on server startup — upgrades a short-lived token to a permanent Page token.
// If the token is already a permanent Page token (never-expiring), no action is taken.
export function initFacebookTokenRefresh(log: (msg: string, tag: string) => void): void {
  if (g._fbInitialized) return;
  g._fbInitialized = true;

  if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) return;

  upgradeToPermanentPageToken(log).catch(() => {});
}

async function upgradeToPermanentPageToken(log: (msg: string, tag: string) => void): Promise<void> {
  const stored = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!stored || !pageId || !appId || !appSecret) {
    g._fbToken = stored || null;
    return;
  }

  try {
    // Try to exchange for a long-lived user token (works if stored token is a short-lived user token)
    const exchUrl = new URL(`${GRAPH}/oauth/access_token`);
    exchUrl.searchParams.set("grant_type", "fb_exchange_token");
    exchUrl.searchParams.set("client_id", appId);
    exchUrl.searchParams.set("client_secret", appSecret);
    exchUrl.searchParams.set("fb_exchange_token", stored);

    const exchRes = await fetch(exchUrl.toString(), { signal: AbortSignal.timeout(10000) });
    const exchData = await exchRes.json() as any;

    if (!exchData?.access_token) {
      // Stored token is already a permanent Page token — nothing to do
      g._fbToken = stored;
      log("Facebook: permanent Page token active — auto-posting enabled", "facebook");
      return;
    }

    // Got a long-lived user token — now fetch the never-expiring Page token
    const acctUrl = new URL(`${GRAPH}/me/accounts`);
    acctUrl.searchParams.set("access_token", exchData.access_token);

    const acctRes = await fetch(acctUrl.toString(), { signal: AbortSignal.timeout(10000) });
    const acctData = await acctRes.json() as any;
    const page = (acctData?.data || []).find((p: any) => p.id === pageId);

    if (page?.access_token) {
      g._fbToken = page.access_token;
      log("Facebook: upgraded to never-expiring Page token — auto-posting enabled", "facebook");
    } else {
      g._fbToken = exchData.access_token;
      log("Facebook: using 60-day token (page not found in accounts) — auto-posting enabled", "facebook");
    }
  } catch (err: any) {
    g._fbToken = stored;
    log(`Facebook: using stored token — ${err?.message || "upgrade skipped"}`, "facebook");
  }
}

function getToken(): string | null {
  return g._fbToken !== undefined ? g._fbToken : (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null);
}

export async function postArticleToFacebook(article: {
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
}): Promise<{ success: boolean; postId?: string; message?: string }> {
  const token = getToken();

  if (!token) {
    return { success: false, message: "Facebook credentials not configured" };
  }

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const caption = article.excerpt
    ? `${article.title}\n\n${article.excerpt}\n\n🔗 Read more: ${articleUrl}`
    : `${article.title}\n\n🔗 Read more: ${articleUrl}`;

  try {
    let endpoint: string;
    let body: URLSearchParams;

    if (article.imageUrl) {
      // Photo post — image appears large and prominent in the feed
      endpoint = `${GRAPH}/me/photos`;
      body = new URLSearchParams({
        url: article.imageUrl,
        caption,
        access_token: token,
      });
    } else {
      // Fallback: link post (Facebook will scrape OG image from article URL)
      endpoint = `${GRAPH}/me/feed`;
      body = new URLSearchParams({
        message: caption,
        link: articleUrl,
        access_token: token,
      });
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json() as any;

    if (!res.ok || data.error) {
      // If photo post fails, retry as a plain link post
      if (article.imageUrl) {
        const fallback = new URLSearchParams({
          message: caption,
          link: articleUrl,
          access_token: token,
        });
        const fallbackRes = await fetch(`${GRAPH}/me/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: fallback.toString(),
          signal: AbortSignal.timeout(12000),
        });
        const fallbackData = await fallbackRes.json() as any;
        if (!fallbackRes.ok || fallbackData.error) {
          return { success: false, message: fallbackData?.error?.message || `HTTP ${fallbackRes.status}` };
        }
        return { success: true, postId: fallbackData.id };
      }
      return { success: false, message: data?.error?.message || `HTTP ${res.status}` };
    }

    return { success: true, postId: data.id };
  } catch (err: any) {
    return { success: false, message: err?.message || "Unknown Facebook error" };
  }
}

export async function postBatchToFacebook(
  articles: Array<{ title: string; slug: string; excerpt?: string; imageUrl?: string }>,
  log: (msg: string, tag: string) => void
): Promise<void> {
  if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
    log("Facebook posting skipped — credentials not set", "facebook");
    return;
  }

  for (const article of articles) {
    const result = await postArticleToFacebook(article);
    if (result.success) {
      log(`Facebook posted: "${article.title}" → post ID ${result.postId}`, "facebook");
    } else {
      log(`Facebook post failed for "${article.title}": ${result.message}`, "facebook");
    }
    await new Promise(r => setTimeout(r, 3000));
  }
}
