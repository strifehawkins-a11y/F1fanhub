const SITE_URL = "https://www.f1fanhub.net";

interface PostResult {
  platform: string;
  success: boolean;
  message?: string;
}

async function postToDiscord(article: { title: string; slug: string; excerpt?: string; tags?: string[] }): Promise<PostResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return { platform: "discord", success: false, message: "DISCORD_WEBHOOK_URL not set" };

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const tagLine = article.tags?.slice(0, 3).map(t => `\`${t}\``).join(" ") || "";

  const payload = {
    embeds: [
      {
        title: article.title,
        url: articleUrl,
        description: (article.excerpt || "").slice(0, 300) + (article.excerpt && article.excerpt.length > 300 ? "..." : ""),
        color: 0xe8002d,
        footer: {
          text: "F1 Fan Hub • f1fanhub.net",
        },
        fields: tagLine ? [{ name: "Tags", value: tagLine, inline: true }] : [],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 204 || res.ok) return { platform: "discord", success: true };
    const text = await res.text().catch(() => "");
    return { platform: "discord", success: false, message: `HTTP ${res.status}: ${text.slice(0, 100)}` };
  } catch (err: any) {
    return { platform: "discord", success: false, message: err?.message };
  }
}

async function postToTelegram(article: { title: string; slug: string; excerpt?: string }): Promise<PostResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return { platform: "telegram", success: false, message: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set" };

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const excerpt = (article.excerpt || "").slice(0, 200) + (article.excerpt && article.excerpt.length > 200 ? "..." : "");
  const text = `🏎️ *${escapeMarkdown(article.title)}*\n\n${escapeMarkdown(excerpt)}\n\n[Read on F1 Fan Hub](${articleUrl})`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: false,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json() as any;
    if (data.ok) return { platform: "telegram", success: true };
    return { platform: "telegram", success: false, message: data.description || "Unknown error" };
  } catch (err: any) {
    return { platform: "telegram", success: false, message: err?.message };
  }
}

async function postToBluesky(article: { title: string; slug: string; excerpt?: string }): Promise<PostResult> {
  const handle = process.env.BLUESKY_HANDLE;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;
  if (!handle || !appPassword) return { platform: "bluesky", success: false, message: "BLUESKY_HANDLE or BLUESKY_APP_PASSWORD not set" };

  try {
    const sessionRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: handle, password: appPassword }),
      signal: AbortSignal.timeout(8000),
    });
    if (!sessionRes.ok) return { platform: "bluesky", success: false, message: "Bluesky login failed" };
    const session = await sessionRes.json() as any;
    const accessJwt = session.accessJwt;
    const did = session.did;

    const articleUrl = `${SITE_URL}/article/${article.slug}`;
    const postText = `${article.title.slice(0, 200)}\n\n${articleUrl}`;
    const byteStart = Buffer.byteLength(article.title.slice(0, 200) + "\n\n");
    const byteEnd = Buffer.byteLength(postText);

    const postRes = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessJwt}`,
      },
      body: JSON.stringify({
        repo: did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: postText,
          facets: [
            {
              index: { byteStart, byteEnd },
              features: [{ $type: "app.bsky.richtext.facet#link", uri: articleUrl }],
            },
          ],
          createdAt: new Date().toISOString(),
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (postRes.ok) return { platform: "bluesky", success: true };
    const err = await postRes.json().catch(() => ({})) as any;
    return { platform: "bluesky", success: false, message: err?.message || `HTTP ${postRes.status}` };
  } catch (err: any) {
    return { platform: "bluesky", success: false, message: err?.message };
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

async function postToInstagram(article: { title: string; slug: string; excerpt?: string; imageUrl?: string }): Promise<PostResult> {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accountId || !accessToken) return { platform: "instagram", success: false, message: "INSTAGRAM_ACCOUNT_ID or INSTAGRAM_ACCESS_TOKEN not set" };

  const imageUrl = article.imageUrl;
  if (!imageUrl) return { platform: "instagram", success: false, message: "No image URL — Instagram requires an image" };

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const caption = `${article.title}\n\n${(article.excerpt || "").slice(0, 180)}${article.excerpt && article.excerpt.length > 180 ? "..." : ""}\n\n🔗 ${articleUrl}\n\n#F1 #Formula1 #F1FanHub #FormulaOne`;

  try {
    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, caption, access_token: accessToken }),
        signal: AbortSignal.timeout(12000),
      }
    );
    const containerData = await containerRes.json() as any;
    if (!containerData.id) return { platform: "instagram", success: false, message: containerData.error?.message || "Container creation failed" };

    // Step 2: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
        signal: AbortSignal.timeout(12000),
      }
    );
    const publishData = await publishRes.json() as any;
    if (publishData.id) return { platform: "instagram", success: true };
    return { platform: "instagram", success: false, message: publishData.error?.message || "Publish failed" };
  } catch (err: any) {
    return { platform: "instagram", success: false, message: err?.message };
  }
}

async function postToFacebook(article: { title: string; slug: string; excerpt?: string; imageUrl?: string }): Promise<PostResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !pageToken) return { platform: "facebook", success: false, message: "FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN not set" };

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const message = `${article.title}\n\n${(article.excerpt || "").slice(0, 400)}${article.excerpt && article.excerpt.length > 400 ? "..." : ""}\n\nRead more: ${articleUrl}\n\n#F1 #Formula1 #F1FanHub #FormulaOne`;

  try {
    // If there's an image, post as a photo with link; otherwise post as a plain feed link
    let res: Response;
    if (article.imageUrl) {
      res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: article.imageUrl,
          caption: message,
          access_token: pageToken,
        }),
        signal: AbortSignal.timeout(12000),
      });
    } else {
      res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          link: articleUrl,
          access_token: pageToken,
        }),
        signal: AbortSignal.timeout(12000),
      });
    }
    const data = await res.json() as any;
    if (data.id) return { platform: "facebook", success: true };
    return { platform: "facebook", success: false, message: data.error?.message || `HTTP ${res.status}` };
  } catch (err: any) {
    return { platform: "facebook", success: false, message: err?.message };
  }
}

async function postToPinterest(article: { title: string; slug: string; excerpt?: string; imageUrl?: string }): Promise<PostResult> {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
  const boardId = process.env.PINTEREST_BOARD_ID;
  if (!accessToken || !boardId) return { platform: "pinterest", success: false, message: "PINTEREST_ACCESS_TOKEN or PINTEREST_BOARD_ID not set" };

  const imageUrl = article.imageUrl;
  if (!imageUrl) return { platform: "pinterest", success: false, message: "No image URL — Pinterest requires an image" };

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const description = `${(article.excerpt || article.title).slice(0, 480)}`;

  try {
    const res = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        board_id: boardId,
        title: article.title.slice(0, 100),
        description,
        link: articleUrl,
        media_source: {
          source_type: "image_url",
          url: imageUrl,
        },
      }),
      signal: AbortSignal.timeout(12000),
    });
    const data = await res.json() as any;
    if (data.id) return { platform: "pinterest", success: true };
    return { platform: "pinterest", success: false, message: data.message || `HTTP ${res.status}` };
  } catch (err: any) {
    return { platform: "pinterest", success: false, message: err?.message };
  }
}

export type CommunityArticle = {
  title: string;
  slug: string;
  excerpt?: string;
  tags?: string[];
  imageUrl?: string;
};

export async function postArticleToCommunities(
  article: CommunityArticle,
  log: (msg: string, tag: string) => void
): Promise<void> {
  const jobs: Promise<PostResult>[] = [];

  if (process.env.DISCORD_WEBHOOK_URL) jobs.push(postToDiscord(article));
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) jobs.push(postToTelegram(article));
  if (process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD) jobs.push(postToBluesky(article));
  if (process.env.INSTAGRAM_ACCOUNT_ID && process.env.INSTAGRAM_ACCESS_TOKEN) jobs.push(postToInstagram(article));
  if (process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN) jobs.push(postToFacebook(article));
  if (process.env.PINTEREST_ACCESS_TOKEN && process.env.PINTEREST_BOARD_ID) jobs.push(postToPinterest(article));

  if (jobs.length === 0) {
    log("Community posting skipped — no platforms configured", "community");
    return;
  }

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "fulfilled") {
      const res = r.value;
      if (res.success) {
        log(`Posted to ${res.platform}: "${article.title}"`, "community");
      } else {
        log(`${res.platform} post failed: ${res.message}`, "community");
      }
    }
  }
}

export async function postBatchToCommunities(
  articles: Array<CommunityArticle>,
  log: (msg: string, tag: string) => void
): Promise<void> {
  for (const article of articles) {
    await postArticleToCommunities(article, log);
    await new Promise(r => setTimeout(r, 1500));
  }
}
