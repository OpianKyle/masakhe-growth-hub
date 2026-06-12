import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, Globe, LayoutTemplate, Wand2, Plus, Settings, Search,
  Rocket, Sparkles, ChevronRight, CheckCircle2, Layers, Lock,
  Crown, Eye, Copy, ExternalLink, Shield, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { templateList } from "@/components/website/templates";
import { toast } from "sonner";
import WebsiteBuilder from "./WebsiteBuilder";

/* ─── Static category images — no runtime buildTemplate() calls ─── */
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

const CATEGORY_IMAGES: Record<string, string> = {
  "Professional":       "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600",
  "Finance":            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600",
  "Food & Hospitality": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600",
  "Health & Wellness":  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600",
  "Trade & Build":      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
  "Technology":         "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
  "Retail":             "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600",
  "Creative":           "https://images.unsplash.com/photo-1541753866388-0b3c701627d3?auto=format&fit=crop&q=80&w=600",
  "Education":          "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=600",
  "Agriculture":        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600",
  "Property":           "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600",
  "Events":             "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600",
  "Premium":            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600",
  "Other":              "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Professional": "#1e40af", "Finance": "#0f766e", "Food & Hospitality": "#b45309",
  "Health & Wellness": "#065f46", "Trade & Build": "#7c3aed", "Technology": "#1e3a5f",
  "Retail": "#be185d", "Creative": "#6d28d9", "Education": "#1e40af",
  "Agriculture": "#3f6212", "Property": "#991b1b", "Events": "#c2410c",
  "Premium": "#78350f", "Other": "#374151",
};

function getCatImage(id: string) { return CATEGORY_IMAGES[CATEGORY_MAP[id]] ?? CATEGORY_IMAGES["Other"]; }
function getCatColor(id: string) { return CATEGORY_COLORS[CATEGORY_MAP[id]] ?? "#374151"; }

const FILTER_TABS = [
  "All", "Professional", "Food & Hospitality", "Health & Wellness",
  "Trade & Build", "Finance", "Retail", "Creative", "Property", "Events", "Technology", "Premium",
];

/* ─── Reusable template card ────────────────────────────────────── */
function TemplateCard({ tmpl, isProPlan, delay = 0 }: { tmpl: (typeof templateList)[number]; isProPlan: boolean; delay?: number }) {
  const navigate = useNavigate();
  const cat = CATEGORY_MAP[tmpl.id] ?? "Other";
  const locked = tmpl.premium && !isProPlan;
  const img = getCatImage(tmpl.id);
  const color = getCatColor(tmpl.id);

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate("/website-builder/builder")}
      className="text-left group"
    >
      <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-sky-200 ${locked ? "opacity-80" : ""}`}>
        <div className="relative h-32 w-full overflow-hidden">
          <img
            src={img}
            alt={tmpl.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${color}66 0%, ${color}ee 100%)` }} />
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
        </div>
        <div className="px-3 pb-3 pt-2 flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-tight truncate">{tmpl.name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{tmpl.description}</p>
          </div>
          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 font-medium whitespace-nowrap">{cat}</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Left icon sidebar ──────────────────────────────────────────── */
function LeftNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initials = ((user as any)?.full_name || (user as any)?.email || "U")
    .split(/\s+/).map((s: string) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const isAt = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navItems = [
    { icon: Home,          label: "Home",      path: "/website-builder" },
    { icon: Wand2,         label: "Builder",   path: "/website-builder/builder" },
    { icon: LayoutTemplate,label: "Templates", path: "/website-builder/templates" },
    { icon: Rocket,        label: "Publish",   path: "/website-builder/domain" },
  ];

  return (
    <div className="w-[72px] bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-1 shrink-0 h-full">
      <button
        onClick={() => navigate("/website-builder/builder")}
        className="w-11 h-11 mb-4 flex items-center justify-center rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #0369a1, #06b6d4)" }}
        title="Open Website Builder"
      >
        <Plus className="h-5 w-5 text-white" />
      </button>

      {navItems.map((item) => {
        const active = item.path === "/website-builder"
          ? location.pathname === "/website-builder" || location.pathname === "/website-builder/"
          : isAt(item.path);
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium transition-all ${
              active ? "bg-sky-50 text-sky-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
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

/* ─── Hub home ───────────────────────────────────────────────────── */
function StandaloneHome() {
  const navigate = useNavigate();
  const [mySite, setMySite] = useState<any>(null);
  const [loadingSite, setLoadingSite] = useState(true);
  const [isProPlan, setIsProPlan] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/websites/mine", { credentials: "include" }).then(r => r.json()).catch(() => []),
      fetch("/api/billing/status", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
    ]).then(([sites, billing]) => {
      if (Array.isArray(sites) && sites.length > 0) setMySite(sites[0]);
      if (billing.plan === "pro" && (billing.status === "ACTIVE" || billing.status === "TRIAL")) setIsProPlan(true);
    }).finally(() => setLoadingSite(false));
  }, []);

  const featured = templateList.slice(0, 8);

  return (
    <div className="h-full overflow-auto bg-white">
      {/* Hero */}
      <div
        className="pt-16 pb-12 px-8 text-center"
        style={{ background: "linear-gradient(160deg, #e0f2fe 0%, #cffafe 30%, #d1fae5 65%, #ecfdf5 100%)" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
          style={{ background: "linear-gradient(90deg, #0369a1 0%, #0891b2 40%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
        >
          What will you build today?
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sky-700/70 mb-8 text-base">
          Choose from {templateList.length}+ industry templates and go live in minutes.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          onClick={() => navigate("/website-builder/builder")}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
          style={{ background: "linear-gradient(90deg, #0369a1, #0891b2, #059669)" }}
        >
          <Plus className="h-5 w-5" />
          {mySite ? "Edit My Website" : "Create a Website"}
        </motion.button>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12 pt-8 space-y-10">

        {/* Current site card */}
        {!loadingSite && mySite && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">My website</h2>
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
                    {mySite.status === "published"
                      ? <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold"><CheckCircle2 className="h-3 w-3" /> Published</span>
                      : <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold"><Layers className="h-3 w-3" /> Draft</span>}
                    <span className="text-[11px] text-gray-400">· /{mySite.slug}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" className="shrink-0 bg-sky-600 hover:bg-sky-700 text-white shadow text-xs">
                <Wand2 className="h-3.5 w-3.5 mr-1" /> Edit Site
              </Button>
            </div>
          </motion.section>
        )}

        {/* Quick access */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Build / Edit Site", icon: Wand2,         path: "/website-builder/builder",   desc: "Customise your site",     color: "from-sky-500 to-cyan-600" },
              { label: "Templates",         icon: LayoutTemplate, path: "/website-builder/templates", desc: `${templateList.length}+ ready-made`, color: "from-emerald-500 to-teal-500" },
              { label: "Preview Live",      icon: Eye,            path: "/website-builder/builder",   desc: "See your live site",      color: "from-violet-500 to-purple-600" },
              { label: "Domain & Publish",  icon: Rocket,         path: "/website-builder/domain",    desc: "Go live & connect domain", color: "from-rose-500 to-pink-500" },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
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

        {/* Featured templates (fast — static images) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Featured templates</h2>
              <p className="text-xs text-gray-500 mt-0.5">Pick a starting point — customise everything afterwards</p>
            </div>
            <button onClick={() => navigate("/website-builder/templates")} className="text-sm text-sky-600 font-medium hover:text-sky-800 flex items-center gap-1 shrink-0">
              See all {templateList.length} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featured.map((t, i) => <TemplateCard key={t.id} tmpl={t} isProPlan={isProPlan} delay={i * 0.03} />)}
          </div>
        </section>

        {/* AI strip */}
        <section>
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-6" style={{ background: "linear-gradient(120deg, #0369a1 0%, #0891b2 50%, #059669 100%)" }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><Sparkles className="h-4 w-4 text-yellow-300" /><span className="text-yellow-200 text-xs font-semibold uppercase tracking-wider">AI-Powered</span></div>
              <h3 className="text-white font-bold text-xl mb-1">Build your site with AI assistance</h3>
              <p className="text-sky-100 text-sm">Let AI pre-fill your content, write homepage copy, and suggest sections — tailored for your South African business.</p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <Button onClick={() => navigate("/website-builder/builder")} className="bg-white text-sky-700 font-semibold hover:bg-sky-50 border-0 shadow-lg">
                Try It <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Industry templates", value: `${templateList.length}+`, icon: LayoutTemplate, color: "bg-sky-100 text-sky-700" },
            { label: "Page section types",  value: "10",                     icon: Layers,         color: "bg-emerald-100 text-emerald-700" },
            { label: "Go live in minutes",  value: "Free",                   icon: Rocket,         color: "bg-violet-100 text-violet-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}><s.icon className="h-5 w-5" /></div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}

/* ─── Full templates gallery page ────────────────────────────────── */
function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [isProPlan, setIsProPlan] = useState(false);

  useEffect(() => {
    fetch("/api/billing/status", { credentials: "include" }).then(r => r.json())
      .then(b => { if (b.plan === "pro" && (b.status === "ACTIVE" || b.status === "TRIAL")) setIsProPlan(true); })
      .catch(() => {});
  }, []);

  const filtered = templateList.filter((t) => {
    const cat = CATEGORY_MAP[t.id] ?? "Other";
    const matchCat = filterTab === "All" || cat === filterTab;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 20);

  return (
    <div className="flex flex-col h-full">
      <SubBar title="Templates" />
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

          {/* Header + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-gray-900">Choose a Template</h1>
              <p className="text-sm text-gray-500 mt-0.5">{templateList.length} industry templates — pick one and customise it</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowAll(true); }}
                placeholder="Search templates…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-gray-50"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => { setFilterTab(tab); setShowAll(false); }}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium whitespace-nowrap transition-all ${
                  filterTab === tab ? "bg-sky-600 text-white border-sky-600" : "bg-white border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No templates found</p>
              <button onClick={() => { setSearch(""); setFilterTab("All"); }} className="mt-2 text-sm text-sky-600 hover:underline">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayed.map((t, i) => <TemplateCard key={t.id} tmpl={t} isProPlan={isProPlan} delay={i * 0.02} />)}
              </div>
              {!showAll && filtered.length > 20 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all"
                  >
                    Show {filtered.length - 20} more <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Domain & Publish page ──────────────────────────────────────── */
function DomainPublishPage() {
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [savedDomain, setSavedDomain] = useState<string | null>(null);
  const [savingDomain, setSavingDomain] = useState(false);

  useEffect(() => {
    fetch("/api/websites/mine", { credentials: "include" })
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const s = data[0];
          setSite(s);
          if (s.custom_domain) { setSavedDomain(s.custom_domain); setCustomDomain(s.custom_domain); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const publishedUrl = site?.status === "published" ? `${window.location.origin}/site/${site.slug}` : null;

  const handlePublish = async () => {
    if (!site?.id) { toast.error("Build your site first in the editor"); return; }
    setPublishing(true);
    try {
      const res = await fetch(`/api/websites/${site.id}/publish`, { method: "POST", credentials: "include" });
      if (res.ok) {
        setSite((prev: any) => ({ ...prev, status: "published" }));
        toast.success("Website published! 🎉");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to publish");
      }
    } catch { toast.error("Failed to publish"); }
    finally { setPublishing(false); }
  };

  const handleUnpublish = async () => {
    if (!site?.id) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/websites/${site.id}/unpublish`, { method: "POST", credentials: "include" });
      if (res.ok) {
        setSite((prev: any) => ({ ...prev, status: "draft" }));
        toast.success("Website taken offline");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to unpublish");
      }
    } catch { toast.error("Failed to unpublish"); }
    finally { setPublishing(false); }
  };

  const saveDomain = async () => {
    if (!site?.id) { toast.error("Save your site first in the editor"); return; }
    setSavingDomain(true);
    try {
      const res = await fetch(`/api/websites/${site.id}/domain`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customDomain: customDomain.trim() }),
      });
      const data = await res.json();
      if (res.ok) { setSavedDomain(data.customDomain || null); toast.success(data.customDomain ? "Custom domain saved!" : "Custom domain removed"); }
      else toast.error(data.error || "Failed to save domain");
    } catch { toast.error("Network error saving domain"); }
    finally { setSavingDomain(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <SubBar title="Domain & Publish" />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />)}
            </div>
          ) : !site ? (
            <div className="text-center py-16">
              <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-700 mb-2">No website yet</h2>
              <p className="text-sm text-gray-500 mb-6">Build your site first, then come back here to publish it.</p>
              <Button onClick={() => navigate("/website-builder/builder")} className="bg-sky-600 hover:bg-sky-700">
                <Wand2 className="h-4 w-4 mr-2" /> Start Building
              </Button>
            </div>
          ) : (
            <>

              {/* Site status card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Website status</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-sm">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{site.content?.businessName || site.slug || "My Website"}</p>
                      {site.status === "published"
                        ? <span className="flex items-center gap-1 text-sm text-emerald-600 font-semibold mt-0.5"><CheckCircle2 className="h-4 w-4" /> Live & Published</span>
                        : <span className="flex items-center gap-1 text-sm text-amber-600 font-semibold mt-0.5"><AlertCircle className="h-4 w-4" /> Draft — not visible to the public</span>}
                    </div>
                  </div>
                  {site.status === "published"
                    ? <Button variant="outline" size="sm" onClick={handleUnpublish} disabled={publishing} className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
                        {publishing ? "Working…" : "Take Offline"}
                      </Button>
                    : <Button size="sm" onClick={handlePublish} disabled={publishing} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                        <Rocket className="h-3.5 w-3.5 mr-1.5" />{publishing ? "Publishing…" : "Publish Now"}
                      </Button>}
                </div>
              </div>

              {/* Published URL */}
              {publishedUrl && (
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-1">Live URL</h2>
                  <p className="text-xs text-gray-500 mb-4">Your website is live at this address. Share it with clients!</p>
                  <div className="flex gap-2">
                    <Input value={publishedUrl} readOnly className="bg-gray-50 text-sm font-mono flex-1" />
                    <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(publishedUrl); toast.success("Copied!"); }} title="Copy URL">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => window.open(publishedUrl, "_blank")} title="Open in new tab">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Custom domain */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Custom Domain</h2>
                <p className="text-xs text-gray-500 mb-4">Connect your own domain (e.g. <span className="font-mono">www.mybusiness.co.za</span>) to this website.</p>

                <div className="flex gap-2 mb-4">
                  <Input
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value.replace(/^https?:\/\//, "").replace(/\/$/, ""))}
                    placeholder="www.mybusiness.co.za"
                    className="text-sm flex-1"
                  />
                  <Button onClick={saveDomain} disabled={savingDomain} className="bg-sky-600 hover:bg-sky-700 text-white shrink-0">
                    {savingDomain ? "Saving…" : "Save"}
                  </Button>
                  {savedDomain && (
                    <Button variant="outline" onClick={() => { setCustomDomain(""); saveDomain(); }} className="text-red-500 border-red-200 hover:bg-red-50 shrink-0 text-xs">
                      Remove
                    </Button>
                  )}
                </div>

                {savedDomain && (
                  <div className="space-y-4">
                    {/* DNS records */}
                    <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 space-y-3">
                      <p className="text-xs font-bold text-sky-800 uppercase tracking-wide">DNS Records — add in your registrar (Xneelo, GoDaddy, etc.)</p>
                      <div className="bg-white rounded-lg border border-sky-100 overflow-hidden">
                        <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-sky-100/60 text-[11px] font-bold text-sky-700 uppercase tracking-wide">
                          <span>Type</span><span>Name</span><span>Value</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs font-mono text-gray-700">
                            <span>CNAME</span>
                            <span>{savedDomain.startsWith("www.") ? "www" : savedDomain.split(".")[0]}</span>
                            <span>masakheportal.co.za</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs font-mono text-gray-700">
                            <span>A</span><span>@</span><span>154.65.110.84</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-sky-600">Allow up to 24 hours for DNS propagation after saving these records.</p>
                    </div>

                    {/* HTTPS guide */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <p className="text-xs font-bold text-amber-800">Enable Free HTTPS via Cloudflare</p>
                      </div>
                      <ol className="text-[11px] text-amber-700 space-y-1 list-decimal list-inside">
                        <li>Create a free account at <span className="font-mono font-semibold">cloudflare.com</span></li>
                        <li>Add your domain and follow the setup wizard</li>
                        <li>Update your registrar's nameservers to Cloudflare's</li>
                        <li>In Cloudflare DNS, add the A record above with <span className="font-semibold">Proxy (orange cloud) ON</span></li>
                        <li>HTTPS activates automatically — no extra cost</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Slug / URL path */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Site URL path</h2>
                <p className="text-xs text-gray-500 mb-3">Your website's path on the Masakhe platform.</p>
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                  <span className="text-sm text-gray-400 font-mono">{window.location.origin}/site/</span>
                  <span className="text-sm font-bold text-sky-700 font-mono">{site.slug}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">To change your URL path, edit it in the <button onClick={() => navigate("/website-builder/builder")} className="text-sky-600 hover:underline">builder settings panel</button>.</p>
              </div>

            </>
          )}
        </div>
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

          <Route path="builder" element={
            <div className="flex flex-col h-full">
              <SubBar title="Website Builder" />
              <div className="flex-1 overflow-hidden">
                <WebsiteBuilder />
              </div>
            </div>
          } />

          <Route path="templates" element={<TemplatesPage />} />

          <Route path="domain" element={<DomainPublishPage />} />

          <Route path="*" element={
            <div className="flex flex-col h-full">
              <SubBar title="Website Builder" />
              <div className="flex-1 overflow-hidden">
                <WebsiteBuilder />
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}
