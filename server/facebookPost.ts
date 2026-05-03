const SITE_URL = "https://www.f1fanhub.net";

export async function postArticleToFacebook(article: {
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
}): Promise<{ success: boolean; postId?: string; message?: string }> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    return { success: false, message: "Facebook credentials not configured" };
  }

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const message = article.excerpt
    ? `${article.title}\n\n${article.excerpt}\n\nRead more: ${articleUrl}`
    : `${article.title}\n\nRead more: ${articleUrl}`;

  try {
    // Post a link with message to the Facebook Page feed
    const body = new URLSearchParams({
      message,
      link: articleUrl,
      access_token: token,
    });

    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
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
    // Space out posts to avoid rate limiting
    await new Promise(r => setTimeout(r, 3000));
  }
}
