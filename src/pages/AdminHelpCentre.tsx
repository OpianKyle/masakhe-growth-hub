import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, X, Loader2, BookOpen, Video, HelpCircle, FileText,
  Pin, Eye, Search, ChevronDown, CheckCircle, Save
} from "lucide-react";

interface HelpCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  order_index: number;
  article_count?: number;
}

interface HelpArticle {
  id: string;
  category_id?: string;
  category_name?: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  content_type: "article" | "video" | "faq";
  video_url?: string;
  thumbnail_url?: string;
  tags?: string;
  status: "draft" | "published";
  pinned: number;
  view_count: number;
  order_index: number;
  created_at: string;
}

const ICON_OPTIONS = ["💡", "📖", "🚀", "⚙️", "💰", "📊", "👥", "🌐", "📧", "🔒", "❓", "🎯", "📱", "🏢", "📋", "🤝", "🛠️", "💳"];
const COLOR_OPTIONS = [
  { value: "blue",   label: "Blue",   swatch: "bg-blue-500" },
  { value: "green",  label: "Green",  swatch: "bg-green-500" },
  { value: "purple", label: "Purple", swatch: "bg-purple-500" },
  { value: "amber",  label: "Amber",  swatch: "bg-amber-500" },
  { value: "red",    label: "Red",    swatch: "bg-red-500" },
  { value: "cyan",   label: "Cyan",   swatch: "bg-cyan-500" },
  { value: "indigo", label: "Indigo", swatch: "bg-indigo-500" },
  { value: "slate",  label: "Slate",  swatch: "bg-slate-500" },
];
const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-700 border-green-200",
  draft:     "bg-gray-100 text-gray-600 border-gray-200",
};

export default function AdminHelpCentre() {
  const [tab, setTab] = useState<"articles" | "categories">("articles");
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editArticle, setEditArticle] = useState<HelpArticle | null | "new">(null);
  const [editCategory, setEditCategory] = useState<HelpCategory | null | "new">(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [cats, arts] = await Promise.all([
        fetch("/api/help/admin/categories", { credentials: "include" }).then(r => r.json()),
        fetch("/api/help/admin/articles", { credentials: "include" }).then(r => r.json()),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setArticles(Array.isArray(arts) ? arts : []);
    } catch { toast.error("Failed to load content"); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadAll(); }, []);

  async function deleteArticle(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    const res = await fetch(`/api/help/admin/articles/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Article deleted"); loadAll(); }
    else toast.error("Failed to delete article");
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Articles in it won't be deleted but will lose their category.")) return;
    const res = await fetch(`/api/help/admin/categories/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Category deleted"); loadAll(); }
    else toast.error("Failed to delete category");
  }

  async function togglePublish(article: HelpArticle) {
    const newStatus = article.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/help/admin/articles/${article.id}`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: newStatus }),
    });
    if (res.ok) { toast.success(newStatus === "published" ? "Article published" : "Moved to draft"); loadAll(); }
    else toast.error("Failed to update article");
  }

  const filteredArticles = articles.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.summary || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || a.category_id === filterCat;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-500" />Help Centre
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage self-help articles, guides, and videos for users</p>
        </div>
        <Button onClick={() => tab === "articles" ? setEditArticle("new") : setEditCategory("new")} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {tab === "articles" ? "New Article" : "New Category"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Articles", value: articles.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Published", value: articles.filter(a => a.status === "published").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Drafts", value: articles.filter(a => a.status === "draft").length, color: "text-gray-600", bg: "bg-gray-100" },
          { label: "Categories", value: categories.length, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
        {(["articles", "categories"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t} ({t === "articles" ? articles.length : categories.length})
          </button>
        ))}
      </div>

      {/* Articles Tab */}
      {tab === "articles" && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No articles yet</p>
              <p className="text-sm mt-1 mb-4">Create your first help article</p>
              <Button onClick={() => setEditArticle("new")}><Plus className="h-4 w-4 mr-1" />New Article</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArticles.map(article => {
                const TypeIcon = { article: FileText, video: Video, faq: HelpCircle }[article.content_type] || FileText;
                return (
                  <div key={article.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${article.content_type === "video" ? "bg-purple-100 text-purple-600" : article.content_type === "faq" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{article.title}</p>
                        {!!article.pinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge className={`${STATUS_BADGE[article.status]} border text-xs px-1.5 py-0`}>{article.status}</Badge>
                        {article.category_name && <span className="text-xs text-muted-foreground">{article.category_name}</span>}
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{article.view_count} views</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => togglePublish(article)}>
                        {article.status === "published" ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditArticle(article)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => deleteArticle(article.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {tab === "categories" && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No categories yet</p>
              <p className="text-sm mt-1 mb-4">Create categories to organise your help content</p>
              <Button onClick={() => setEditCategory("new")}><Plus className="h-4 w-4 mr-1" />New Category</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{cat.icon}</div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditCategory(cat)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => deleteCategory(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <p className="font-semibold text-sm">{cat.name}</p>
                  {cat.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{cat.article_count || 0} article{cat.article_count !== 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Article Editor Modal */}
      {editArticle !== null && (
        <ArticleModal
          article={editArticle === "new" ? null : editArticle}
          categories={categories}
          onClose={() => { setEditArticle(null); }}
          onSaved={() => { setEditArticle(null); loadAll(); }}
        />
      )}

      {/* Category Editor Modal */}
      {editCategory !== null && (
        <CategoryModal
          category={editCategory === "new" ? null : editCategory}
          onClose={() => { setEditCategory(null); }}
          onSaved={() => { setEditCategory(null); loadAll(); }}
        />
      )}
    </div>
  );
}

// ── Article Modal ────────────────────────────────────────────────────────────

function ArticleModal({ article, categories, onClose, onSaved }: {
  article: HelpArticle | null;
  categories: HelpCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: article?.title || "",
    category_id: article?.category_id || "",
    summary: article?.summary || "",
    body: article?.body || "",
    content_type: article?.content_type || "article",
    video_url: article?.video_url || "",
    thumbnail_url: article?.thumbnail_url || "",
    tags: article?.tags || "",
    status: article?.status || "draft",
    pinned: article?.pinned ? "1" : "0",
    order_index: String(article?.order_index ?? 0),
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const method = article ? "PUT" : "POST";
      const url = article ? `/api/help/admin/articles/${article.id}` : "/api/help/admin/articles";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category_id: form.category_id || null,
          pinned: form.pinned === "1" ? 1 : 0,
          order_index: parseInt(form.order_index) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(article ? "Article updated" : "Article created");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{article ? "Edit Article" : "New Article"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input className="mt-1.5" placeholder="e.g. How to create your first invoice" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category_id || "none"} onValueChange={v => set("category_id", v === "none" ? "" : v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="No category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content Type</Label>
              <Select value={form.content_type} onValueChange={v => set("content_type", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">📄 Article</SelectItem>
                  <SelectItem value="video">🎬 Video</SelectItem>
                  <SelectItem value="faq">❓ FAQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Short Summary</Label>
            <Textarea className="mt-1.5 min-h-[60px] resize-none" placeholder="Brief description shown in the article list..." value={form.summary} onChange={e => set("summary", e.target.value)} />
          </div>

          {form.content_type === "video" && (
            <div>
              <Label>Video URL</Label>
              <Input className="mt-1.5" placeholder="YouTube or Vimeo URL" value={form.video_url} onChange={e => set("video_url", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Supports YouTube (youtube.com, youtu.be) and Vimeo URLs</p>
            </div>
          )}

          <div>
            <Label>Body / Content <span className="text-muted-foreground text-xs">(HTML supported)</span></Label>
            <Textarea
              className="mt-1.5 min-h-[220px] resize-y font-mono text-sm"
              placeholder={form.content_type === "faq" ? "Q: Your question here?\n\nA: Your answer here..." : "Write your article content here. You can use HTML for formatting.\n\n<h2>Section title</h2>\n<p>Paragraph text...</p>\n<ul><li>List item</li></ul>"}
              value={form.body}
              onChange={e => set("body", e.target.value)}
            />
          </div>
          <div>
            <Label>Thumbnail URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input className="mt-1.5" placeholder="https://..." value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)} />
          </div>
          <div>
            <Label>Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input className="mt-1.5" placeholder="invoicing, getting started, billing" value={form.tags} onChange={e => set("tags", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pinned / Featured</Label>
              <Select value={form.pinned} onValueChange={v => set("pinned", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">Yes — pin to top</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order</Label>
              <Input className="mt-1.5" type="number" min="0" value={form.order_index} onChange={e => set("order_index", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {article ? "Save Changes" : "Create Article"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Category Modal ───────────────────────────────────────────────────────────

function CategoryModal({ category, onClose, onSaved }: {
  category: HelpCategory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "💡",
    color: category?.color || "blue",
    order_index: String(category?.order_index ?? 0),
  });
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const method = category ? "PUT" : "POST";
      const url = category ? `/api/help/admin/categories/${category.id}` : "/api/help/admin/categories";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order_index: parseInt(form.order_index) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(category ? "Category updated" : "Category created");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{category ? "Edit Category" : "New Category"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label>Category Name <span className="text-red-500">*</span></Label>
            <Input className="mt-1.5" placeholder="e.g. Getting Started" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1.5 min-h-[70px] resize-none" placeholder="Brief description of this category..." value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div>
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ICON_OPTIONS.map(icon => (
                <button key={icon} onClick={() => set("icon", icon)}
                  className={`w-9 h-9 text-lg rounded-lg border-2 transition-all flex items-center justify-center ${form.icon === icon ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Colour</Label>
            <div className="flex gap-2 mt-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c.value} onClick={() => set("color", c.value)} title={c.label}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${c.swatch} ${form.color === c.value ? "border-foreground scale-110 ring-2 ring-offset-1 ring-foreground/30" : "border-white/50 hover:scale-105"}`} />
              ))}
            </div>
          </div>
          <div>
            <Label>Display Order</Label>
            <Input className="mt-1.5 w-24" type="number" min="0" value={form.order_index} onChange={e => set("order_index", e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </div>
    </div>
  );
}
