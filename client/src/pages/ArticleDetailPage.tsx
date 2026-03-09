import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, MessageSquare, Send, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

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
      <div className="px-4 py-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="px-4 py-6 text-center text-muted-foreground">
        <p className="font-racing">Article not found.</p>
        <Link href="/articles"><Button className="mt-4 font-racing" size="sm">Back to Articles</Button></Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-5">
      <Link href="/articles">
        <button className="flex items-center gap-1.5 text-muted-foreground" data-testid="button-back-articles">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-racing">Articles</span>
        </button>
      </Link>

      {/* Article Header */}
      <div>
        {article.tags?.length > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-racing">{tag}</Badge>
            ))}
          </div>
        )}
        <h1 className="font-racing text-2xl font-black text-foreground leading-tight">{article.title}</h1>
        <div className="flex items-center gap-3 mt-3">
          <Avatar className="w-7 h-7">
            <AvatarImage src={article.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-racing font-bold">
              {(article.username || "A").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-racing font-bold text-foreground">{article.username || "Admin"}</p>
            <p className="text-[10px] text-muted-foreground">
              {article.publishedAt ? format(new Date(article.publishedAt), "MMMM d, yyyy") : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="prose prose-sm max-w-none text-foreground">
        <p className="text-sm font-medium text-muted-foreground leading-relaxed italic border-l-2 border-primary pl-3 mb-4">
          {article.excerpt}
        </p>
        {article.content.split("\n\n").map((para: string, i: number) => (
          <p key={i} className="text-sm text-foreground leading-relaxed mb-3">{para}</p>
        ))}
      </div>

      {/* Comments Section */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase mb-4 flex items-center gap-2">
          <MessageSquare className="w-3 h-3" />
          {comments?.length || 0} Comments
        </h3>

        {/* Add comment */}
        <div className="flex gap-2 mb-4">
          <Textarea
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="text-sm resize-none min-h-[72px]"
            data-testid="input-article-comment"
          />
          <Button
            size="icon"
            onClick={() => comment.trim() && commentMutation.mutate()}
            disabled={!comment.trim() || commentMutation.isPending}
            data-testid="button-submit-article-comment"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {commentsLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : comments?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm font-racing">No comments yet. Be first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments?.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={c.profileImageUrl || ""} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-racing">
                    {(c.username || "P").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-racing text-xs font-bold text-foreground">{c.username || "Pilot"}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {c.createdAt ? format(new Date(c.createdAt), "MMM d") : ""}
                    </span>
                    {c.userId === (user as any)?.id && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(c.id)}
                        className="ml-auto text-muted-foreground"
                        data-testid={`button-delete-article-comment-${c.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
