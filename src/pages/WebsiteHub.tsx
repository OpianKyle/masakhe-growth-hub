import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, LayoutTemplate, Wand2, Eye, ArrowLeft, Sparkles,
  HardHat, UtensilsCrossed, HeartPulse, Briefcase, ShoppingBag,
  Palette, Home, MonitorSmartphone, GraduationCap, Leaf, Camera,
  PartyPopper, ChevronRight, Plus, Search, Rocket, CheckCircle2,
  Star, Layers, Zap, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WebsiteBuilder from "./WebsiteBuilder";

/* ─── Mini browser-window mockup ─────────────────────────────────── */
function BrowserMockup({
  gradient,
  accent = "#fff",
  compact = false,
}: {
  gradient: string;
  accent?: string;
  compact?: boolean;
}) {
  const w = compact ? 130 : 168;
  const h = compact ? 88 : 114;
  return (
    <div
      className="rounded-xl overflow-hidden shadow-xl border-2 border-white/70"
      style={{ width: w, height: h, background: "#f1f5f9" }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1 px-2 h-5 bg-slate-100 border-b border-slate-200">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 h-2 rounded-full bg-white border border-slate-200" />
      </div>
      {/* Page area */}
      <div className={`relative inset-0 bg-gradient-to-br ${gradient}`} style={{ height: h - 20 }}>
        {/* Hero bar */}
        <div className="absolute top-2 left-2 right-2 h-5 rounded-md bg-white/20" />
        {/* Headline */}
        <div className="absolute top-9 left-3 w-2/3 h-2 rounded-full bg-white/50" />
        <div className="absolute top-13 left-3 w-1/2 h-1.5 rounded-full bg-white/30" />
        {/* CTA button */}
        <div className="absolute top-[52px] left-3 w-16 h-3 rounded-full" style={{ background: accent + "99" }} />
        {/* Card row */}
        <div className="absolute bottom-3 left-2 right-2 flex gap-1">
          <div className="flex-1 h-6 rounded bg-white/15" />
          <div className="flex-1 h-6 rounded bg-white/15" />
          <div className="flex-1 h-6 rounded bg-white/15" />
        </div>
      </div>
    </div>
  );
}

/* ─── Industry category cards ────────────────────────────────────── */
const INDUSTRY_CATEGORIES = [
  { label: "Trade & Construction", icon: HardHat,         color: "from-orange-500 to-amber-500",   bg: "bg-orange-50",  text: "text-orange-700",  count: 7 },
  { label: "Food & Hospitality",   icon: UtensilsCrossed, color: "from-rose-500 to-pink-500",       bg: "bg-rose-50",    text: "text-rose-700",    count: 5 },
  { label: "Health & Wellness",    icon: HeartPulse,      color: "from-green-500 to-emerald-500",   bg: "bg-green-50",   text: "text-green-700",   count: 6 },
  { label: "Professional Services",icon: Briefcase,       color: "from-blue-500 to-indigo-500",     bg: "bg-blue-50",    text: "text-blue-700",    count: 6 },
  { label: "Retail & Commerce",    icon: ShoppingBag,     color: "from-violet-500 to-purple-500",   bg: "bg-violet-50",  text: "text-violet-700",  count: 3 },
  { label: "Creative & Media",     icon: Palette,         color: "from-fuchsia-500 to-pink-500",    bg: "bg-fuchsia-50", text: "text-fuchsia-700", count: 3 },
  { label: "Property",             icon: Home,            color: "from-cyan-500 to-teal-500",       bg: "bg-cyan-50",    text: "text-cyan-700",    count: 3 },
  { label: "Technology",           icon: MonitorSmartphone,color:"from-sky-500 to-blue-600",        bg: "bg-sky-50",     text: "text-sky-700",     count: 2 },
  { label: "Education & Community",icon: GraduationCap,   color: "from-yellow-500 to-orange-400",   bg: "bg-yellow-50",  text: "text-yellow-700",  count: 4 },
  { label: "Events",               icon: PartyPopper,     color: "from-pink-500 to-fuchsia-500",    bg: "bg-pink-50",    text: "text-pink-700",    count: 2 },
  { label: "Agriculture & Transport",icon: Leaf,          color: "from-lime-500 to-green-600",      bg: "bg-lime-50",    text: "text-lime-700",    count: 2 },
  { label: "Photography",          icon: Camera,          color: "from-amber-500 to-yellow-500",    bg: "bg-amber-50",   text: "text-amber-700",   count: 1 },
];

/* ─── Quick actions ──────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: "Build My Site",  icon: Wand2,          desc: "Design & customise" },
  { label: "Templates",      icon: LayoutTemplate, desc: "44+ ready-made" },
  { label: "Preview Live",   icon: Eye,            desc: "See it in the browser" },
  { label: "Publish",        icon: Rocket,         desc: "Go live instantly" },
  { label: "Custom Domain",  icon: Globe,          desc: "Connect your domain" },
];

/* ─── Hub home landing page ──────────────────────────────────────── */
function WebsiteHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mySite, setMySite] = useState<any>(null);
  const [loadingSite, setLoadingSite] = useState(true);

  useEffect(() => {
    fetch("/api/websites/mine", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setMySite(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingSite(false));
  }, []);

  const filteredCategories = INDUSTRY_CATEGORIES.filter(
    (c) =>
      !search ||
      c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-white">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #cffafe 30%, #d1fae5 70%, #ecfdf5 100%)" }}
      >
        {/* Floating browser mockups */}
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div
            initial={{ opacity: 0, rotate: -8, y: 20 }}
            animate={{ opacity: 0.9, rotate: -6, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-6"
          >
            <BrowserMockup gradient="from-blue-600 to-cyan-500" accent="#38bdf8" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: 6, y: 20 }}
            animate={{ opacity: 0.9, rotate: 4, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-4 top-3"
          >
            <BrowserMockup gradient="from-emerald-500 to-teal-500" accent="#34d399" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: 3, y: 30 }}
            animate={{ opacity: 0.75, rotate: 2, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute right-32 -bottom-1"
          >
            <BrowserMockup gradient="from-violet-500 to-indigo-500" accent="#a78bfa" compact />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: -4, y: 30 }}
            animate={{ opacity: 0.7, rotate: -3, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="absolute left-32 bottom-0"
          >
            <BrowserMockup gradient="from-rose-400 to-orange-400" accent="#fb923c" compact />
          </motion.div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 py-14 px-6 text-center max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: "#0c4a6e" }}
          >
            What will you build today?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sky-700/70 mb-6 text-sm"
          >
            Choose a template, customise every detail, and publish your business website in minutes.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-lg mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by industry — restaurant, legal, fitness…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-sm shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder-sky-300 text-gray-700"
            />
          </motion.div>
        </div>
      </div>

      {/* ── Quick actions icon row ──────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate("/dashboard/website/builder")}
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-sky-50 transition-colors group min-w-[80px] shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center group-hover:from-sky-200 group-hover:to-cyan-200 transition-all">
                <action.icon className="h-5 w-5 text-sky-600" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{action.label}</span>
            </motion.button>
          ))}

          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate("/dashboard/website/builder")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-sky-700 hover:to-cyan-700 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> {mySite ? "Edit My Site" : "Create Site"}
          </motion.button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* ── Current site status card ────────────────────────── */}
        {!loadingSite && mySite && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">My website</h2>
            <div
              className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate("/dashboard/website/builder")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-sm">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {mySite.content?.businessName || mySite.slug || "My Website"}
                  </p>
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
              <Button
                size="sm"
                className="shrink-0 bg-sky-600 hover:bg-sky-700 text-white text-xs shadow"
                onClick={(e) => { e.stopPropagation(); navigate("/dashboard/website/builder"); }}
              >
                <Wand2 className="h-3.5 w-3.5 mr-1" /> Edit Site
              </Button>
            </div>
          </motion.section>
        )}

        {!loadingSite && !mySite && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">You don't have a website yet</h3>
              <p className="text-sm text-gray-500 mb-4">Choose a template below and launch your business online in minutes.</p>
              <Button
                onClick={() => navigate("/dashboard/website/builder")}
                className="bg-sky-600 hover:bg-sky-700 text-white shadow"
              >
                <Plus className="h-4 w-4 mr-2" /> Get Started — It's Free
              </Button>
            </div>
          </motion.section>
        )}

        {/* ── Industry categories ─────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Browse by industry</h2>
              <p className="text-xs text-gray-500 mt-0.5">Templates crafted for every South African business</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/website/builder")}
              className="text-sm text-sky-600 font-medium hover:text-sky-800 flex items-center gap-1"
            >
              All templates <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate("/dashboard/website/builder")}
                  className={`${cat.bg} border border-transparent hover:border-current/20 rounded-2xl p-4 text-left group hover:shadow-md transition-all`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className={`text-sm font-bold ${cat.text}`}>{cat.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{cat.count} template{cat.count !== 1 ? "s" : ""}</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── AI Highlight strip ─────────────────────────────────── */}
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
                Let AI pre-fill your content, write your homepage copy, and suggest sections — tailored to your industry and South African market.
              </p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <Button
                onClick={() => navigate("/dashboard/website/builder")}
                className="bg-white text-sky-700 font-semibold hover:bg-sky-50 border-0 shadow-lg"
              >
                Try It <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -right-4 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
          </div>
        </section>

        {/* ── Feature highlights ─────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Everything your site needs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: LayoutTemplate, color: "bg-sky-100 text-sky-700",     title: "44+ Industry Templates",     desc: "Ready-made designs for every SA business sector" },
              { icon: Layers,         color: "bg-emerald-100 text-emerald-700", title: "10 Page Sections",        desc: "Hero, services, gallery, testimonials, contact form & more" },
              { icon: Globe,          color: "bg-violet-100 text-violet-700", title: "Free Subdomain",           desc: "Instant .masakheportal.co.za URL when you publish" },
              { icon: Lock,           color: "bg-pink-100 text-pink-700",    title: "Custom Domain",              desc: "Connect your own domain with free Cloudflare HTTPS" },
              { icon: Zap,            color: "bg-orange-100 text-orange-700", title: "Mobile Optimised",         desc: "Every template looks great on phones & desktops" },
              { icon: Star,           color: "bg-amber-100 text-amber-700",  title: "Live Preview",               desc: "See changes in real-time as you edit each section" },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-100 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl ${feat.color} flex items-center justify-center shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{feat.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Stats strip ─────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Industry templates", value: "44+",  icon: LayoutTemplate, color: "bg-sky-100 text-sky-700" },
            { label: "Page section types", value: "10",   icon: Layers,         color: "bg-emerald-100 text-emerald-700" },
            { label: "Go live in minutes", value: "Free", icon: Rocket,         color: "bg-violet-100 text-violet-700" },
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

/* ─── Back-nav wrapper for sub-pages ────────────────────────────── */
function SubPageWrapper({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
        <Link
          to="/dashboard/website"
          className="flex items-center gap-1.5 text-sm text-sky-600 font-medium hover:text-sky-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Website Hub
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────── */
export default function WebsiteHub() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<WebsiteHome />} />
          <Route
            path="builder"
            element={
              <SubPageWrapper title="Website Builder">
                <WebsiteBuilder />
              </SubPageWrapper>
            }
          />
          <Route
            path="*"
            element={
              <SubPageWrapper title="Website Builder">
                <WebsiteBuilder />
              </SubPageWrapper>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
