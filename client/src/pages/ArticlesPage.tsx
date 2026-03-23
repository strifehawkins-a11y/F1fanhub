import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { MessageSquare, Clock, Newspaper, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function ArticlesPage() {
  const { data: articles, isLoading } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const heroArticle = articles?.[0];
  const gridArticles = articles?.slice(1) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">Latest News</span>
        </div>
        <h1 className="font-racing text-3xl font-black text-foreground tracking-tight">Articles</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
          </div>
        </div>
      ) : articles?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-racing text-sm">No articles yet.</p>
          <p className="text-xs mt-1">Check back soon for the latest F1 news.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Hero article */}
          {heroArticle && (
            <Link href={`/articles/${heroArticle.id}`}>
              <div
                data-testid={`hero-article-${heroArticle.id}`}
                className="relative rounded-2xl overflow-hidden cursor-pointer group min-h-[320px] flex flex-col justify-end"
                style={{
                  background: heroArticle.imageUrl
                    ? `url(${heroArticle.imageUrl}) center/cover`
                    : "linear-gradient(135deg, #0d0d14 0%, #1a0814 40%, #2d0a10 100%)"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="relative p-6 md:p-8">
                  <span className="inline-block font-racing text-[10px] font-bold tracking-[0.2em] uppercase bg-primary text-white px-2.5 py-1 rounded mb-3">
                    {getCategoryFromTags(heroArticle.tags)}
                  </span>
                  <h2 className="font-racing text-2xl md:text-3xl font-black text-white leading-tight mb-3 group-hover:text-primary/90 transition-colors">
                    {heroArticle.title}
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-4">{heroArticle.excerpt}</p>
                  <div className="flex items-center gap-4 text-white/50 text-xs">
                    <span className="font-racing">{heroArticle.username || "F1 Paddock"}</span>
                    <span>{heroArticle.publishedAt ? format(new Date(heroArticle.publishedAt), "d MMM yyyy") : ""}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{estimateReadTime(heroArticle.content)} min
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Eye className="w-3 h-3" />{heroArticle.viewCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />{heroArticle.commentCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          {gridArticles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gridArticles.map((article) => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <div
                    data-testid={`card-article-${article.id}`}
                    className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all group h-full flex flex-col"
                  >
                    {article.imageUrl ? (
                      <div className="relative h-36 overflow-hidden">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    ) : (
                      <div className="h-0.5 bg-gradient-to-r from-primary/80 to-primary/20" />
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <span className="inline-block font-racing text-[9px] font-bold tracking-[0.15em] uppercase text-primary mb-2">
                        {getCategoryFromTags(article.tags)}
                      </span>
                      <h3 className="font-racing text-sm font-black text-foreground leading-tight line-clamp-3 mb-2 flex-1 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      {article.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="font-racing text-[9px] bg-primary/5 border border-primary/20 text-primary/80 rounded px-1.5 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border/50 pt-2 mt-auto">
                        <span className="font-racing truncate flex-1">{article.username || "F1 Paddock"}</span>
                        <span>{article.publishedAt ? format(new Date(article.publishedAt), "d MMM") : ""}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />{estimateReadTime(article.content)}m
                        </span>
                        <span className="flex items-center gap-0.5" data-testid={`text-view-count-${article.id}`}>
                          <Eye className="w-2.5 h-2.5" />{article.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="w-2.5 h-2.5" />{article.commentCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
