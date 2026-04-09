import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, MessageSquare, Send, Trash2, Clock, Eye, Tag, Share2, Link2, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

function getCategoryFromTags(tags: string[] | null): string {
  if (!tags || tags.length === 0) return "NEWS";
  const t = tags[0].toUpperCase();
  if (t.includes("REPORT")) return "RACE REPORT";
  if (t.includes("PREVIEW")) return "PREVIEW";
  if (t.includes("ANALYSIS") || t.includes("TECHNICAL")) return "ANALYSIS";
  if (t.includes("INTERVIEW")) return "INTERVIEW";
  if (t.includes("REGULATION")) return "REGULATIONS";
  return "NEWS";
}

function estimateReadTime(content: string) {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

function getOrCreateVisitorId(): string {
  const key = "f1_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function ArticleDetailPage() {
  const [, params] = useRoute("/articles/:slug");
  const slugOrId = params?.slug || "";
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: article, isLoading: articleLoading } = useQuery<any>({
    queryKey: ["/api/articles", slugOrId],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${slugOrId}`);
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
    enabled: !!slugOrId,
  });

  const articleId = article?.id;

  const { data: comments, isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: ["/api/articles", articleId, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      return res.json();
    },
    enabled: !!articleId,
  });

  const { data: allArticles } = useQuery<any[]>({ queryKey: ["/api/articles"] });

  // Dynamic SEO meta tags
  useEffect(() => {
    if (!article) return;
    const siteTitle = "F1 Paddock";
    const fullTitle = `${article.title} | ${siteTitle}`;
    const description = article.excerpt || `Read ${article.title} on F1 Paddock.`;
    const url = `${window.location.origin}/articles/${article.slug || articleId}`;
    const image = article.imageUrl || "";

    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (attr === "property") el.setAttribute("property", selector.match(/\[property="([^"]+)"\]/)?.[1] || "");
        else el.setAttribute("name", selector.match(/\[name="([^"]+)"\]/)?.[1] || "");
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    setMeta('meta[name="description"]', "name", description);
    setMeta('meta[name="author"]', "name", article.username || "F1 Paddock");
    setMeta('meta[name="keywords"]', "name", ["Formula 1", "F1", ...(article.tags || [])].join(", "));
    setMeta('meta[property="og:title"]', "property", fullTitle);
    setMeta('meta[property="og:description"]', "property", description);
    setMeta('meta[property="og:url"]', "property", url);
    setMeta('meta[property="og:type"]', "property", "article");
    if (image) setMeta('meta[property="og:image"]', "property", image);
    setMeta('meta[name="twitter:title"]', "name", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", description);
    if (image) setMeta('meta[name="twitter:image"]', "name", image);

    const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement) ||
      (() => { const l = document.createElement("link"); l.rel = "canonical"; document.head.appendChild(l); return l; })();
    canonical.href = url;

    const existing = document.getElementById("article-ld-json");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "article-ld-json";
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.title,
      description,
      url,
      image: image || undefined,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: { "@type": "Person", name: article.username || "F1 Paddock" },
      publisher: { "@type": "Organization", name: "F1 Paddock", url: window.location.origin },
      keywords: (article.tags || []).join(", "),
      articleSection: "Formula 1",
    });
    document.head.appendChild(script);

    return () => {
      document.title = "F1 Paddock – The Ultimate F1 Fan Experience";
      document.getElementById("article-ld-json")?.remove();
    };
  }, [article, articleId]);

  // Record visit
  useEffect(() => {
    if (!articleId) return;
    const visitorId = (user as any)?.id || getOrCreateVisitorId();
    fetch(`/api/articles/${articleId}/view`, {
      method: "POST",
      headers: { "x-visitor-id": visitorId },
    }).catch(() => {});
  }, [articleId, (user as any)?.id]);

  const commentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/articles/${articleId}/comments`, { content: comment }),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/articles", articleId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to post comment", variant: "destructive" }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/articles/${articleId}/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/articles", articleId, "comments"] }),
  });

  if (articleLoading) {
    return (
      <div className="space-y-0">
        <Skeleton className="h-[420px] w-full" />
        <div className="max-w-3xl mx-auto px-4 mt-8 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 text-muted-foreground">
        <p className="font-racing text-lg mb-4">Article not found.</p>
        <Link href="/articles">
          <button className="font-racing text-sm text-primary hover:underline">Back to Articles</button>
        </Link>
      </div>
    );
  }

  const category = getCategoryFromTags(article.tags);
  const readTime = estimateReadTime(article.content);
  const hasHeroImage = !!article.imageUrl;

  return (
    <div className="min-h-screen">
      {/* ─── Cinematic Hero (break out of AppLayout padding) ─── */}
      <div
        className="relative w-full overflow-hidden -mx-4 sm:-mx-6 -mt-6"
        style={{ minHeight: hasHeroImage ? 440 : 220 }}
      >
        {hasHeroImage ? (
          <>
            <img
              src={article.imageUrl}
              alt={article.title}
              data-testid="img-article-cover"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #0d0005 0%, #1a0008 40%, #2d0010 70%, #1a0008 100%)" }}
          />
        )}

        {/* Content over hero */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 flex flex-col justify-end h-full" style={{ minHeight: hasHeroImage ? 440 : 220 }}>
          {/* Back */}
          <Link href="/articles">
            <button
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors mb-6 group"
              data-testid="button-back-articles"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-racing text-xs tracking-widest uppercase">All Articles</span>
            </button>
          </Link>

          <span className="inline-block font-racing text-[10px] font-bold tracking-[0.25em] uppercase bg-primary text-white px-3 py-1 rounded mb-4 w-fit">
            {category}
          </span>

          <h1 className="font-racing text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-5 max-w-3xl drop-shadow-lg">
            {article.title}
          </h1>

          {/* Author + meta strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7 ring-1 ring-white/30">
                <AvatarImage src={article.profileImageUrl || ""} />
                <AvatarFallback className="bg-primary text-white text-[10px] font-racing font-black">
                  {(article.username || "A").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-racing text-sm font-bold text-white">{article.username || "F1 Paddock"}</span>
            </div>
            <span className="text-white/50 text-xs">{article.publishedAt ? format(new Date(article.publishedAt), "d MMMM yyyy") : ""}</span>
            <span className="flex items-center gap-1 text-white/50 text-xs"><Clock className="w-3 h-3" />{readTime} min read</span>
            <span className="flex items-center gap-1 text-white/50 text-xs ml-auto"><Eye className="w-3.5 h-3.5" /><span data-testid="text-article-view-count">{article.viewCount || 0}</span></span>
            <span className="flex items-center gap-1 text-white/50 text-xs"><MessageSquare className="w-3.5 h-3.5" />{comments?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* ─── Article Body ─── */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Excerpt pull-quote */}
        <blockquote className="border-l-[3px] border-primary pl-5 py-1">
          <p className="text-base md:text-lg font-medium text-foreground/80 leading-relaxed italic">{article.excerpt}</p>
        </blockquote>

        {/* Article content */}
        <div className="space-y-5">
          {article.content.split("\n\n").map((para: string, i: number) => {
            const imgMatch = para.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (imgMatch) {
              return (
                <figure key={i} className="my-6">
                  <div className="rounded-xl overflow-hidden">
                    <img
                      src={imgMatch[2]}
                      alt={imgMatch[1] || ""}
                      className="w-full object-cover max-h-[500px]"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  {imgMatch[1] && (
                    <figcaption className="text-center text-xs text-muted-foreground mt-2.5 italic">{imgMatch[1]}</figcaption>
                  )}
                </figure>
              );
            }
            return (
              <p key={i} className="text-[15px] md:text-[16px] text-foreground/90 leading-[1.85] font-light">
                {para}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 border-t border-border/60">
            <Tag className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
            {article.tags.map((tag: string) => (
              <span key={tag} className="font-racing text-[10px] bg-primary/8 border border-primary/20 text-primary/90 rounded-full px-3 py-1 tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ─── Social Sharing ─── */}
        {(() => {
          const shareUrl = `https://www.f1fanhub.net/articles/${article.slug || article.id}`;
          const shareTitle = encodeURIComponent(article.title);
          const shareUrlEnc = encodeURIComponent(shareUrl);
          const handleCopy = () => {
            navigator.clipboard.writeText(shareUrl).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          };
          return (
            <div className="pt-6 border-t border-border/60">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 font-racing text-[10px] tracking-widest uppercase text-muted-foreground">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrlEnc}&hashtags=F1,Formula1,F1FanHub`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="button-share-twitter"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-racing font-bold hover:bg-neutral-800 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X / Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrlEnc}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="button-share-facebook"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2] text-white text-[11px] font-racing font-bold hover:bg-[#1464D2] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </a>
                <a
                  href={`https://www.reddit.com/submit?url=${shareUrlEnc}&title=${shareTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="button-share-reddit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF4500] text-white text-[11px] font-racing font-bold hover:bg-[#E03D00] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                  Reddit
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrlEnc}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="button-share-whatsapp"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-racing font-bold hover:bg-[#1EB857] transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <button
                  onClick={handleCopy}
                  data-testid="button-share-copy-link"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-foreground text-[11px] font-racing font-bold hover:bg-muted/70 transition-colors border border-border"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Link2 className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* ─── Related Articles ─── */}
        {(() => {
          if (!allArticles || !article?.tags?.length) return null;
          const related = allArticles
            .filter((a: any) =>
              a.id !== article.id &&
              a.status === "published" &&
              a.tags?.some((t: string) => article.tags.includes(t))
            )
            .slice(0, 3);
          if (related.length === 0) return null;
          return (
            <div className="pt-8 border-t border-border/60">
              <h2 className="font-racing text-xl font-black text-foreground mb-5">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((a: any) => (
                  <Link key={a.id} href={`/articles/${a.slug || a.id}`}>
                    <div
                      data-testid={`card-related-article-${a.id}`}
                      className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all cursor-pointer"
                    >
                      {a.imageUrl && (
                        <img
                          src={a.imageUrl}
                          alt={a.title}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <div className="p-3">
                        <p className="font-racing text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {a.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {estimateReadTime(a.content)} min read
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ─── Comments ─── */}
        <div className="pt-8 border-t border-border/60 space-y-6">
          <h2 className="font-racing text-xl font-black text-foreground">
            {comments?.length || 0} Comments
          </h2>

          {/* Comment input */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <p className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase">Leave a Comment</p>
            <textarea
              placeholder="Share your thoughts on this article..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[100px] transition-all"
              data-testid="input-article-comment"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey && comment.trim()) commentMutation.mutate();
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Ctrl+Enter to submit</span>
              <button
                onClick={() => comment.trim() && commentMutation.mutate()}
                disabled={!comment.trim() || commentMutation.isPending}
                data-testid="button-submit-article-comment"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-racing text-xs font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {commentMutation.isPending ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>

          {/* Comments list */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : comments?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="font-racing text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments?.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={c.profileImageUrl || ""} />
                    <AvatarFallback className="bg-card border border-border text-foreground text-xs font-racing font-bold">
                      {(c.username || "P").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-racing text-sm font-bold text-foreground">{c.username || "Pilot"}</span>
                      <span className="text-[10px] text-muted-foreground">{c.createdAt ? format(new Date(c.createdAt), "d MMM, HH:mm") : ""}</span>
                      {c.userId === (user as any)?.id && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(c.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          data-testid={`button-delete-article-comment-${c.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
