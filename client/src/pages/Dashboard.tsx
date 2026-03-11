import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Flag, Trophy, MessageSquare, BookOpen, Zap, Heart, ChevronRight, Timer, Star } from "lucide-react";
import beaVossImage from "@assets/bea-voss.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Race, UserProfile } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

function getRaceCountdown(raceDate: string) {
  const now = new Date();
  const date = parseISO(raceDate);
  const days = differenceInDays(date, now);
  const hours = differenceInHours(date, now) % 24;
  const minutes = differenceInMinutes(date, now) % 60;
  if (days < 0) return null;
  if (days === 0) return `${hours}h ${minutes}m`;
  return `${days}d ${hours}h`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") return <Badge variant="secondary" className="text-[10px] font-racing">Completed</Badge>;
  if (status === "live") return <Badge className="text-[10px] font-racing bg-green-600">LIVE</Badge>;
  return <Badge variant="outline" className="text-[10px] font-racing text-primary border-primary">Upcoming</Badge>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const [calendarSeason, setCalendarSeason] = useState<2025 | 2026>(2025);

  const { data: races } = useQuery<Race[]>({
    queryKey: ["/api/races", calendarSeason],
    queryFn: () => fetch(`/api/races?season=${calendarSeason}`).then(r => r.json()),
  });

  const { data: articles } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const claimMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/profile/claim-daily"),
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: "5,000 Points Claimed!", description: "Come back tomorrow for more." });
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      } else {
        toast({ title: "Already Claimed", description: data.message, variant: "destructive" });
      }
    },
  });

  const upcomingRace = races?.find((r) => r.status === "upcoming");
  const nextRaces = races?.filter((r) => r.status === "upcoming").slice(0, 5) || [];
  const recentArticles = articles?.slice(0, 2) || [];

  const canClaim = !profile?.lastDailyClaimAt ||
    (new Date().getTime() - new Date(profile.lastDailyClaimAt).getTime()) >= 24 * 60 * 60 * 1000;

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-racing tracking-widest uppercase">Welcome back</p>
          <h2 className="font-racing text-2xl font-black text-foreground tracking-tight">
            {user?.firstName || "Pilot"}
          </h2>
        </div>
        <Avatar className="w-12 h-12 border-2 border-primary">
          <AvatarImage src={user?.profileImageUrl || ""} />
          <AvatarFallback className="bg-primary text-primary-foreground font-racing font-black text-lg">
            {(user?.firstName || "P").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Points & Daily Claim */}
      <Card className="relative overflow-hidden bg-card border-card-border p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-racing tracking-widest uppercase mb-1">Your Points</p>
            <p className="font-racing text-3xl font-black text-foreground">
              {profileLoading ? "—" : (profile?.totalPoints || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lifetime: {(profile?.lifetimePoints || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              size="sm"
              onClick={() => claimMutation.mutate()}
              disabled={!canClaim || claimMutation.isPending}
              className="font-racing text-xs tracking-wide"
              data-testid="button-claim-daily"
            >
              <Zap className="w-3 h-3 mr-1.5" />
              {canClaim ? "Claim 5,000" : "Claimed"}
            </Button>
            <p className="text-[10px] text-muted-foreground">Daily reward</p>
          </div>
        </div>
      </Card>

      {/* Bea's Story Teaser */}
      <Link href="/novel">
        <Card
          data-testid="card-novel-teaser"
          className="relative overflow-hidden border-card-border p-4 cursor-pointer hover-elevate"
          style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(0 60% 12%))" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-racing text-xs text-primary tracking-widest uppercase font-bold">Visual Novel</span>
              </div>
              <h3 className="font-racing text-lg font-black text-foreground leading-tight mb-1">
                Bea's Racing Dream
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Help rookie driver Bea Voss navigate the highs and lows of her debut F1 season.
              </p>
            </div>
            {/* Bea portrait */}
            <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-primary/30"
              style={{ background: "linear-gradient(180deg, hsl(0 60% 12%) 0%, hsl(220 10% 8%) 100%)" }}>
              <img
                src={beaVossImage}
                alt="Bea Voss"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] font-racing border-primary text-primary">
              5 Chapters
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Card>
      </Link>

      {/* Next Race Countdown */}
      {upcomingRace && (
        <div>
          <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase mb-3 flex items-center gap-2">
            <Flag className="w-3 h-3" />
            Next Race
          </h3>
          <Card className="border-card-border p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg" />
            <div className="pl-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-racing text-base font-black text-foreground leading-tight">
                    {upcomingRace.flagEmoji} {upcomingRace.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{upcomingRace.circuit}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(upcomingRace.raceDate), "MMM d, yyyy")}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-primary">
                    <Timer className="w-3 h-3" />
                    <span className="font-racing text-sm font-bold">
                      {getRaceCountdown(upcomingRace.raceDate) || "Now!"}
                    </span>
                  </div>
                  {upcomingRace.hasSprint && (
                    <Badge className="mt-1 text-[9px] font-racing bg-yellow-500 text-black">Sprint</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/quiz">
            <Card
              data-testid="card-quiz-action"
              className="border-card-border p-4 cursor-pointer hover-elevate"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <p className="font-racing text-sm font-bold text-foreground">Take Quiz</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Earn points</p>
            </Card>
          </Link>
          <Link href="/forum">
            <Card
              data-testid="card-forum-action"
              className="border-card-border p-4 cursor-pointer hover-elevate"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <p className="font-racing text-sm font-bold text-foreground">Race Forum</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Discuss GPs</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Race Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase flex items-center gap-2">
            <Flag className="w-3 h-3" /> Calendar
          </h3>
          <Link href="/forum">
            <button className="text-[11px] text-primary font-racing tracking-wide" data-testid="link-view-calendar">
              View All
            </button>
          </Link>
        </div>
        {/* Season Tabs */}
        <div className="flex gap-2 mb-3">
          {([2025, 2026] as const).map((yr) => (
            <button
              key={yr}
              data-testid={`button-calendar-season-${yr}`}
              onClick={() => setCalendarSeason(yr)}
              className={`flex-1 py-1.5 rounded-lg font-racing text-xs font-bold tracking-widest transition-colors
                ${calendarSeason === yr
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
                }`}
            >
              {yr}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {nextRaces.map((race) => (
            <Link key={race.id} href={`/forum/${race.id}`}>
              <div
                data-testid={`card-race-${race.id}`}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-card-border cursor-pointer hover-elevate"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{race.flagEmoji || "🏁"}</span>
                  <div>
                    <p className="font-racing text-sm font-bold text-foreground leading-tight">{race.name}</p>
                    <p className="text-[11px] text-muted-foreground">{format(parseISO(race.raceDate), "MMM d")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={race.status} />
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Articles */}
      {recentArticles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase flex items-center gap-2">
              <BookOpen className="w-3 h-3" /> Latest News
            </h3>
            <Link href="/articles">
              <button className="text-[11px] text-primary font-racing tracking-wide" data-testid="link-view-articles">
                All Articles
              </button>
            </Link>
          </div>
          <div className="space-y-2">
            {recentArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`}>
                <Card
                  data-testid={`card-article-${article.id}`}
                  className="border-card-border p-3 cursor-pointer hover-elevate"
                >
                  <p className="font-racing text-sm font-bold text-foreground leading-tight line-clamp-2 mb-1">
                    {article.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {article.tags?.slice(0, 2).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-[9px] font-racing">{tag}</Badge>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
