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
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = getToken();

  if (!pageId || !token) {
    return { success: false, message: "Facebook credentials not configured" };
  }

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const message = article.excerpt
    ? `${article.title}\n\n${article.excerpt}\n\nRead more: ${articleUrl}`
    : `${article.title}\n\nRead more: ${articleUrl}`;

  try {
    const body = new URLSearchParams({
      message,
      link: articleUrl,
      access_token: token,
    });

    const res = await fetch(`${GRAPH}/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(12000),
    });

    const data = await res.json() as any;

    if (!res.ok || data.error) {
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
