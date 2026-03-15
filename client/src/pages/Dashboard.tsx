import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, parseISO, differenceInDays, differenceInHours } from "date-fns";
import { MessageSquare, Clock, ChevronRight, Zap, Flag, Trophy, Timer, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Race, UserProfile, DriverStanding, ConstructorStanding } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import videoSrc from "@assets/generated_videos/bea-grid-flag.mp4";

function estimateReadTime(content: string) {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

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

function VideoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = () => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.pause();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden mb-6">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        className="w-full object-cover"
        style={{ maxHeight: 320 }}
      />

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

function BeaStoryCard() {
  return (
    <Link href="/novel">
      <div
        data-testid="card-bea-story"
        className="relative rounded-xl overflow-hidden cursor-pointer group"
        style={{ background: "linear-gradient(135deg, #1a0008 0%, #3d0015 50%, #7d0025 100%)" }}
      >
        {/* Shimmer accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-primary via-red-400 to-primary/20" />

        <div className="p-4">
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1 mb-3">
            <Play className="w-2.5 h-2.5 text-white fill-white" />
            <span className="font-racing text-[9px] text-white/90 tracking-widest uppercase font-bold">Bea's Season · 2026</span>
          </div>
          <h3 className="font-racing text-sm font-black text-white leading-snug mb-1 group-hover:text-primary/90 transition-colors">
            Follow Bea Voss<br />on the F1 grid
          </h3>
          <p className="text-white/50 text-[11px] mb-3">Visual novel · New episodes weekly</p>
          <div className="flex items-center justify-between">
            <span className="font-racing text-[10px] text-white/40">Chapter 1 available now</span>
            <div className="flex items-center gap-1 font-racing text-[10px] font-bold text-primary bg-primary/20 rounded-full px-3 py-1">
              Play Story <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function NextRaceWidget({ races }: { races: Race[] }) {
  const upcoming = races?.filter(r => r.status !== "completed").sort((a, b) =>
    new Date(a.raceDate).getTime() - new Date(b.raceDate).getTime()
  );
  const liveRace = races?.find(r => r.status === "live");
  const next = liveRace || upcoming?.[0];
  if (!next) return null;

  const now = new Date();
  const date = parseISO(next.raceDate);
  const days = differenceInDays(date, now);
  const hours = differenceInHours(date, now) % 24;

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Flag className="w-3.5 h-3.5 text-primary" />
        <span className="font-racing text-xs font-bold tracking-widest uppercase text-gray-900">
          {next.status === "live" ? "Live Race" : "Next Race"}
        </span>
        {next.status === "live" && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-racing text-[9px] text-green-600 tracking-widest">LIVE</span>
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{next.flagEmoji}</span>
          <div>
            <p className="font-racing text-sm font-black text-gray-900 leading-tight">{next.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{next.circuit}</p>
            <p className="text-xs text-gray-400">{format(date, "d MMM yyyy")}</p>
          </div>
        </div>
        {next.status !== "live" && days >= 0 && (
          <div className="mt-3 flex items-center gap-1.5 bg-primary/5 rounded-lg px-2.5 py-2">
            <Timer className="w-3 h-3 text-primary" />
            <span className="font-racing text-xs text-primary font-black">
              {days > 0 ? `${days}d ${hours}h` : `${hours}h`} to go
            </span>
          </div>
        )}
        {next.hasSprint && (
          <div className="mt-2">
            <span className="font-racing text-[9px] bg-orange-100 text-orange-600 rounded-full px-2 py-0.5 border border-orange-200">Sprint Weekend</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStandings({ drivers, constructors }: { drivers: DriverStanding[]; constructors: ConstructorStanding[] }) {
  const top5Drivers = drivers?.slice(0, 5) || [];
  const top5Constructors = constructors?.slice(0, 5) || [];

  return (
    <>
      {/* Drivers */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="font-racing text-xs font-bold tracking-widest uppercase text-gray-900">Drivers</span>
          </div>
          <Link href="/standings">
            <span className="font-racing text-[10px] text-primary hover:underline tracking-wide">Full Table</span>
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {top5Drivers.map((d) => (
            <div key={d.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`font-racing text-xs font-black w-4 text-center ${
                d.position === 1 ? "text-yellow-500" : d.position === 2 ? "text-slate-400" : d.position === 3 ? "text-orange-500" : "text-gray-300"
              }`}>{d.position}</span>
              <div className="w-0.5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: d.teamColor }} />
              <div className="flex-1 min-w-0">
                <p className="font-racing text-xs font-bold text-gray-900 truncate">{d.driverCode}</p>
                <p className="text-[10px] text-gray-400 truncate">{d.teamName}</p>
              </div>
              <span className="font-racing text-xs font-black text-gray-900 tabular-nums">{d.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Constructors */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="font-racing text-xs font-bold tracking-widest uppercase text-gray-900">Constructors</span>
          </div>
          <Link href="/standings?tab=constructors">
            <span className="font-racing text-[10px] text-primary hover:underline tracking-wide">Full Table</span>
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {top5Constructors.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`font-racing text-xs font-black w-4 text-center ${
                c.position === 1 ? "text-yellow-500" : c.position === 2 ? "text-slate-400" : c.position === 3 ? "text-orange-500" : "text-gray-300"
              }`}>{c.position}</span>
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.teamColor }} />
              <p className="font-racing text-xs font-bold text-gray-900 flex-1 truncate">{c.teamName}</p>
              <span className="font-racing text-xs font-black text-gray-900 tabular-nums">{c.points}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function HeroArticle({ article }: { article: any }) {
  const category = getCategoryFromTags(article.tags);
  const readTime = estimateReadTime(article.content);
  return (
    <Link href={`/articles/${article.id}`}>
      <div
        data-testid={`hero-article-${article.id}`}
        className="relative rounded-2xl overflow-hidden cursor-pointer group min-h-[300px] md:min-h-[360px] flex flex-col justify-end"
        style={{
          background: article.imageUrl
            ? `url(${article.imageUrl}) center/cover`
            : "linear-gradient(135deg, #1a0008 0%, #3d0015 50%, #7d0025 100%)"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="relative p-6">
          <span className="inline-block font-racing text-[10px] font-bold tracking-[0.2em] uppercase bg-primary text-white px-2.5 py-1 rounded mb-3">
            {category}
          </span>
          <h1 className="font-racing text-2xl md:text-3xl font-black text-white leading-tight mb-3 group-hover:text-primary/90 transition-colors">
            {article.title}
          </h1>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
          <div className="flex items-center gap-4 text-white/50 text-xs">
            <span className="font-racing">{article.username || "F1 Paddock"}</span>
            <span>{article.publishedAt ? format(new Date(article.publishedAt), "d MMM yyyy") : ""}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} min read</span>
            <span className="flex items-center gap-1 ml-auto"><MessageSquare className="w-3 h-3" />{article.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: any }) {
  const category = getCategoryFromTags(article.tags);
  const readTime = estimateReadTime(article.content);
  return (
    <Link href={`/articles/${article.id}`}>
      <div
        data-testid={`card-article-${article.id}`}
        className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group h-full flex flex-col"
      >
        <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20" />
        <div className="p-4 flex flex-col flex-1">
          <span className="inline-block font-racing text-[9px] font-bold tracking-[0.15em] uppercase text-primary mb-2">{category}</span>
          <h3 className="font-racing text-sm font-black text-gray-900 leading-tight line-clamp-3 mb-2 flex-1 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-3">{article.excerpt}</p>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 border-t border-gray-50 pt-2 mt-auto">
            <span className="font-racing truncate flex-1">{article.username || "F1 Paddock"}</span>
            <span>{article.publishedAt ? format(new Date(article.publishedAt), "d MMM") : ""}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{readTime}m</span>
            <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" />{article.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery<UserProfile>({ queryKey: ["/api/profile"] });
  const { data: races } = useQuery<Race[]>({
    queryKey: ["/api/races", 2026],
    queryFn: () => fetch(`/api/races?season=2026`).then(r => r.json()),
  });
  const { data: articles, isLoading: articlesLoading } = useQuery<any[]>({ queryKey: ["/api/articles"] });
  const { data: driverStandings } = useQuery<DriverStanding[]>({ queryKey: ["/api/standings/drivers"] });
  const { data: constructorStandings } = useQuery<ConstructorStanding[]>({ queryKey: ["/api/standings/constructors"] });

  const claimMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/profile/claim-daily"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "+5,000 Points Claimed!", description: "Come back tomorrow for your next reward." });
    },
    onError: () => toast({ title: "Already Claimed", description: "You've already claimed your daily points.", variant: "destructive" }),
  });

  const heroArticle = articles?.[0];
  const gridArticles = articles?.slice(1) || [];

  return (
    <div className="space-y-0">
      {/* Cinematic video banner */}
      <VideoBanner />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">2026 Season</span>
          </div>
          <h1 className="font-racing text-2xl font-black text-gray-900 tracking-tight mt-0.5">F1 Paddock</h1>
        </div>
        {profile && (
          <button
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
            data-testid="button-claim-daily"
            className="flex items-center gap-2 bg-primary/8 border border-primary/20 hover:bg-primary/15 text-primary rounded-lg px-3 py-2 transition-all font-racing text-xs font-bold"
          >
            <Zap className="w-3.5 h-3.5" />
            +5,000 Daily
          </button>
        )}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left: news */}
        <div className="space-y-4">
          {articlesLoading ? (
            <Skeleton className="h-80 w-full rounded-2xl" />
          ) : heroArticle ? (
            <HeroArticle article={heroArticle} />
          ) : null}

          {articlesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
          ) : gridArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gridArticles.map(article => <ArticleCard key={article.id} article={article} />)}
            </div>
          ) : null}

          {articles && articles.length > 0 && (
            <Link href="/articles">
              <button className="w-full py-3 border border-gray-200 rounded-xl font-racing text-xs text-gray-400 hover:text-gray-900 hover:border-primary/30 transition-all flex items-center justify-center gap-2 bg-white">
                View All Articles <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {races && <NextRaceWidget races={races} />}
          <MiniStandings
            drivers={driverStandings || []}
            constructors={constructorStandings || []}
          />
          <BeaStoryCard />
        </div>
      </div>
    </div>
  );
}
