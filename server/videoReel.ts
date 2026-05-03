import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const SITE_URL = "https://www.f1fanhub.net";
const GRAPH = "https://graph.facebook.com/v19.0";
const FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const W = 720;
const H = 1280;

export type ReelType = "morning" | "midday" | "evening";

const REEL_CONFIG: Record<ReelType, { hook1: string; hook2: string; sub: string; articleSlice: [number, number] }> = {
  morning: { hook1: "MORNING F1", hook2: "BRIEFING", sub: "Top stories from the paddock", articleSlice: [0, 3] },
  midday:  { hook1: "MIDDAY F1",  hook2: "UPDATE",   sub: "What is happening right now",  articleSlice: [3, 6] },
  evening: { hook1: "TONIGHT IN", hook2: "FORMULA 1",sub: "Your evening F1 roundup",      articleSlice: [6, 9] },
};

const REEL_CAPTIONS: Record<ReelType, string> = {
  morning: "☀️ MORNING F1 BRIEFING — your top paddock stories for today!\n\nFollow for daily Formula 1 news, standings and analysis.\n\n>> www.f1fanhub.net\n\n#F1 #Formula1 #FormulaOne #F1News #GrandPrix",
  midday:  "🏎️ MIDDAY PADDOCK UPDATE — catch up on the latest F1 stories!\n\nAll the news from the grid at www.f1fanhub.net\n\n#F1 #Formula1 #FormulaOne #F1News",
  evening: "🏁 EVENING F1 ROUNDUP — tonight's top stories from Formula 1!\n\nFull analysis and race reports at www.f1fanhub.net\n\n#F1 #Formula1 #FormulaOne #F1News #GrandPrix",
};

function getToken(): string | null {
  return (globalThis as any)._fbToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
}

function ffText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:");
}

function wrapLine(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur ? cur + " " + w : w).length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function runFfmpeg(args: string[], label: string): void {
  const result = spawnSync("ffmpeg", args, { encoding: "buffer", timeout: 60000 });
  if (result.status !== 0) {
    const err = result.stderr?.toString() || "unknown ffmpeg error";
    throw new Error(`ffmpeg ${label} failed: ${err.slice(-400)}`);
  }
}

function buildIntroSlide(imgPath: string, outPath: string, cfg: typeof REEL_CONFIG[ReelType]): void {
  const hook1 = ffText(cfg.hook1);
  const hook2 = ffText(cfg.hook2);
  const sub   = ffText(cfg.sub);
  const wm    = ffText("F1FANHUB.NET");
  const url   = ffText(">> www.f1fanhub.net");

  const filter = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}[bg]`,
    `[bg]drawbox=x=0:y=0:w=${W}:h=${H}:color=0x000000@0.58:t=fill[ov]`,
    `[ov]drawtext=fontfile='${FONT_BOLD}':text='${wm}':fontsize=28:fontcolor=0xFFFFFF@0.9:x=(w-text_w)/2:y=52[wm]`,
    `[wm]drawbox=x=60:y=480:w=600:h=10:color=0xCC0000@1:t=fill[rb1]`,
    `[rb1]drawtext=fontfile='${FONT_BOLD}':text='${hook1}':fontsize=96:fontcolor=white:x=(w-text_w)/2:y=510[h1]`,
    `[h1]drawtext=fontfile='${FONT_BOLD}':text='${hook2}':fontsize=96:fontcolor=0xCC0000:x=(w-text_w)/2:y=618[h2]`,
    `[h2]drawbox=x=60:y=730:w=600:h=10:color=0xCC0000@1:t=fill[rb2]`,
    `[rb2]drawtext=fontfile='${FONT}':text='${sub}':fontsize=38:fontcolor=0xEEEEEE:x=(w-text_w)/2:y=758[sub]`,
    `[sub]drawtext=fontfile='${FONT_BOLD}':text='${url}':fontsize=34:fontcolor=0xCC0000:x=(w-text_w)/2:y=${H - 80}[out]`,
  ].join(";");

  runFfmpeg([
    "-y", "-loop", "1", "-t", "7", "-i", imgPath,
    "-filter_complex", filter, "-map", "[out]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "26",
    "-r", "30", "-pix_fmt", "yuv420p", "-t", "7", outPath,
  ], "intro-slide");
}

function buildArticleSlide(imgPath: string, outPath: string, title: string, slideNum: number): void {
  const lines = wrapLine(title, 24);
  const wm  = ffText("F1FANHUB.NET");
  const url = ffText(">> www.f1fanhub.net for the full story");
  const num = ffText(`STORY ${slideNum}`);

  const textY = H - 340;
  const lineH = 64;

  const filters: string[] = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}[bg]`,
    `[bg]drawbox=x=0:y=${H - 370}:w=${W}:h=370:color=0x000000@0.84:t=fill[ov]`,
    `[ov]drawtext=fontfile='${FONT_BOLD}':text='${wm}':fontsize=26:fontcolor=0xFFFFFF@0.85:x=(w-text_w)/2:y=46[wm]`,
    `[wm]drawtext=fontfile='${FONT_BOLD}':text='${num}':fontsize=28:fontcolor=0xCC0000:x=26:y=${H - 360}[sn]`,
  ];

  let prev = "sn";
  lines.forEach((line, i) => {
    const escaped = ffText(line);
    const y = textY + i * lineH;
    const next = `l${i}`;
    filters.push(`[${prev}]drawtext=fontfile='${FONT_BOLD}':text='${escaped}':fontsize=54:fontcolor=white:x=24:y=${y}[${next}]`);
    prev = next;
  });

  filters.push(`[${prev}]drawtext=fontfile='${FONT}':text='${url}':fontsize=32:fontcolor=0xCC0000:x=(w-text_w)/2:y=${H - 52}[out]`);

  runFfmpeg([
    "-y", "-loop", "1", "-t", "7", "-i", imgPath,
    "-filter_complex", filters.join(";"), "-map", "[out]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "26",
    "-r", "30", "-pix_fmt", "yuv420p", "-t", "7", outPath,
  ], `article-slide-${slideNum}`);
}

function buildCtaSlide(imgPath: string, outPath: string): void {
  const wm   = ffText("F1FANHUB.NET");
  const cta1 = ffText("FOLLOW FOR DAILY");
  const cta2 = ffText("F1 NEWS");
  const url  = ffText("www.f1fanhub.net");
  const sub  = ffText("News  |  Standings  |  Polls  |  Forum");

  const filter = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}[bg]`,
    `[bg]drawbox=x=0:y=0:w=${W}:h=${H}:color=0x000000@0.65:t=fill[ov]`,
    `[ov]drawtext=fontfile='${FONT_BOLD}':text='${wm}':fontsize=28:fontcolor=0xFFFFFF@0.9:x=(w-text_w)/2:y=52[wm]`,
    `[wm]drawbox=x=60:y=490:w=600:h=8:color=0xCC0000:t=fill[rb1]`,
    `[rb1]drawtext=fontfile='${FONT_BOLD}':text='${cta1}':fontsize=88:fontcolor=white:x=(w-text_w)/2:y=516[c1]`,
    `[c1]drawtext=fontfile='${FONT_BOLD}':text='${cta2}':fontsize=88:fontcolor=0xCC0000:x=(w-text_w)/2:y=616[c2]`,
    `[c2]drawbox=x=60:y=720:w=600:h=8:color=0xCC0000:t=fill[rb2]`,
    `[rb2]drawtext=fontfile='${FONT_BOLD}':text='${url}':fontsize=52:fontcolor=white:x=(w-text_w)/2:y=746[u]`,
    `[u]drawtext=fontfile='${FONT}':text='${sub}':fontsize=34:fontcolor=0xCCCCCC:x=(w-text_w)/2:y=820[out]`,
  ].join(";");

  runFfmpeg([
    "-y", "-loop", "1", "-t", "7", "-i", imgPath,
    "-filter_complex", filter, "-map", "[out]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "26",
    "-r", "30", "-pix_fmt", "yuv420p", "-t", "7", outPath,
  ], "cta-slide");
}

export async function buildDailyReel(
  articles: Array<{ title: string; slug: string; imageUrl?: string; excerpt?: string }>,
  reelType: ReelType,
  log: (msg: string, tag: string) => void,
): Promise<string | null> {
  const cfg = REEL_CONFIG[reelType];
  const picks = articles
    .filter(a => a.imageUrl)
    .slice(cfg.articleSlice[0], cfg.articleSlice[1]);

  if (picks.length === 0) {
    const fallback = articles.filter(a => a.imageUrl).slice(0, 3);
    if (fallback.length === 0) {
      log(`Reel ${reelType}: no articles with images — skipped`, "reel");
      return null;
    }
    picks.push(...fallback);
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `f1reel-${reelType}-`));
  log(`Reel ${reelType}: building in ${workDir}`, "reel");

  try {
    const imgPaths: string[] = [];
    for (let i = 0; i < picks.length; i++) {
      const p = path.join(workDir, `img${i}.jpg`);
      await downloadImage(picks[i].imageUrl!, p);
      imgPaths.push(p);
      log(`Reel ${reelType}: image ${i + 1}/${picks.length} downloaded`, "reel");
    }

    const slides: string[] = [];

    const introPath = path.join(workDir, "slide_intro.mp4");
    buildIntroSlide(imgPaths[0], introPath, cfg);
    slides.push(introPath);
    log(`Reel ${reelType}: intro slide built`, "reel");

    for (let i = 0; i < picks.length; i++) {
      const sp = path.join(workDir, `slide_${i + 1}.mp4`);
      buildArticleSlide(imgPaths[i], sp, picks[i].title, i + 1);
      slides.push(sp);
      log(`Reel ${reelType}: article slide ${i + 1} built`, "reel");
    }

    const ctaPath = path.join(workDir, "slide_cta.mp4");
    buildCtaSlide(imgPaths[imgPaths.length - 1], ctaPath);
    slides.push(ctaPath);
    log(`Reel ${reelType}: CTA slide built`, "reel");

    const listPath = path.join(workDir, "list.txt");
    fs.writeFileSync(listPath, slides.map(s => `file '${s}'`).join("\n"));

    const outPath = path.join(workDir, "reel_final.mp4");
    runFfmpeg([
      "-y", "-f", "concat", "-safe", "0", "-i", listPath,
      "-c:v", "libx264", "-preset", "fast", "-crf", "26",
      "-pix_fmt", "yuv420p", outPath,
    ], "concat");

    const sizeMb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
    log(`Reel ${reelType}: video ready — ${sizeMb}MB, ${slides.length} slides`, "reel");
    return outPath;

  } catch (err: any) {
    log(`Reel ${reelType}: build error — ${err.message}`, "reel");
    try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}
    return null;
  }
}

export async function uploadReelToFacebook(
  videoPath: string,
  description: string,
  log: (msg: string, tag: string) => void,
): Promise<{ success: boolean; postId?: string; message?: string }> {
  const token = getToken();
  if (!token) return { success: false, message: "No Facebook token" };

  const videoBuffer = fs.readFileSync(videoPath);
  const videoSize = videoBuffer.length;

  try {
    log(`Reel upload: initialising (${(videoSize / 1024 / 1024).toFixed(1)}MB)`, "reel");

    const initRes = await fetch(`${GRAPH}/me/video_reels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upload_phase: "start", video_size: videoSize, access_token: token }),
      signal: AbortSignal.timeout(30000),
    });
    const initData = await initRes.json() as any;

    if (initData.upload_url && initData.video_id) {
      log(`Reel upload: uploading binary to Facebook...`, "reel");
      const uploadRes = await fetch(initData.upload_url, {
        method: "POST",
        headers: {
          "Authorization": `OAuth ${token}`,
          "Content-Type": "application/octet-stream",
          "offset": "0",
          "file_size": String(videoSize),
        },
        body: videoBuffer,
        signal: AbortSignal.timeout(180000),
      });

      if (uploadRes.ok || uploadRes.status === 200) {
        const pubParams = new URLSearchParams({
          upload_phase: "finish",
          video_id: initData.video_id,
          video_state: "PUBLISHED",
          description,
          title: "F1 Fan Hub Daily News",
          access_token: token,
        });
        const pubRes = await fetch(`${GRAPH}/me/video_reels`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: pubParams.toString(),
          signal: AbortSignal.timeout(30000),
        });
        const pubData = await pubRes.json() as any;
        if (pubData.success || pubData.post_id) {
          log(`Reel upload: published as Reel — ${pubData.post_id || initData.video_id}`, "reel");
          return { success: true, postId: pubData.post_id || initData.video_id };
        }
        log(`Reel publish response: ${JSON.stringify(pubData)}`, "reel");
      }
    }

    log(`Reel upload: Reels API unavailable — falling back to /me/videos`, "reel");
    return await uploadAsVideo(videoBuffer, description, token, log);

  } catch (err: any) {
    log(`Reel upload: error — ${err.message}, trying /me/videos fallback`, "reel");
    return await uploadAsVideo(videoBuffer, description, token, log);
  } finally {
    try { fs.rmSync(path.dirname(videoPath), { recursive: true, force: true }); } catch {}
  }
}

async function uploadAsVideo(
  videoBuffer: Buffer,
  description: string,
  token: string,
  log: (msg: string, tag: string) => void,
): Promise<{ success: boolean; postId?: string; message?: string }> {
  try {
    const form = new FormData();
    form.append("description", description);
    form.append("access_token", token);
    form.append("file", new Blob([videoBuffer], { type: "video/mp4" }), "reel.mp4");

    const res = await fetch(`${GRAPH}/me/videos`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(180000),
    });
    const data = await res.json() as any;
    if (data.error) return { success: false, message: data.error.message };
    log(`Reel upload: posted as video — ${data.id}`, "reel");
    return { success: true, postId: data.id };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function publishReel(
  articles: Array<{ title: string; slug: string; imageUrl?: string; excerpt?: string }>,
  reelType: ReelType,
  log: (msg: string, tag: string) => void,
): Promise<void> {
  if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
    log(`Reel ${reelType}: skipped — no Facebook token`, "reel");
    return;
  }

  try {
    const videoPath = await buildDailyReel(articles, reelType, log);
    if (!videoPath) return;

    const result = await uploadReelToFacebook(videoPath, REEL_CAPTIONS[reelType], log);
    if (result.success) {
      log(`Reel ${reelType}: live on Facebook — post ID ${result.postId}`, "reel");
    } else {
      log(`Reel ${reelType}: upload failed — ${result.message}`, "reel");
    }
  } catch (err: any) {
    log(`Reel ${reelType}: unexpected error — ${err.message}`, "reel");
  }
}

export function scheduleDailyReels(
  getArticles: () => Promise<Array<{ title: string; slug: string; imageUrl?: string; excerpt?: string; publishedAt?: any; authorId?: string }>>,
  log: (msg: string, tag: string) => void,
): void {
  const slots: Array<{ type: ReelType; utcHour: number; utcMin: number }> = [
    { type: "morning", utcHour: 8,  utcMin: 0  },
    { type: "midday",  utcHour: 13, utcMin: 0  },
    { type: "evening", utcHour: 19, utcMin: 0  },
  ];

  for (const slot of slots) {
    scheduleReelSlot(slot.type, slot.utcHour, slot.utcMin, getArticles, log);
  }
}

function scheduleReelSlot(
  type: ReelType,
  utcHour: number,
  utcMin: number,
  getArticles: () => Promise<Array<{ title: string; slug: string; imageUrl?: string; excerpt?: string; publishedAt?: any; authorId?: string }>>,
  log: (msg: string, tag: string) => void,
): void {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), utcHour, utcMin, 0, 0));
  if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);

  const msUntil = next.getTime() - now.getTime();
  log(`Reel ${type} scheduled in ${Math.round(msUntil / 60000)}min (${next.toISOString()})`, "reel");

  setTimeout(async () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const all = await getArticles();
      const todaysArticles = all
        .filter((a: any) => {
          const d = a.publishedAt || a.createdAt;
          return d && new Date(d).toISOString().split("T")[0] === todayStr && a.authorId === "seed-admin" && a.imageUrl;
        })
        .slice(0, 9);

      if (todaysArticles.length === 0) {
        log(`Reel ${type}: no published articles for today — skipped`, "reel");
      } else {
        await publishReel(todaysArticles, type, log);
      }
    } catch (err: any) {
      log(`Reel ${type}: scheduler error — ${err?.message}`, "reel");
    }
    scheduleReelSlot(type, utcHour, utcMin, getArticles, log);
  }, msUntil);
}
