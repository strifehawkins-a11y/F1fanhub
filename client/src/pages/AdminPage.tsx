import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Shield, X, Save, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { UserProfile } from "@shared/schema";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: articles, isLoading } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast({ title: "Article published!" });
    },
    onError: (err: any) => toast({ title: "Error", description: "Admin access required", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/articles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setDialogOpen(false);
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
    onError: () => toast({ title: "Error", description: "Failed to delete article", variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast({ title: "Fill in all required fields", variant: "destructive" });
      return;
    }
    const data = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      imageUrl: form.imageUrl || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (editingId !== null) {
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
    setDialogOpen(true);
  };

  if (!profile?.isAdmin) {
    return (
      <div className="px-4 py-10 text-center space-y-4">
        <Shield className="w-16 h-16 mx-auto text-muted-foreground opacity-40" />
        <h1 className="font-racing text-2xl font-black text-foreground">Admin Only</h1>
        <p className="text-sm text-muted-foreground">This area requires admin access.</p>
        <p className="text-xs text-muted-foreground">Contact the site administrator to request access.</p>
        <div className="mt-4 p-3 bg-card border border-card-border rounded-lg text-left">
          <p className="font-racing text-xs text-muted-foreground mb-1">Your User ID:</p>
          <code className="text-xs text-primary break-all">{(user as any)?.id || "Loading..."}</code>
          <p className="text-[10px] text-muted-foreground mt-1">Share this with an admin to grant access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <Badge className="text-[10px] font-racing">Admin</Badge>
          </div>
          <h1 className="font-racing text-3xl font-black text-foreground">Content Panel</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setEditingId(null); setForm(emptyForm); }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-racing text-xs tracking-wide" data-testid="button-new-article">
              <Plus className="w-3 h-3 mr-1.5" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-racing text-foreground">
                {editingId ? "Edit Article" : "New Article"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-racing text-xs text-muted-foreground uppercase tracking-wide">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Article title..."
                  className="mt-1 font-racing text-sm"
                  data-testid="input-article-title"
                />
              </div>
              <div>
                <Label className="font-racing text-xs text-muted-foreground uppercase tracking-wide">Excerpt *</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Brief summary (shown in article list)..."
                  className="mt-1 text-sm resize-none min-h-[72px]"
                  data-testid="input-article-excerpt"
                />
              </div>
              <div>
                <Label className="font-racing text-xs text-muted-foreground uppercase tracking-wide">Content *</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Full article content... (separate paragraphs with blank lines)"
                  className="mt-1 text-sm resize-none min-h-[160px]"
                  data-testid="input-article-content"
                />
              </div>
              <div>
                <Label className="font-racing text-xs text-muted-foreground uppercase tracking-wide">Tags</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="2025 Season, Hamilton, Ferrari (comma-separated)"
                  className="mt-1 text-sm"
                  data-testid="input-article-tags"
                />
              </div>
              <Button
                className="w-full font-racing tracking-wide"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-article"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Save Changes" : "Publish Article"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="font-racing text-xs text-muted-foreground tracking-widest uppercase mb-3">
          {articles?.length || 0} Published Articles
        </h3>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-racing text-sm">No articles yet. Publish your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {articles?.map((article) => (
              <Card key={article.id} data-testid={`card-admin-article-${article.id}`} className="border-card-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-racing text-sm font-bold text-foreground leading-tight line-clamp-1">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        {article.publishedAt ? format(new Date(article.publishedAt), "MMM d, yyyy") : ""}
                      </span>
                      {article.tags?.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] font-racing">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(article)}
                      data-testid={`button-edit-article-${article.id}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(article.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-article-${article.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
