import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Shield, Save, Newspaper, BarChart2, ChevronDown, ChevronUp, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { UserProfile, DriverStanding, ConstructorStanding } from "@shared/schema";

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  tags: string;
}

const emptyForm: ArticleForm = { title: "", excerpt: "", content: "", imageUrl: "", tags: "" };

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"articles" | "standings">("articles");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  // Standings edit state
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
  const [driverEditForm, setDriverEditForm] = useState<Partial<DriverStanding>>({});
  const [editingConstructorId, setEditingConstructorId] = useState<number | null>(null);
  const [constructorEditForm, setConstructorEditForm] = useState<Partial<ConstructorStanding>>({});

  const { data: profile } = useQuery<UserProfile>({ queryKey: ["/api/profile"] });
  const { data: articles, isLoading } = useQuery<any[]>({ queryKey: ["/api/articles"] });
  const { data: drivers } = useQuery<DriverStanding[]>({ queryKey: ["/api/standings/drivers"] });
  const { data: constructors } = useQuery<ConstructorStanding[]>({ queryKey: ["/api/standings/constructors"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setShowForm(false);
      setForm(emptyForm);
      toast({ title: "Article published!" });
    },
    onError: () => toast({ title: "Error", description: "Admin access required", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/articles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "Article updated!" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update article", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/standings/drivers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standings/drivers"] });
      setEditingDriverId(null);
      toast({ title: "Driver standings updated!" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });

  const updateConstructorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/standings/constructors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standings/constructors"] });
      setEditingConstructorId(null);
      toast({ title: "Constructor standings updated!" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });

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
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (article: any) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      imageUrl: article.imageUrl || "",
      tags: (article.tags || []).join(", "),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!profile?.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h1 className="font-racing text-2xl font-black text-foreground mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground text-sm">You need admin privileges to access this panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">Admin Panel</span>
          </div>
          <h1 className="font-racing text-3xl font-black text-foreground tracking-tight">Content Manager</h1>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-card border border-border rounded-xl p-1 w-fit gap-1">
        <button
          onClick={() => setTab("articles")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-racing text-sm font-bold transition-all ${
            tab === "articles" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          Articles
        </button>
        <button
          onClick={() => setTab("standings")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-racing text-sm font-bold transition-all ${
            tab === "standings" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Standings
        </button>
      </div>

      {/* ARTICLES TAB */}
      {tab === "articles" && (
        <div className="space-y-4">
          {/* Publish / Edit form */}
          {showForm ? (
            <div className="bg-card border border-primary/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-racing text-lg font-black text-foreground">
                  {editingId ? "Edit Article" : "Publish New Article"}
                </h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                  className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
                    Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Article headline..."
                    data-testid="input-article-title"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
                    Excerpt / Subtitle *
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="A brief summary that appears in article cards..."
                    rows={2}
                    data-testid="input-article-excerpt"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
                    Full Content * <span className="text-muted-foreground/50 normal-case tracking-normal">(Separate paragraphs with a blank line)</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Write your full article here...&#10;&#10;Each paragraph separated by a blank line will be displayed correctly."
                    rows={12}
                    data-testid="input-article-content"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
                      Cover Image URL
                    </label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://..."
                      data-testid="input-article-image"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="font-racing text-xs text-muted-foreground tracking-widest uppercase block mb-1.5">
                      Tags <span className="text-muted-foreground/50 normal-case tracking-normal">(comma-separated)</span>
                    </label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="Race Report, Verstappen, 2026 Season"
                      data-testid="input-article-tags"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-publish-article"
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-racing text-sm font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "Save Changes" : "Publish Article"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                  className="px-6 py-2.5 border border-border font-racing text-sm text-muted-foreground rounded-lg hover:text-foreground transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
              data-testid="button-new-article"
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-racing text-sm font-bold rounded-xl hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Write New Article
            </button>
          )}

          {/* Articles list */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-racing text-sm font-black text-foreground">
                {articles?.length || 0} Published Articles
              </h2>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-background/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : articles?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-racing text-sm">No articles yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {articles?.map((article) => (
                  <div key={article.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                          className="flex items-start gap-2 w-full text-left group"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-racing text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">
                                {article.publishedAt ? format(new Date(article.publishedAt), "d MMM yyyy") : ""}
                              </span>
                              {article.tags?.length > 0 && (
                                <div className="flex gap-1">
                                  {article.tags.slice(0, 2).map((tag: string) => (
                                    <span key={tag} className="font-racing text-[9px] bg-primary/10 text-primary/70 rounded px-1.5 py-0.5">{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {expandedArticle === article.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                        </button>

                        {expandedArticle === article.id && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{article.excerpt}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(article)}
                          data-testid={`button-edit-article-${article.id}`}
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(article.id)}
                          data-testid={`button-delete-article-${article.id}`}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STANDINGS TAB */}
      {tab === "standings" && (
        <div className="space-y-6">
          {/* Driver standings */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-racing text-sm font-black text-foreground">Driver Standings — 2026</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Click a row to edit points and wins</p>
            </div>
            <div className="divide-y divide-border/40">
              {drivers?.map((d) => (
                <div key={d.id} className="px-5 py-3">
                  {editingDriverId === d.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-0.5 h-5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                        <span className="font-racing text-sm font-black text-foreground">{d.driverName}</span>
                        <span className="text-xs text-muted-foreground">({d.driverCode})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="font-racing text-[9px] text-muted-foreground tracking-widest block mb-1">POINTS</label>
                          <input
                            type="number"
                            value={driverEditForm.points ?? d.points}
                            onChange={(e) => setDriverEditForm({ ...driverEditForm, points: Number(e.target.value) })}
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="font-racing text-[9px] text-muted-foreground tracking-widest block mb-1">WINS</label>
                          <input
                            type="number"
                            value={driverEditForm.wins ?? d.wins}
                            onChange={(e) => setDriverEditForm({ ...driverEditForm, wins: Number(e.target.value) })}
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="font-racing text-[9px] text-muted-foreground tracking-widest block mb-1">PODIUMS</label>
                          <input
                            type="number"
                            value={driverEditForm.podiums ?? d.podiums}
                            onChange={(e) => setDriverEditForm({ ...driverEditForm, podiums: Number(e.target.value) })}
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateDriverMutation.mutate({ id: d.id, data: driverEditForm })}
                          disabled={updateDriverMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white font-racing text-xs font-bold rounded hover:bg-primary/90 transition-all"
                        >
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => { setEditingDriverId(null); setDriverEditForm({}); }}
                          className="px-3 py-1.5 border border-border font-racing text-xs text-muted-foreground rounded hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingDriverId(d.id); setDriverEditForm({ points: d.points, wins: d.wins, podiums: d.podiums }); }}
                      className="w-full flex items-center gap-3 text-left hover:bg-background/50 -mx-1 px-1 rounded transition-all"
                    >
                      <span className="font-racing text-xs text-muted-foreground w-5 text-center">{d.position}</span>
                      <div className="w-0.5 h-5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                      <span className="text-base">{d.flagEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-racing text-sm font-bold text-foreground">{d.driverName}</span>
                        <span className="font-racing text-xs text-muted-foreground ml-2">{d.teamName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-racing">
                        <span className="font-black text-foreground">{d.points} pts</span>
                        <span className="text-muted-foreground">{d.wins}W</span>
                        <span className="text-muted-foreground">{d.podiums}P</span>
                        <Edit2 className="w-3 h-3 text-muted-foreground/50" />
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Constructor standings */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-racing text-sm font-black text-foreground">Constructor Standings — 2026</h2>
            </div>
            <div className="divide-y divide-border/40">
              {constructors?.map((c) => (
                <div key={c.id} className="px-5 py-3">
                  {editingConstructorId === c.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.teamColor }} />
                        <span className="font-racing text-sm font-black text-foreground">{c.teamName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-racing text-[9px] text-muted-foreground tracking-widest block mb-1">POINTS</label>
                          <input
                            type="number"
                            value={constructorEditForm.points ?? c.points}
                            onChange={(e) => setConstructorEditForm({ ...constructorEditForm, points: Number(e.target.value) })}
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="font-racing text-[9px] text-muted-foreground tracking-widest block mb-1">WINS</label>
                          <input
                            type="number"
                            value={constructorEditForm.wins ?? c.wins}
                            onChange={(e) => setConstructorEditForm({ ...constructorEditForm, wins: Number(e.target.value) })}
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateConstructorMutation.mutate({ id: c.id, data: constructorEditForm })}
                          disabled={updateConstructorMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white font-racing text-xs font-bold rounded hover:bg-primary/90 transition-all"
                        >
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => { setEditingConstructorId(null); setConstructorEditForm({}); }}
                          className="px-3 py-1.5 border border-border font-racing text-xs text-muted-foreground rounded hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingConstructorId(c.id); setConstructorEditForm({ points: c.points, wins: c.wins }); }}
                      className="w-full flex items-center gap-3 text-left hover:bg-background/50 -mx-1 px-1 rounded transition-all"
                    >
                      <span className="font-racing text-xs text-muted-foreground w-5 text-center">{c.position}</span>
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.teamColor }} />
                      <span className="font-racing text-sm font-bold text-foreground flex-1">{c.teamName}</span>
                      <div className="flex items-center gap-3 text-xs font-racing">
                        <span className="font-black text-foreground">{c.points} pts</span>
                        <span className="text-muted-foreground">{c.wins}W</span>
                        <Edit2 className="w-3 h-3 text-muted-foreground/50" />
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
