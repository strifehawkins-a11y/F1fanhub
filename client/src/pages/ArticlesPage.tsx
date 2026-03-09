import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { BookOpen, MessageSquare, ChevronRight, Newspaper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlesPage() {
  const { data: articles, isLoading } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <p className="font-racing text-xs text-muted-foreground tracking-widest uppercase">Read</p>
        <h1 className="font-racing text-3xl font-black text-foreground mt-1">Articles</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : articles?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-racing text-sm">No articles yet.</p>
          <p className="text-xs mt-1 text-muted-foreground">Check back soon for the latest F1 news.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles?.map((article, index) => (
            <Link key={article.id} href={`/articles/${article.id}`}>
              <Card
                data-testid={`card-article-${article.id}`}
                className={`border-card-border overflow-hidden cursor-pointer hover-elevate ${index === 0 ? "border-primary/30" : ""}`}
              >
                {index === 0 && (
                  <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {index === 0 && (
                        <Badge className="mb-2 text-[9px] font-racing">Featured</Badge>
                      )}
                      <h3 className="font-racing text-base font-black text-foreground leading-tight line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={article.profileImageUrl || ""} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-[9px] font-racing">
                        {(article.username || "A").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] text-muted-foreground font-racing flex-1">
                      {article.username || "Admin"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {article.publishedAt ? format(new Date(article.publishedAt), "MMM d, yyyy") : ""}
                    </span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{article.commentCount}</span>
                    </div>
                  </div>

                  {article.tags?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {article.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] font-racing">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
