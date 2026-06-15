import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, LayoutTemplate, ExternalLink, Sparkles } from "lucide-react";

/* ─── Platform SVG logos ─────────────────────────────────────── */
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
        <linearGradient id={`igp-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FED373"/>
          <stop offset="30%" stopColor="#F15245"/>
          <stop offset="60%" stopColor="#D92E7F"/>
          <stop offset="85%" stopColor="#9B36B7"/>
          <stop offset="100%" stopColor="#515ECF"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#igp-${size})`}/>
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
      <path d="M16 5C10 5 5.5 9.5 5.5 15c0 4.3 2.7 8 6.5 9.7-.1-.8 0-1.9.2-2.8l1.5-6.4s-.4-.8-.4-2c0-1.9 1.1-3.3 2.5-3.3 1.2 0 1.8.9 1.8 2 0 1.2-.8 3-1.2 4.7-.3 1.4.7 2.5 2 2.5 2.4 0 4-2.5 4-6.1 0-3.2-2.3-5.4-5.6-5.4-3.8 0-6 2.9-6 5.8 0 .9.3 1.9.8 2.7.1.1.1.2 0 .3-.1.4-.3 1.3-.3 1.5-.1.2-.2.3-.4.2-1.4-.7-2.3-2.8-2.3-4.5 0-3.6 2.6-7 7.5-7 3.9 0 6.9 2.8 6.9 6.5 0 3.9-2.4 7-5.8 7-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.3.9-.9 2.1-1.4 2.8.7.2 1.5.3 2.3.3 6 0 10.5-4.9 10.5-11S22 5 16 5z" fill="white"/>
    </svg>
  );
}

/* ─── Platform list ──────────────────────────────────────────── */
const PLATFORMS = [
  { id: "instagram", label: "Instagram", desc: "Posts, stories & reels", Logo: IgLogo, accent: "#E1306C" },
  { id: "facebook",  label: "Facebook",  desc: "Posts & cover photos",  Logo: FbLogo, accent: "#1877F2" },
  { id: "linkedin",  label: "LinkedIn",  desc: "Professional content",  Logo: LiLogo, accent: "#0A66C2" },
  { id: "tiktok",    label: "TikTok",    desc: "Short videos & clips",  Logo: TkLogo, accent: "#010101" },
  { id: "youtube",   label: "YouTube",   desc: "Thumbnails & shorts",   Logo: YtLogo, accent: "#FF0000" },
  { id: "twitter",   label: "Twitter / X", desc: "Posts & banners",     Logo: TwLogo, accent: "#000000" },
  { id: "pinterest", label: "Pinterest", desc: "Pins & boards",         Logo: PiLogo, accent: "#E60023" },
  { id: "all",       label: "Any format", desc: "Start from scratch",   Logo: null,   accent: "#7c3aed" },
];

/* ─── Format options ─────────────────────────────────────────── */
const FORMAT_OPTIONS = [
  { id: "ig-post",    label: "Post (4:5)",       platform: "instagram", ratio: "portrait45", bg: "from-pink-500 via-rose-500 to-orange-400" },
  { id: "ig-story",   label: "Story",            platform: "instagram", ratio: "story",      bg: "from-purple-600 via-pink-500 to-orange-400" },
  { id: "ig-square",  label: "Post (1:1)",       platform: "instagram", ratio: "square",     bg: "from-rose-500 to-pink-400" },
  { id: "yt-thumb",   label: "Thumbnail",        platform: "youtube",   ratio: "wide",       bg: "from-red-600 to-red-400" },
  { id: "yt-short",   label: "Short",            platform: "youtube",   ratio: "story",      bg: "from-red-600 to-orange-500" },
  { id: "fb-post",    label: "Post (Landscape)", platform: "facebook",  ratio: "landscape",  bg: "from-blue-600 to-blue-400" },
  { id: "fb-cover",   label: "Cover Photo",      platform: "facebook",  ratio: "banner",     bg: "from-blue-700 via-blue-500 to-indigo-500" },
  { id: "li-post",    label: "Post",             platform: "linkedin",  ratio: "landscape",  bg: "from-sky-700 to-blue-500" },
  { id: "li-video",   label: "Video",            platform: "linkedin",  ratio: "portrait45", bg: "from-sky-800 to-blue-600" },
  { id: "tk-video",   label: "Video",            platform: "tiktok",    ratio: "story",      bg: "from-gray-900 via-slate-800 to-cyan-900" },
  { id: "tw-post",    label: "Post",             platform: "twitter",   ratio: "wide",       bg: "from-gray-900 to-gray-700" },
  { id: "pi-pin",     label: "Pin",              platform: "pinterest", ratio: "portrait45", bg: "from-red-700 to-red-500" },
  { id: "generic-sq", label: "Square",           platform: "all",       ratio: "square",     bg: "from-violet-500 to-purple-600" },
  { id: "generic-ld", label: "Landscape",        platform: "all",       ratio: "landscape",  bg: "from-indigo-500 to-blue-600" },
  { id: "generic-st", label: "Story / Vertical", platform: "all",       ratio: "story",      bg: "from-fuchsia-500 to-pink-600" },
];

/* ─── Quick content templates ────────────────────────────────── */
const QUICK_TEMPLATES = [
  {
    id: "promo",
    label: "Flash Sale",
    desc: "Limited-time discount offer",
    emoji: "⚡",
    color: "from-orange-400 to-red-500",
    text: "⚡ FLASH SALE — 24 HOURS ONLY!\n\nMassive savings are here! Don't miss out on our biggest deals of the season.\n\n🔥 Up to 30% OFF selected items\n⏰ Offer ends midnight tonight\n🛍️ Limited quantities available\n\n#FlashSale #LimitedOffer #ShopLocal #SouthAfrica",
  },
  {
    id: "intro",
    label: "Introduction",
    desc: "Introduce your business",
    emoji: "👋",
    color: "from-blue-400 to-indigo-500",
    text: "👋 Hey there! We're excited to be here!\n\nWe're a proudly South African business dedicated to delivering quality products and outstanding service to our community.\n\nFollow us to stay up to date with news, offers, and tips!\n\n#NewBusiness #SouthAfrica #Entrepreneur #SMME",
  },
  {
    id: "tips",
    label: "Tips & Value",
    desc: "Share useful knowledge",
    emoji: "💡",
    color: "from-teal-400 to-cyan-600",
    text: "💡 Did you know?\n\nHere are 3 quick tips to help you get the most out of our products and services:\n\n✅ Tip 1: [Insert tip here]\n✅ Tip 2: [Insert tip here]\n✅ Tip 3: [Insert tip here]\n\nSave this post for later!\n\n#Tips #Value #SouthAfrica #SmallBusiness",
  },
  {
    id: "testimonial",
    label: "Testimonial",
    desc: "Share a customer review",
    emoji: "⭐",
    color: "from-amber-400 to-yellow-500",
    text: "⭐⭐⭐⭐⭐ What our clients say:\n\n\"[Insert customer review here]\"\n\n— [Client Name]\n\nWe're grateful for every client who trusts us. Thank you for your continued support!\n\n#CustomerReview #Testimonial #SouthAfrica #Grateful",
  },
  {
    id: "new-product",
    label: "New Product",
    desc: "Announce something new",
    emoji: "🚀",
    color: "from-green-400 to-emerald-600",
    text: "🚀 INTRODUCING: [Product / Service Name]\n\nWe've been working hard behind the scenes, and we're thrilled to finally share this with you!\n\n✨ [Key benefit 1]\n✨ [Key benefit 2]\n✨ [Key benefit 3]\n\nAvailable now — link in bio!\n\n#NewProduct #LaunchDay #Innovation #SouthAfrica",
  },
  {
    id: "engagement",
    label: "Engagement",
    desc: "Get your audience talking",
    emoji: "💬",
    color: "from-pink-400 to-rose-600",
    text: "💬 Let's get to know each other!\n\nWe want to hear from YOU. Drop your answer in the comments below 👇\n\nQuestion: [Insert question here]\n\nA) Option 1\nB) Option 2\nC) Option 3\nD) Something else!\n\n#Community #Engagement #SouthAfrica #Poll",
  },
];

/* ─── Format mockup preview ──────────────────────────────────── */
function FormatMockup({ ratio, gradient }: { ratio: string; gradient: string }) {
  if (ratio === "story") return (
    <div className="relative mx-auto overflow-hidden rounded-lg shadow-sm" style={{ width: 48, height: 84 }}>
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      <div className="absolute inset-x-2 top-3 h-1 rounded-full bg-white/30" />
      <div className="absolute bottom-4 inset-x-2 h-6 rounded bg-white/15" />
    </div>
  );
  if (ratio === "portrait45") return (
    <div className="relative mx-auto overflow-hidden rounded-lg shadow-sm" style={{ width: 56, height: 70 }}>
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      <div className="absolute inset-x-2 top-3 h-1 rounded-full bg-white/30" />
      <div className="absolute bottom-3 inset-x-2 h-8 rounded bg-white/15" />
    </div>
  );
  if (ratio === "banner") return (
    <div className="relative mx-auto overflow-hidden rounded-lg shadow-sm" style={{ width: 84, height: 32 }}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-4 rounded bg-white/25" />
    </div>
  );
  if (ratio === "landscape" || ratio === "wide") return (
    <div className="relative mx-auto overflow-hidden rounded-lg shadow-sm" style={{ width: 84, height: 48 }}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
      <div className="absolute inset-x-2 top-2 h-1 rounded-full bg-white/30" />
      <div className="absolute bottom-2 inset-x-2 h-8 rounded bg-white/15" />
    </div>
  );
  return (
    <div className="relative mx-auto overflow-hidden rounded-lg shadow-sm" style={{ width: 64, height: 64 }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-x-2 top-2 h-1 rounded-full bg-white/30" />
      <div className="absolute bottom-2 inset-x-2 h-10 rounded bg-white/15" />
    </div>
  );
}

/* ─── Step 1: Platform picker ────────────────────────────────── */
function PlatformPicker({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create a Design</h1>
        <p className="text-gray-500 mb-8">Which platform are you creating for?</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PLATFORMS.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.03, translateY: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(p.id)}
            className="group flex flex-col items-center gap-3 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-violet-200 transition-all text-center"
          >
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shadow-md"
              style={{ background: p.Logo ? "transparent" : "linear-gradient(135deg,#7c3aed,#9333ea)" }}>
              {p.Logo
                ? <p.Logo size={56} />
                : <Plus className="h-7 w-7 text-white" />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 group-hover:text-violet-700 transition-colors">{p.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{p.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 2: Design options for the chosen platform ─────────── */
function DesignOptions({ platform, onBack }: { platform: string; onBack: () => void }) {
  const platformInfo = PLATFORMS.find(p => p.id === platform);
  const formats = FORMAT_OPTIONS.filter(f => f.platform === platform || (platform === "all" && f.platform === "all"));

  const openNew = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const handleFormat = (fmt: typeof FORMAT_OPTIONS[number]) => {
    openNew(`/social-hub/editor?format=${fmt.id}`);
  };

  const handleTemplate = (tpl: typeof QUICK_TEMPLATES[number]) => {
    openNew(`/social-hub/create?template=${encodeURIComponent(tpl.text)}`);
  };

  const handleBlankCanvas = () => {
    openNew("/social-hub/editor");
  };

  const handleBrowseAllTemplates = () => {
    openNew("/social-hub/templates");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> All platforms
        </button>
        <div className="flex items-center gap-3">
          {platformInfo?.Logo && (
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow">
              <platformInfo.Logo size={40} />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{platformInfo?.label ?? "Design"}</h1>
            <p className="text-sm text-gray-400">Choose a starting point — opens in a new tab</p>
          </div>
        </div>
      </motion.div>

      {/* Blank Canvas — always at top */}
      <section>
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={handleBlankCanvas}
          className="w-full flex items-center gap-5 p-5 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 hover:bg-violet-50 hover:border-violet-400 transition-all group text-left"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg group-hover:shadow-violet-300/50 transition-shadow">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-violet-800">Blank Canvas</p>
            <p className="text-sm text-violet-500/80 mt-0.5">Start from scratch with a completely empty design</p>
          </div>
          <ExternalLink className="h-4 w-4 text-violet-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </section>

      {/* Format options */}
      {formats.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LayoutTemplate className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Visual Formats</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {formats.map((fmt, i) => (
              <motion.button
                key={fmt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 + 0.1 }}
                whileHover={{ scale: 1.04, translateY: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleFormat(fmt)}
                className="group flex flex-col items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 transition-all"
              >
                <FormatMockup ratio={fmt.ratio} gradient={fmt.bg} />
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-violet-700 transition-colors leading-tight text-center">{fmt.label}</p>
                  <ExternalLink className="h-3 w-3 text-gray-300 group-hover:text-violet-400 transition-colors shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Content templates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Content Templates</h2>
          </div>
          <button
            onClick={handleBrowseAllTemplates}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
          >
            Browse all <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_TEMPLATES.map((tpl, i) => (
            <motion.button
              key={tpl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTemplate(tpl)}
              className="group flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 transition-all text-left"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tpl.color} text-2xl shadow-sm`}>
                {tpl.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 group-hover:text-violet-700 transition-colors">{tpl.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{tpl.desc}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────── */
export default function SocialDesignPicker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlatform = searchParams.get("platform") || null;
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(initialPlatform);

  return (
    <div className="min-h-full bg-white overflow-auto">
      {/* Top back-to-hub bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/social-hub")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Social Hub
        </button>
        <span className="text-gray-200 select-none">›</span>
        <span className="text-sm font-semibold text-gray-700">
          {selectedPlatform
            ? PLATFORMS.find(p => p.id === selectedPlatform)?.label ?? "Design"
            : "Create a Design"}
        </span>
      </div>

      {!selectedPlatform
        ? <PlatformPicker onSelect={setSelectedPlatform} />
        : <DesignOptions platform={selectedPlatform} onBack={() => setSelectedPlatform(null)} />}
    </div>
  );
}
