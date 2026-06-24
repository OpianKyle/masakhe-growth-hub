import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, LayoutTemplate, Wand2, Eye, Sparkles,
  Rocket, Search, Plus, CheckCircle2, Layers, Zap,
  Star, Crown, ChevronRight, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { templateList, buildTemplate } from "@/components/website/templates";
import { useAuth } from "@/contexts/AuthContext";

const HERO_FALLBACKS: Record<string, string> = {
  corporate: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600",
  centered:  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600",
  bold:      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=600",
  minimal:   "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
};

interface TemplatePreview { bgImage: string; primary: string; title: string; subtitle: string; }
const TEMPLATE_PREVIEWS: Record<string, TemplatePreview> = (() => {
  const map: Record<string, TemplatePreview> = {};
  for (const tmpl of templateList) {
    try {
      const config = buildTemplate(tmpl.id);
      const hero = config.sections?.find((s: any) => s.type === "hero");
      const data = hero?.data || {};
      const style: string = data.heroStyle || "corporate";
      map[tmpl.id] = {
        bgImage: data.backgroundImageUrl || HERO_FALLBACKS[style] || HERO_FALLBACKS.corporate,
        primary: config.theme?.primary || "#2563eb",
        title: data.title || config.businessName || tmpl.name,
        subtitle: data.subtitle || tmpl.description,
      };
    } catch {
      map[tmpl.id] = { bgImage: HERO_FALLBACKS.corporate, primary: "#2563eb", title: tmpl.name, subtitle: tmpl.description };
    }
  }
  return map;
})();

const CATEGORY_MAP: Record<string, string> = {
  professional: "Professional", legal: "Professional", consulting: "Professional",
  staffing: "Professional", funeral: "Professional", mining: "Professional",
  accounting: "Finance", insurance: "Finance", brokerage: "Finance",
  restaurant: "Food & Hospitality", bakery: "Food & Hospitality", guesthouse: "Food & Hospitality",
  travel: "Food & Hospitality", catering: "Food & Hospitality",
  healthcare: "Health & Wellness", fitness: "Health & Wellness", beauty: "Health & Wellness",
  childcare: "Health & Wellness", petcare: "Health & Wellness", pharmacy: "Health & Wellness", hairsalon: "Health & Wellness",
  construction: "Trade & Build", automotive: "Trade & Build", cleaning: "Trade & Build",
  solar: "Trade & Build", security: "Trade & Build", plumbing: "Trade & Build", homeimprovement: "Trade & Build",
  technology: "Technology",
  retail: "Retail", fashion: "Retail",
  creative: "Creative", printing: "Creative", photography: "Creative",
  education: "Education", church: "Education", nonprofit: "Education", drivingschool: "Education",
  agriculture: "Agriculture", transport: "Agriculture",
  realestate: "Property", events: "Events",
  showroom: "Premium", luxury_estate: "Premium",
};

const FILTER_TABS = [
  "All", "Professional", "Food & Hospitality", "Health & Wellness",
  "Trade & Build", "Retail", "Creative", "Property", "Events", "Premium",
];

function BrowserMockup({ gradient, compact = false }: { gradient: string; compact?: boolean }) {
  const w = compact ? 130 : 168;
  const h = compact ? 88 : 114;
  return (
    <div className="rounded-xl overflow-hidden shadow-xl border-2 border-white/70" style={{ width: w, height: h }}>
      <div className="flex items-center gap-1 px-2 h-5 bg-slate-100 border-b border-slate-200 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 h-2 rounded-full bg-white border border-slate-200" />
      </div>
      <div className={`relative bg-gradient-to-br ${gradient}`} style={{ height: h - 20 }}>
        <div className="absolute top-2 left-2 right-2 h-5 rounded bg-white/20" />
        <div className="absolute top-9 left-3 w-2/3 h-2 rounded-full bg-white/50" />
        <div className="absolute top-[48px] left-3 w-1/2 h-1.5 rounded-full bg-white/30" />
        <div className="absolute bottom-3 left-2 right-2 flex gap-1">
          <div className="flex-1 h-5 rounded bg-white/15" />
          <div className="flex-1 h-5 rounded bg-white/15" />
          <div className="flex-1 h-5 rounded bg-white/15" />
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ tmpl, onClick }: { tmpl: (typeof templateList)[0]; onClick: () => void }) {
  const preview = TEMPLATE_PREVIEWS[tmpl.id];
  const cat = CATEGORY_MAP[tmpl.id] || "Other";
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={onClick} className="w-full text-left group">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-sky-200">
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={preview?.bgImage}
              alt={tmpl.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${preview?.primary}55 0%, ${preview?.primary}dd 100%)` }} />
            {tmpl.premium && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] px-1.5 py-0.5 gap-1 shadow-md">
                  <Crown className="h-2.5 w-2.5" /> PRO
                </Badge>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white font-bold text-xs leading-tight line-clamp-1 drop-shadow-md">{preview?.title}</p>
            </div>
          </div>
          <div className="px-3 pb-3 pt-2 flex items-start justify-between gap-1">
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-tight">{tmpl.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{tmpl.description}</p>
            </div>
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 font-medium whitespace-nowrap">{cat}</span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

export default function WebsiteHub() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [mySite, setMySite] = useState<any>(null);
  const [loadingSite, setLoadingSite] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/websites/mine", { credentials: "include" })
      .then(r => r.json())
      .then(sites => { if (Array.isArray(sites) && sites.length > 0) setMySite(sites[0]); })
      .catch(() => {})
      .finally(() => setLoadingSite(false));
  }, []);

  const filtered = useMemo(() => {
    return templateList.filter((t) => {
      const cat = CATEGORY_MAP[t.id] || "Other";
      const matchCat = filterTab === "All" || cat === filterTab;
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, filterTab]);

  const displayed = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 border-b border-gray-100 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-cyan-500 flex items-center justify-center shadow-sm">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Website Builder</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{user?.name}</span>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #cffafe 30%, #d1fae5 70%, #ecfdf5 100%)" }}>
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div initial={{ opacity: 0, rotate: -8, y: 20 }} animate={{ opacity: 0.88, rotate: -6, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="absolute -left-4 top-6">
            <BrowserMockup gradient="from-blue-600 to-cyan-500" />
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 6, y: 20 }} animate={{ opacity: 0.9, rotate: 4, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="absolute -right-4 top-3">
            <BrowserMockup gradient="from-emerald-500 to-teal-500" />
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: 3, y: 30 }} animate={{ opacity: 0.72, rotate: 2, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="absolute right-32 -bottom-1">
            <BrowserMockup gradient="from-violet-500 to-indigo-500" compact />
          </motion.div>
          <motion.div initial={{ opacity: 0, rotate: -4, y: 30 }} animate={{ opacity: 0.68, rotate: -3, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }} className="absolute left-32 bottom-0">
            <BrowserMockup gradient="from-rose-400 to-orange-400" compact />
          </motion.div>
        </div>
        <div className="relative z-10 py-14 px-6 text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#0c4a6e" }}>
            What will you build today?
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sky-700/70 mb-6 text-sm">
            Choose from {templateList.length}+ industry templates, customise every section, and publish in minutes.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowAll(true); }}
              placeholder="Search by industry — restaurant, legal, fitness…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-sm shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder-sky-300 text-gray-700"
            />
          </motion.div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border-b border-gray-100 bg-white px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto">
          {[
            { label: "Build My Site", icon: Wand2 },
            { label: "Templates", icon: LayoutTemplate },
            { label: "Preview Live", icon: Eye },
            { label: "Publish", icon: Rocket },
            { label: "Custom Domain", icon: Globe },
          ].map((action, i) => (
            <motion.button key={action.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => navigate("/builder")} className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-sky-50 transition-colors group min-w-[80px] shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center group-hover:from-sky-200 group-hover:to-cyan-200 transition-all">
                <action.icon className="h-5 w-5 text-sky-600" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{action.label}</span>
            </motion.button>
          ))}
          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} onClick={() => navigate("/builder")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-sky-700 hover:to-cyan-700 transition-all shrink-0">
            <Plus className="h-4 w-4" /> {mySite ? "Edit My Site" : "Create Site"}
          </motion.button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Current site card */}
        {!loadingSite && mySite && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">My website</h2>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/builder")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-sm shrink-0">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{mySite.content?.businessName || mySite.slug || "My Website"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {mySite.status === "published" ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold"><CheckCircle2 className="h-3 w-3" /> Published</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold"><Layers className="h-3 w-3" /> Draft</span>
                    )}
                    <span className="text-[11px] text-gray-400">·</span>
                    <span className="text-[11px] text-gray-400">/{mySite.slug}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" className="shrink-0 bg-sky-600 hover:bg-sky-700 text-white shadow text-xs">
                <Wand2 className="h-3.5 w-3.5 mr-1" /> Edit Site
              </Button>
            </div>
          </motion.section>
        )}

        {!loadingSite && !mySite && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">You don't have a website yet</h3>
              <p className="text-sm text-gray-500 mb-4">Choose any template below and launch your business online in minutes.</p>
              <Button onClick={() => navigate("/builder")} className="bg-sky-600 hover:bg-sky-700 text-white shadow">
                <Plus className="h-4 w-4 mr-2" /> Get Started — It's Free
              </Button>
            </div>
          </motion.section>
        )}

        {/* Template gallery */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Choose a template</h2>
              <p className="text-xs text-gray-500 mt-0.5">Pick a starting point — customise everything afterwards</p>
            </div>
            <button onClick={() => navigate("/builder")} className="text-sm text-sky-600 font-medium hover:text-sky-800 flex items-center gap-1 shrink-0">
              All {templateList.length}+ <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2 flex-wrap mb-5">
            {FILTER_TABS.map((tab) => (
              <button key={tab} onClick={() => { setFilterTab(tab); setShowAll(false); }} className={`text-xs px-3 py-1.5 rounded-full border font-medium whitespace-nowrap transition-all ${filterTab === tab ? "bg-sky-600 text-white border-sky-600" : "bg-white border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600"}`}>
                {tab}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No templates found — try a different search or category</p>
              <button onClick={() => { setSearch(""); setFilterTab("All"); }} className="mt-2 text-sm text-sky-600 hover:underline">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayed.map((tmpl, i) => (
                  <motion.div key={tmpl.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <TemplateCard tmpl={tmpl} onClick={() => navigate("/builder")} />
                  </motion.div>
                ))}
              </div>
              {!showAll && filtered.length > 8 && (
                <div className="text-center mt-6">
                  <button onClick={() => setShowAll(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all">
                    Show {filtered.length - 8} more <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* AI strip */}
        <section>
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-6" style={{ background: "linear-gradient(120deg, #0369a1 0%, #0891b2 50%, #059669 100%)" }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-yellow-200 text-xs font-semibold uppercase tracking-wider">AI-Powered</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-1">Build your site with AI assistance</h3>
              <p className="text-sky-100 text-sm">Let AI pre-fill your content, write homepage copy, and suggest sections — tailored to your industry.</p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <Button onClick={() => navigate("/builder")} className="bg-white text-sky-700 font-semibold hover:bg-sky-50 border-0 shadow-lg">
                Try It <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          </div>
        </section>

        {/* Stats strip */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Industry templates", value: `${templateList.length}+`, icon: LayoutTemplate, color: "text-sky-600" },
            { label: "Sections available", value: "10+", icon: Zap, color: "text-emerald-600" },
            { label: "Publish in minutes", value: "Fast", icon: Star, color: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
              <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
