import { useState, useEffect } from "react";
import { Loader2, Search, ArrowLeft, Eye, Pin, X, FileText, Video, HelpCircle } from "lucide-react";

interface HelpCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  image_url?: string;
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
  slate:  "from-slate-400 to-slate-500",
};

const TYPE_CONFIG = {
  article: { label: "Article",     icon: FileText,   bg: "bg-blue-100",   text: "text-blue-700"   },
  video:   { label: "Video",       icon: Video,       bg: "bg-violet-100", text: "text-violet-700" },
  faq:     { label: "FAQ",         icon: HelpCircle, bg: "bg-amber-100",  text: "text-amber-700"  },
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
function getArticleThumbnail(article: HelpArticle): { kind: "img"; src: string } | { kind: "gradient" } {
  if (article.thumbnail_url) return { kind: "img", src: article.thumbnail_url };
  if (article.video_url) {
    const ytId = getYouTubeId(article.video_url);
    if (ytId) return { kind: "img", src: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` };
    const vmId = getVimeoId(article.video_url);
    if (vmId) return { kind: "img", src: `https://vumbnail.com/${vmId}.jpg` };
  }
  return { kind: "gradient" };
}

export default function HelpCentrePage() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
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

  async function doSearch(q: string) {
    setSearch(q);
    setSelectedCategory(null);
    const url = q.trim() ? `/api/help/articles?q=${encodeURIComponent(q)}` : "/api/help/articles";
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) setArticles(await res.json());
  }

  async function filterByCategory(cat: HelpCategory | null) {
    setSelectedCategory(cat);
    setSelectedArticle(null);
    setSearch("");
    setSearchInput("");
    const url = cat ? `/api/help/articles?category=${cat.id}` : "/api/help/articles";
    const res = await fetch(url, { credentials: "include" });
    if (res.ok) setArticles(await res.json());
  }

  function clearSearch() {
    setSearchInput("");
    doSearch("");
  }

  // ── Article detail view ─────────────────────────────────────────────────────
  if (selectedArticle) {
    const uploadedVideo = selectedArticle.video_url && isUploadedVideo(selectedArticle.video_url)
      ? selectedArticle.video_url : null;
    const embedUrl = !uploadedVideo && selectedArticle.video_url
      ? buildEmbedUrl(selectedArticle.video_url) : null;
    const tc = TYPE_CONFIG[selectedArticle.content_type] || TYPE_CONFIG.article;
    const TypeIcon = tc.icon;
    const grad = CAT_GRADIENT[selectedArticle.category_color || "blue"] || CAT_GRADIENT.blue;

    return (
      <div className="min-h-full bg-white">
        <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />
        <div className="max-w-2xl mx-auto px-6 py-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Help Centre
            {selectedArticle.category_name && (
              <><span className="opacity-40 mx-0.5">/</span><span>{selectedArticle.category_icon} {selectedArticle.category_name}</span></>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${tc.bg} ${tc.text}`}>
              <TypeIcon className="h-3.5 w-3.5" />{tc.label}
            </span>
            {!!selectedArticle.pinned && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                <Pin className="h-3 w-3" /> Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-3">{selectedArticle.title}</h1>
          {selectedArticle.summary && (
            <p className="text-gray-500 text-base leading-relaxed mb-2">{selectedArticle.summary}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400 mb-8 pb-8 border-b border-gray-100">
            <span className="flex items-center gap-1.5"><Eye className="h-3 w-3" />{selectedArticle.view_count} views</span>
            <span>{new Date(selectedArticle.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

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

          {selectedArticle.body && (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" style={{ lineHeight: "1.8" }}
              dangerouslySetInnerHTML={{ __html: selectedArticle.body }} />
          )}

          {selectedArticle.tags && (
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
              {selectedArticle.tags.split(",").map(t => (
                <span key={t} className="text-xs text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full hover:border-gray-400 transition-colors">
                  {t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const pinnedArticles   = articles.filter(a =>  a.pinned);
  const regularArticles  = articles.filter(a => !a.pinned);
  const popularArticles  = [...articles].sort((a, b) => b.view_count - a.view_count).slice(0, 6);
  const articleCountMap  = articles.reduce<Record<string, number>>((acc, a) => {
    if (a.category_id) acc[a.category_id] = (acc[a.category_id] || 0) + 1;
    return acc;
  }, {});

  // ── Main listing ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Decorative petals */}
        <svg className="pointer-events-none absolute top-0 left-0 w-48 h-48 opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="30" cy="30" r="18" fill="#f43f5e" />
          <circle cx="70" cy="15" r="12" fill="#f43f5e" />
          <circle cx="10" cy="70" r="14" fill="#f43f5e" />
          <circle cx="50" cy="55" r="10" fill="#fda4af" />
          <circle cx="100" cy="20" r="8"  fill="#fda4af" />
        </svg>
        <svg className="pointer-events-none absolute top-0 right-0 w-48 h-48 opacity-10" viewBox="0 0 200 200" fill="none">
          <circle cx="170" cy="30" r="18" fill="#f43f5e" />
          <circle cx="130" cy="15" r="12" fill="#f43f5e" />
          <circle cx="190" cy="70" r="14" fill="#f43f5e" />
          <circle cx="150" cy="55" r="10" fill="#fda4af" />
          <circle cx="100" cy="20" r="8"  fill="#fda4af" />
        </svg>

        <div className="relative z-10 py-12 px-6 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-7" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Welcome to our Help Centre
          </h1>

          {/* Search bar */}
          <div className="flex items-center max-w-lg mx-auto shadow-sm border border-gray-200 rounded-md overflow-hidden bg-white">
            <div className="pl-3 pr-2 flex items-center text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search for articles, guides, FAQs…"
              className="flex-1 h-11 px-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-white"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch(searchInput)}
            />
            {searchInput && (
              <button onClick={clearSearch} className="px-2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => doSearch(searchInput)}
              className="h-11 px-5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
            >
              Search
            </button>
          </div>

          {/* Category quick-links */}
          {categories.length > 0 && !search && (
            <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
              <button
                onClick={() => filterByCategory(null)}
                className={`text-sm transition-colors ${!selectedCategory ? "text-sky-600 font-semibold" : "text-gray-500 hover:text-sky-600"}`}
              >
                All topics
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => filterByCategory(cat)}
                  className={`text-sm transition-colors ${selectedCategory?.id === cat.id ? "text-sky-600 font-semibold" : "text-gray-500 hover:text-sky-600"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

          {/* Empty state */}
          {articles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">📭</div>
              <p className="font-bold text-gray-800 text-lg">{search ? "No results found" : "Nothing here yet"}</p>
              <p className="text-sm text-gray-400">{search ? "Try a different search term" : "Check back soon — guides are coming."}</p>
            </div>
          )}

          {/* Search results */}
          {search && articles.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-5">
                <strong className="text-gray-800">{articles.length}</strong> result{articles.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.map(article => (
                  <TopicCard key={article.id} article={article} articleCount={0} onClick={() => openArticle(article)} />
                ))}
              </div>
            </div>
          )}

          {!search && (
            <>
              {/* Featured Topics */}
              {(pinnedArticles.length > 0 || categories.length > 0) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-7">
                    {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : "Featured Topics"}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {(selectedCategory
                      ? regularArticles.slice(0, 8)
                      : pinnedArticles.length > 0 ? pinnedArticles.slice(0, 4) : articles.slice(0, 4)
                    ).map(article => (
                      <TopicCard key={article.id} article={article} articleCount={0} onClick={() => openArticle(article)} featured={!!article.pinned} />
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Articles — two-column link list */}
              {!selectedCategory && popularArticles.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-7">Popular Articles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 max-w-3xl mx-auto">
                    {popularArticles.map(article => (
                      <button
                        key={article.id}
                        onClick={() => openArticle(article)}
                        className="text-left text-sm text-sky-600 hover:text-sky-800 hover:underline underline-offset-2 transition-colors py-0.5 leading-snug"
                      >
                        {article.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Browse by Category */}
              {!selectedCategory && categories.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-7">Browse Products and Services</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {categories.map(cat => {
                      const count = articleCountMap[cat.id] || 0;
                      const grad  = CAT_GRADIENT[cat.color] || CAT_GRADIENT.slate;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => filterByCategory(cat)}
                          className="group text-left rounded-md overflow-hidden border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white"
                        >
                          <div className="relative w-full aspect-video overflow-hidden">
                            {cat.image_url ? (
                              <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={e => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                  const p = e.currentTarget.parentElement;
                                  if (p) p.classList.add("show-fallback");
                                }}
                              />
                            ) : null}
                            <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center text-4xl ${cat.image_url ? "opacity-0 group-[.show-fallback]:opacity-100" : ""}`}>
                              {cat.icon}
                            </div>
                          </div>
                          <div className="px-3 py-2.5">
                            <p className="font-semibold text-sm text-gray-800 group-hover:text-sky-600 transition-colors">{cat.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{count} article{count !== 1 ? "s" : ""}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Regular articles under a selected category */}
              {selectedCategory && regularArticles.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-7">All Articles</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {regularArticles.map(article => (
                      <TopicCard key={article.id} article={article} articleCount={0} onClick={() => openArticle(article)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      )}

      {articleLoading && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
        </div>
      )}
    </div>
  );
}

function TopicCard({
  article,
  onClick,
  featured = false,
}: {
  article: HelpArticle;
  articleCount: number;
  onClick: () => void;
  featured?: boolean;
}) {
  const grad  = CAT_GRADIENT[article.category_color || "slate"] || CAT_GRADIENT.slate;
  const thumb = getArticleThumbnail(article);

  return (
    <button onClick={onClick} className="group text-left rounded-md overflow-hidden border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white">
      {/* Thumbnail */}
      <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
        {thumb.kind === "img" ? (
          <img src={thumb.src} alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const p = e.currentTarget.parentElement;
              if (p) p.classList.add("show-fallback");
            }}
          />
        ) : null}
        <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center ${thumb.kind === "img" ? "opacity-0 group-[.show-fallback]:opacity-100" : ""}`}>
          <span className="text-3xl">{article.category_icon || "📄"}</span>
        </div>

        {/* Video play button */}
        {article.content_type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[12px] border-l-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Badges */}
        {featured && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">Featured</span>
          </div>
        )}
        {article.view_count > 100 && !featured && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-white shadow-sm">Popular</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="font-semibold text-sm text-gray-800 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">{article.title}</p>
        {article.category_name && (
          <p className="text-xs text-gray-400 mt-0.5">{article.category_name}</p>
        )}
      </div>
    </button>
  );
}
