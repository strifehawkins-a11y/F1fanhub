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

export async function postArticleToCommunities(
  article: { title: string; slug: string; excerpt?: string; tags?: string[] },
  log: (msg: string, tag: string) => void
): Promise<void> {
  const jobs: Promise<PostResult>[] = [];

  if (process.env.DISCORD_WEBHOOK_URL) jobs.push(postToDiscord(article));
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) jobs.push(postToTelegram(article));
  if (process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD) jobs.push(postToBluesky(article));

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
  articles: Array<{ title: string; slug: string; excerpt?: string; tags?: string[] }>,
  log: (msg: string, tag: string) => void
): Promise<void> {
  for (const article of articles) {
    await postArticleToCommunities(article, log);
    await new Promise(r => setTimeout(r, 1500));
  }
}
