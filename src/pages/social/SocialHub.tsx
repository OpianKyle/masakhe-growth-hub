import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PenSquare, FileText, Edit3, Search, Facebook, Instagram, Linkedin,
  Youtube, ArrowLeft, Sparkles, Image, Calendar, BarChart3, Globe,
  Zap, Plus, ChevronRight, Megaphone, Gift, Tag, Rocket, Star,
  TrendingUp, Users, Heart, Clock, Send, BookOpen, Palette,
  Video, LayoutTemplate, Hash, Camera, Film, Monitor, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SocialPostEditor from "./SocialPostEditor";
import SocialPostTemplates from "./SocialPostTemplates";
import SocialCreate from "./SocialCreate";
import type { SiteConfig } from "@/types/site";

import canvaHome from "@assets/image_1781125346820.png";
import canvaCreate from "@assets/image_1781125361871.png";
import canvaTemplates from "@assets/image_1781125390050.png";
import canvaEditor from "@assets/image_1781125476811.png";

const SITE_CACHE_KEY = "masakhe_site_cache";

/* ─── Platform format cards ─────────────────────────────────────── */
const FORMAT_CARDS = [
  {
    id: "facebook-post",
    label: "Facebook Post",
    sublabel: "Landscape",
    path: "create",
    platform: "facebook",
    color: "#1877F2",
    bg: "from-blue-600 to-blue-400",
    ratio: "landscape",
    icon: Facebook,
    accent: "#e7f0ff",
  },
  {
    id: "instagram-post",
    label: "Instagram Post",
    sublabel: "4:5 Portrait",
    path: "create",
    platform: "instagram",
    color: "#E4405F",
    bg: "from-pink-500 via-rose-500 to-orange-400",
    ratio: "portrait45",
    icon: Instagram,
    accent: "#fff0f3",
  },
  {
    id: "instagram-story",
    label: "Instagram Story",
    sublabel: "9:16 Vertical",
    path: "create",
    platform: "instagram",
    color: "#C13584",
    bg: "from-purple-600 via-pink-500 to-orange-400",
    ratio: "story",
    icon: Smartphone,
    accent: "#faf0ff",
  },
  {
    id: "linkedin-post",
    label: "LinkedIn Post",
    sublabel: "1200 × 627",
    path: "create",
    platform: "linkedin",
    color: "#0A66C2",
    bg: "from-sky-700 to-blue-500",
    ratio: "landscape",
    icon: Linkedin,
    accent: "#e8f4ff",
  },
  {
    id: "youtube-thumb",
    label: "YouTube Thumbnail",
    sublabel: "1280 × 720",
    path: "create",
    platform: "youtube",
    color: "#FF0000",
    bg: "from-red-600 to-red-400",
    ratio: "wide",
    icon: Youtube,
    accent: "#fff0f0",
  },
  {
    id: "tiktok-video",
    label: "TikTok Video",
    sublabel: "1080 × 1920",
    path: "create",
    platform: "tiktok",
    color: "#010101",
    bg: "from-gray-900 via-slate-800 to-cyan-900",
    ratio: "story",
    icon: Film,
    accent: "#f0fffe",
  },
  {
    id: "facebook-cover",
    label: "Facebook Cover",
    sublabel: "820 × 312",
    path: "create",
    platform: "facebook",
    color: "#1877F2",
    bg: "from-blue-700 via-blue-500 to-indigo-500",
    ratio: "banner",
    icon: Monitor,
    accent: "#e7f0ff",
  },
  {
    id: "twitter-post",
    label: "Twitter / X Post",
    sublabel: "1600 × 900",
    path: "create",
    platform: "twitter",
    color: "#000000",
    bg: "from-gray-900 to-gray-700",
    ratio: "landscape",
    icon: Globe,
    accent: "#f4f4f4",
  },
];

/* ─── Template category cards ────────────────────────────────────── */
const TEMPLATE_CATEGORIES = [
  { label: "Advertising",    icon: Megaphone,  color: "from-orange-500 to-rose-500",    bg: "bg-orange-50",   text: "text-orange-700" },
  { label: "Promotions",     icon: Tag,        color: "from-rose-500 to-pink-500",       bg: "bg-rose-50",     text: "text-rose-700" },
  { label: "Services",       icon: Star,       color: "from-green-500 to-emerald-500",   bg: "bg-green-50",    text: "text-green-700" },
  { label: "Engagement",     icon: Heart,      color: "from-pink-500 to-fuchsia-500",    bg: "bg-pink-50",     text: "text-pink-700" },
  { label: "Introduction",   icon: Users,      color: "from-blue-500 to-violet-500",     bg: "bg-blue-50",     text: "text-blue-700" },
  { label: "Giveaway",       icon: Gift,       color: "from-yellow-500 to-orange-500",   bg: "bg-yellow-50",   text: "text-yellow-700" },
  { label: "Tips & Value",   icon: Zap,        color: "from-teal-500 to-cyan-500",       bg: "bg-teal-50",     text: "text-teal-700" },
  { label: "Launch",         icon: Rocket,     color: "from-violet-500 to-purple-600",   bg: "bg-violet-50",   text: "text-violet-700" },
];

/* ─── Quick action shortcuts ─────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: "Post Editor",   icon: Palette,       path: "editor",    desc: "Design visual posts" },
  { label: "Post Templates",icon: LayoutTemplate, path: "templates", desc: "Ready-made content" },
  { label: "Create Post",   icon: Edit3,         path: "create",    desc: "Write & schedule" },
  { label: "Calendar",      icon: Calendar,      path: "calendar",  desc: "View schedule" },
  { label: "Analytics",     icon: BarChart3,     path: "analytics", desc: "Track performance" },
  { label: "Media Library", icon: Image,         path: "media",     desc: "Manage files" },
];

/* ─── Mini platform mockup SVG ───────────────────────────────────── */
function FormatMockup({ ratio, gradient }: { ratio: string; gradient: string }) {
  if (ratio === "story") {
    return (
      <div className="relative mx-auto overflow-hidden rounded-lg shadow-inner" style={{ width: 48, height: 80 }}>
        <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
        <div className="absolute inset-x-3 top-4 h-1.5 rounded-full bg-white/30" />
        <div className="absolute inset-x-4 top-7 h-1 rounded-full bg-white/20" />
        <div className="absolute bottom-5 inset-x-3 h-6 rounded bg-white/10" />
        <div className="absolute bottom-2 inset-x-6 h-2 rounded-full bg-white/40" />
      </div>
    );
  }
  if (ratio === "portrait45") {
    return (
      <div className="relative mx-auto overflow-hidden rounded-lg shadow-inner" style={{ width: 56, height: 70 }}>
        <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
        <div className="absolute inset-x-2 top-3 h-1.5 rounded-full bg-white/30" />
        <div className="absolute inset-x-3 top-6 h-1 rounded-full bg-white/20" />
        <div className="absolute bottom-4 inset-x-2 h-7 rounded bg-white/10" />
        <div className="absolute bottom-2 inset-x-4 h-1.5 rounded-full bg-white/40" />
      </div>
    );
  }
  if (ratio === "banner") {
    return (
      <div className="relative mx-auto overflow-hidden rounded-lg shadow-inner" style={{ width: 88, height: 32 }}>
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-4 rounded bg-white/20" />
        <div className="absolute right-3 inset-y-2 w-12 rounded bg-white/10" />
      </div>
    );
  }
  if (ratio === "wide") {
    return (
      <div className="relative mx-auto overflow-hidden rounded-lg shadow-inner" style={{ width: 80, height: 48 }}>
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
        <div className="absolute inset-x-3 top-3 h-1.5 rounded-full bg-white/30" />
        <div className="absolute inset-x-4 top-6 h-1 rounded-full bg-white/20" />
        <div className="absolute bottom-3 inset-x-3 h-8 rounded bg-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[8px] border-l-white ml-0.5" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative mx-auto overflow-hidden rounded-lg shadow-inner" style={{ width: 80, height: 52 }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-x-3 top-3 h-1.5 rounded-full bg-white/30" />
      <div className="absolute inset-x-4 top-6 h-1 rounded-full bg-white/20" />
      <div className="absolute bottom-3 inset-x-3 h-10 rounded bg-white/10" />
    </div>
  );
}

/* ─── Home landing (Canva-inspired) ─────────────────────────────── */
function SocialHome({ workspaceId, site }: { workspaceId: string | null; site: SiteConfig | null }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/analytics`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setRecentPosts(d.recentPosts || []))
      .catch(() => {});
  }, [workspaceId]);

  const filteredFormats = FORMAT_CARDS.filter(f =>
    !search || f.label.toLowerCase().includes(search.toLowerCase()) || f.sublabel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full bg-white">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ede9fe 0%, #f3e8ff 30%, #fce7f3 60%, #ffe4e6 100%)" }}>
        {/* Floating preview images */}
        <div className="pointer-events-none select-none absolute inset-0">
          <motion.div
            initial={{ opacity: 0, rotate: -8, y: 20 }}
            animate={{ opacity: 0.85, rotate: -6, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute -left-4 top-6 w-44 rounded-xl overflow-hidden shadow-2xl border-2 border-white/80"
          >
            <img src={canvaEditor} alt="" className="w-full h-auto" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: 6, y: 20 }}
            animate={{ opacity: 0.9, rotate: 4, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-6 top-2 w-52 rounded-xl overflow-hidden shadow-2xl border-2 border-white/80"
          >
            <img src={canvaCreate} alt="" className="w-full h-auto" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: 3, y: 30 }}
            animate={{ opacity: 0.75, rotate: 2, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute right-36 -bottom-2 w-40 rounded-xl overflow-hidden shadow-xl border-2 border-white/70"
          >
            <img src={canvaTemplates} alt="" className="w-full h-auto" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: -4, y: 30 }}
            animate={{ opacity: 0.7, rotate: -3, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="absolute left-36 bottom-0 w-36 rounded-xl overflow-hidden shadow-xl border-2 border-white/70"
          >
            <img src={canvaHome} alt="" className="w-full h-auto" />
          </motion.div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 py-14 px-6 text-center max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: "#3b0764" }}
          >
            What will you create today?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-purple-700/70 mb-6 text-sm"
          >
            Design posts, write captions, and publish to all your platforms from one place.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-lg mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search formats, templates, platforms…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-sm shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-purple-300 text-gray-700"
            />
          </motion.div>
        </div>
      </div>

      {/* ── Quick actions icon row ──────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.path}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/dashboard/social/${action.path === "editor" ? "" : action.path}`)}
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-purple-50 transition-colors group min-w-[72px] shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center group-hover:from-violet-200 group-hover:to-purple-200 transition-all">
                <action.icon className="h-5 w-5 text-violet-600" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{action.label}</span>
            </motion.button>
          ))}

          <div className="mx-2 h-10 w-px bg-gray-200 shrink-0" />

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate("/dashboard/social/create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-violet-700 hover:to-purple-700 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> Create Post
          </motion.button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* ── Platform format cards ──────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create for your platform</h2>
              <p className="text-xs text-gray-500 mt-0.5">Pick the right format for every channel</p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {["All","Facebook","Instagram","LinkedIn","YouTube","TikTok"].map((p, i) => (
                <button
                  key={p}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium whitespace-nowrap transition-all ${
                    i === 0
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFormats.map((fmt, i) => {
              const Icon = fmt.icon;
              return (
                <motion.div
                  key={fmt.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button
                    onClick={() => navigate(`/dashboard/social/${fmt.path}`)}
                    className="w-full group text-left"
                  >
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-violet-200">
                      {/* Mockup preview area */}
                      <div
                        className="relative flex items-center justify-center py-6"
                        style={{ background: `linear-gradient(135deg, ${fmt.accent} 0%, white 100%)` }}
                      >
                        <FormatMockup ratio={fmt.ratio} gradient={fmt.bg} />
                        {/* Platform badge */}
                        <div
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: fmt.color }}
                        >
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      {/* Label */}
                      <div className="px-3 pb-3 pt-2">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{fmt.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{fmt.sublabel}</p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Template categories ────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Explore post templates</h2>
              <p className="text-xs text-gray-500 mt-0.5">AI-powered content crafted for your business</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/social/templates")}
              className="text-sm text-violet-600 font-medium hover:text-violet-800 flex items-center gap-1"
            >
              See all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEMPLATE_CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate("/dashboard/social/templates")}
                  className={`${cat.bg} border border-transparent hover:border-current/20 rounded-2xl p-4 text-left group hover:shadow-md transition-all`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className={`text-sm font-bold ${cat.text}`}>{cat.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Browse posts</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── AI Highlight strip ─────────────────────────────────── */}
        <section>
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-6" style={{ background: "linear-gradient(120deg, #7c3aed 0%, #9333ea 50%, #ec4899 100%)" }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-yellow-200 text-xs font-semibold uppercase tracking-wider">AI-Powered</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-1">Generate posts in seconds</h3>
              <p className="text-purple-100 text-sm">Let AI write captions, generate images, and suggest hashtags — tailored to your brand and South African audience.</p>
            </div>
            <div className="shrink-0 hidden sm:block">
              <Button
                onClick={() => navigate("/dashboard/social/create")}
                className="bg-white text-purple-700 font-semibold hover:bg-purple-50 border-0 shadow-lg"
              >
                Try It <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -right-4 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
          </div>
        </section>

        {/* ── Recent posts ────────────────────────────────────────── */}
        {recentPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent posts</h2>
              <button
                onClick={() => navigate("/dashboard/social/calendar")}
                className="text-sm text-violet-600 font-medium hover:text-violet-800 flex items-center gap-1"
              >
                View calendar <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentPosts.slice(0, 6).map((post: any, i: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-100 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <Send className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{post.content_text || "(No text)"}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {post.creator} · {new Date(post.updated_at).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Stats strip ─────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Platforms supported", value: "6+", icon: Globe, color: "bg-violet-100 text-violet-700" },
            { label: "Post templates", value: "50+", icon: LayoutTemplate, color: "bg-pink-100 text-pink-700" },
            { label: "SA focused hashtags", value: "100+", icon: Hash, color: "bg-blue-100 text-blue-700" },
          ].map((s, i) => (
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
          to="/dashboard/social"
          className="flex items-center gap-1.5 text-sm text-violet-600 font-medium hover:text-violet-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Social Hub
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────── */
export default function SocialHub() {
  const location = useLocation();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [site, setSite] = useState<SiteConfig | null>(() => {
    try {
      const cached = localStorage.getItem(SITE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  useEffect(() => {
    fetch("/api/social/workspaces/mine", { credentials: "include" })
      .then(r => r.json())
      .then(d => setWorkspaceId(d.defaultId || ""))
      .catch(() => setWorkspaceId(""));

    fetch("/api/websites/mine", { credentials: "include" })
      .then(r => r.json())
      .then((data: any[]) => {
        if (data?.length > 0) {
          const siteData = data[0].content || data[0];
          setSite(siteData);
          try { localStorage.setItem(SITE_CACHE_KEY, JSON.stringify(siteData)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const isHome = location.pathname === "/dashboard/social" || location.pathname === "/dashboard/social/";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route
            index
            element={<SocialHome workspaceId={workspaceId} site={site} />}
          />

          <Route
            path="editor"
            element={
              <SubPageWrapper title="Post Editor">
                <SocialPostEditor />
              </SubPageWrapper>
            }
          />

          <Route
            path="templates"
            element={
              <SubPageWrapper title="Post Templates">
                {workspaceId === null ? (
                  <div className="p-8 space-y-4 animate-pulse">
                    <div className="h-6 bg-gray-100 rounded w-1/3" />
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl" />)}
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <SocialPostTemplates workspaceId={workspaceId} site={site} createPath="/dashboard/social/create" />
                  </div>
                )}
              </SubPageWrapper>
            }
          />

          <Route
            path="create"
            element={
              <SubPageWrapper title="Create Post">
                {workspaceId === null ? (
                  <div className="p-8 space-y-4 animate-pulse">
                    <div className="h-8 bg-gray-100 rounded w-1/2" />
                    <div className="h-48 bg-gray-100 rounded-2xl" />
                  </div>
                ) : (
                  <SocialCreate workspaceId={workspaceId} calendarPath="/dashboard/social/calendar" />
                )}
              </SubPageWrapper>
            }
          />

          <Route
            path="*"
            element={
              <SubPageWrapper title="Post Editor">
                <SocialPostEditor />
              </SubPageWrapper>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
