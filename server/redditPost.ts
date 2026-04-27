const SITE_URL = "https://www.f1fanhub.net";
const REDDIT_UA = "F1FanHub/1.0 (+https://www.f1fanhub.net)";

async function getRedditToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) return null;

  try {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": REDDIT_UA,
      },
      body: new URLSearchParams({
        grant_type: "password",
        username,
        password,
        scope: "submit",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    return data.access_token || null;
  } catch {
    return null;
  }
}

export async function postArticleToReddit(article: {
  title: string;
  slug: string;
  tags?: string[];
}): Promise<{ success: boolean; redditUrl?: string; message?: string }> {
  const token = await getRedditToken();
  if (!token) {
    return { success: false, message: "Reddit credentials not configured — set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD" };
  }

  const subreddit = process.env.REDDIT_SUBREDDIT || "f1fanhub";
  const articleUrl = `${SITE_URL}/article/${article.slug}`;

  try {
    const res = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": REDDIT_UA,
      },
      body: new URLSearchParams({
        sr: subreddit,
        kind: "link",
        title: article.title,
        url: articleUrl,
        resubmit: "false",
        sendreplies: "true",
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json() as any;

    if (data?.json?.errors?.length > 0) {
      const err = data.json.errors[0];
      return { success: false, message: `Reddit error: ${err[1] || err[0]}` };
    }

    const redditUrl = data?.json?.data?.url;
    return { success: true, redditUrl };
  } catch (err: any) {
    return { success: false, message: err?.message || "Unknown Reddit error" };
  }
}

export async function postBatchToReddit(
  articles: Array<{ title: string; slug: string; tags?: string[] }>,
  log: (msg: string, tag: string) => void
): Promise<void> {
  if (!process.env.REDDIT_CLIENT_ID) {
    log("Reddit posting skipped — credentials not set", "reddit");
    return;
  }

  for (const article of articles) {
    const result = await postArticleToReddit(article);
    if (result.success) {
      log(`Reddit posted: "${article.title}" → ${result.redditUrl}`, "reddit");
    } else {
      log(`Reddit post failed for "${article.title}": ${result.message}`, "reddit");
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}
