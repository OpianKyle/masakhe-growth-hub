import { useState, useEffect } from "react";
import { Loader2, Search, ArrowLeft, Eye, Pin, ArrowRight, Video, HelpCircle, FileText, X } from "lucide-react";

interface HelpCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  order_index: number;
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

const COLOR_STRIPE: Record<string, string> = {
  blue:   "bg-blue-500",
  green:  "bg-green-500",
  purple: "bg-purple-500",
  amber:  "bg-amber-500",
  red:    "bg-red-500",
  cyan:   "bg-cyan-500",
  indigo: "bg-indigo-500",
  slate:  "bg-slate-400",
};
const COLOR_TEXT: Record<string, string> = {
  blue:   "text-blue-600",
  green:  "text-green-600",
  purple: "text-purple-600",
  amber:  "text-amber-600",
  red:    "text-red-600",
  cyan:   "text-cyan-600",
  indigo: "text-indigo-600",
  slate:  "text-slate-500",
};
const COLOR_DOT: Record<string, string> = {
  blue:   "bg-blue-500",
  green:  "bg-green-500",
  purple: "bg-purple-500",
  amber:  "bg-amber-500",
  red:    "bg-red-500",
  cyan:   "bg-cyan-500",
  indigo: "bg-indigo-500",
  slate:  "bg-slate-400",
};
const TYPE_LABEL: Record<string, string> = { article: "Article", video: "Video guide", faq: "FAQ" };
const TYPE_ICON: Record<string, React.ElementType> = { article: FileText, video: Video, faq: HelpCircle };

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return m ? m[1] : null;
}
function getVimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}
function buildEmbedUrl(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  const vmId = getVimeoId(url);
  if (vmId) return `https://player.vimeo.com/video/${vmId}`;
  return null;
}

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
      setSelectedArticle(res.ok ? await res.json() : article);
    } catch { setSelectedArticle(article); }
    finally { setArticleLoading(false); }
  }

  async function searchArticles(q: string) {
    setSearch(q);
    const url = q.trim() ? `/api/help/articles?q=${encodeURIComponent(q)}` : "/api/help/articles";
    const res = await fetch(url, { credentials: "include" });
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

  // ── Article detail ──────────────────────────────────────────────────────────
  if (selectedArticle) {
    const embedUrl = selectedArticle.video_url ? buildEmbedUrl(selectedArticle.video_url) : null;
    const TypeIcon = TYPE_ICON[selectedArticle.content_type] || FileText;
    const stripe = COLOR_STRIPE[selectedArticle.category_color || "blue"] || COLOR_STRIPE.blue;
    return (
      <div className="min-h-full">
        {/* Slim top accent stripe */}
        <div className={`h-1 w-full ${stripe}`} />

        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors uppercase tracking-widest font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Help Centre
            {selectedArticle.category_name && (
              <>
                <span className="opacity-40 mx-0.5">/</span>
                <span>{selectedArticle.category_icon} {selectedArticle.category_name}</span>
              </>
            )}
          </button>

          {/* Type pill */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${COLOR_TEXT[selectedArticle.category_color || "blue"] || COLOR_TEXT.blue}`}>
              <TypeIcon className="h-3.5 w-3.5" />
              {TYPE_LABEL[selectedArticle.content_type]}
            </span>
            {!!selectedArticle.pinned && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-semibold uppercase tracking-wider">
                <Pin className="h-3 w-3" />Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight text-foreground mb-3">
            {selectedArticle.title}
          </h1>
          {selectedArticle.summary && (
            <p className="text-muted-foreground text-base leading-relaxed mb-2">
              {selectedArticle.summary}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-8 border-b">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{selectedArticle.view_count} views</span>
            <span>{new Date(selectedArticle.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          {/* Video */}
          {embedUrl && (
            <div className="aspect-video w-full overflow-hidden mb-8 bg-black">
              <iframe src={embedUrl} className="w-full h-full" allowFullScreen frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          )}

          {/* Body */}
          {selectedArticle.body && (
            <div
              className="text-foreground leading-relaxed text-[15px]"
              style={{
                fontFamily: "inherit",
                lineHeight: "1.8",
              }}
              dangerouslySetInnerHTML={{ __html: selectedArticle.body }}
            />
          )}

          {/* Tags */}
          {selectedArticle.tags && (
            <div className="mt-10 pt-6 border-t flex flex-wrap gap-2">
              {selectedArticle.tags.split(",").map(t => (
                <span key={t} className="text-xs text-muted-foreground border border-border px-2.5 py-1 rounded-sm hover:border-foreground/30 transition-colors">
                  {t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const pinnedArticles = articles.filter(a => a.pinned);
  const regularArticles = articles.filter(a => !a.pinned);

  // ── Main listing ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full">
      {/* Hero band */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mb-3">Documentation & Guides</p>
        <h1 className="text-3xl font-bold text-white mb-2">How can we help?</h1>
        <p className="text-slate-400 text-sm mb-7">Guides, tutorials and answers for South African businesses using Masakhe</p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles, guides, FAQs…"
            className="w-full bg-white/10 backdrop-blur-sm text-white placeholder:text-slate-400 border border-white/20 rounded-none px-4 pl-11 pr-10 h-12 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all"
            value={search}
            onChange={e => searchArticles(e.target.value)}
          />
          {search && (
            <button onClick={() => searchArticles("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category nav strip */}
      {categories.length > 0 && !search && (
        <div className="border-b bg-background">
          <div className="max-w-4xl mx-auto px-6 flex gap-0 overflow-x-auto scrollbar-none">
            <button
              onClick={() => filterByCategory(null)}
              className={`shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${!selectedCategory ? "border-amber-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              All topics
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => filterByCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${selectedCategory?.id === cat.id ? "border-amber-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <span>{cat.icon}</span>{cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Empty state */}
          {articles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📭</p>
              <p className="font-semibold text-foreground">{search ? "No results found" : "Nothing here yet"}</p>
              <p className="text-sm text-muted-foreground mt-1">{search ? `Try a different search term` : "Check back soon — guides are coming."}</p>
            </div>
          )}

          {/* Search results header */}
          {search && articles.length > 0 && (
            <p className="text-sm text-muted-foreground mb-6 pb-4 border-b">
              <strong className="text-foreground">{articles.length}</strong> result{articles.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
          )}

          {/* Category overview tiles — shown when no filter, no search */}
          {!search && !selectedCategory && categories.length > 0 && (
            <div className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-l">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => filterByCategory(cat)}
                    className="group text-left p-5 border-b border-r hover:bg-muted/40 transition-colors flex gap-4 items-start"
                  >
                    <span className="text-2xl mt-0.5">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{cat.name}</p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      {cat.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pinned articles */}
          {pinnedArticles.length > 0 && !search && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-0">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                  <Pin className="h-3 w-3" />Featured
                </span>
                <div className="flex-1 border-b border-amber-200/60" />
              </div>
              <div>
                {pinnedArticles.map((article, i) => (
                  <ArticleRow
                    key={article.id}
                    article={article}
                    onClick={() => openArticle(article)}
                    last={i === pinnedArticles.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular articles */}
          {(search ? articles : regularArticles).length > 0 && (
            <div>
              {!search && (
                <div className="flex items-center gap-3 mb-0">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : "All Articles"}
                  </span>
                  <div className="flex-1 border-b" />
                </div>
              )}
              <div>
                {(search ? articles : regularArticles).map((article, i, arr) => (
                  <ArticleRow
                    key={article.id}
                    article={article}
                    onClick={() => openArticle(article)}
                    last={i === arr.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {articleLoading && (
        <div className="fixed inset-0 bg-background/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

function ArticleRow({ article, onClick, last }: { article: HelpArticle; onClick: () => void; last: boolean }) {
  const stripe = COLOR_STRIPE[article.category_color || "slate"] || "bg-slate-300";
  const TypeIcon = TYPE_ICON[article.content_type] || FileText;
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left flex items-center gap-0 hover:bg-muted/40 transition-colors ${last ? "" : "border-b"}`}
    >
      {/* Left colour stripe by type */}
      <span className={`w-[3px] self-stretch shrink-0 ${article.content_type === "video" ? "bg-purple-500" : article.content_type === "faq" ? "bg-amber-400" : "bg-blue-400"} opacity-60 group-hover:opacity-100 transition-opacity`} />
      <div className="flex-1 flex items-center gap-4 px-5 py-4 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors leading-snug">{article.title}</p>
          {article.summary && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{article.summary}</p>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-right">
          {article.category_name && (
            <span className="text-xs text-muted-foreground">{article.category_icon} {article.category_name}</span>
          )}
          <span className={`text-[11px] font-medium flex items-center gap-1 ${article.content_type === "video" ? "text-purple-500" : article.content_type === "faq" ? "text-amber-500" : "text-blue-500"}`}>
            <TypeIcon className="h-3 w-3" />
            {TYPE_LABEL[article.content_type]}
          </span>
          {!!article.pinned && <Pin className="h-3 w-3 text-amber-400" />}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 shrink-0" />
      </div>
    </button>
  );
}
