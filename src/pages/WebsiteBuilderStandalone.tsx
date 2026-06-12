import { useState, useEffect, useMemo } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, Globe, LayoutTemplate, Wand2, Plus, Settings, Search,
  Rocket, Sparkles, ChevronRight, CheckCircle2, Layers, Lock,
  Crown, Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { templateList, buildTemplate } from "@/components/website/templates";
import WebsiteBuilder from "./WebsiteBuilder";

/* ─── Template preview data ─────────────────────────────────────── */
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
        title:    data.title || config.businessName || tmpl.name,
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

/* ─── Left icon sidebar ──────────────────────────────────────────── */
function LeftNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initials = ((user as any)?.full_name || (user as any)?.email || "U")
    .split(/\s+/)
    .map((s: string) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isAt = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navItems = [
    { icon: Home,          label: "Home",      path: "/website-builder" },
    { icon: Wand2,         label: "Builder",   path: "/website-builder/builder" },
    { icon: LayoutTemplate,label: "Templates", path: "/website-builder/builder" },
  ];

  return (
    <div className="w-[72px] bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-1 shrink-0 h-full">
      {/* Create / Edit button */}
      <button
        onClick={() => navigate("/website-builder/builder")}
        className="w-11 h-11 mb-4 flex items-center justify-center rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #0369a1, #06b6d4)" }}
        title="Open Website Builder"
      >
        <Plus className="h-5 w-5 text-white" />
      </button>

      {navItems.map((item) => {
        const active =
          item.path === "/website-builder"
            ? location.pathname === "/website-builder" || location.pathname === "/website-builder/"
            : isAt(item.path);
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium transition-all ${
              active
                ? "bg-sky-50 text-sky-700"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            }`}
            title={item.label}
          >
            <item.icon className={`h-5 w-5 ${active ? "text-sky-600" : ""}`} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        onClick={() => window.open("/dashboard/settings", "_blank")}
        className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
        title="Settings"
      >
        <Settings className="h-5 w-5" />
        <span>Settings</span>
      </button>

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer mt-1 shadow-sm"
        style={{ background: "linear-gradient(135deg, #0369a1, #06b6d4)" }}
        title="Signed in"
      >
        {initials}
      </div>
    </div>
  );
}

/* ─── Sub-page top bar ───────────────────────────────────────────── */
function SubBar({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
      <button
        onClick={() => navigate("/website-builder")}
        className="flex items-center gap-1.5 text-sm text-sky-600 font-medium hover:text-sky-800 transition-colors"
      >
        <Home className="h-4 w-4" /> Home
      </button>
      <span className="text-gray-200">›</span>
      <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
  );
}

/* ─── Standalone hub home ────────────────────────────────────────── */
function StandaloneHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [mySite, setMySite] = useState<any>(null);
  const [loadingSite, setLoadingSite] = useState(true);
  const [isProPlan, setIsProPlan] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/websites/mine", { credentials: "include" }).then(r => r.json()).catch(() => []),
      fetch("/api/billing/status", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
    ]).then(([sites, billing]) => {
      if (Array.isArray(sites) && sites.length > 0) setMySite(sites[0]);
      if (billing.plan === "pro" && (billing.status === "ACTIVE" || billing.status === "TRIAL")) setIsProPlan(true);
    }).finally(() => setLoadingSite(false));
  }, []);

  const filtered = useMemo(() => templateList.filter((t) => {
    const cat = CATEGORY_MAP[t.id] || "Other";
    const matchCat = filterTab === "All" || cat === filterTab;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [search, filterTab]);

  const displayed = showAll ? filtered : filtered.slice(0, 12);

  return (
    <div className="h-full overflow-auto bg-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        className="pt-16 pb-12 px-8 text-center"
        style={{ background: "linear-gradient(160deg, #e0f2fe 0%, #cffafe 30%, #d1fae5 65%, #ecfdf5 100%)" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
          style={{
            background: "linear-gradient(90deg, #0369a1 0%, #0891b2 40%, #059669 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          What will you build today?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sky-700/70 mb-8 text-base"
        >
          Choose from {templateList.length}+ industry templates and publish your business website in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative max-w-xl mx-auto mb-6"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setShowAll(true); }}
            placeholder="Search by industry — restaurant, legal, fitness…"
            className="w-full py-4 rounded-2xl border border-white/70 bg-white/90 backdrop-blur-sm shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder-gray-400 text-gray-700"
            style={{ paddingLeft: 52, paddingRight: 20 }}
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/website-builder/builder")}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
          style={{ background: "linear-gradient(90deg, #0369a1, #0891b2, #059669)" }}
        >
          <Plus className="h-5 w-5" />
          {mySite ? "Edit My Website" : "Create a Website"}
        </motion.button>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pb-12 pt-8 space-y-10">

        {/* Current site card */}
        {!loadingSite && mySite && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">My website</h2>
            </div>
            <div
              className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate("/website-builder/builder")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-sm shrink-0">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{mySite.content?.businessName || mySite.slug || "My Website"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {mySite.status === "published" ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                        <Layers className="h-3 w-3" /> Draft
                      </span>
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

        {/* Quick access tiles */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Build / Edit Site", icon: Wand2,          path: "/website-builder/builder", desc: "Customise your site",    color: "from-sky-500 to-cyan-600" },
              { label: "Templates",         icon: LayoutTemplate,  path: "/website-builder/builder", desc: `${templateList.length}+ ready-made`, color: "from-emerald-500 to-teal-500" },
              { label: "Preview Live",      icon: Eye,             path: "/website-builder/builder", desc: "See your live site",      color: "from-violet-500 to-purple-600" },
              { label: "Domain & Publish",  icon: Rocket,          path: "/website-builder/builder", desc: "Go live & connect domain", color: "from-rose-500 to-pink-500" },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(a.path)}
                  className="group flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-200 hover:-translate-y-0.5 transition-all text-left"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{a.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{a.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Template gallery */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Choose a template</h2>
              <p className="text-xs text-gray-500 mt-0.5">Pick a starting point — customise everything afterwards</p>
            </div>
            <button
              onClick={() => navigate("/website-builder/builder")}
              className="text-sm text-sky-600 font-medium hover:text-sky-800 flex items-center gap-1 shrink-0"
            >
              See all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Category filter chips */}
          <div className="flex gap-2 flex-wrap mb-5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setFilterTab(tab); setShowAll(false); }}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium whitespace-nowrap transition-all ${
                  filterTab === tab
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No templates found</p>
              <button onClick={() => { setSearch(""); setFilterTab("All"); }} className="mt-2 text-sm text-sky-600 hover:underline">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayed.map((tmpl, i) => {
                  const preview = TEMPLATE_PREVIEWS[tmpl.id];
                  const cat = CATEGORY_MAP[tmpl.id] || "Other";
                  const locked = tmpl.premium && !isProPlan;
                  return (
                    <motion.button
                      key={tmpl.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => navigate("/website-builder/builder")}
                      className="text-left group"
                    >
                      <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-sky-200 ${locked ? "opacity-80" : ""}`}>
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
                          {locked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <Lock className="h-5 w-5 text-white/80" />
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
                    </motion.button>
                  );
                })}
              </div>

              {!showAll && filtered.length > 12 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all"
                  >
                    Show {filtered.length - 12} more <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* AI strip */}
        <section>
          <div
            className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-6"
            style={{ background: "linear-gradient(120deg, #0369a1 0%, #0891b2 50%, #059669 100%)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-yellow-200 text-xs font-semibold uppercase tracking-wider">AI-Powered</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-1">Build your site with AI assistance</h3>
              <p className="text-sky-100 text-sm">
                Let AI pre-fill your content, write homepage copy, and suggest sections — tailored for your South African business.
              </p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <Button onClick={() => navigate("/website-builder/builder")} className="bg-white text-sky-700 font-semibold hover:bg-sky-50 border-0 shadow-lg">
                Try It <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -right-4 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Industry templates",  value: `${templateList.length}+`, icon: LayoutTemplate, color: "bg-sky-100 text-sky-700" },
            { label: "Page section types",  value: "10",                       icon: Layers,         color: "bg-emerald-100 text-emerald-700" },
            { label: "Go live in minutes",  value: "Free",                     icon: Rocket,         color: "bg-violet-100 text-violet-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────── */
export default function WebsiteBuilderStandalone() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <LeftNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route index element={<StandaloneHome />} />

          <Route
            path="builder"
            element={
              <div className="flex flex-col h-full">
                <SubBar title="Website Builder" />
                <div className="flex-1 overflow-hidden">
                  <WebsiteBuilder />
                </div>
              </div>
            }
          />

          <Route
            path="*"
            element={
              <div className="flex flex-col h-full">
                <SubBar title="Website Builder" />
                <div className="flex-1 overflow-hidden">
                  <WebsiteBuilder />
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
