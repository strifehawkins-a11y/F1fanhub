import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { MessageSquare, Clock, Newspaper, Eye, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

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

const F1_GRADIENTS = [
  "linear-gradient(135deg, #0d0005 0%, #1a0008 40%, #3d0015 70%, #2d0010 100%)",
  "linear-gradient(135deg, #0a0010 0%, #1a0030 40%, #0d0050 70%, #050020 100%)",
  "linear-gradient(135deg, #0d0500 0%, #1a1000 40%, #3d2500 70%, #2d1800 100%)",
];

function ArticlePlaceholder({ id, className = "" }: { id: number; className?: string }) {
  const gradient = F1_GRADIENTS[id % F1_GRADIENTS.length];
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`} style={{ background: gradient }}>
      <div className="text-center select-none opacity-20">
        <div className="font-racing text-white text-4xl font-black tracking-tighter mb-1">F1</div>
        <div className="font-racing text-white text-[10px] tracking-widest uppercase">Paddock</div>
      </div>
    </div>
  );
}

function ArticleCard({ article, featured = false }: { article: any; featured?: boolean }) {
  const category = getCategoryFromTags(article.tags);
  const readTime = estimateReadTime(article.content);
  const [imgFailed, setImgFailed] = useState(false);
  const hasImg = !!article.imageUrl && !imgFailed;

  if (featured) {
    return (
      <Link href={`/articles/${article.slug || article.id}`}>
        <div
          data-testid={`hero-article-${article.id}`}
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{ minHeight: 400 }}
        >
          {hasImg ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={() => setImgFailed(true)}
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
          ) : (
            <ArticlePlaceholder id={article.id} className="absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

          <div className="relative p-6 md:p-8 h-full flex flex-col justify-end" style={{ minHeight: 400 }}>
            <span className="inline-block font-racing text-[10px] font-bold tracking-[0.2em] uppercase bg-primary text-white px-3 py-1 rounded mb-4 w-fit">
              {category}
            </span>
            <h2 className="font-racing text-2xl md:text-4xl font-black text-white leading-tight mb-3 group-hover:text-primary/90 transition-colors max-w-2xl">
              {article.title}
            </h2>
            <p className="text-white/65 text-sm leading-relaxed line-clamp-2 mb-5 max-w-xl">{article.excerpt}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/45 text-xs">
              <span className="font-racing font-bold text-white/60">{article.username || "F1 Paddock"}</span>
              <span>{article.publishedAt ? format(new Date(article.publishedAt), "d MMM yyyy") : ""}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} min read</span>
              <div className="ml-auto flex items-center gap-4">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.viewCount || 0}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{article.commentCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug || article.id}`}>
      <div
        data-testid={`card-article-${article.id}`}
        className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-300 group h-full flex flex-col"
      >
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          {hasImg ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgFailed(true)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ArticlePlaceholder id={article.id} className="h-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-3 left-3 font-racing text-[9px] font-bold tracking-[0.2em] uppercase bg-primary text-white px-2 py-1 rounded">
            {category}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-racing text-sm font-black text-gray-900 leading-tight line-clamp-3 mb-2 flex-1 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-3">{article.excerpt}</p>

          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {article.tags.slice(0, 2).map((tag: string) => (
                <span key={tag} className="font-racing text-[9px] bg-primary/8 border border-primary/15 text-primary/80 rounded px-1.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-gray-400 border-t border-gray-50 pt-2 mt-auto">
            <span className="font-racing truncate flex-1 text-gray-500">{article.username || "F1 Paddock"}</span>
            <span>{article.publishedAt ? format(new Date(article.publishedAt), "d MMM") : ""}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{readTime}m</span>
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
  );
}

export default function ArticlesPage() {
  const { data: articles, isLoading } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const heroArticle = articles?.[0];
  const secondArticle = articles?.[1];
  const gridArticles = articles?.slice(2) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">Latest Coverage</span>
          </div>
          <h1 className="font-racing text-3xl md:text-4xl font-black text-foreground tracking-tight">Articles</h1>
        </div>
        <span className="font-racing text-xs text-muted-foreground">{articles?.length || 0} stories</span>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
          </div>
        </div>
      ) : articles?.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Newspaper className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-racing text-base font-black mb-1">No articles published yet</p>
          <p className="text-sm">Check back soon for the latest F1 news and analysis.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero + secondary split */}
          {heroArticle && secondArticle ? (
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
              <ArticleCard article={heroArticle} featured />
              <ArticleCard article={secondArticle} featured />
            </div>
          ) : heroArticle ? (
            <ArticleCard article={heroArticle} featured />
          ) : null}

          {/* Divider */}
          {gridArticles.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <span className="font-racing text-[10px] text-gray-400 tracking-widest uppercase font-bold">More Stories</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          )}

          {/* Grid */}
          {gridArticles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gridArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {articles && articles.length >= 10 && (
            <button className="w-full py-4 border border-gray-200 rounded-xl font-racing text-xs text-gray-400 hover:text-gray-900 hover:border-primary/30 transition-all flex items-center justify-center gap-2 bg-white">
              Load More Articles <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
