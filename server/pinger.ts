/**
 * Traffic & indexing pinger
 * Fires automatically when an article is approved.
 * - IndexNow: instantly notifies Bing, Yandex, Seznam, Naver, DuckDuckGo and others
 * - Pingomatic: notifies 30+ RSS aggregators and blog directories
 * No credentials required — all services are free and open.
 *
 * Note: Google and Bing deprecated their sitemap ping endpoints (now return 404/410).
 * For Google, use Search Console. IndexNow already covers Bing directly.
 */

const SITE = "https://www.f1fanhub.net";
const INDEX_NOW_KEY = "l6li9p2cqjldbaijsxccrpfcl4hhfqie";

/** Ping IndexNow — covers Bing, Yandex, Seznam, Naver, Yep (202 = accepted) */
async function pingIndexNow(urls: string[]): Promise<void> {
  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "www.f1fanhub.net",
        key: INDEX_NOW_KEY,
        keyLocation: `${SITE}/${INDEX_NOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    console.log(`[pinger] IndexNow: ${res.status} (202 = accepted) for ${urls.length} URL(s)`);
  } catch (err: any) {
    console.error(`[pinger] IndexNow error: ${err?.message}`);
  }
}

/** Ping RSS aggregators via Pingomatic XML-RPC (reaches 30+ services) */
async function pingRssAggregators(articleUrl: string, articleTitle: string): Promise<void> {
  const xmlBody = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value><string>F1 Fan Hub</string></value></param>
    <param><value><string>${SITE}</string></value></param>
    <param><value><string>${articleUrl}</string></value></param>
    <param><value><string>${SITE}/rss.xml</string></value></param>
  </params>
</methodCall>`;

  const targets = [
    "http://rpc.pingomatic.com/",
    "http://blogsearch.google.com/ping/RPC2",
  ];

  for (const target of targets) {
    try {
      const res = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: xmlBody,
        signal: AbortSignal.timeout(8000),
      });
      console.log(`[pinger] RSS ping ${target}: ${res.status}`);
    } catch (err: any) {
      console.log(`[pinger] RSS ping ${target} skipped: ${err?.message}`);
    }
  }
}

/**
 * Master pinger — call this after an article is approved or on demand.
 * Runs all pings in parallel; never throws (all errors are logged only).
 */
export async function pingAllOnArticlePublish(articleSlug: string, articleTitle: string): Promise<void> {
  const urls: string[] = [SITE, `${SITE}/articles`];
  if (articleSlug) urls.push(`${SITE}/articles/${articleSlug}`);
  const articleUrl = articleSlug ? `${SITE}/articles/${articleSlug}` : `${SITE}/articles`;

  console.log(`[pinger] Firing all pings for ${urls.length} URL(s)`);

  await Promise.allSettled([
    pingIndexNow(urls),
    pingRssAggregators(articleUrl, articleTitle),
  ]);

  console.log(`[pinger] All pings dispatched for "${articleTitle}"`);
}
