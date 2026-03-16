import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { DriverStanding, ConstructorStanding } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users } from "lucide-react";

export default function StandingsPage() {
  const [location] = useLocation();
  const defaultTab = location.includes("constructors") ? "constructors" : "drivers";
  const [tab, setTab] = useState<"drivers" | "constructors">(defaultTab);

  const { data: drivers, isLoading: driversLoading } = useQuery<DriverStanding[]>({
    queryKey: ["/api/standings/drivers"],
  });

  const { data: constructors, isLoading: constructorsLoading } = useQuery<ConstructorStanding[]>({
    queryKey: ["/api/standings/constructors"],
  });

  const leader = tab === "drivers" ? drivers?.[0]?.points ?? 0 : constructors?.[0]?.points ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">2026 Season</span>
        </div>
        <h1 className="font-racing text-3xl font-black text-foreground tracking-tight">Championship Standings</h1>
        <p className="text-muted-foreground text-sm mt-1">After Round 1 — Australian Grand Prix</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-card border border-border rounded-xl p-1 w-fit gap-1">
        <button
          data-testid="tab-drivers"
          onClick={() => setTab("drivers")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-racing text-sm font-bold transition-all ${
            tab === "drivers" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Drivers
        </button>
        <button
          data-testid="tab-constructors"
          onClick={() => setTab("constructors")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-racing text-sm font-bold transition-all ${
            tab === "constructors" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Constructors
        </button>
      </div>

      {/* Table */}
      {tab === "drivers" ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          {/* Table header */}
          <div className="grid grid-cols-[40px_minmax(130px,1fr)_minmax(120px,160px)_60px_50px_50px] gap-2 px-4 py-2.5 border-b border-border bg-background/40 min-w-[480px]">
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase">#</span>
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase">Driver</span>
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase">Team</span>
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase text-right">Pts</span>
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase text-center">W</span>
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase text-center">Pd</span>
          </div>

          {driversLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {drivers?.map((d) => {
                const gap = leader - d.points;
                return (
                  <div
                    key={d.id}
                    data-testid={`row-driver-${d.id}`}
                    className={`grid grid-cols-[40px_minmax(130px,1fr)_minmax(120px,160px)_60px_50px_50px] gap-2 items-center px-4 py-3.5 hover:bg-white/[0.02] transition-colors min-w-[480px] ${
                      d.position <= 3 ? "bg-white/[0.015]" : ""
                    }`}
                  >
                    {/* Position */}
                    <div className="flex items-center justify-center">
                      {d.position === 1 && (
                        <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center">
                          <span className="font-racing text-xs font-black text-yellow-400">1</span>
                        </div>
                      )}
                      {d.position === 2 && (
                        <div className="w-7 h-7 rounded-full bg-slate-400/20 flex items-center justify-center">
                          <span className="font-racing text-xs font-black text-slate-400">2</span>
                        </div>
                      )}
                      {d.position === 3 && (
                        <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <span className="font-racing text-xs font-black text-orange-500">3</span>
                        </div>
                      )}
                      {d.position > 3 && (
                        <span className="font-racing text-xs text-muted-foreground font-bold">{d.position}</span>
                      )}
                    </div>

                    {/* Driver */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-0.5 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: d.teamColor }} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{d.flagEmoji}</span>
                          <span className="font-racing text-sm font-black text-foreground">{d.driverCode}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{d.driverName}</p>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="min-w-0">
                      <p className="font-racing text-[11px] font-bold truncate" style={{ color: d.teamColor }}>
                        {d.teamName}
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="font-racing text-sm font-black text-foreground tabular-nums">{d.points}</p>
                      {gap > 0 && <p className="font-racing text-[9px] text-muted-foreground">-{gap}</p>}
                    </div>

                    {/* Wins */}
                    <div className="text-center">
                      <span className={`font-racing text-sm font-bold ${d.wins > 0 ? "text-yellow-400" : "text-muted-foreground/40"}`}>
                        {d.wins}
                      </span>
                    </div>

                    {/* Podiums */}
                    <div className="text-center">
                      <span className={`font-racing text-sm font-bold ${d.podiums > 0 ? "text-orange-400" : "text-muted-foreground/40"}`}>
                        {d.podiums}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_80px_60px] gap-2 px-4 py-2.5 border-b border-border bg-background/40 min-w-[360px]">
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase">#</span>
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase">Constructor</span>
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase text-center">Wins</span>
            <span className="font-racing text-[10px] text-muted-foreground tracking-widest uppercase text-right">Pts</span>
          </div>

          {constructorsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded" />)}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {constructors?.map((c) => {
                const gap = leader - c.points;
                const barWidth = leader > 0 ? (c.points / leader) * 100 : 0;
                return (
                  <div
                    key={c.id}
                    data-testid={`row-constructor-${c.id}`}
                    className={`grid grid-cols-[40px_1fr_80px_60px] gap-2 items-center px-4 py-3.5 hover:bg-white/[0.02] transition-colors min-w-[360px] ${
                      c.position <= 3 ? "bg-white/[0.015]" : ""
                    }`}
                  >
                    {/* Position */}
                    <div className="flex items-center justify-center">
                      {c.position === 1 && (
                        <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center">
                          <span className="font-racing text-xs font-black text-yellow-400">1</span>
                        </div>
                      )}
                      {c.position === 2 && (
                        <div className="w-7 h-7 rounded-full bg-slate-400/20 flex items-center justify-center">
                          <span className="font-racing text-xs font-black text-slate-400">2</span>
                        </div>
                      )}
                      {c.position === 3 && (
                        <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <span className="font-racing text-xs font-black text-orange-500">3</span>
                        </div>
                      )}
                      {c.position > 3 && (
                        <span className="font-racing text-xs text-muted-foreground font-bold">{c.position}</span>
                      )}
                    </div>

                    {/* Team */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.teamColor }} />
                        <p className="font-racing text-sm font-black text-foreground truncate">{c.teamName}</p>
                      </div>
                      {/* Points bar */}
                      <div className="h-1 bg-border rounded-full overflow-hidden max-w-[140px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${barWidth}%`, backgroundColor: c.teamColor }}
                        />
                      </div>
                    </div>

                    {/* Wins */}
                    <div className="text-center">
                      <span className={`font-racing text-sm font-bold ${c.wins > 0 ? "text-yellow-400" : "text-muted-foreground/40"}`}>
                        {c.wins}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="font-racing text-sm font-black text-foreground tabular-nums">{c.points}</p>
                      {gap > 0 && <p className="font-racing text-[9px] text-muted-foreground">-{gap}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
