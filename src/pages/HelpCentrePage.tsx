import { useState, useEffect } from "react";
import {
  Loader2, Search, ArrowLeft, Eye, Pin, ArrowRight,
  Video, HelpCircle, FileText, X, BookOpen, Sparkles,
} from "lucide-react";

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

const CAT_GRADIENT: Record<string, string> = {
  blue:   "from-blue-500 to-blue-600",
  green:  "from-emerald-500 to-emerald-600",
  purple: "from-violet-500 to-violet-600",
  amber:  "from-amber-400 to-amber-500",
  red:    "from-rose-500 to-rose-600",
  cyan:   "from-cyan-500 to-cyan-600",
  indigo: "from-indigo-500 to-indigo-600",
  slate:  "from-slate-500 to-slate-600",
};
const CAT_BG: Record<string, string> = {
  blue:   "bg-blue-50 dark:bg-blue-950/30",
  green:  "bg-emerald-50 dark:bg-emerald-950/30",
  purple: "bg-violet-50 dark:bg-violet-950/30",
  amber:  "bg-amber-50 dark:bg-amber-950/30",
  red:    "bg-rose-50 dark:bg-rose-950/30",
  cyan:   "bg-cyan-50 dark:bg-cyan-950/30",
  indigo: "bg-indigo-50 dark:bg-indigo-950/30",
  slate:  "bg-slate-50 dark:bg-slate-900/30",
};
const CAT_BORDER: Record<string, string> = {
  blue:   "border-blue-200 dark:border-blue-800",
  green:  "border-emerald-200 dark:border-emerald-800",
  purple: "border-violet-200 dark:border-violet-800",
  amber:  "border-amber-200 dark:border-amber-800",
  red:    "border-rose-200 dark:border-rose-800",
  cyan:   "border-cyan-200 dark:border-cyan-800",
  indigo: "border-indigo-200 dark:border-indigo-800",
  slate:  "border-slate-200 dark:border-slate-800",
};
const CAT_TEXT: Record<string, string> = {
  blue:   "text-blue-700 dark:text-blue-300",
  green:  "text-emerald-700 dark:text-emerald-300",
  purple: "text-violet-700 dark:text-violet-300",
  amber:  "text-amber-700 dark:text-amber-300",
  red:    "text-rose-700 dark:text-rose-300",
  cyan:   "text-cyan-700 dark:text-cyan-300",
  indigo: "text-indigo-700 dark:text-indigo-300",
  slate:  "text-slate-700 dark:text-slate-300",
};

const TYPE_CONFIG = {
  article: { label: "Article",     icon: FileText,   bg: "bg-blue-100 dark:bg-blue-900/40",   text: "text-blue-700 dark:text-blue-300"   },
  video:   { label: "Video guide", icon: Video,       bg: "bg-violet-100 dark:bg-violet-900/40",text: "text-violet-700 dark:text-violet-300"},
  faq:     { label: "FAQ",         icon: HelpCircle, bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
};

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
function isUploadedVideo(url: string): boolean {
  return /\.(mp4|mov|webm|avi|mkv|m4v)$/i.test(url) || url.includes("/uploads/help-videos/");
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
      fetch("/api/help/articles",   { credentials: "include" }).then(r => r.json()),
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
    finally   { setArticleLoading(false); }
  }

  async function searchArticles(q: string) {
    setSearch(q);
    const url = q.trim()
      ? `/api/help/articles?q=${encodeURIComponent(q)}`
      : "/api/help/articles";
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

  // ── Article detail view ──────────────────────────────────────────────────────
  if (selectedArticle) {
    const uploadedVideo = selectedArticle.video_url && isUploadedVideo(selectedArticle.video_url)
      ? selectedArticle.video_url : null;
    const embedUrl = !uploadedVideo && selectedArticle.video_url
      ? buildEmbedUrl(selectedArticle.video_url) : null;
    const tc = TYPE_CONFIG[selectedArticle.content_type] || TYPE_CONFIG.article;
    const TypeIcon = tc.icon;
    const grad = CAT_GRADIENT[selectedArticle.category_color || "blue"] || CAT_GRADIENT.blue;

    return (
      <div className="min-h-full bg-background">
        {/* Accent top bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />

        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <button
            onClick={() => setSelectedArticle(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground mb-8 transition-colors"
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

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${tc.bg} ${tc.text}`}>
              <TypeIcon className="h-3.5 w-3.5" />
              {tc.label}
            </span>
            {!!selectedArticle.pinned && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                <Pin className="h-3 w-3" /> Featured
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
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-8 border-b border-border">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              {selectedArticle.view_count} views
            </span>
            <span>{new Date(selectedArticle.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          {/* Video */}
          {uploadedVideo && (
            <div className="aspect-video w-full overflow-hidden rounded-xl mb-8 bg-black shadow-lg">
              <video src={uploadedVideo} controls className="w-full h-full" />
            </div>
          )}
          {embedUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-xl mb-8 bg-black shadow-lg">
              <iframe src={embedUrl} className="w-full h-full" allowFullScreen frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          )}

          {/* Body */}
          {selectedArticle.body && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed"
              style={{ lineHeight: "1.8" }}
              dangerouslySetInnerHTML={{ __html: selectedArticle.body }}
            />
          )}

          {/* Tags */}
          {selectedArticle.tags && (
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
              {selectedArticle.tags.split(",").map(t => (
                <span key={t} className="text-xs text-muted-foreground border border-border px-2.5 py-1 rounded-full hover:border-foreground/30 transition-colors">
                  {t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const pinnedArticles  = articles.filter(a =>  a.pinned);
  const regularArticles = articles.filter(a => !a.pinned);

  // article count per category
  const articleCountMap = articles.reduce<Record<string, number>>((acc, a) => {
    if (a.category_id) acc[a.category_id] = (acc[a.category_id] || 0) + 1;
    return acc;
  }, {});

  // ── Main listing ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-background">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-14 text-center">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">Help Centre</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">How can we help?</h1>
          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
            Guides, tutorials and answers for South African businesses using Masakhe
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles, guides, FAQs…"
              className="w-full bg-white/10 backdrop-blur-sm text-white placeholder:text-slate-400 border border-white/20 rounded-2xl px-4 pl-11 pr-10 h-12 text-sm focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all"
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
      </div>

      {/* Category tab strip */}
      {categories.length > 0 && !search && (
        <div className="border-b border-border bg-background">
          <div className="max-w-5xl mx-auto px-6 flex gap-0 overflow-x-auto scrollbar-none">
            <button
              onClick={() => filterByCategory(null)}
              className={`shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${!selectedCategory ? "border-amber-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              All topics
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => filterByCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${selectedCategory?.id === cat.id ? "border-amber-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
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
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

          {/* Empty state */}
          {articles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">📭</div>
              <p className="font-bold text-foreground text-lg">{search ? "No results found" : "Nothing here yet"}</p>
              <p className="text-sm text-muted-foreground">
                {search ? `Try a different search term` : "Check back soon — guides are coming."}
              </p>
            </div>
          )}

          {/* Search results header */}
          {search && articles.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{articles.length}</strong> result{articles.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
          )}

          {/* Category cards — shown when no filter, no search */}
          {!search && !selectedCategory && categories.length > 0 && (
            <div>
              <SectionHeading icon={BookOpen} label="Browse by topic" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {categories.map(cat => {
                  const grad   = CAT_GRADIENT[cat.color] || CAT_GRADIENT.slate;
                  const bg     = CAT_BG[cat.color]       || CAT_BG.slate;
                  const border = CAT_BORDER[cat.color]   || CAT_BORDER.slate;
                  const text   = CAT_TEXT[cat.color]     || CAT_TEXT.slate;
                  const count  = articleCountMap[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => filterByCategory(cat)}
                      className={`group text-left rounded-2xl border ${border} ${bg} p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-3`}
                    >
                      {/* Icon circle */}
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-xl shadow-sm`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${text} group-hover:underline underline-offset-2 mb-1`}>{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">
                          {count} article{count !== 1 ? "s" : ""}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pinned / featured articles */}
          {pinnedArticles.length > 0 && !search && (
            <div>
              <SectionHeading icon={Pin} label="Featured" accent="amber" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {pinnedArticles.map(article => (
                  <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} featured />
                ))}
              </div>
            </div>
          )}

          {/* Regular / search articles */}
          {(search ? articles : regularArticles).length > 0 && (
            <div>
              {!search && (
                <SectionHeading
                  icon={BookOpen}
                  label={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : "All Articles"}
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {(search ? articles : regularArticles).map(article => (
                  <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Article loading overlay */}
      {articleLoading && (
        <div className="fixed inset-0 bg-background/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  label,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${accent === "amber" ? "bg-amber-100 dark:bg-amber-900/40" : "bg-muted"}`}>
        <Icon className={`h-3.5 w-3.5 ${accent === "amber" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} />
      </div>
      <span className="font-bold text-sm text-foreground uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function ArticleCard({
  article,
  onClick,
  featured = false,
}: {
  article: HelpArticle;
  onClick: () => void;
  featured?: boolean;
}) {
  const tc = TYPE_CONFIG[article.content_type] || TYPE_CONFIG.article;
  const TypeIcon = tc.icon;
  const grad   = CAT_GRADIENT[article.category_color || "slate"] || CAT_GRADIENT.slate;
  const border = CAT_BORDER[article.category_color || "slate"]   || CAT_BORDER.slate;

  return (
    <button
      onClick={onClick}
      className={`group text-left rounded-2xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden
        ${featured ? border : "border-border"}`}
    >
      {/* Top gradient accent line */}
      <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />

      <div className="p-5 flex flex-col gap-3">
        {/* Type + pinned badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>
            <TypeIcon className="h-3 w-3" />
            {tc.label}
          </span>
          {article.category_name && (
            <span className="text-[11px] text-muted-foreground font-medium">
              {article.category_icon} {article.category_name}
            </span>
          )}
          {!!article.pinned && (
            <Pin className="h-3 w-3 text-amber-400 ml-auto" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60 mt-auto">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            {article.view_count} views
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
}
