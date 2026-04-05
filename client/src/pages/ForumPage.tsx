import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { format } from "date-fns";
import {
  MessageSquare, Plus, ArrowLeft, Send, Trash2, ChevronRight,
  Pin, Clock, User, Eye, Flag, AlertCircle, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Race } from "@shared/schema";

/* ─── helpers ─── */
function relativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return format(d, "dd MMM yyyy");
}

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

/* ─── Breadcrumb ─── */
function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1 text-[11px] font-racing tracking-wide text-gray-400 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
          {item.onClick ? (
            <button onClick={item.onClick} className="hover:text-primary transition-colors">
              {item.label}
            </button>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ─── Thread View ─── */
function ThreadView({
  postId,
  raceId,
  raceName,
  postTitle,
  onBack,
  onBackToRace,
}: {
  postId: number;
  raceId: number | null;
  raceName: string;
  postTitle: string;
  onBack: () => void;
  onBackToRace: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: comments, isLoading } = useQuery<any[]>({
    queryKey: [`/api/forum/posts/${postId}/comments`],
  });

  const commentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/forum/posts/${postId}/comments`, { content: comment }),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}/comments`] });
      if (raceId === null) {
        queryClient.invalidateQueries({ queryKey: [`/api/forum/general`] });
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/forum/race/${raceId}`] });
      }
    },
    onError: () => toast({ title: "Failed to post reply", variant: "destructive" }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/forum/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${postId}/comments`] }),
  });

  return (
    <div>
      <Breadcrumb items={[
        { label: "Forum", onClick: onBackToRace },
        { label: raceName, onClick: onBack },
        { label: postTitle },
      ]} />

      {/* Thread header */}
      <div className="bg-white border border-gray-200 rounded-t-xl px-5 py-3 border-b-0">
        <h1 className="font-racing text-lg font-bold text-gray-900">{postTitle}</h1>
        <p className="text-[11px] text-gray-400 font-racing mt-0.5">{raceName}</p>
      </div>

      {/* Posts */}
      <div className="border border-gray-200 rounded-b-xl overflow-hidden divide-y divide-gray-100">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-0 animate-pulse">
                <div className="w-[140px] flex-shrink-0 bg-gray-50 p-4 border-r border-gray-100" />
                <div className="flex-1 p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !comments || comments.length === 0 ? (
          <div className="bg-white p-10 text-center">
            <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="font-racing text-sm text-gray-400">No replies yet. Be the first!</p>
          </div>
        ) : (
          comments.map((c, idx) => (
            <div key={c.id} className="flex bg-white" data-testid={`comment-${c.id}`}>
              {/* Author sidebar */}
              <div className="w-[140px] flex-shrink-0 bg-gray-50 border-r border-gray-100 p-4 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                  {c.profileImageUrl ? (
                    <img src={c.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-racing text-primary font-bold text-sm">
                      {(c.username || "P").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-racing text-[11px] font-bold text-gray-800 leading-tight break-all">
                    {c.username || "Pilot"}
                  </p>
                  <p className="font-racing text-[9px] text-gray-400 tracking-wide mt-0.5">
                    Post #{idx + 1}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-racing">
                    <Clock className="w-3 h-3" />
                    <span>{c.createdAt ? relativeTime(c.createdAt) : ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user && c.userId === (user as any)?.id && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(c.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        data-testid={`button-delete-comment-${c.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      className="text-gray-300 hover:text-primary transition-colors"
                      onClick={() => {
                        setComment(`@${c.username || "Pilot"}: `);
                        textareaRef.current?.focus();
                      }}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{c.content}</p>
              </div>
            </div>
          ))
        )}

        {/* Reply box */}
        {user ? (
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <p className="font-racing text-[10px] text-gray-400 tracking-widest uppercase mb-2">Post a Reply</p>
            <textarea
              ref={textareaRef}
              placeholder="Write your reply..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              data-testid="input-comment"
              className={inputCls + " resize-none"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && comment.trim()) {
                  commentMutation.mutate();
                }
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-gray-300">Ctrl+Enter to submit</p>
              <button
                onClick={() => comment.trim() && commentMutation.mutate()}
                disabled={!comment.trim() || commentMutation.isPending}
                data-testid="button-submit-comment"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-white font-racing text-xs font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {commentMutation.isPending ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Post Reply
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
            <p className="text-xs text-gray-400 font-racing">
              <a href="/login" className="text-primary hover:underline">Sign in</a> to reply to this thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Race Forum (Topic List) ─── */
function RaceForum({
  raceId,
  onBack,
  onSelectPost,
}: {
  raceId: number;
  onBack: () => void;
  onSelectPost: (postId: number, title: string) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const { data: race } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
  });

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: [`/api/forum/race/${raceId}`],
    staleTime: 0,
  });

  const createPostMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/forum/posts", { raceId, title: newTitle, content: newContent }),
    onSuccess: async () => {
      setNewTitle("");
      setNewContent("");
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: [`/api/forum/race/${raceId}`] });
      toast({ title: "Topic posted!" });
    },
    onError: () => toast({ title: "Failed to post topic", variant: "destructive" }),
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/forum/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/forum/race/${raceId}`] }),
  });

  return (
    <div>
      <Breadcrumb items={[
        { label: "Forum", onClick: onBack },
        { label: race?.name || "Loading..." },
      ]} />

      {/* Race header */}
      {race && (
        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4">
          <span className="text-4xl">{race.flagEmoji || "🏁"}</span>
          <div className="flex-1">
            <h1 className="font-racing text-xl font-black text-gray-900">{race.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{race.circuit} · {race.location}, {race.country}</p>
            <p className="text-xs text-gray-400">
              Race: {format(new Date(race.raceDate), "MMMM d, yyyy")}
              {race.hasSprint && <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-racing text-[9px] font-bold">Sprint Weekend</span>}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded-full font-racing text-[10px] font-bold ${
              race.status === "completed" ? "bg-gray-100 text-gray-500" :
              race.status === "live" ? "bg-green-100 text-green-600" :
              "bg-primary/10 text-primary"
            }`}>
              {race.status === "completed" ? "Completed" : race.status === "live" ? "Live" : "Upcoming"}
            </span>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-racing text-[10px] text-gray-400 tracking-widest uppercase">
          {posts?.length || 0} topic{posts?.length !== 1 ? "s" : ""}
        </span>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            data-testid="button-new-post"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-racing text-xs font-bold hover:bg-red-700 transition-all shadow-sm shadow-primary/20"
          >
            <Plus className="w-3.5 h-3.5" />
            New Topic
          </button>
        )}
        {!user && (
          <a href="/login" className="font-racing text-[11px] text-primary hover:underline">
            Sign in to post
          </a>
        )}
      </div>

      {/* New topic form */}
      {showForm && (
        <div className="bg-white border border-primary/20 rounded-xl p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-racing text-sm font-bold text-gray-900">New Topic</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Topic title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              data-testid="input-post-title"
              className={inputCls}
              maxLength={120}
            />
            <textarea
              placeholder="Share your thoughts on this race..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              data-testid="input-post-content"
              className={inputCls + " resize-none"}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); setNewTitle(""); setNewContent(""); }}
                className="px-4 py-2 rounded-lg border border-gray-200 font-racing text-xs text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => createPostMutation.mutate()}
                disabled={!newTitle.trim() || !newContent.trim() || createPostMutation.isPending}
                data-testid="button-submit-post"
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white font-racing text-xs font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {createPostMutation.isPending ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Post Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_100px_130px] bg-gray-50 border-b border-gray-200 px-4 py-2">
          <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase">Topic</span>
          <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase text-center">Replies</span>
          <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase text-right">Last Post</span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-4 py-4 flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-racing text-sm text-gray-400">No topics yet.</p>
            <p className="text-xs text-gray-300 mt-1">Start the conversation about this race!</p>
            {user && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-5 py-2 rounded-lg bg-primary text-white font-racing text-xs font-bold hover:bg-red-700 transition-all"
              >
                Post First Topic
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div
                key={post.id}
                className="sm:grid sm:grid-cols-[1fr_100px_130px] items-center hover:bg-gray-50/70 transition-colors group"
                data-testid={`card-post-${post.id}`}
              >
                {/* Topic info */}
                <button
                  className="w-full text-left px-4 py-3.5 flex items-start gap-3"
                  onClick={() => onSelectPost(post.id, post.title)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-racing text-primary text-[11px] font-bold">
                      {(post.username || "P").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-racing text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <User className="w-3 h-3 text-gray-300" />
                      <span className="font-racing text-[10px] text-gray-400">{post.username || "Pilot"}</span>
                      <span className="text-gray-200">·</span>
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span className="font-racing text-[10px] text-gray-400">
                        {post.createdAt ? relativeTime(post.createdAt) : ""}
                      </span>
                      <span className="sm:hidden text-gray-200">·</span>
                      <span className="sm:hidden font-racing text-[10px] text-gray-400">
                        {post.commentCount} {post.commentCount === 1 ? "reply" : "replies"}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Replies */}
                <div className="hidden sm:flex items-center justify-center px-2 py-3.5">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-300" />
                    <span className="font-racing text-sm font-bold text-gray-700">{post.commentCount}</span>
                  </div>
                </div>

                {/* Last post */}
                <div className="hidden sm:block px-4 py-3.5 text-right">
                  <p className="font-racing text-[10px] text-gray-400 leading-tight">
                    {post.createdAt ? relativeTime(post.createdAt) : ""}
                  </p>
                  <p className="font-racing text-[10px] text-gray-500 font-bold mt-0.5">
                    {post.username || "Pilot"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── General Forum (Topic List for non-race discussions) ─── */
function GeneralForum({
  onBack,
  onSelectPost,
}: {
  onBack: () => void;
  onSelectPost: (postId: number, title: string) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: [`/api/forum/general`],
    staleTime: 0,
  });

  const createPostMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/forum/posts", { raceId: null, title: newTitle, content: newContent }),
    onSuccess: async () => {
      setNewTitle("");
      setNewContent("");
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: [`/api/forum/general`] });
      toast({ title: "Topic posted!" });
    },
    onError: () => toast({ title: "Failed to post topic", variant: "destructive" }),
  });

  return (
    <div>
      <Breadcrumb items={[
        { label: "Forum", onClick: onBack },
        { label: "General Discussion" },
      ]} />

      {/* Board header */}
      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="font-racing text-xl font-black text-gray-900">General Discussion</h1>
          <p className="text-xs text-gray-400 mt-0.5">F1 news, predictions, regulations, fantasy league, and everything else</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-racing text-[10px] text-gray-400 tracking-widest uppercase">
          {posts?.length || 0} topic{posts?.length !== 1 ? "s" : ""}
        </span>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            data-testid="button-new-general-post"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-racing text-xs font-bold hover:bg-red-700 transition-all shadow-sm shadow-primary/20"
          >
            <Plus className="w-3.5 h-3.5" />
            New Topic
          </button>
        )}
        {!user && (
          <a href="/login" className="font-racing text-[11px] text-primary hover:underline">
            Sign in to post
          </a>
        )}
      </div>

      {/* New topic form */}
      {showForm && (
        <div className="bg-white border border-primary/20 rounded-xl p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-racing text-sm font-bold text-gray-900">New Topic</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">✕</button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Topic title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              data-testid="input-general-post-title"
              className={inputCls}
              maxLength={120}
            />
            <textarea
              placeholder="Share your thoughts..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              data-testid="input-general-post-content"
              className={inputCls + " resize-none"}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); setNewTitle(""); setNewContent(""); }}
                className="px-4 py-2 rounded-lg border border-gray-200 font-racing text-xs text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => createPostMutation.mutate()}
                disabled={!newTitle.trim() || !newContent.trim() || createPostMutation.isPending}
                data-testid="button-submit-general-post"
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white font-racing text-xs font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {createPostMutation.isPending ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Post Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_100px_130px] bg-gray-50 border-b border-gray-200 px-4 py-2">
          <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase">Topic</span>
          <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase text-center">Replies</span>
          <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase text-right">Last Post</span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-4 flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-racing text-sm text-gray-400">No topics yet.</p>
            {user && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-5 py-2 rounded-lg bg-primary text-white font-racing text-xs font-bold hover:bg-red-700 transition-all"
              >
                Start Discussion
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div
                key={post.id}
                className="sm:grid sm:grid-cols-[1fr_100px_130px] items-center hover:bg-gray-50/70 transition-colors group"
                data-testid={`card-general-post-${post.id}`}
              >
                <button
                  className="w-full text-left px-4 py-3.5 flex items-start gap-3"
                  onClick={() => onSelectPost(post.id, post.title)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-racing text-primary text-[11px] font-bold">
                      {(post.username || "P").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-racing text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <User className="w-3 h-3 text-gray-300" />
                      <span className="font-racing text-[10px] text-gray-400">{post.username || "F1 Fan Hub"}</span>
                      <span className="text-gray-200">·</span>
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span className="font-racing text-[10px] text-gray-400">
                        {post.createdAt ? relativeTime(post.createdAt) : ""}
                      </span>
                      <span className="sm:hidden text-gray-200">·</span>
                      <span className="sm:hidden font-racing text-[10px] text-gray-400">
                        {post.commentCount} {post.commentCount === 1 ? "reply" : "replies"}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="hidden sm:flex items-center justify-center px-2 py-3.5">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-300" />
                    <span className="font-racing text-sm font-bold text-gray-700">{post.commentCount}</span>
                  </div>
                </div>

                <div className="hidden sm:block px-4 py-3.5 text-right">
                  <p className="font-racing text-[10px] text-gray-400 leading-tight">
                    {post.createdAt ? relativeTime(post.createdAt) : ""}
                  </p>
                  <p className="font-racing text-[10px] text-gray-500 font-bold mt-0.5">
                    {post.username || "F1 Fan Hub"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Forum Index (Race / Board List) ─── */
function ForumIndex({
  onSelectRace,
  onSelectGeneral,
}: {
  onSelectRace: (id: number) => void;
  onSelectGeneral: () => void;
}) {
  const { data: races } = useQuery<Race[]>({
    queryKey: [`/api/races`],
  });
  const { data: generalPosts } = useQuery<any[]>({
    queryKey: [`/api/forum/general`],
  });

  const completed = races?.filter((r) => r.status === "completed") || [];
  const upcoming = races?.filter((r) => r.status !== "completed") || [];

  function RaceSection({ title, items }: { title: string; items: Race[] }) {
    return (
      <div className="mb-6">
        {/* Section header */}
        <div className="bg-primary px-4 py-2 rounded-t-xl">
          <h2 className="font-racing text-xs font-bold text-white tracking-widest uppercase">{title}</h2>
        </div>

        {/* Table header */}
        <div className="bg-white border-x border-gray-200">
          <div className="hidden sm:grid grid-cols-[1fr_80px_80px_140px] bg-gray-50 border-b border-gray-200 px-4 py-2">
            <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase">Race</span>
            <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase text-center">Topics</span>
            <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase text-center">Replies</span>
            <span className="font-racing text-[9px] text-gray-400 tracking-widest uppercase text-right">Status</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden divide-y divide-gray-100">
          {items.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-gray-300 font-racing">None yet</div>
          )}
          {items.map((race) => (
            <button
              key={race.id}
              data-testid={`button-race-forum-${race.id}`}
              className="w-full text-left hover:bg-gray-50/80 transition-colors group"
              onClick={() => onSelectRace(race.id)}
            >
              <div className="sm:grid sm:grid-cols-[1fr_80px_80px_140px] items-center px-4 py-3.5">
                {/* Race info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center text-2xl flex-shrink-0">
                    {race.flagEmoji || "🏁"}
                  </div>
                  <div>
                    <p className="font-racing text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {race.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {race.circuit} · {format(new Date(race.raceDate), "MMM d, yyyy")}
                      {race.hasSprint && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 font-racing text-[9px] font-bold">Sprint</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Stats — hidden on mobile */}
                <div className="hidden sm:flex justify-center">
                  <span className="font-racing text-sm text-gray-500">—</span>
                </div>
                <div className="hidden sm:flex justify-center">
                  <span className="font-racing text-sm text-gray-500">—</span>
                </div>

                {/* Status */}
                <div className="hidden sm:flex justify-end items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-racing text-[10px] font-bold ${
                    race.status === "completed"
                      ? "bg-gray-100 text-gray-500"
                      : race.status === "live"
                      ? "bg-green-100 text-green-700"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {race.status === "completed" ? "Completed" : race.status === "live" ? "Live" : "Upcoming"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Forum header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h1 className="font-racing text-2xl font-black text-gray-900 tracking-tight">F1 Fan Hub Forum</h1>
        </div>
        <p className="text-sm text-gray-400 ml-7">Discuss every race, lap, and moment of the 2026 season.</p>
      </div>

      {/* General Discussion board */}
      <div className="mb-6">
        <div className="bg-primary px-4 py-2 rounded-t-xl">
          <h2 className="font-racing text-xs font-bold text-white tracking-widest uppercase">General Discussion</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden">
          <button
            data-testid="button-general-forum"
            className="w-full text-left hover:bg-gray-50/80 transition-colors group"
            onClick={onSelectGeneral}
          >
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-racing text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                  General Discussion
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  F1 news, predictions, regulations, fantasy league, and everything in between
                </p>
                <p className="font-racing text-[10px] text-gray-400 mt-1">
                  {generalPosts?.length || 0} topic{generalPosts?.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {!races ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {completed.length > 0 && <RaceSection title="Completed Races" items={[...completed].reverse()} />}
          <RaceSection title="Upcoming Races" items={upcoming} />
        </>
      )}
    </div>
  );
}

/* ─── Main export ─── */
type View = "index" | "topics" | "general" | "thread";

export default function ForumPage() {
  const [routeMatch, routeParams] = useRoute("/forum/:raceId");
  const [view, setView] = useState<View>(() =>
    routeMatch && routeParams?.raceId ? "topics" : "index"
  );
  const [raceId, setRaceId] = useState<number | null>(() =>
    routeMatch && routeParams?.raceId ? Number(routeParams.raceId) : null
  );
  const [postId, setPostId] = useState<number | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [isGeneralThread, setIsGeneralThread] = useState(false);

  const { data: race } = useQuery<Race>({
    queryKey: [`/api/races/${raceId}`],
    enabled: !!raceId,
  });

  function goIndex() { setView("index"); setRaceId(null); setPostId(null); setIsGeneralThread(false); }
  function goTopics(id: number) { setRaceId(id); setView("topics"); setPostId(null); setIsGeneralThread(false); }
  function goGeneral() { setView("general"); setRaceId(null); setPostId(null); setIsGeneralThread(false); }
  function goThread(pid: number, title: string, isGeneral = false) {
    setPostId(pid);
    setPostTitle(title);
    setIsGeneralThread(isGeneral);
    setView("thread");
  }

  if (view === "thread" && postId !== null) {
    return (
      <ThreadView
        postId={postId}
        raceId={isGeneralThread ? null : raceId}
        raceName={isGeneralThread ? "General Discussion" : (race?.name || "Race Forum")}
        postTitle={postTitle}
        onBack={() => isGeneralThread ? setView("general") : setView("topics")}
        onBackToRace={goIndex}
      />
    );
  }

  if (view === "general") {
    return (
      <GeneralForum
        onBack={goIndex}
        onSelectPost={(pid, title) => goThread(pid, title, true)}
      />
    );
  }

  if (view === "topics" && raceId !== null) {
    return (
      <RaceForum
        raceId={raceId}
        onBack={goIndex}
        onSelectPost={(pid, title) => goThread(pid, title, false)}
      />
    );
  }

  return <ForumIndex onSelectRace={goTopics} onSelectGeneral={goGeneral} />;
}
