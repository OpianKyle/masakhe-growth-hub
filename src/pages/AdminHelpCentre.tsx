import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, X, Loader2, Video, HelpCircle, FileText,
  Pin, Eye, Search, Save, ArrowUpDown, Upload, Film
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
const COLOR_DOT: Record<string, string> = {
  blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500",
  amber: "bg-amber-500", red: "bg-red-500", cyan: "bg-cyan-500",
  indigo: "bg-indigo-500", slate: "bg-slate-400",
};
const TYPE_ICON: Record<string, React.ElementType> = { article: FileText, video: Video, faq: HelpCircle };

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
    if (res.ok) { toast.success(newStatus === "published" ? "Published" : "Moved to draft"); loadAll(); }
    else toast.error("Failed to update");
  }

  const filteredArticles = articles.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !search || a.title.toLowerCase().includes(q) || (a.summary || "").toLowerCase().includes(q);
    const matchCat = filterCat === "all" || a.category_id === filterCat;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const published = articles.filter(a => a.status === "published").length;
  const drafts = articles.filter(a => a.status === "draft").length;

  return (
    <div className="min-h-full flex flex-col">
      {/* ── Top header bar ─────────────────────────────────────────────────── */}
      <div className="border-b bg-background px-6 py-5 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Help Centre</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage self-help content for Masakhe users</p>
        </div>
        <Button
          onClick={() => tab === "articles" ? setEditArticle("new") : setEditCategory("new")}
          size="sm"
          className="gap-1.5 rounded-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          {tab === "articles" ? "New Article" : "New Category"}
        </Button>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <div className="border-b bg-muted/30 px-6 py-2.5 flex gap-0 text-sm divide-x">
        {[
          { label: "Total", value: articles.length },
          { label: "Published", value: published, accent: "text-green-600" },
          { label: "Draft", value: drafts, accent: "text-muted-foreground" },
          { label: "Categories", value: categories.length },
        ].map(s => (
          <div key={s.label} className="flex items-baseline gap-1.5 px-4 first:pl-0">
            <span className={`text-lg font-bold tabular-nums ${s.accent || "text-foreground"}`}>{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Tabs (underline style) ──────────────────────────────────────────── */}
      <div className="border-b bg-background px-6 flex gap-0">
        {(["articles", "categories"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
            <span className={`ml-1.5 text-xs tabular-nums ${tab === t ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
              ({t === "articles" ? articles.length : categories.length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">

        {/* Articles tab */}
        {tab === "articles" && (
          <div>
            {/* Toolbar */}
            <div className="flex gap-2 px-6 py-3 border-b bg-muted/20 flex-wrap">
              <div className="relative flex-1 min-w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search articles…"
                  className="pl-8 h-8 text-sm rounded-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger className="w-40 h-8 text-sm rounded-sm"><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-8 text-sm rounded-sm"><SelectValue placeholder="All status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Column headers */}
            {filteredArticles.length > 0 && (
              <div className="hidden sm:grid grid-cols-[3fr_1fr_1fr_auto] gap-4 px-6 py-2 border-b bg-muted/10 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <span className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" />Title</span>
                <span>Category</span>
                <span>Status</span>
                <span className="pr-2">Actions</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-3xl mb-3">📄</p>
                <p className="font-medium text-foreground">No articles yet</p>
                <p className="text-sm mt-1 mb-5">Create your first help article to get started</p>
                <Button size="sm" onClick={() => setEditArticle("new")} className="rounded-sm"><Plus className="h-3.5 w-3.5 mr-1" />New Article</Button>
              </div>
            ) : (
              <div>
                {filteredArticles.map((article, i) => {
                  const TypeIcon = TYPE_ICON[article.content_type] || FileText;
                  const isPublished = article.status === "published";
                  return (
                    <div
                      key={article.id}
                      className={`flex items-center gap-0 border-b hover:bg-muted/30 transition-colors group ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                    >
                      {/* Status stripe */}
                      <div className={`w-[3px] self-stretch shrink-0 transition-colors ${isPublished ? "bg-green-500" : "bg-border"}`} />

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr_auto] gap-x-4 items-center px-5 py-3">
                        {/* Title col */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <TypeIcon className={`h-3.5 w-3.5 shrink-0 ${article.content_type === "video" ? "text-purple-500" : article.content_type === "faq" ? "text-amber-500" : "text-blue-500"}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                            {article.summary && <p className="text-xs text-muted-foreground truncate">{article.summary}</p>}
                          </div>
                          {!!article.pinned && <Pin className="h-3 w-3 text-amber-400 shrink-0" />}
                        </div>

                        {/* Category */}
                        <div className="hidden sm:flex items-center gap-1.5">
                          {article.category_name ? (
                            <span className="text-xs text-muted-foreground truncate">{article.category_name}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </div>

                        {/* Status + views */}
                        <div className="hidden sm:flex items-center gap-2">
                          <span className={`text-xs font-medium ${isPublished ? "text-green-600" : "text-muted-foreground"}`}>
                            {isPublished ? "Live" : "Draft"}
                          </span>
                          <span className="text-xs text-muted-foreground/60 flex items-center gap-0.5">
                            <Eye className="h-2.5 w-2.5" />{article.view_count}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => togglePublish(article)}
                            className={`text-xs px-2 py-1 border rounded-sm transition-colors ${isPublished ? "text-muted-foreground hover:border-red-300 hover:text-red-600" : "text-green-600 border-green-200 hover:bg-green-50"}`}
                          >
                            {isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button onClick={() => setEditArticle(article)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-sm hover:bg-muted transition-colors">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteArticle(article.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-sm hover:bg-red-50 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Categories tab */}
        {tab === "categories" && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-3xl mb-3">🗂️</p>
                <p className="font-medium text-foreground">No categories yet</p>
                <p className="text-sm mt-1 mb-5">Categories help users navigate your help content</p>
                <Button size="sm" onClick={() => setEditCategory("new")} className="rounded-sm"><Plus className="h-3.5 w-3.5 mr-1" />New Category</Button>
              </div>
            ) : (
              <div>
                {/* Column header */}
                <div className="hidden sm:grid grid-cols-[2fr_3fr_auto_auto] gap-6 px-6 py-2 border-b bg-muted/10 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  <span>Category</span>
                  <span>Description</span>
                  <span>Articles</span>
                  <span className="pr-2">Actions</span>
                </div>
                {categories.map((cat, i) => (
                  <div
                    key={cat.id}
                    className={`group flex items-center gap-0 border-b hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                  >
                    <div className={`w-[3px] self-stretch shrink-0 ${COLOR_DOT[cat.color] || "bg-slate-400"}`} />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-[2fr_3fr_auto_auto] gap-x-6 items-center px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="font-medium text-sm text-foreground">{cat.name}</span>
                      </div>
                      <p className="hidden sm:block text-xs text-muted-foreground truncate">{cat.description || <span className="opacity-40">No description</span>}</p>
                      <span className="hidden sm:block text-xs text-muted-foreground tabular-nums">
                        {cat.article_count ?? 0} article{cat.article_count !== 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditCategory(cat)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-sm hover:bg-muted transition-colors">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-sm hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {editArticle !== null && (
        <ArticleModal
          article={editArticle === "new" ? null : editArticle}
          categories={categories}
          onClose={() => setEditArticle(null)}
          onSaved={() => { setEditArticle(null); loadAll(); }}
        />
      )}
      {editCategory !== null && (
        <CategoryModal
          category={editCategory === "new" ? null : editCategory}
          onClose={() => setEditCategory(null)}
          onSaved={() => { setEditCategory(null); loadAll(); }}
        />
      )}
    </div>
  );
}

// ── Article Modal ─────────────────────────────────────────────────────────────

function ArticleModal({ article, categories, onClose, onSaved }: {
  article: HelpArticle | null;
  categories: HelpCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
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
        body: JSON.stringify({ ...form, category_id: form.category_id || null, pinned: form.pinned === "1" ? 1 : 0, order_index: parseInt(form.order_index) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(article ? "Article updated" : "Article created");
      onSaved();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background w-full max-w-2xl my-8 shadow-2xl border">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-foreground">{article ? "Edit Article" : "New Article"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title <span className="text-red-500">*</span></Label>
            <Input className="mt-1.5 rounded-sm" placeholder="e.g. How to create your first invoice" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select value={form.category_id || "none"} onValueChange={v => set("category_id", v === "none" ? "" : v)}>
                <SelectTrigger className="mt-1.5 rounded-sm"><SelectValue placeholder="No category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select value={form.content_type} onValueChange={v => set("content_type", v)}>
                <SelectTrigger className="mt-1.5 rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">📄 Article</SelectItem>
                  <SelectItem value="video">🎬 Video</SelectItem>
                  <SelectItem value="faq">❓ FAQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</Label>
            <Textarea className="mt-1.5 min-h-[56px] resize-none rounded-sm text-sm" placeholder="Brief description shown in the article list…" value={form.summary} onChange={e => set("summary", e.target.value)} />
          </div>
          {form.content_type === "video" && (
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Video</Label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska,.mp4,.mov,.webm,.avi,.mkv,.m4v"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 500 * 1024 * 1024) {
                    toast.error("Video must be under 500MB");
                    if (videoInputRef.current) videoInputRef.current.value = "";
                    return;
                  }
                  setUploadingVideo(true);
                  try {
                    const fd = new FormData();
                    fd.append("video", file);
                    const res = await fetch("/api/help/admin/upload-video", { method: "POST", credentials: "include", body: fd });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    set("video_url", data.url);
                    toast.success("Video uploaded");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to upload video");
                  } finally {
                    setUploadingVideo(false);
                    if (videoInputRef.current) videoInputRef.current.value = "";
                  }
                }}
              />
              {form.video_url ? (
                <div className="mt-1.5 border rounded-sm overflow-hidden bg-black">
                  <video src={form.video_url} controls className="w-full max-h-56" />
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <Film className="h-3.5 w-3.5 shrink-0" /> {form.video_url.split("/").pop()}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button type="button" variant="outline" size="sm" className="h-7 rounded-sm text-xs" disabled={uploadingVideo} onClick={() => videoInputRef.current?.click()}>
                        {uploadingVideo ? <Loader2 className="h-3 w-3 animate-spin" /> : "Replace"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-7 rounded-sm text-xs text-red-500 hover:text-red-600" onClick={() => set("video_url", "")}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="mt-1.5 w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-sm py-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
                >
                  {uploadingVideo ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  <span className="text-sm font-medium">{uploadingVideo ? "Uploading…" : "Click to upload a video file"}</span>
                  <span className="text-xs">MP4, MOV, WebM, AVI, MKV — up to 500MB</span>
                </button>
              )}
            </div>
          )}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body <span className="normal-case font-normal tracking-normal text-muted-foreground/60">(HTML supported)</span></Label>
            <Textarea
              className="mt-1.5 min-h-[200px] resize-y font-mono text-sm rounded-sm"
              placeholder={form.content_type === "faq"
                ? "Q: Your question?\n\nA: Your answer here…"
                : "<h2>Section</h2>\n<p>Content here…</p>\n<ul><li>Item</li></ul>"}
              value={form.body}
              onChange={e => set("body", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags <span className="normal-case font-normal tracking-normal text-muted-foreground/60">(comma-separated)</span></Label>
            <Input className="mt-1.5 rounded-sm" placeholder="invoicing, payroll, getting started" value={form.tags} onChange={e => set("tags", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="mt-1.5 rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Featured</Label>
              <Select value={form.pinned} onValueChange={v => set("pinned", v)}>
                <SelectTrigger className="mt-1.5 rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">Yes — pin to top</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</Label>
              <Input className="mt-1.5 rounded-sm" type="number" min="0" value={form.order_index} onChange={e => set("order_index", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose} size="sm" className="rounded-sm">Cancel</Button>
          <Button onClick={save} disabled={saving} size="sm" className="gap-1.5 rounded-sm">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {article ? "Save Changes" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Category Modal ────────────────────────────────────────────────────────────

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
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background w-full max-w-md shadow-2xl border">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-foreground">{category ? "Edit Category" : "New Category"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name <span className="text-red-500">*</span></Label>
            <Input className="mt-1.5 rounded-sm" placeholder="e.g. Getting Started" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea className="mt-1.5 min-h-[60px] resize-none rounded-sm text-sm" placeholder="Brief description…" value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ICON_OPTIONS.map(icon => (
                <button key={icon} onClick={() => set("icon", icon)}
                  className={`w-9 h-9 text-lg flex items-center justify-center border transition-all rounded-sm ${form.icon === icon ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colour</Label>
            <div className="flex gap-2 mt-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c.value} onClick={() => set("color", c.value)} title={c.label}
                  className={`w-7 h-7 rounded-sm border-2 transition-all ${c.swatch} ${form.color === c.value ? "border-foreground scale-110 ring-2 ring-offset-1 ring-foreground/20" : "border-transparent hover:scale-105"}`} />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</Label>
            <Input className="mt-1.5 w-20 rounded-sm" type="number" min="0" value={form.order_index} onChange={e => set("order_index", e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 justify-end px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose} size="sm" className="rounded-sm">Cancel</Button>
          <Button onClick={save} disabled={saving} size="sm" className="gap-1.5 rounded-sm">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {category ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
