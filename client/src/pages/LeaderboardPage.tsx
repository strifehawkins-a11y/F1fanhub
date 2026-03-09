import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Star, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

interface LeaderboardEntry {
  userId: string;
  username: string | null;
  profileImageUrl: string | null;
  lifetimePoints: number;
  attempts: number;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="font-racing text-sm font-black text-muted-foreground w-5 text-center">{rank}</span>;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const currentUserRank = leaderboard?.findIndex((e) => e.userId === (user as any)?.id);

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <p className="font-racing text-xs text-muted-foreground tracking-widest uppercase">Rankings</p>
        <h1 className="font-racing text-3xl font-black text-foreground mt-1">Leaderboard</h1>
      </div>

      {/* Top 3 podium */}
      {!isLoading && leaderboard && leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {/* 2nd place */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <Avatar className="w-12 h-12 border-2 border-slate-400">
              <AvatarImage src={leaderboard[1]?.profileImageUrl || ""} />
              <AvatarFallback className="bg-slate-400 text-white text-sm font-racing font-black">
                {(leaderboard[1]?.username || "P").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-racing text-xs font-bold text-foreground truncate max-w-[70px]">
                {leaderboard[1]?.username || "Pilot"}
              </p>
              <p className="font-racing text-xs text-muted-foreground">
                {leaderboard[1]?.lifetimePoints.toLocaleString()}
              </p>
            </div>
            <div className="w-full h-12 bg-slate-400/20 border border-slate-400/40 rounded-t-lg flex items-center justify-center">
              <span className="font-racing text-2xl font-black text-slate-400">2</span>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <Crown className="w-5 h-5 text-yellow-500" />
            <Avatar className="w-14 h-14 border-2 border-yellow-500">
              <AvatarImage src={leaderboard[0]?.profileImageUrl || ""} />
              <AvatarFallback className="bg-yellow-500 text-black text-base font-racing font-black">
                {(leaderboard[0]?.username || "P").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-racing text-xs font-bold text-foreground truncate max-w-[70px]">
                {leaderboard[0]?.username || "Pilot"}
              </p>
              <p className="font-racing text-xs text-yellow-500 font-black">
                {leaderboard[0]?.lifetimePoints.toLocaleString()}
              </p>
            </div>
            <div className="w-full h-16 bg-yellow-500/20 border border-yellow-500/40 rounded-t-lg flex items-center justify-center">
              <span className="font-racing text-3xl font-black text-yellow-500">1</span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <Avatar className="w-12 h-12 border-2 border-amber-600">
              <AvatarImage src={leaderboard[2]?.profileImageUrl || ""} />
              <AvatarFallback className="bg-amber-600 text-white text-sm font-racing font-black">
                {(leaderboard[2]?.username || "P").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-racing text-xs font-bold text-foreground truncate max-w-[70px]">
                {leaderboard[2]?.username || "Pilot"}
              </p>
              <p className="font-racing text-xs text-muted-foreground">
                {leaderboard[2]?.lifetimePoints.toLocaleString()}
              </p>
            </div>
            <div className="w-full h-8 bg-amber-600/20 border border-amber-600/40 rounded-t-lg flex items-center justify-center">
              <span className="font-racing text-xl font-black text-amber-600">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Current user rank highlight */}
      {currentUserRank !== undefined && currentUserRank >= 0 && leaderboard && (
        <Card className="border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-racing text-xs font-black text-primary">#{currentUserRank + 1}</span>
            </div>
            <p className="font-racing text-xs text-primary font-bold flex-1">Your Position</p>
            <span className="font-racing text-sm font-black text-primary">
              {leaderboard[currentUserRank]?.lifetimePoints.toLocaleString()} pts
            </span>
          </div>
        </Card>
      )}

      {/* Full list */}
      <div>
        <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase mb-3">All Pilots</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : leaderboard?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-racing text-sm">No rankings yet.</p>
            <p className="text-xs mt-1">Take the quiz to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard?.map((entry, index) => {
              const isCurrentUser = entry.userId === (user as any)?.id;
              return (
                <div
                  key={entry.userId}
                  data-testid={`row-leaderboard-${index}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCurrentUser ? "bg-primary/5 border-primary/30" : "bg-card border-card-border"
                  }`}
                >
                  <div className="w-6 flex items-center justify-center flex-shrink-0">
                    <RankIcon rank={index + 1} />
                  </div>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={entry.profileImageUrl || ""} />
                    <AvatarFallback className={`text-xs font-racing font-black ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {(entry.username || "P").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`font-racing text-sm font-bold truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {entry.username || "Pilot"}
                      {isCurrentUser && <span className="text-[10px] font-normal ml-1">(you)</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{entry.attempts} quiz attempts</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-racing text-sm font-black ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {entry.lifetimePoints.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
