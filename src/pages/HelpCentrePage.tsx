import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ArrowLeft, Eye, Pin, ChevronRight, BookOpen, Video, HelpCircle, FileText, X } from "lucide-react";

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
  category_icon?: string;
  category_color?: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  content_type: "article" | "video" | "faq";
  video_url?: string;
  thumbnail_url?: string;
  tags?: string;
  status: string;
  pinned: number;
  view_count: number;
  created_at: string;
}

const COLOR_BG: Record<string, string> = {
  blue:   "bg-blue-50 text-blue-700 border-blue-200",
  green:  "bg-green-50 text-green-700 border-green-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  amber:  "bg-amber-50 text-amber-700 border-amber-200",
  red:    "bg-red-50 text-red-700 border-red-200",
  cyan:   "bg-cyan-50 text-cyan-700 border-cyan-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  slate:  "bg-slate-100 text-slate-700 border-slate-200",
};
const COLOR_ICON: Record<string, string> = {
  blue:   "bg-blue-100 text-blue-600",
  green:  "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  amber:  "bg-amber-100 text-amber-600",
  red:    "bg-red-100 text-red-600",
  cyan:   "bg-cyan-100 text-cyan-600",
  indigo: "bg-indigo-100 text-indigo-600",
  slate:  "bg-slate-100 text-slate-600",
};

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return m ? m[1] : null;
}
function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}
function buildEmbedUrl(videoUrl: string): string | null {
  const ytId = getYouTubeId(videoUrl);
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  const vmId = getVimeoId(videoUrl);
  if (vmId) return `https://player.vimeo.com/video/${vmId}`;
  return null;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  article: FileText,
  video:   Video,
  faq:     HelpCircle,
};
const TYPE_LABEL: Record<string, string> = {
  article: "Article",
  video:   "Video",
  faq:     "FAQ",
};

export default function HelpCentrePage() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/help/categories", { credentials: "include" }).then(r => r.json()),
      fetch("/api/help/articles", { credentials: "include" }).then(r => r.json()),
    ]).then(([cats, arts]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setArticles(Array.isArray(arts) ? arts : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function openArticle(article: HelpArticle) {
    setArticleLoading(true);
    try {
      const res = await fetch(`/api/help/articles/${article.id}`, { credentials: "include" });
      if (res.ok) setSelectedArticle(await res.json());
      else setSelectedArticle(article);
    } catch { setSelectedArticle(article); }
    finally { setArticleLoading(false); }
  }

  async function searchArticles(q: string) {
    setSearch(q);
    if (!q.trim()) {
      const res = await fetch("/api/help/articles", { credentials: "include" });
      if (res.ok) setArticles(await res.json());
      return;
    }
    const res = await fetch(`/api/help/articles?q=${encodeURIComponent(q)}`, { credentials: "include" });
    if (res.ok) setArticles(await res.json());
  }

  async function filterByCategory(cat: HelpCategory | null) {
    setSelectedCategory(cat);
    setSelectedArticle(null);
    setSearch("");
    const url = cat ? `/api/help/articles?category=${cat.id}` : "/api/help/articles";
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) setArticles(await res.json());
  }

  // Article detail view
  if (selectedArticle) {
    const embedUrl = selectedArticle.video_url ? buildEmbedUrl(selectedArticle.video_url) : null;
    const TypeIcon = TYPE_ICON[selectedArticle.content_type] || FileText;
    const catColor = selectedArticle.category_color || "blue";
    return (
      <div className="max-w-3xl mx-auto p-6">
        <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Help Centre
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {selectedArticle.category_name && (
              <Badge className={`${COLOR_BG[catColor] || COLOR_BG.blue} border text-xs gap-1`}>
                <span>{selectedArticle.category_icon}</span>{selectedArticle.category_name}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs gap-1">
              <TypeIcon className="h-3 w-3" />{TYPE_LABEL[selectedArticle.content_type]}
            </Badge>
            {!!selectedArticle.pinned && <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs gap-1"><Pin className="h-3 w-3" />Pinned</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{selectedArticle.title}</h1>
          {selectedArticle.summary && <p className="text-muted-foreground text-base leading-relaxed">{selectedArticle.summary}</p>}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{selectedArticle.view_count} views</span>
            <span>{new Date(selectedArticle.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        {embedUrl && (
          <div className="aspect-video w-full rounded-xl overflow-hidden mb-6 border shadow-sm bg-black">
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </div>
        )}

        {selectedArticle.body && (
          <div className="prose prose-sm max-w-none text-foreground rounded-xl border bg-card p-6"
            style={{ fontFamily: "inherit", lineHeight: "1.75" }}
            dangerouslySetInnerHTML={{ __html: selectedArticle.body }} />
        )}

        {selectedArticle.tags && (
          <div className="mt-6 flex flex-wrap gap-2">
            {selectedArticle.tags.split(",").map(t => (
              <span key={t} className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs">{t.trim()}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  const pinnedArticles = articles.filter(a => a.pinned);
  const regularArticles = articles.filter(a => !a.pinned);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Help Centre</h1>
        <p className="text-muted-foreground text-base">Guides, tutorials, and answers to help you get the most out of Masakhe</p>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles, guides, FAQs..."
            className="pl-10 pr-10 h-12 rounded-xl text-base"
            value={search}
            onChange={e => searchArticles(e.target.value)}
          />
          {search && (
            <button onClick={() => searchArticles("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Category filter chips */}
          {categories.length > 0 && !search && (
            <div className="flex gap-2 flex-wrap mb-6 justify-center">
              <button onClick={() => filterByCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${!selectedCategory ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"}`}>
                All Topics
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => filterByCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border gap-1.5 flex items-center ${selectedCategory?.id === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"}`}>
                  <span>{cat.icon}</span>{cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Category cards (shown when no search, no category selected) */}
          {!search && !selectedCategory && categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => filterByCategory(cat)}
                  className="text-left p-5 rounded-xl border-2 border-border hover:border-primary/40 hover:shadow-md transition-all bg-card group">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-2xl ${COLOR_ICON[cat.color] || COLOR_ICON.blue}`}>
                    {cat.icon}
                  </div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</p>
                  {cat.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {articles.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{search ? "No articles found" : "No articles yet"}</p>
              <p className="text-sm mt-1">{search ? "Try a different search term" : "Check back soon for guides and tutorials"}</p>
            </div>
          )}

          {/* Pinned / featured articles */}
          {pinnedArticles.length > 0 && !search && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Pin className="h-3.5 w-3.5" />Featured
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {pinnedArticles.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />)}
              </div>
            </div>
          )}

          {/* Regular articles */}
          {(regularArticles.length > 0 || search) && (
            <div>
              {!search && regularArticles.length > 0 && (
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {selectedCategory ? selectedCategory.name : "All Articles"}
                </h2>
              )}
              {search && (
                <p className="text-sm text-muted-foreground mb-3">
                  {articles.length} result{articles.length !== 1 ? "s" : ""} for "<strong>{search}</strong>"
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {(search ? articles : regularArticles).map(article => (
                  <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {articleLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article, onClick }: { article: HelpArticle; onClick: () => void }) {
  const TypeIcon = TYPE_ICON[article.content_type] || FileText;
  const catColor = article.category_color || "blue";
  return (
    <button onClick={onClick}
      className="text-left p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/40 transition-all group flex gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${COLOR_ICON[catColor] || COLOR_ICON.blue}`}>
        <TypeIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">{article.title}</p>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>
        {article.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>}
        <div className="flex items-center gap-2 mt-2">
          {article.category_name && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {article.category_icon} {article.category_name}
            </span>
          )}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${article.content_type === "video" ? "bg-purple-100 text-purple-700" : article.content_type === "faq" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
            {TYPE_LABEL[article.content_type]}
          </span>
          {!!article.pinned && <Pin className="h-3 w-3 text-amber-500" />}
        </div>
      </div>
    </button>
  );
}
