import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isAfter, isBefore, differenceInDays } from "date-fns";
import { Flag, Clock, CheckCircle, ChevronRight, Timer, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Race } from "@shared/schema";
import { Link } from "wouter";

const TEAM_FLAGS: Record<string, string> = {
  "Bahrain": "🇧🇭", "Saudi Arabia": "🇸🇦", "Australia": "🇦🇺", "Japan": "🇯🇵",
  "China": "🇨🇳", "USA": "🇺🇸", "Italy": "🇮🇹", "Monaco": "🇲🇨",
  "Canada": "🇨🇦", "Spain": "🇪🇸", "Austria": "🇦🇹", "United Kingdom": "🇬🇧",
  "Hungary": "🇭🇺", "Belgium": "🇧🇪", "Netherlands": "🇳🇱", "Singapore": "🇸🇬",
  "Azerbaijan": "🇦🇿", "Mexico": "🇲🇽", "Brazil": "🇧🇷", "Las Vegas": "🇺🇸",
  "Qatar": "🇶🇦", "Abu Dhabi": "🇦🇪", "United States": "🇺🇸",
};

function getFlag(country: string, flagEmoji?: string | null): string {
  if (flagEmoji) return flagEmoji;
  for (const [key, flag] of Object.entries(TEAM_FLAGS)) {
    if (country.toLowerCase().includes(key.toLowerCase())) return flag;
  }
  return "🏁";
}

function RaceCard({ race }: { race: Race }) {
  const now = new Date();
  const raceDate = parseISO(race.raceDate);
  const isPast = isBefore(raceDate, now);
  const daysAway = differenceInDays(raceDate, now);
  const isNextRace = !isPast && daysAway <= 14;
  const isThisWeekend = !isPast && daysAway <= 4;
  const isLive = race.status === "live";

  let statusBadge = null;
  if (isLive) {
    statusBadge = (
      <span className="flex items-center gap-1 font-racing text-[9px] font-black tracking-widest uppercase bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />LIVE
      </span>
    );
  } else if (isPast) {
    statusBadge = (
      <span className="flex items-center gap-1 font-racing text-[9px] tracking-widest uppercase text-gray-400">
        <CheckCircle className="w-3 h-3" />COMPLETED
      </span>
    );
  } else if (isThisWeekend) {
    statusBadge = (
      <span className="flex items-center gap-1 font-racing text-[9px] font-black tracking-widest uppercase bg-primary text-white px-2 py-0.5 rounded-full">
        <Timer className="w-3 h-3" />THIS WEEKEND
      </span>
    );
  } else if (isNextRace) {
    statusBadge = (
      <span className="font-racing text-[9px] tracking-widest uppercase text-primary font-bold">
        {daysAway} days away
      </span>
    );
  }

  return (
    <Link href={`/forum/${race.id}`}>
      <div
        data-testid={`card-race-${race.id}`}
        className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden ${
          isPast
            ? "border-gray-100 bg-white opacity-60 hover:opacity-80"
            : isThisWeekend || isLive
            ? "border-primary/30 bg-primary/5 hover:border-primary/50 shadow-sm"
            : "border-gray-200 bg-white hover:border-primary/30 hover:shadow-sm"
        }`}
      >
        {(isThisWeekend || isLive) && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-xl" />
        )}
        <div className="p-4 flex items-center gap-4">
          {/* Round + flag */}
          <div className="flex-shrink-0 text-center">
            <div className="text-2xl">{getFlag(race.country, race.flagEmoji)}</div>
            <div className="font-racing text-[9px] text-gray-400 tracking-widest uppercase mt-0.5">R{race.round}</div>
          </div>

          {/* Race info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-racing text-sm font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                  {race.name}
                </p>
                <p className="font-racing text-[10px] text-gray-500 mt-0.5 tracking-wide">
                  {race.circuit} · {race.location}
                </p>
              </div>
              {statusBadge && <div className="flex-shrink-0">{statusBadge}</div>}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span className="font-racing text-[10px]">
                  {format(raceDate, "EEE d MMM yyyy")}
                </span>
              </div>
              {race.hasSprint && (
                <span className="font-racing text-[9px] bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full tracking-wide">
                  SPRINT
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

export default function CalendarPage() {
  const { data: races, isLoading } = useQuery<Race[]>({
    queryKey: ["/api/races"],
  });

  const now = new Date();
  const season2026 = (races || []).filter((r) => r.season === 2026).sort((a, b) => a.round - b.round);
  const pastRaces = season2026.filter((r) => isBefore(parseISO(r.raceDate), now));
  const upcomingRaces = season2026.filter((r) => isAfter(parseISO(r.raceDate), now) || r.status === "live");
  const nextRace = upcomingRaces[0];

  const completedCount = pastRaces.length;
  const totalRaces = season2026.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-racing text-[10px] text-primary tracking-widest uppercase">2026 Season</span>
        </div>
        <h1 className="font-racing text-3xl font-black text-gray-900 tracking-tight">Race Calendar</h1>
        <p className="font-racing text-xs text-gray-500 mt-1 tracking-wide">
          {completedCount} of {totalRaces} races completed
        </p>
      </div>

      {/* Season progress bar */}
      {totalRaces > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-racing text-[10px] text-gray-500 tracking-widest uppercase">Season Progress</span>
            <span className="font-racing text-[10px] font-bold text-gray-900">{Math.round((completedCount / totalRaces) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(completedCount / totalRaces) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-racing text-[9px] text-gray-400">Round 1</span>
            <span className="font-racing text-[9px] text-gray-400">Round {totalRaces}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : season2026.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-racing text-sm text-gray-500">No 2026 season data available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming */}
          {upcomingRaces.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-racing text-sm font-black text-gray-900 tracking-wide uppercase">Upcoming Races</h2>
                <span className="font-racing text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{upcomingRaces.length}</span>
              </div>
              <div className="space-y-2">
                {upcomingRaces.map((race) => <RaceCard key={race.id} race={race} />)}
              </div>
            </div>
          )}

          {/* Past */}
          {pastRaces.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gray-300 rounded-full" />
                <h2 className="font-racing text-sm font-black text-gray-500 tracking-wide uppercase">Completed</h2>
                <span className="font-racing text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{pastRaces.length}</span>
              </div>
              <div className="space-y-2">
                {[...pastRaces].reverse().map((race) => <RaceCard key={race.id} race={race} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA to forum */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 text-center">
        <Flag className="w-6 h-6 text-primary mx-auto mb-2" />
        <p className="font-racing text-sm font-black text-gray-900">Discuss the races in the Forum</p>
        <p className="font-racing text-[10px] text-gray-500 mt-1 mb-3">Share your predictions, reactions and analysis</p>
        <Link href="/forum">
          <button className="font-racing text-xs font-black bg-primary text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Open Forum
          </button>
        </Link>
      </div>
    </div>
  );
}
