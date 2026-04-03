import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, MessageSquare, Send, Trash2, Clock, Eye, Tag } from "lucide-react";
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
