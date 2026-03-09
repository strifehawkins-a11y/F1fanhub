import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { format, parseISO } from "date-fns";
import { MessageSquare, Plus, ChevronRight, ArrowLeft, Send, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Race } from "@shared/schema";

function RaceList({ onSelectRace }: { onSelectRace: (id: number) => void }) {
  const [season, setSeason] = useState<2025 | 2026>(2025);
  const { data: races } = useQuery<Race[]>({
    queryKey: ["/api/races", season],
    queryFn: () => fetch(`/api/races?season=${season}`).then(r => r.json()),
  });

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <p className="font-racing text-xs text-muted-foreground tracking-widest uppercase">Discuss</p>
        <h1 className="font-racing text-3xl font-black text-foreground mt-1">Race Forum</h1>
      </div>

      {/* Season Switcher */}
      <div className="flex gap-2">
        {([2025, 2026] as const).map((yr) => (
          <button
            key={yr}
            data-testid={`button-season-${yr}`}
            onClick={() => setSeason(yr)}
            className={`flex-1 py-2 rounded-lg font-racing text-sm font-bold tracking-widest transition-colors
              ${season === yr
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
              }`}
          >
            {yr} Season
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">Select a Grand Prix to join the discussion.</p>
      <div className="space-y-2">
        {races?.map((race) => (
          <button
            key={race.id}
            data-testid={`button-race-forum-${race.id}`}
            className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-card-border hover-elevate text-left"
            onClick={() => onSelectRace(race.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{race.flagEmoji || "🏁"}</span>
              <div>
                <p className="font-racing text-sm font-bold text-foreground leading-tight">{race.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {format(parseISO(race.raceDate), "MMM d, yyyy")}
                  {race.hasSprint && <span className="ml-2 text-yellow-500">Sprint</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={race.status === "completed" ? "secondary" : "outline"}
                className={`text-[9px] font-racing ${race.status === "upcoming" ? "border-primary text-primary" : ""}`}>
                {race.status}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PostDetail({ postId, raceId, onBack }: { postId: number; raceId: number; onBack: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: comments, isLoading } = useQuery<any[]>({
    queryKey: ["/api/forum/posts", postId, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/forum/posts/${postId}/comments`);
      return res.json();
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/forum/posts/${postId}/comments`, { content: comment }),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/race", raceId] });
    },
    onError: () => toast({ title: "Error", description: "Failed to post comment", variant: "destructive" }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/forum/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", postId, "comments"] }),
  });

  return (
    <div className="px-4 py-5 space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground" data-testid="button-back">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-racing">Back</span>
      </button>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : comments?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-racing">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments?.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={c.profileImageUrl || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-racing font-bold">
                  {(c.username || "P").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-racing text-xs font-bold text-foreground">{c.username || "Pilot"}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {c.createdAt ? format(new Date(c.createdAt), "MMM d") : ""}
                  </span>
                  {c.userId === (user as any)?.id && (
                    <button
                      onClick={() => deleteCommentMutation.mutate(c.id)}
                      className="ml-auto text-muted-foreground"
                      data-testid={`button-delete-comment-${c.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Add your thoughts..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="text-sm resize-none min-h-[72px]"
          data-testid="input-comment"
        />
        <Button
          size="icon"
          onClick={() => comment.trim() && commentMutation.mutate()}
          disabled={!comment.trim() || commentMutation.isPending}
          data-testid="button-submit-comment"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function RaceForum({ raceId, onBack }: { raceId: number; onBack: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  const { data: race } = useQuery<Race>({
    queryKey: ["/api/races", raceId],
    queryFn: async () => {
      const res = await fetch(`/api/races/${raceId}`);
      return res.json();
    },
  });

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/forum/race", raceId],
    queryFn: async () => {
      const res = await fetch(`/api/forum/race/${raceId}`);
      return res.json();
    },
  });

  const createPostMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/forum/posts", { raceId, title: newTitle, content: newContent }),
    onSuccess: () => {
      setNewTitle("");
      setNewContent("");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/forum/race", raceId] });
      toast({ title: "Post created!" });
    },
    onError: () => toast({ title: "Error", description: "Failed to create post", variant: "destructive" }),
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/forum/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/forum/race", raceId] }),
  });

  if (selectedPost !== null) {
    return <PostDetail postId={selectedPost} raceId={raceId} onBack={() => setSelectedPost(null)} />;
  }

  return (
    <div className="px-4 py-5 space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground" data-testid="button-back-races">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-racing">All Races</span>
      </button>

      {race && (
        <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-card-border">
          <span className="text-3xl">{race.flagEmoji || "🏁"}</span>
          <div>
            <h2 className="font-racing text-base font-black text-foreground">{race.name}</h2>
            <p className="text-xs text-muted-foreground">{race.circuit}</p>
            <p className="text-xs text-muted-foreground">{format(parseISO(race.raceDate), "MMMM d, yyyy")}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="font-racing text-xs text-muted-foreground tracking-widest uppercase">
          {posts?.length || 0} Discussions
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-racing text-xs tracking-wide" data-testid="button-new-post">
              <Plus className="w-3 h-3 mr-1.5" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-racing text-foreground">New Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Post title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="font-racing text-sm"
                data-testid="input-post-title"
              />
              <Textarea
                placeholder="Share your thoughts..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[100px] text-sm resize-none"
                data-testid="input-post-content"
              />
              <Button
                className="w-full font-racing tracking-wide"
                onClick={() => createPostMutation.mutate()}
                disabled={!newTitle.trim() || !newContent.trim() || createPostMutation.isPending}
                data-testid="button-submit-post"
              >
                Post Discussion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-racing text-sm">No discussions yet.</p>
          <p className="text-xs mt-1">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts?.map((post) => (
            <Card
              key={post.id}
              data-testid={`card-post-${post.id}`}
              className="border-card-border p-4 cursor-pointer hover-elevate"
              onClick={() => setSelectedPost(post.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-racing text-sm font-bold text-foreground leading-tight line-clamp-2">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{post.content}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={post.profileImageUrl || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-[9px] font-racing">
                    {(post.username || "P").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-muted-foreground font-racing">{post.username || "Pilot"}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {post.createdAt ? format(new Date(post.createdAt), "MMM d") : ""}
                </span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{post.commentCount}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForumPage() {
  const [match, params] = useRoute("/forum/:raceId");
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(
    match && params?.raceId ? Number(params.raceId) : null
  );

  if (selectedRaceId !== null) {
    return <RaceForum raceId={selectedRaceId} onBack={() => setSelectedRaceId(null)} />;
  }

  return <RaceList onSelectRace={setSelectedRaceId} />;
}
