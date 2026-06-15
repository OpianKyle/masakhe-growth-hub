import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Home, LayoutTemplate, Palette, BarChart3, Image as ImageIcon,
  X, ChevronRight, Send, Hash, Globe, Sparkles, Settings,
} from "lucide-react";
import SocialPostEditor from "./SocialPostEditor";
import SocialPostTemplates from "./SocialPostTemplates";
import SocialCreate from "./SocialCreate";
import SocialMediaLibrary from "./SocialMedia";
import SocialAnalytics from "./SocialAnalytics";
import SocialDesignPicker from "./SocialDesignPicker";
import { useAuth } from "@/contexts/AuthContext";
import type { SiteConfig } from "@/types/site";

const SITE_CACHE_KEY = "masakhe_site_cache";

/* ─── Platform SVG Logo Components ─────────────────────────── */
function FbLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#1877F2"/>
      <path d="M20.5 17h-2.8V27H14V17h-2v-3.5h2V11c0-2.8 1.3-4.5 4.5-4.5H21v3.5h-1.7c-1 0-1.3.4-1.3 1.3V13.5H21L20.5 17z" fill="white"/>
    </svg>
  );
}

function IgLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={`ig-grad-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FED373"/>
          <stop offset="30%" stopColor="#F15245"/>
          <stop offset="60%" stopColor="#D92E7F"/>
          <stop offset="85%" stopColor="#9B36B7"/>
          <stop offset="100%" stopColor="#515ECF"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#ig-grad-${size})`}/>
      <rect x="8" y="8" width="16" height="16" rx="4.5" stroke="white" strokeWidth="1.5" fill="none"/>
      <circle cx="16" cy="16" r="4.2" stroke="white" strokeWidth="1.5" fill="none"/>
      <circle cx="22.2" cy="9.8" r="1.3" fill="white"/>
    </svg>
  );
}

function LiLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0A66C2"/>
      <rect x="8" y="13" width="3.5" height="12" fill="white"/>
      <circle cx="9.75" cy="9.5" r="2" fill="white"/>
      <path d="M15 13h3.2v1.8c.8-1.2 2.2-2.1 4-2.1 3.3 0 4.8 2.2 4.8 5.5V25h-3.5v-6.3c0-1.9-.7-3-2.2-3s-2.8.6-2.8 3.2V25H15V13z" fill="white"/>
    </svg>
  );
}

function YtLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#FF0000"/>
      <path d="M25.8 11.5a2.8 2.8 0 00-1.9-2C22.2 9 16 9 16 9s-6.2 0-7.9.5a2.8 2.8 0 00-1.9 2C5.7 13.3 5.7 16 5.7 16s0 2.7.5 3.5a2.8 2.8 0 001.9 2C9.8 22 16 22 16 22s6.2 0 7.9-.5a2.8 2.8 0 001.9-2c.5-.8.5-3.5.5-3.5s0-2.7-.5-3.5z" fill="white"/>
      <path d="M13.5 19.3V12.7l6 3.3-6 3.3z" fill="#FF0000"/>
    </svg>
  );
}

function TkLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#010101"/>
      <path d="M22.5 8h-2.8v10.2a2.2 2.2 0 11-2.2-2.2v-2.8a5 5 0 105 5V13.2A7.7 7.7 0 0027 14v-2.8a5 5 0 01-4.5-3.2z" fill="white"/>
      <path d="M22.5 8h-2.8v10.2a2.2 2.2 0 11-2.2-2.2v-2.8a5 5 0 105 5V13.2A7.7 7.7 0 0027 14v-2.8a5 5 0 01-4.5-3.2z" fill="#69C9D0" opacity="0.6"/>
    </svg>
  );
}

function TwLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#000000"/>
      <path d="M8 8h4l4 5.5 4-5.5h4l-6 8 6.5 8h-4L16 18l-4.5 6H7.5l6.5-8L8 8z" fill="white"/>
    </svg>
  );
}

function PiLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#E60023"/>
      <path d="M16 5C10 5 5.5 9.5 5.5 15c0 4.3 2.7 8 6.5 9.7-.1-.8 0-1.9.2-2.8l1.5-6.4s-.4-.8-.4-2c0-1.9 1.1-3.3 2.5-3.3 1.2 0 1.8.9 1.8 2 0 1.2-.8 3-.1-4.4.3-1.3.7-2.5 1-2.5 1.8 0 2.1 1.3 2.1 2.8-1.2-3.7-2.8-6.4-2.8-6.4-3.7 0-6.3 2.4-6.3 5.8 0 .9.3 1.9.8 2.7.1.1.1.2 0 .3-.1.4-.3 1.3-.3 1.5-.1.2-.2.3-.4.2-1.4-.7-2.3-2.8-2.3-4.5 0-3.6 2.6-7 7.5-7 3.9 0 6.9 2.8 6.9 6.5 0 3.9-2.4 7-5.8 7-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.3.9-.9 2.1-1.4 2.8.7.2 1.5.3 2.3.3 6 0 10.5-4.9 10.5-11S22 5 16 5z" fill="white"/>
    </svg>
  );
}

/* ─── Format options for Create a Design modal ──────────────── */
const FORMAT_OPTIONS = [
  { id: "ig-post",    label: "Instagram Post (4:5)",    platform: "instagram", ratio: "portrait45", bg: "from-pink-500 via-rose-500 to-orange-400", Logo: IgLogo },
  { id: "ig-story",   label: "Instagram Story",         platform: "instagram", ratio: "story",      bg: "from-purple-600 via-pink-500 to-orange-400", Logo: IgLogo },
  { id: "yt-thumb",   label: "YouTube Thumbnail",       platform: "youtube",   ratio: "wide",       bg: "from-red-600 to-red-400", Logo: YtLogo },
  { id: "fb-post",    label: "Facebook Post (Landscape)",platform: "facebook", ratio: "landscape",  bg: "from-blue-600 to-blue-400", Logo: FbLogo },
  { id: "fb-cover",   label: "Facebook Cover",          platform: "facebook",  ratio: "banner",     bg: "from-blue-700 via-blue-500 to-indigo-500", Logo: FbLogo },
  { id: "li-post",    label: "LinkedIn Post",           platform: "linkedin",  ratio: "landscape",  bg: "from-sky-700 to-blue-500", Logo: LiLogo },
  { id: "li-video",   label: "LinkedIn Video",          platform: "linkedin",  ratio: "portrait45", bg: "from-sky-800 to-blue-600", Logo: LiLogo },
  { id: "tk-video",   label: "TikTok Video",            platform: "tiktok",    ratio: "story",      bg: "from-gray-900 via-slate-800 to-cyan-900", Logo: TkLogo },
  { id: "ig-square",  label: "Instagram Post (1:1)",    platform: "instagram", ratio: "square",     bg: "from-rose-500 to-pink-400", Logo: IgLogo },
  { id: "tw-post",    label: "Twitter / X Post",        platform: "twitter",   ratio: "wide",       bg: "from-gray-900 to-gray-700", Logo: TwLogo },
  { id: "pi-pin",     label: "Pinterest Pin",           platform: "pinterest", ratio: "portrait45", bg: "from-red-700 to-red-500", Logo: PiLogo },
  { id: "yt-short",   label: "YouTube Short",           platform: "youtube",   ratio: "story",      bg: "from-red-600 to-orange-500", Logo: YtLogo },
];

const PLATFORMS = [
  { id: "all",       label: "Popular" },
  { id: "facebook",  label: "Facebook",  Logo: FbLogo },
  { id: "instagram", label: "Instagram", Logo: IgLogo },
  { id: "linkedin",  label: "LinkedIn",  Logo: LiLogo },
  { id: "pinterest", label: "Pinterest", Logo: PiLogo },
  { id: "tiktok",    label: "TikTok",    Logo: TkLogo },
  { id: "twitter",   label: "Twitter",   Logo: TwLogo },
  { id: "youtube",   label: "YouTube",   Logo: YtLogo },
];

const MODAL_CATS = [
  { id: "foryou",       label: "For you" },
  { id: "social",       label: "Social media" },
  { id: "photo",        label: "Photo editor" },
  { id: "video",        label: "Videos" },
  { id: "presentation", label: "Presentations" },
  { id: "document",     label: "Docs" },
];

/* ─── Format mockup preview ─────────────────────────────────── */
function FormatMockup({ ratio, gradient }: { ratio: string; gradient: string }) {
  if (ratio === "story") return (
    <div className="relative mx-auto overflow-hidden rounded-xl shadow-md" style={{ width: 80, height: 140 }}>
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      <div className="absolute inset-x-4 top-5 h-2 rounded-full bg-white/30" />
      <div className="absolute inset-x-5 top-10 h-1.5 rounded-full bg-white/20" />
      <div className="absolute bottom-8 inset-x-4 h-12 rounded bg-white/15" />
      <div className="absolute bottom-3 inset-x-8 h-3 rounded-full bg-white/40" />
    </div>
  );
  if (ratio === "portrait45") return (
    <div className="relative mx-auto overflow-hidden rounded-xl shadow-md" style={{ width: 90, height: 112 }}>
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      <div className="absolute inset-x-3 top-4 h-2 rounded-full bg-white/30" />
      <div className="absolute inset-x-4 top-8 h-1.5 rounded-full bg-white/20" />
      <div className="absolute bottom-6 inset-x-3 h-14 rounded bg-white/15" />
    </div>
  );
  if (ratio === "banner") return (
    <div className="relative mx-auto overflow-hidden rounded-xl shadow-md" style={{ width: 140, height: 52 }}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-6 rounded bg-white/25" />
      <div className="absolute right-4 inset-y-3 w-20 rounded bg-white/15" />
    </div>
  );
  if (ratio === "wide") return (
    <div className="relative mx-auto overflow-hidden rounded-xl shadow-md" style={{ width: 140, height: 78 }}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
      <div className="absolute inset-x-4 top-4 h-2 rounded-full bg-white/30" />
      <div className="absolute inset-x-5 top-8 h-1.5 rounded-full bg-white/20" />
      <div className="absolute bottom-4 inset-x-4 h-16 rounded bg-white/15" />
    </div>
  );
  return (
    <div className="relative mx-auto overflow-hidden rounded-xl shadow-md" style={{ width: 120, height: 120 }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-x-4 top-5 h-2 rounded-full bg-white/30" />
      <div className="absolute inset-x-5 top-10 h-1.5 rounded-full bg-white/20" />
      <div className="absolute bottom-5 inset-x-4 h-20 rounded bg-white/15" />
    </div>
  );
}

/* ─── Create a Design Modal ─────────────────────────────────── */
function CreateDesignModal({ open, onClose, onSelect }: {
  open: boolean;
  onClose: () => void;
  onSelect: (format: typeof FORMAT_OPTIONS[number]) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("social");
  const [activePlatform, setActivePlatform] = useState("all");

  const filtered = FORMAT_OPTIONS.filter(f => {
    const matchPlatform = activePlatform === "all" || f.platform === activePlatform;
    const matchSearch = !search || f.label.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchSearch;
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex"
            style={{ width: 900, maxWidth: "95vw", height: 620, maxHeight: "90vh" }}
            initial={{ scale: 0.93, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            {/* Left sidebar */}
            <div className="w-48 border-r border-gray-100 flex flex-col shrink-0 py-4">
              <h2 className="text-lg font-bold text-gray-900 px-5 mb-4">Create a design</h2>
              <div className="flex-1 overflow-y-auto">
                {MODAL_CATS.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={`w-full text-left px-5 py-2.5 text-sm font-medium rounded-xl mx-1 transition-colors ${
                      activeCat === cat.id
                        ? "bg-violet-100 text-violet-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={{ width: "calc(100% - 8px)" }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search bar */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="What would you like to create?"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 bg-gray-50"
                    autoFocus
                  />
                </div>
              </div>

              {/* Platform tabs */}
              <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-gray-100 overflow-x-auto scrollbar-none">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                      activePlatform === p.id
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p.Logo && activePlatform !== p.id && (
                      <p.Logo size={14} />
                    )}
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Section heading */}
              <div className="px-5 pt-3 pb-1">
                <p className="text-sm font-bold text-gray-900">
                  {PLATFORMS.find(p => p.id === activePlatform)?.label || "Popular"}
                </p>
              </div>

              {/* Format grid */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="grid grid-cols-4 gap-3">
                  {filtered.map(fmt => (
                    <motion.button
                      key={fmt.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSelect(fmt)}
                      className="group flex flex-col bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all text-left"
                    >
                      <div className="relative flex items-center justify-center py-5 bg-white">
                        <FormatMockup ratio={fmt.ratio} gradient={fmt.bg} />
                        <div className="absolute top-2 right-2">
                          <fmt.Logo size={22} />
                        </div>
                      </div>
                      <div className="px-3 py-2">
                        <p className="text-[11px] font-semibold text-gray-700 leading-tight">{fmt.label}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Search className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">No formats found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Platform shortcut icons for home ─────────────────────── */
const PLATFORM_SHORTCUTS = [
  { id: "instagram", label: "Instagram", Logo: IgLogo, path: "/social-hub/design?platform=instagram" },
  { id: "facebook",  label: "Facebook",  Logo: FbLogo, path: "/social-hub/design?platform=facebook" },
  { id: "tiktok",    label: "TikTok",    Logo: TkLogo, path: "/social-hub/design?platform=tiktok" },
  { id: "youtube",   label: "YouTube",   Logo: YtLogo, path: "/social-hub/design?platform=youtube" },
  { id: "linkedin",  label: "LinkedIn",  Logo: LiLogo, path: "/social-hub/design?platform=linkedin" },
  { id: "twitter",   label: "Twitter",   Logo: TwLogo, path: "/social-hub/design?platform=twitter" },
  { id: "pinterest", label: "Pinterest", Logo: PiLogo, path: "/social-hub/design?platform=pinterest" },
];

/* ─── Standalone Home ───────────────────────────────────────── */
function StandaloneHome({
  workspaceId, site, onCreateDesign,
}: {
  workspaceId: string | null;
  site: SiteConfig | null;
  onCreateDesign: () => void;
}) {
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

  return (
    <div className="min-h-full bg-white overflow-auto">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div
        className="pt-20 pb-14 px-8 text-center"
        style={{ background: "linear-gradient(160deg, #f5f0ff 0%, #ede9fe 30%, #fce7f3 65%, #fff0f5 100%)" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
          style={{
            background: "linear-gradient(90deg, #7c3aed 0%, #9333ea 40%, #ec4899 80%, #f43f5e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          What will you design today?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-purple-600/70 mb-8 text-base"
        >
          Design posts, write captions, and publish to all your platforms from one place.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative max-w-xl mx-auto mb-6"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search && navigate("/social-hub/templates")}
            placeholder="Search designs, folders and uploads"
            className="w-full pl-13 pr-5 py-4 rounded-2xl border border-white/70 bg-white/90 backdrop-blur-sm shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder-gray-400 text-gray-700"
            style={{ paddingLeft: 52 }}
          />
        </motion.div>

        {/* Create a Design button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/social-hub/design")}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
          style={{ background: "linear-gradient(90deg, #7c3aed, #9333ea, #ec4899)" }}
        >
          <Plus className="h-5 w-5" />
          Create a design
        </motion.button>
      </div>

      {/* ── Platform shortcuts row ────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-start gap-6 overflow-x-auto scrollbar-none pb-2">
          {PLATFORM_SHORTCUTS.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(p.path)}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-200">
                <p.Logo size={56} />
              </div>
              <span className="text-[11px] text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                {p.label}
              </span>
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => navigate("/social-hub/design")}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-all">
              <span className="text-gray-500 text-xl font-bold">···</span>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">More</span>
          </motion.button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pb-12 space-y-10">

        {/* Quick actions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Quick access</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Create Design", icon: Plus,           path: "/social-hub/design",    desc: "Design & templates",   color: "from-violet-500 to-purple-600" },
              { label: "Post Editor",   icon: Palette,        path: "/social-hub/editor",    desc: "Visual post editor",   color: "from-fuchsia-500 to-pink-500" },
              { label: "Create Post",   icon: Sparkles,       path: "/social-hub/create",     desc: "Write & schedule",     color: "from-emerald-500 to-teal-500" },
              { label: "Analytics",     icon: BarChart3,      path: "/social-hub/analytics",  desc: "Track performance",    color: "from-blue-500 to-cyan-500" },
            ].map((a, i) => (
              <motion.button
                key={a.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(a.path)}
                className="group flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0`}>
                  <a.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                  <p className="text-[10px] text-gray-400">{a.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recents */}
        {recentPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recents</h2>
              <button
                onClick={() => navigate("/social-hub/analytics")}
                className="text-sm text-violet-600 font-medium hover:text-violet-800 flex items-center gap-1"
              >
                View all <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {recentPosts.slice(0, 8).map((post: any, i: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-100 hover:-translate-y-0.5 transition-all overflow-hidden group cursor-pointer"
                  onClick={() => navigate("/social-hub/create")}
                >
                  <div
                    className="h-28 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #ede9fe, #fce7f3)" }}
                  >
                    <Send className="h-8 w-8 text-violet-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-700 truncate font-medium">{post.content_text || "(No text)"}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {post.creator} · {new Date(post.updated_at).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: "Platforms supported", value: "7+", icon: Globe, grad: "from-violet-500 to-purple-600" },
            { label: "Post templates", value: "50+", icon: LayoutTemplate, grad: "from-pink-500 to-rose-500" },
            { label: "SA focused hashtags", value: "100+", icon: Hash, grad: "from-blue-500 to-cyan-500" },
          ].map((s, i) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className="h-5 w-5 text-white" />
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

/* ─── Left icon sidebar ─────────────────────────────────────── */
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

  const isAt = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navItems = [
    { icon: Home,          label: "Home",      path: "/social-hub" },
    { icon: LayoutTemplate,label: "Templates", path: "/social-hub/templates" },
    { icon: Palette,       label: "Editor",    path: "/social-hub/editor" },
    { icon: BarChart3,     label: "Analytics", path: "/social-hub/analytics" },
    { icon: ImageIcon,     label: "Media",     path: "/social-hub/media" },
  ];

  return (
    <div className="w-[72px] bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-1 shrink-0 h-full">
      {/* Create button */}
      <button
        onClick={() => navigate("/social-hub/design")}
        className="w-11 h-11 mb-4 flex items-center justify-center rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
        title="Create a design"
      >
        <Plus className="h-5 w-5 text-white" />
      </button>

      {navItems.map(item => {
        const active = item.path === "/social-hub"
          ? location.pathname === "/social-hub" || location.pathname === "/social-hub/"
          : isAt(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium transition-all ${
              active
                ? "bg-violet-50 text-violet-700"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            }`}
            title={item.label}
          >
            <item.icon className={`h-5 w-5 ${active ? "text-violet-600" : ""}`} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Settings */}
      <button
        onClick={() => window.open("/dashboard/settings", "_blank")}
        className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
        title="Settings"
      >
        <Settings className="h-5 w-5" />
        <span>Settings</span>
      </button>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer mt-1 shadow-sm"
        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
        title={`Signed in`}
      >
        {initials}
      </div>
    </div>
  );
}

/* ─── Sub-page top bar (back nav + title) ───────────────────── */
function SubBar({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
      <button
        onClick={() => navigate("/social-hub")}
        className="flex items-center gap-1.5 text-sm text-violet-600 font-medium hover:text-violet-800 transition-colors"
      >
        <Home className="h-4 w-4" /> Home
      </button>
      <span className="text-gray-200">›</span>
      <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────── */
export default function SocialHubStandalone() {
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <LeftNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route
            index
            element={
              <StandaloneHome
                workspaceId={workspaceId}
                site={site}
                onCreateDesign={() => {}}
              />
            }
          />

          <Route
            path="design"
            element={
              <div className="flex-1 overflow-auto">
                <SocialDesignPicker />
              </div>
            }
          />

          <Route
            path="editor"
            element={
              <div className="flex flex-col h-full">
                <SubBar title="Post Editor" />
                <div className="flex-1 overflow-hidden">
                  <SocialPostEditor />
                </div>
              </div>
            }
          />

          <Route
            path="templates"
            element={
              <div className="flex flex-col h-full">
                <SubBar title="Templates" />
                <div className="flex-1 overflow-auto">
                  {workspaceId === null ? (
                    <div className="p-8 space-y-4 animate-pulse">
                      <div className="h-6 bg-gray-100 rounded w-1/3" />
                      <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl" />)}
                      </div>
                    </div>
                  ) : (
                    <SocialPostTemplates workspaceId={workspaceId} site={site} createPath="/social-hub/create" editorPath="/social-hub/editor" />
                  )}
                </div>
              </div>
            }
          />

          <Route
            path="create"
            element={
              <div className="flex flex-col h-full">
                <SubBar title="Create Post" />
                <div className="flex-1 overflow-auto">
                  {workspaceId === null ? (
                    <div className="p-8 space-y-4 animate-pulse">
                      <div className="h-8 bg-gray-100 rounded w-1/2" />
                      <div className="h-48 bg-gray-100 rounded-2xl" />
                    </div>
                  ) : (
                    <SocialCreate workspaceId={workspaceId} calendarPath="/social-hub" />
                  )}
                </div>
              </div>
            }
          />

          <Route
            path="analytics"
            element={
              <div className="flex flex-col h-full">
                <SubBar title="Analytics" />
                <div className="flex-1 overflow-auto p-6">
                  {workspaceId !== null && <SocialAnalytics workspaceId={workspaceId} />}
                </div>
              </div>
            }
          />

          <Route
            path="media"
            element={
              <div className="flex flex-col h-full">
                <SubBar title="Media Library" />
                <div className="flex-1 overflow-auto p-6">
                  {workspaceId !== null && <SocialMediaLibrary workspaceId={workspaceId} />}
                </div>
              </div>
            }
          />

          <Route
            path="*"
            element={
              <div className="flex flex-col h-full">
                <SubBar title="Post Editor" />
                <div className="flex-1 overflow-hidden">
                  <SocialPostEditor />
                </div>
              </div>
            }
          />
        </Routes>
      </div>

    </div>
  );
}
