import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, CheckCircle2, Clock, Lock, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

function getOrCreateVisitorId(): string {
  const key = "f1_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function PollCard({ poll }: { poll: any }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const visitorId = (user as any)?.id || getOrCreateVisitorId();

  const { data: myVoteData } = useQuery<{ optionIndex: number | null }>({
    queryKey: ["/api/polls", poll.id, "my-vote", visitorId],
    queryFn: () =>
      fetch(`/api/polls/${poll.id}/my-vote`, {
        headers: { "x-visitor-id": visitorId },
      }).then((r) => r.json()),
  });

  const myVote = myVoteData?.optionIndex ?? null;
  const hasVoted = myVote !== null;
  const isClosed = !poll.isActive || (poll.closesAt && new Date(poll.closesAt) < new Date());

  const voteMutation = useMutation({
    mutationFn: (optionIndex: number) =>
      fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-visitor-id": visitorId },
        body: JSON.stringify({ optionIndex }),
      }).then((r) => {
        if (!r.ok) throw new Error("Already voted");
        return r.json();
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/polls"], (old: any[]) =>
        old?.map((p) => (p.id === poll.id ? updated : p))
      );
      queryClient.invalidateQueries({ queryKey: ["/api/polls", poll.id, "my-vote", visitorId] });
    },
  });

  const showResults = hasVoted || isClosed;

  return (
    <div
      data-testid={`card-poll-${poll.id}`}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-racing text-base font-black text-foreground leading-tight flex-1">
            {poll.question}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isClosed ? (
              <>
                {poll.winnersRewarded && (
                  <span className="flex items-center gap-1 font-racing text-[9px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <Zap className="w-2.5 h-2.5" /> Rewarded
                  </span>
                )}
                <span className="flex items-center gap-1 font-racing text-[9px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Lock className="w-2.5 h-2.5" /> Closed
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 font-racing text-[9px] text-primary bg-primary/10 px-2 py-1 rounded-full">
                  <Zap className="w-2.5 h-2.5" /> 500 pts to winners
                </span>
                <span className="flex items-center gap-1 font-racing text-[9px] text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                </span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {poll.options.map((option: string, i: number) => {
            const count = poll.votes?.[i] || 0;
            const pct = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;
            const isMyVote = myVote === i;
            const isWinner = showResults && poll.votes && count === Math.max(...poll.votes) && count > 0;

            return (
              <button
                key={i}
                data-testid={`button-poll-option-${poll.id}-${i}`}
                onClick={() => !hasVoted && !isClosed && voteMutation.mutate(i)}
                disabled={hasVoted || isClosed || voteMutation.isPending}
                className={`w-full text-left relative rounded-xl border transition-all overflow-hidden ${
                  showResults
                    ? isMyVote
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                    : "border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                } ${voteMutation.isPending ? "opacity-60" : ""}`}
              >
                {showResults && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all rounded-xl ${isWinner ? "bg-primary/15" : "bg-muted/50"}`}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isMyVote && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    <span className={`font-racing text-sm ${isMyVote ? "text-primary font-black" : "text-foreground"}`}>
                      {option}
                    </span>
                  </div>
                  {showResults && (
                    <span className={`font-racing text-xs flex-shrink-0 ${isWinner ? "text-primary font-black" : "text-muted-foreground"}`}>
                      {pct}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          <span className="font-racing">{poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}</span>
          {poll.closesAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {isClosed ? "Closed" : `Closes ${format(new Date(poll.closesAt), "d MMM")}`}
            </span>
          )}
          {!showResults && !isClosed && (
            <span className="italic">Click to vote</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PollsPage() {
  const { data: polls, isLoading } = useQuery<any[]>({ queryKey: ["/api/polls"] });

  const activePolls = polls?.filter((p) => p.isActive && (!p.closesAt || new Date(p.closesAt) > new Date())) || [];
  const closedPolls = polls?.filter((p) => !p.isActive || (p.closesAt && new Date(p.closesAt) <= new Date())) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">
            Fan Votes
          </span>
        </div>
        <h1 className="font-racing text-3xl font-black text-foreground tracking-tight">Polls</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : polls?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-racing text-sm">No polls yet.</p>
          <p className="text-xs mt-1">Check back soon for fan votes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activePolls.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-racing text-xs text-muted-foreground tracking-widest uppercase">Active</h2>
              {activePolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
          {closedPolls.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-racing text-xs text-muted-foreground tracking-widest uppercase">Past Polls</h2>
              {closedPolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
