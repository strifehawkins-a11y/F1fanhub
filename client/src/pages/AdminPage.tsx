import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Shield, Save, Newspaper, BarChart2, Flag, ChevronDown, ChevronUp, X, Calendar, BarChart3, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { UserProfile, DriverStanding, ConstructorStanding, Race } from "@shared/schema";

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  tags: string;
}
const emptyForm: ArticleForm = { title: "", excerpt: "", content: "", imageUrl: "", tags: "" };

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
const labelCls = "font-racing text-[10px] text-gray-400 tracking-widest uppercase block mb-1";

type Tab = "articles" | "standings" | "races" | "polls";

interface PollForm {
  question: string;
  options: string[];
  isActive: boolean;
  closesAt: string;
}
const emptyPollForm: PollForm = { question: "", options: ["", ""], isActive: true, closesAt: "" };

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("articles");

  // Article state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  // Driver edit state
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
  const [driverForm, setDriverForm] = useState<Partial<DriverStanding>>({});

  // Constructor edit state
  const [editingConstructorId, setEditingConstructorId] = useState<number | null>(null);
  const [constructorForm, setConstructorForm] = useState<Partial<ConstructorStanding>>({});

  // Race edit state
  const [editingRaceId, setEditingRaceId] = useState<number | null>(null);
  const [raceForm, setRaceForm] = useState<Partial<Race>>({});

  // Poll state
  const [showPollForm, setShowPollForm] = useState(false);
  const [editingPollId, setEditingPollId] = useState<number | null>(null);
  const [pollForm, setPollForm] = useState<PollForm>(emptyPollForm);

  const { data: profile } = useQuery<UserProfile>({ queryKey: ["/api/profile"] });
  const { data: articles, isLoading } = useQuery<any[]>({ queryKey: ["/api/articles"] });
  const { data: pollsData } = useQuery<any[]>({ queryKey: ["/api/polls"] });
  const { data: drivers } = useQuery<DriverStanding[]>({ queryKey: ["/api/standings/drivers"] });
  const { data: constructors } = useQuery<ConstructorStanding[]>({ queryKey: ["/api/standings/constructors"] });
  const { data: races } = useQuery<Race[]>({
    queryKey: ["/api/races", 2026],
    queryFn: () => fetch("/api/races?season=2026").then(r => r.json()),
  });

  // Article mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/articles", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/articles"] }); setShowForm(false); setForm(emptyForm); toast({ title: "Article published!" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/articles/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/articles"] }); setShowForm(false); setEditingId(null); setForm(emptyForm); toast({ title: "Article updated!" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/articles/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/articles"] }); toast({ title: "Article deleted" }); },
  });

  // Driver mutation
  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/standings/drivers/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/standings/drivers"] }); setEditingDriverId(null); toast({ title: "Driver updated!" }); },
    onError: () => toast({ title: "Error updating driver", variant: "destructive" }),
  });

  // Constructor mutation
  const updateConstructorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/standings/constructors/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/standings/constructors"] }); setEditingConstructorId(null); toast({ title: "Constructor updated!" }); },
    onError: () => toast({ title: "Error updating constructor", variant: "destructive" }),
  });

  // Race mutation
  const updateRaceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/races/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/races", 2026] });
      setEditingRaceId(null);
      toast({ title: "Race updated!" });
    },
    onError: () => toast({ title: "Error updating race", variant: "destructive" }),
  });

  // Poll mutations
  const createPollMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/polls", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/polls"] }); setShowPollForm(false); setPollForm(emptyPollForm); toast({ title: "Poll created!" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });
  const updatePollMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/polls/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/polls"] }); setShowPollForm(false); setEditingPollId(null); setPollForm(emptyPollForm); toast({ title: "Poll updated!" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });
  const deletePollMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/polls/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/polls"] }); toast({ title: "Poll deleted" }); },
  });

  const handlePollSubmit = () => {
    const validOptions = pollForm.options.map(o => o.trim()).filter(Boolean);
    if (!pollForm.question.trim() || validOptions.length < 2) {
      toast({ title: "Question and at least 2 options required", variant: "destructive" });
      return;
    }
    const data = {
      question: pollForm.question.trim(),
      options: validOptions,
      isActive: pollForm.isActive,
      closesAt: pollForm.closesAt || null,
    };
    if (editingPollId) updatePollMutation.mutate({ id: editingPollId, data });
    else createPollMutation.mutate(data);
  };

  const handleEditPoll = (poll: any) => {
    setEditingPollId(poll.id);
    setPollForm({
      question: poll.question,
      options: poll.options,
      isActive: poll.isActive,
      closesAt: poll.closesAt ? new Date(poll.closesAt).toISOString().slice(0, 16) : "",
    });
    setShowPollForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
    const data = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      imageUrl: form.imageUrl.trim() || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      authorId: (user as any)?.id || "admin",
    };
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (article: any) => {
    setEditingId(article.id);
    setForm({ title: article.title, excerpt: article.excerpt, content: article.content, imageUrl: article.imageUrl || "", tags: (article.tags || []).join(", ") });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!profile?.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Shield className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="font-racing text-2xl font-black text-gray-900 mb-2">Admin Access Required</h1>
        <p className="text-gray-400 text-sm">You need admin privileges to access this panel.</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "articles", label: "Articles", icon: Newspaper },
    { key: "polls", label: "Polls", icon: BarChart3 },
    { key: "standings", label: "Standings", icon: BarChart2 },
    { key: "races", label: "Races", icon: Calendar },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">Admin Panel</span>
        </div>
        <h1 className="font-racing text-3xl font-black text-gray-900 tracking-tight">Content Manager</h1>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit gap-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-racing text-sm font-bold transition-all ${
              tab === key ? "bg-primary text-white shadow-sm shadow-primary/20" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── ARTICLES TAB ── */}
      {tab === "articles" && (
        <div className="space-y-4">
          {showForm ? (
            <div className="bg-white border border-primary/20 shadow-md rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-racing text-lg font-black text-gray-900">{editingId ? "Edit Article" : "Publish New Article"}</h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Article headline..." data-testid="input-article-title" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Excerpt / Subtitle *</label>
                  <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="A brief summary..." rows={2} data-testid="input-article-excerpt" className={inputCls + " resize-none"} />
                </div>
                <div>
                  <label className={labelCls}>Full Content * <span className="normal-case tracking-normal text-gray-300">(blank line = new paragraph)</span></label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your full article here..." rows={12} data-testid="input-article-content" className={inputCls + " resize-y font-mono"} />
                  <p className="mt-1 text-[10px] text-gray-300">Embed an image inline: <code className="bg-gray-100 px-1 rounded">![Caption text](https://image-url.jpg)</code> on its own blank-separated line</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Cover Image URL</label>
                    <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." data-testid="input-article-image" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Tags (comma-separated)</label>
                    <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Race Report, Verstappen" data-testid="input-article-tags" className={inputCls} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-publish-article" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-racing text-sm font-bold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {editingId ? "Save Changes" : "Publish Article"}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="px-6 py-2.5 border border-gray-200 font-racing text-sm text-gray-400 rounded-lg hover:text-gray-700 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} data-testid="button-new-article" className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-racing text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" />
              Write New Article
            </button>
          )}

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-racing text-sm font-black text-gray-900">{articles?.length || 0} Published Articles</h2>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}</div>
            ) : articles?.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><Newspaper className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="font-racing text-sm">No articles yet</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {articles?.map((article) => (
                  <div key={article.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <button onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)} className="flex items-start gap-2 w-full text-left group">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-racing text-sm font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{article.title}</h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-gray-400">{article.publishedAt ? format(new Date(article.publishedAt), "d MMM yyyy") : ""}</span>
                              {article.tags?.slice(0, 2).map((tag: string) => (
                                <span key={tag} className="font-racing text-[9px] bg-primary/8 text-primary rounded px-1.5 py-0.5">{tag}</span>
                              ))}
                            </div>
                          </div>
                          {expandedArticle === article.id ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                        </button>
                        {expandedArticle === article.id && <p className="text-xs text-gray-400 mt-2 leading-relaxed">{article.excerpt}</p>}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(article)} data-testid={`button-edit-article-${article.id}`} className="p-1.5 rounded text-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteMutation.mutate(article.id)} data-testid={`button-delete-article-${article.id}`} className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── POLLS TAB ── */}
      {tab === "polls" && (
        <div className="space-y-4">
          {showPollForm ? (
            <div className="bg-white border border-primary/20 shadow-md rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-racing text-lg font-black text-gray-900">{editingPollId ? "Edit Poll" : "Create New Poll"}</h2>
                <button onClick={() => { setShowPollForm(false); setEditingPollId(null); setPollForm(emptyPollForm); }} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Question *</label>
                  <input value={pollForm.question} onChange={e => setPollForm({ ...pollForm, question: e.target.value })} placeholder="Who will win the next race?" data-testid="input-poll-question" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Options * <span className="normal-case tracking-normal text-gray-300">(min 2)</span></label>
                  <div className="space-y-2">
                    {pollForm.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={opt}
                          onChange={e => {
                            const next = [...pollForm.options];
                            next[i] = e.target.value;
                            setPollForm({ ...pollForm, options: next });
                          }}
                          placeholder={`Option ${i + 1}`}
                          data-testid={`input-poll-option-${i}`}
                          className={inputCls}
                        />
                        {pollForm.options.length > 2 && (
                          <button
                            onClick={() => setPollForm({ ...pollForm, options: pollForm.options.filter((_, j) => j !== i) })}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollForm.options.length < 6 && (
                    <button
                      onClick={() => setPollForm({ ...pollForm, options: [...pollForm.options, ""] })}
                      className="mt-2 flex items-center gap-1.5 text-xs text-primary font-racing hover:text-primary/80 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Add option
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Closes at (optional)</label>
                    <input type="datetime-local" value={pollForm.closesAt} onChange={e => setPollForm({ ...pollForm, closesAt: e.target.value })} data-testid="input-poll-closes-at" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setPollForm({ ...pollForm, isActive: true })}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-racing text-xs font-bold transition-all ${pollForm.isActive ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </button>
                      <button
                        onClick={() => setPollForm({ ...pollForm, isActive: false })}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-racing text-xs font-bold transition-all ${!pollForm.isActive ? "bg-red-50 text-red-500 border border-red-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Closed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handlePollSubmit} disabled={createPollMutation.isPending || updatePollMutation.isPending} data-testid="button-save-poll" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-racing text-sm font-bold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {editingPollId ? "Save Changes" : "Create Poll"}
                </button>
                <button onClick={() => { setShowPollForm(false); setEditingPollId(null); setPollForm(emptyPollForm); }} className="px-6 py-2.5 border border-gray-200 font-racing text-sm text-gray-400 rounded-lg hover:text-gray-700 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setShowPollForm(true); setEditingPollId(null); setPollForm(emptyPollForm); }} data-testid="button-new-poll" className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-racing text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" />
              Create New Poll
            </button>
          )}

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-racing text-sm font-black text-gray-900">{pollsData?.length || 0} Polls</h2>
            </div>
            {!pollsData || pollsData.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="font-racing text-sm">No polls yet</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pollsData.map((poll) => (
                  <div key={poll.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${poll.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                          <h3 className="font-racing text-sm font-black text-gray-900 line-clamp-1">{poll.question}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                          <span>{poll.options.length} options</span>
                          <span>·</span>
                          <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}</span>
                          {poll.closesAt && <span>· closes {format(new Date(poll.closesAt), "d MMM yyyy")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleEditPoll(poll)} data-testid={`button-edit-poll-${poll.id}`} className="p-1.5 rounded text-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deletePollMutation.mutate(poll.id)} data-testid={`button-delete-poll-${poll.id}`} className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STANDINGS TAB ── */}
      {tab === "standings" && (
        <div className="space-y-6">
          {/* Driver standings */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-racing text-sm font-black text-gray-900">Driver Standings — 2026</h2>
              <p className="text-xs text-gray-400 mt-0.5">Click a row to edit all driver details</p>
            </div>
            <div className="divide-y divide-gray-50">
              {drivers?.map((d) => (
                <div key={d.id} className="px-5 py-3">
                  {editingDriverId === d.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-0.5 h-5 rounded-full" style={{ backgroundColor: driverForm.teamColor || d.teamColor }} />
                        <span className="font-racing text-sm font-black text-gray-900">{driverForm.driverName || d.driverName}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <label className={labelCls}>Driver Name</label>
                          <input value={driverForm.driverName ?? d.driverName} onChange={e => setDriverForm({ ...driverForm, driverName: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Code (3 letters)</label>
                          <input value={driverForm.driverCode ?? d.driverCode} onChange={e => setDriverForm({ ...driverForm, driverCode: e.target.value.toUpperCase().slice(0, 3) })} className={inputCls} maxLength={3} />
                        </div>
                        <div>
                          <label className={labelCls}>Nationality</label>
                          <input value={driverForm.nationality ?? d.nationality} onChange={e => setDriverForm({ ...driverForm, nationality: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Flag Emoji</label>
                          <input value={driverForm.flagEmoji ?? d.flagEmoji} onChange={e => setDriverForm({ ...driverForm, flagEmoji: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Team Name</label>
                          <input value={driverForm.teamName ?? d.teamName} onChange={e => setDriverForm({ ...driverForm, teamName: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Team Colour (#hex)</label>
                          <div className="flex gap-1.5">
                            <input value={driverForm.teamColor ?? d.teamColor} onChange={e => setDriverForm({ ...driverForm, teamColor: e.target.value })} className={inputCls + " flex-1"} />
                            <input type="color" value={driverForm.teamColor ?? d.teamColor} onChange={e => setDriverForm({ ...driverForm, teamColor: e.target.value })} className="h-9 w-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Position</label>
                          <input type="number" min={1} max={20} value={driverForm.position ?? d.position} onChange={e => setDriverForm({ ...driverForm, position: Number(e.target.value) })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Points</label>
                          <input type="number" min={0} value={driverForm.points ?? d.points} onChange={e => setDriverForm({ ...driverForm, points: Number(e.target.value) })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Wins</label>
                          <input type="number" min={0} value={driverForm.wins ?? d.wins} onChange={e => setDriverForm({ ...driverForm, wins: Number(e.target.value) })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Podiums</label>
                          <input type="number" min={0} value={driverForm.podiums ?? d.podiums} onChange={e => setDriverForm({ ...driverForm, podiums: Number(e.target.value) })} className={inputCls} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateDriverMutation.mutate({ id: d.id, data: driverForm })} disabled={updateDriverMutation.isPending} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-racing text-xs font-bold rounded-lg hover:bg-red-700 transition-all">
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => { setEditingDriverId(null); setDriverForm({}); }} className="px-4 py-2 border border-gray-200 font-racing text-xs text-gray-400 rounded-lg hover:text-gray-700">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingDriverId(d.id); setDriverForm({ ...d }); }} className="w-full flex items-center gap-3 text-left hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-all py-1">
                      <span className="font-racing text-xs text-gray-400 w-5 text-center">{d.position}</span>
                      <div className="w-0.5 h-5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                      <span className="text-base">{d.flagEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-racing text-sm font-bold text-gray-900">{d.driverName}</span>
                        <span className="font-racing text-xs text-gray-400 ml-2">{d.teamName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-racing text-gray-600">
                        <span className="font-black">{d.points}pts</span>
                        <span className="text-gray-400">{d.wins}W · {d.podiums}P</span>
                        <Edit2 className="w-3 h-3 text-gray-300" />
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Constructor standings */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-racing text-sm font-black text-gray-900">Constructor Standings — 2026</h2>
              <p className="text-xs text-gray-400 mt-0.5">Click a row to edit all constructor details</p>
            </div>
            <div className="divide-y divide-gray-50">
              {constructors?.map((c) => (
                <div key={c.id} className="px-5 py-3">
                  {editingConstructorId === c.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: constructorForm.teamColor || c.teamColor }} />
                        <span className="font-racing text-sm font-black text-gray-900">{constructorForm.teamName || c.teamName}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Team Name</label>
                          <input value={constructorForm.teamName ?? c.teamName} onChange={e => setConstructorForm({ ...constructorForm, teamName: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Team Colour (#hex)</label>
                          <div className="flex gap-1.5">
                            <input value={constructorForm.teamColor ?? c.teamColor} onChange={e => setConstructorForm({ ...constructorForm, teamColor: e.target.value })} className={inputCls + " flex-1"} />
                            <input type="color" value={constructorForm.teamColor ?? c.teamColor} onChange={e => setConstructorForm({ ...constructorForm, teamColor: e.target.value })} className="h-9 w-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Position</label>
                          <input type="number" min={1} max={10} value={constructorForm.position ?? c.position} onChange={e => setConstructorForm({ ...constructorForm, position: Number(e.target.value) })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Points</label>
                          <input type="number" min={0} value={constructorForm.points ?? c.points} onChange={e => setConstructorForm({ ...constructorForm, points: Number(e.target.value) })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Wins</label>
                          <input type="number" min={0} value={constructorForm.wins ?? c.wins} onChange={e => setConstructorForm({ ...constructorForm, wins: Number(e.target.value) })} className={inputCls} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateConstructorMutation.mutate({ id: c.id, data: constructorForm })} disabled={updateConstructorMutation.isPending} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-racing text-xs font-bold rounded-lg hover:bg-red-700 transition-all">
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => { setEditingConstructorId(null); setConstructorForm({}); }} className="px-4 py-2 border border-gray-200 font-racing text-xs text-gray-400 rounded-lg hover:text-gray-700">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingConstructorId(c.id); setConstructorForm({ ...c }); }} className="w-full flex items-center gap-3 text-left hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-all py-1">
                      <span className="font-racing text-xs text-gray-400 w-5 text-center">{c.position}</span>
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.teamColor }} />
                      <span className="font-racing text-sm font-bold text-gray-900 flex-1">{c.teamName}</span>
                      <div className="flex items-center gap-3 text-xs font-racing text-gray-600">
                        <span className="font-black">{c.points}pts</span>
                        <span className="text-gray-400">{c.wins}W</span>
                        <Edit2 className="w-3 h-3 text-gray-300" />
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RACES TAB ── */}
      {tab === "races" && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-racing text-sm font-black text-gray-900">2026 Race Calendar</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click a race to edit all details — name, circuit, dates, status</p>
          </div>
          <div className="divide-y divide-gray-50">
            {races?.map((race) => (
              <div key={race.id} className="px-5 py-3">
                {editingRaceId === race.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{raceForm.flagEmoji || race.flagEmoji}</span>
                      <span className="font-racing text-sm font-black text-gray-900">Round {raceForm.round ?? race.round}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <label className={labelCls}>Round #</label>
                        <input type="number" min={1} max={24} value={raceForm.round ?? race.round} onChange={e => setRaceForm({ ...raceForm, round: Number(e.target.value) })} className={inputCls} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Race Name</label>
                        <input value={raceForm.name ?? race.name} onChange={e => setRaceForm({ ...raceForm, name: e.target.value })} className={inputCls} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Circuit</label>
                        <input value={raceForm.circuit ?? race.circuit} onChange={e => setRaceForm({ ...raceForm, circuit: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Location (City)</label>
                        <input value={raceForm.location ?? race.location} onChange={e => setRaceForm({ ...raceForm, location: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Country</label>
                        <input value={raceForm.country ?? race.country} onChange={e => setRaceForm({ ...raceForm, country: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Flag Emoji</label>
                        <input value={raceForm.flagEmoji ?? race.flagEmoji ?? ""} onChange={e => setRaceForm({ ...raceForm, flagEmoji: e.target.value })} className={inputCls} placeholder="🇬🇧" />
                      </div>
                      <div>
                        <label className={labelCls}>Race Date (YYYY-MM-DD)</label>
                        <input type="date" value={raceForm.raceDate ?? race.raceDate} onChange={e => setRaceForm({ ...raceForm, raceDate: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Qualifying Date</label>
                        <input type="date" value={raceForm.qualifyingDate ?? race.qualifyingDate} onChange={e => setRaceForm({ ...raceForm, qualifyingDate: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Status</label>
                        <select value={raceForm.status ?? race.status} onChange={e => setRaceForm({ ...raceForm, status: e.target.value })} className={inputCls}>
                          <option value="upcoming">Upcoming</option>
                          <option value="live">Live</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input type="checkbox" id={`sprint-${race.id}`} checked={raceForm.hasSprint ?? race.hasSprint} onChange={e => setRaceForm({ ...raceForm, hasSprint: e.target.checked })} className="w-4 h-4 accent-primary" />
                        <label htmlFor={`sprint-${race.id}`} className="font-racing text-xs text-gray-600 tracking-wide">Sprint Weekend</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateRaceMutation.mutate({ id: race.id, data: raceForm })} disabled={updateRaceMutation.isPending} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-racing text-xs font-bold rounded-lg hover:bg-red-700 transition-all">
                        <Save className="w-3 h-3" /> Save Race
                      </button>
                      <button onClick={() => { setEditingRaceId(null); setRaceForm({}); }} className="px-4 py-2 border border-gray-200 font-racing text-xs text-gray-400 rounded-lg hover:text-gray-700">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setEditingRaceId(race.id); setRaceForm({ ...race }); }} className="w-full flex items-center gap-3 text-left hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-all py-1">
                    <span className="font-racing text-xs text-gray-400 w-6 text-center">R{race.round}</span>
                    <span className="text-lg">{race.flagEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-racing text-sm font-bold text-gray-900">{race.name}</span>
                      <span className="text-xs text-gray-400 ml-2 font-racing">{race.circuit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-racing flex-shrink-0">
                      <span className="text-gray-400">{race.raceDate}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        race.status === "completed" ? "bg-gray-100 text-gray-400" :
                        race.status === "live" ? "bg-green-100 text-green-600" :
                        "bg-blue-50 text-blue-500"
                      }`}>{race.status}</span>
                      {race.hasSprint && <span className="bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full font-bold">Sprint</span>}
                      <Edit2 className="w-3 h-3 text-gray-300" />
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
