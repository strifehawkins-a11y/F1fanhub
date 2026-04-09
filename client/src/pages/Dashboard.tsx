import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, parseISO, differenceInDays, differenceInHours } from "date-fns";
import { MessageSquare, Clock, ChevronRight, Zap, Flag, Trophy, Timer, Edit2, X, Save, BarChart3, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Race, UserProfile, DriverStanding, ConstructorStanding } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import videoSrc from "@assets/generated_videos/bea-grid-flag.mp4";
import { GinaVossGame } from "@/pages/NovelPage";

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
        preload="none"
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

function PollsWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [idx, setIdx] = useState(0);

  const getVisitorId = () => {
    if (user?.id) return user.id;
    let id = localStorage.getItem("f1_visitor_id");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("f1_visitor_id", id); }
    return id;
  };
  const visitorId = getVisitorId();

  const { data: pollsData, isLoading } = useQuery<any[]>({ queryKey: ["/api/polls"] });
  const activePolls = (pollsData || []).filter((p: any) => p.isActive && (!p.closesAt || new Date(p.closesAt) > new Date()));

  const poll = activePolls[idx];

  const { data: myVote } = useQuery<{ optionIndex: number | null }>({
    queryKey: ["/api/polls", poll?.id, "my-vote", visitorId],
    queryFn: () => poll ? fetch(`/api/polls/${poll.id}/my-vote`, { headers: { "x-visitor-id": visitorId } }).then(r => r.json()) : Promise.resolve({ optionIndex: null }),
    enabled: !!poll,
  });

  const voteMutation = useMutation({
    mutationFn: (optionIndex: number) => fetch(`/api/polls/${poll.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-visitor-id": visitorId },
      body: JSON.stringify({ optionIndex }),
    }).then(r => r.json()),
    onSuccess: (updatedPoll) => {
      queryClient.setQueryData(["/api/polls"], (old: any[]) =>
        (old || []).map((p: any) => p.id === updatedPoll.id ? updatedPoll : p)
      );
      queryClient.invalidateQueries({ queryKey: ["/api/polls", poll.id, "my-vote", visitorId] });
    },
  });

  const voted = myVote?.optionIndex != null;
  const total = poll ? (poll.options as string[]).reduce((_: any, __: any, i: number) => _ + (poll.voteCounts?.[i] || 0), 0) : 0;
  const maxVotes = poll ? Math.max(1, ...((poll.options as string[]).map((_: any, i: number) => poll.voteCounts?.[i] || 0))) : 1;

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!poll) return null;

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20" />
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-primary" />
        <span className="font-racing text-xs font-bold tracking-widest uppercase text-gray-900">Fan Poll</span>
        <span className="flex items-center gap-0.5 font-racing text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
          <Zap className="w-2.5 h-2.5" /> 500 pts
        </span>
        {activePolls.length > 1 && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setIdx(i => (i - 1 + activePolls.length) % activePolls.length)}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              data-testid="button-poll-prev"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-racing text-[9px] text-gray-400">{idx + 1}/{activePolls.length}</span>
            <button
              onClick={() => setIdx(i => (i + 1) % activePolls.length)}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              data-testid="button-poll-next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <p className="font-racing text-xs font-bold text-gray-900 leading-snug">{poll.question}</p>

        <div className="space-y-2">
          {(poll.options as string[]).map((opt: string, i: number) => {
            const votes = poll.voteCounts?.[i] || 0;
            const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
            const isWinner = votes === maxVotes && total > 0;
            const isMine = myVote?.optionIndex === i;

            return voted ? (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className={`text-[11px] font-medium truncate pr-2 ${isMine ? "text-primary font-bold" : "text-gray-700"}`}>{opt}</span>
                  <span className={`text-[10px] font-racing font-bold shrink-0 ${isWinner ? "text-primary" : "text-gray-400"}`}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isMine ? "bg-primary" : isWinner ? "bg-primary/40" : "bg-gray-200"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                key={i}
                onClick={() => voteMutation.mutate(i)}
                disabled={voteMutation.isPending}
                data-testid={`button-poll-option-${i}`}
                className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 hover:border-primary/40 hover:bg-primary/5 text-[11px] text-gray-700 font-medium transition-all"
              >
                {opt}
              </button>
            );
          })}
        </div>

        {voted && (
          <p className="text-[10px] text-gray-400 text-center font-racing">{total} vote{total !== 1 ? "s" : ""} cast · 500 pts awarded to winners when poll closes</p>
        )}
      </div>

      <div className="px-4 pb-3">
        <Link href="/polls">
          <button className="w-full text-center font-racing text-[10px] text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-1">
            View All Polls <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
    </div>
  );
}


const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all";
const labelCls = "font-racing text-[9px] text-gray-400 tracking-widest uppercase block mb-1";

function NextRaceWidget({ races, profile }: { races: Race[]; profile?: UserProfile }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Race>>({});

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

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Race>) => apiRequest("PATCH", `/api/races/${next.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/races"] });
      setEditing(false);
      toast({ title: "Next race updated!" });
    },
    onError: () => toast({ title: "Failed to update race", variant: "destructive" }),
  });

  const startEdit = () => {
    setForm({
      name: next.name,
      circuit: next.circuit,
      location: next.location,
      country: next.country,
      flagEmoji: next.flagEmoji,
      raceDate: next.raceDate,
      qualifyingDate: next.qualifyingDate,
      hasSprint: next.hasSprint,
      status: next.status,
    });
    setEditing(true);
  };

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Flag className="w-3.5 h-3.5 text-primary" />
        <span className="font-racing text-xs font-bold tracking-widest uppercase text-gray-900">
          {next.status === "live" ? "Live Race" : "Next Race"}
        </span>
        {next.status === "live" && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-racing text-[9px] text-green-600 tracking-widest">LIVE</span>
          </span>
        )}
        {profile?.isAdmin && !editing && (
          <button
            data-testid="button-edit-next-race"
            onClick={startEdit}
            className="ml-auto p-1 rounded text-gray-300 hover:text-primary hover:bg-primary/5 transition-all"
            title="Edit next race"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        {editing && (
          <button onClick={() => setEditing(false)} className="ml-auto p-1 rounded text-gray-300 hover:text-gray-700 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className={labelCls}>Race Name</label>
              <input value={form.name ?? ""} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Australian Grand Prix" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Circuit</label>
              <input value={form.circuit ?? ""} onChange={e => setForm({ ...form, circuit: e.target.value })} className={inputCls} placeholder="e.g. Albert Park Circuit" />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input value={form.location ?? ""} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} placeholder="Melbourne" />
            </div>
            <div>
              <label className={labelCls}>Flag Emoji</label>
              <input value={form.flagEmoji ?? ""} onChange={e => setForm({ ...form, flagEmoji: e.target.value })} className={inputCls} placeholder="🇦🇺" />
            </div>
            <div>
              <label className={labelCls}>Race Date</label>
              <input type="date" value={form.raceDate?.slice(0, 10) ?? ""} onChange={e => setForm({ ...form, raceDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Qualifying Date</label>
              <input type="date" value={form.qualifyingDate?.slice(0, 10) ?? ""} onChange={e => setForm({ ...form, qualifyingDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status ?? "upcoming"} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hasSprint ?? false} onChange={e => setForm({ ...form, hasSprint: e.target.checked })} className="w-3.5 h-3.5 accent-primary" />
                <span className="font-racing text-[9px] text-gray-500 tracking-widest uppercase">Sprint Weekend</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              data-testid="button-save-next-race"
              onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-racing text-xs font-bold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-200 font-racing text-xs text-gray-400 rounded-lg hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      ) : (
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
      )}
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

const F1_GRADIENTS = [
  "linear-gradient(135deg, #0d0005 0%, #1a0008 40%, #3d0015 70%, #2d0010 100%)",
  "linear-gradient(135deg, #0a0010 0%, #1a0030 40%, #0d0050 70%, #050020 100%)",
  "linear-gradient(135deg, #0d0500 0%, #1a1000 40%, #3d2500 70%, #2d1800 100%)",
];

function ArticlePlaceholder({ id, className = "" }: { id: any; className?: string }) {
  const idx = typeof id === "number" ? id : (parseInt(String(id).replace(/\D/g, "")) || 0);
  const gradient = F1_GRADIENTS[idx % F1_GRADIENTS.length];
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`} style={{ background: gradient }}>
      <div className="text-center select-none opacity-20">
        <div className="font-racing text-white text-4xl font-black tracking-tighter mb-1">F1</div>
        <div className="font-racing text-white text-[10px] tracking-widest uppercase">Paddock</div>
      </div>
    </div>
  );
}

function HeroArticle({ article }: { article: any }) {
  const category = article.isForum ? "FORUM" : getCategoryFromTags(article.tags);
  const readTime = estimateReadTime(article.content);
  const href = article.isForum ? `/forum` : `/articles/${article.slug || article.id}`;
  const [imgFailed, setImgFailed] = useState(false);
  const hasImg = !!article.imageUrl && !imgFailed;
  return (
    <Link href={href}>
      <div
        data-testid={`hero-article-${article.id}`}
        className="relative rounded-2xl overflow-hidden cursor-pointer group min-h-[300px] md:min-h-[360px] flex flex-col justify-end"
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
  const category = article.isForum ? "FORUM" : getCategoryFromTags(article.tags);
  const readTime = estimateReadTime(article.content);
  const href = article.isForum ? `/forum` : `/articles/${article.slug || article.id}`;
  const [imgFailed, setImgFailed] = useState(false);
  const hasImg = !!article.imageUrl && !imgFailed;
  return (
    <Link href={href}>
      <div
        data-testid={`card-article-${article.id}`}
        className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group h-full flex flex-col"
      >
        <div className="relative h-36 overflow-hidden flex-shrink-0">
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
          <span className="absolute bottom-2 left-3 font-racing text-[9px] font-bold tracking-[0.15em] uppercase bg-primary text-white px-2 py-0.5 rounded">
            {category}
          </span>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-racing text-sm font-black text-gray-900 leading-tight line-clamp-3 mb-2 flex-1 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 mb-3">{article.excerpt}</p>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 border-t border-gray-100 pt-2 mt-auto">
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

const SLIDE_INTERVAL = 6000;
const F1_SLIDE_GRADIENTS = [
  "from-gray-950 via-gray-900 to-red-950",
  "from-slate-950 via-slate-900 to-slate-800",
  "from-zinc-950 via-zinc-900 to-rose-950",
  "from-neutral-950 via-neutral-900 to-red-900",
  "from-stone-950 via-stone-900 to-slate-800",
];

function DashboardSlider({ articles }: { articles: any[] }) {
  const slides = articles.slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (isHovered || slides.length < 2) return;
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHovered, next, slides.length]);

  const [failedImgs, setFailedImgs] = useState<Record<string, boolean>>({});

  if (slides.length === 0) return null;

  const slide = slides[current];
  const category = getCategoryFromTags(slide.tags);
  const href = `/articles/${slide.slug || slide.id}`;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ minHeight: 340 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides background */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {s.imageUrl && !failedImgs[s.id] ? (
            <>
              <img
                src={s.imageUrl}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setFailedImgs(f => ({ ...f, [s.id]: true }))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${F1_SLIDE_GRADIENTS[i % F1_SLIDE_GRADIENTS.length]}`}>
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "20px 20px" }} />
            </div>
          )}
        </div>
      ))}

      {/* Left red accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary z-20" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-end h-full" style={{ minHeight: 340 }}>
        <Link href={href}>
          <div className="px-6 pb-16 pt-10 cursor-pointer group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-primary flex items-center justify-center flex-shrink-0">
                <span className="font-racing text-white text-[8px] font-black">F1</span>
              </div>
              <span className="font-racing text-[11px] tracking-[0.3em] uppercase font-bold text-white/70">
                {category}
              </span>
            </div>
            <h2
              key={current}
              className="mcl-heading text-3xl sm:text-4xl text-white mb-3 max-w-lg group-hover:text-primary/90 transition-colors"
              style={{ animation: "dashSlideUp 0.4s ease forwards" }}
            >
              {slide.title}
              <span className="inline-block ml-2 text-primary align-middle text-xl">↗</span>
            </h2>
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2 max-w-lg mb-1">
              {slide.excerpt}
            </p>
            <div className="flex items-center gap-4 text-white/60 text-[11px] mt-2">
              <span className="font-racing">{slide.username || "F1 Paddock"}</span>
              <span>{slide.publishedAt ? format(new Date(slide.publishedAt), "d MMM yyyy") : ""}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{estimateReadTime(slide.content)} min read</span>
            </div>
          </div>
        </Link>

        {/* McLaren-style bottom nav bar */}
        {slides.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/60 backdrop-blur-sm border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-stretch">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    data-testid={`button-dash-slide-${i}`}
                    className="relative w-14 py-3 flex items-center justify-center transition-all"
                    style={{ background: i === current ? "rgba(196,18,48,0.15)" : "transparent" }}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[3px] transition-all ${i === current ? "bg-primary" : "bg-transparent"}`} />
                    <span className="font-racing text-sm font-black tracking-wider"
                      style={{ color: i === current ? "#C41230" : "rgba(255,255,255,0.35)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex">
                <button onClick={prev} data-testid="button-dash-prev"
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-primary transition-all text-white border-l border-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} data-testid="button-dash-next"
                  className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-red-600 transition-all text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dashSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
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
  const { data: forumPosts } = useQuery<any[]>({ queryKey: ["/api/forum/posts"] });
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

  const normalizedForum = (forumPosts || []).map((p: any) => ({
    id: `forum-${p.id}`,
    forumId: p.id,
    title: p.title,
    content: p.content,
    excerpt: p.content?.slice(0, 200) || "",
    imageUrl: null,
    tags: ["Forum"],
    publishedAt: p.createdAt,
    username: p.username,
    commentCount: p.commentCount,
    isForum: true,
  }));

  const paddockArticles = (articles || [])
    .filter((a: any) => a.section === "paddock")
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const regularArticles = (articles || [])
    .filter((a: any) => a.section !== "paddock")
    .sort((a: any, b: any) => {
      const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const newsArticles = [
    ...regularArticles,
    ...normalizedForum.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
  ];

  const heroArticle = paddockArticles[0] || null;
  const gridArticles = newsArticles;

  return (
    <div className="space-y-0">
      {/* Cinematic video banner */}
      <VideoBanner />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="mcl-label text-primary">2026 Season</span>
          </div>
          <h1 className="mcl-heading text-3xl text-gray-900 mt-0.5">F1 Paddock</h1>
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
            <Skeleton className="h-[340px] w-full rounded-2xl" />
          ) : paddockArticles.length > 0 ? (
            <DashboardSlider articles={paddockArticles} />
          ) : (
            <div className="relative rounded-2xl overflow-hidden flex items-center justify-center min-h-[220px]" style={{ background: "linear-gradient(135deg, #0d0005 0%, #1a0008 40%, #3d0015 70%, #2d0010 100%)" }}>
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="text-center px-6 py-10 opacity-50">
                <div className="font-racing text-white text-4xl font-black tracking-tighter mb-2">F1</div>
                <p className="font-racing text-white/60 text-xs tracking-widest uppercase">Set an article to "F1 Paddock" in Admin to feature it here</p>
              </div>
            </div>
          )}

          {/* Mobile-only: poll + next race pinned above articles */}
          <div className="lg:hidden grid grid-cols-2 gap-3">
            {races && <NextRaceWidget races={races} profile={profile} />}
            <PollsWidget />
          </div>

          {/* General News section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <div>
                  <h2 className="mcl-heading text-lg text-gray-900">General News</h2>
                  <p className="mcl-label text-gray-500 mt-0.5">Latest from the paddock</p>
                </div>
              </div>
              <Link href="/articles">
                <span className="font-racing text-[10px] text-primary hover:text-red-700 tracking-wide flex items-center gap-1 transition-colors">
                  All Articles <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

            {articlesLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-56 flex-shrink-0 rounded-xl" />)}
              </div>
            ) : gridArticles.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 hide-scrollbar">
                {gridArticles.map(article => (
                  <div key={article.id} className="flex-shrink-0 w-64 sm:w-72">
                    <ArticleCard article={article} />
                  </div>
                ))}
                <div className="flex-shrink-0 w-4" />
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
                <p className="font-racing text-xs text-gray-500 tracking-widest uppercase">No articles yet</p>
              </div>
            )}

            <Link href="/articles">
              <button
                data-testid="button-view-all-articles"
                className="w-full mt-4 py-3 border border-gray-200 rounded-xl font-racing text-xs text-gray-500 hover:text-gray-900 hover:border-primary/30 transition-all flex items-center justify-center gap-2 bg-white"
              >
                View All Articles <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Right: sidebar — desktop only for poll + next race */}
        <div className="space-y-4">
          <div className="hidden lg:flex lg:flex-col lg:gap-4">
            {races && <NextRaceWidget races={races} profile={profile} />}
            <PollsWidget />
          </div>
          <MiniStandings
            drivers={driverStandings || []}
            constructors={constructorStandings || []}
          />
        </div>
      </div>

      {/* Gina Voss Visual Novel — full-width at bottom of homepage */}
      <div className="mt-10 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-7 bg-primary rounded-full" />
          <div>
            <h2 className="mcl-heading text-xl text-gray-900">Gina's Story</h2>
            <p className="mcl-label text-gray-500 mt-0.5">Interactive visual novel · Follow Gina Voss on the F1 grid</p>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <GinaVossGame embedded />
        </div>
      </div>
    </div>
  );
}
