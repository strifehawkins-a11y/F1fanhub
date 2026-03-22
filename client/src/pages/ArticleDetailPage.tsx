import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, MessageSquare, Send, Trash2, Clock, Eye } from "lucide-react";
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
  const [, params] = useRoute("/articles/:id");
  const articleId = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: article, isLoading: articleLoading } = useQuery<any>({
    queryKey: ["/api/articles", articleId],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}`);
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
    enabled: !!articleId,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: ["/api/articles", articleId, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      return res.json();
    },
    enabled: !!articleId,
  });

  // Record this visit (fire-and-forget, unique per visitor)
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
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <Link href="/articles">
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-articles">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-racing text-sm">All Articles</span>
        </button>
      </Link>

      {/* Article header */}
      <div>
        <span className="inline-block font-racing text-[10px] font-bold tracking-[0.2em] uppercase bg-primary text-white px-2.5 py-1 rounded mb-4">
          {category}
        </span>
        <h1 className="font-racing text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tight mb-4">
          {article.title}
        </h1>

        {/* Author + meta */}
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <Avatar className="w-9 h-9">
            <AvatarImage src={article.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary text-white text-xs font-racing font-black">
              {(article.username || "A").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-racing text-sm font-bold text-foreground">{article.username || "F1 Paddock"}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{article.publishedAt ? format(new Date(article.publishedAt), "d MMMM yyyy") : ""}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} min read</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span className="font-racing" data-testid="text-article-view-count">{article.viewCount || 0} views</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-racing">{comments?.length || 0} comments</span>
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="space-y-5">
        {/* Excerpt as pull quote */}
        <blockquote className="border-l-4 border-primary pl-5 py-1">
          <p className="text-base font-medium text-foreground/80 leading-relaxed italic">{article.excerpt}</p>
        </blockquote>

        {/* Content */}
        <div className="space-y-4">
          {article.content.split("\n\n").map((para: string, i: number) => (
            <p key={i} className="text-[15px] text-foreground/90 leading-[1.8]">{para}</p>
          ))}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {article.tags.map((tag: string) => (
              <span key={tag} className="font-racing text-[10px] bg-primary/5 border border-primary/20 text-primary/80 rounded-full px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="pt-6 border-t border-border space-y-6">
        <h2 className="font-racing text-lg font-black text-foreground">
          {comments?.length || 0} Comments
        </h2>

        {/* Comment input */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="font-racing text-xs text-muted-foreground tracking-widest uppercase">Add a Comment</p>
          <textarea
            placeholder="Share your thoughts on this article..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[100px]"
            data-testid="input-article-comment"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey && comment.trim()) {
                commentMutation.mutate();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Ctrl+Enter to submit</span>
            <button
              onClick={() => comment.trim() && commentMutation.mutate()}
              disabled={!comment.trim() || commentMutation.isPending}
              data-testid="button-submit-article-comment"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-racing text-xs font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
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
          <div className="space-y-4">
            {comments?.map((c) => (
              <div key={c.id} className="flex gap-3 group">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={c.profileImageUrl || ""} />
                  <AvatarFallback className="bg-card border border-border text-foreground text-xs font-racing font-bold">
                    {(c.username || "P").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-card border border-border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-racing text-sm font-bold text-foreground">{c.username || "Pilot"}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {c.createdAt ? format(new Date(c.createdAt), "d MMM, HH:mm") : ""}
                    </span>
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
  );
}
