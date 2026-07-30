import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Globe, Users, FileText, BarChart3, Headphones, Shield,
  CheckCircle, ArrowRight, Phone, Mail, MapPin, Zap,
  Building2, TrendingUp, Link2, TicketCheck, ChevronRight,
  Menu, X,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as any },
  }),
};

const SERVICES = [
  { icon: Users,      title: "SMME Registration Hub",    desc: "Register and onboard local small businesses under your municipality with a dedicated unique registration link.", tag: "Onboarding"    },
  { icon: Link2,      title: "Municipality Portal",      desc: "A dedicated management portal to oversee all registered SMMEs, track growth, and manage communication.", tag: "Management"    },
  { icon: BarChart3,  title: "SMME Analytics",           desc: "Monitor SMME growth, sector distribution, and registration trends across your municipality in real time.", tag: "Insights"      },
  { icon: TicketCheck,title: "Support Ticket System",    desc: "Manage business support requests and queries from local SMMEs directly through your portal.", tag: "Support"       },
  { icon: Globe,      title: "Free Business Tools",      desc: "Every registered SMME gets access to a website builder, invoicing, social media hub, and financial tracking.", tag: "Tools"         },
  { icon: Shield,     title: "Verified SMME Directory",  desc: "Build a trusted, verified directory of local businesses that boosts credibility and economic visibility.", tag: "Credibility"   },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Register your municipality",  desc: "Complete a quick registration and get approved by the Masakhe admin team — free for all municipalities.", icon: Building2 },
  { step: "02", title: "Share your unique link",      desc: "Share your municipality code or registration link via WhatsApp, email, or printed flyers to onboard SMMEs.", icon: Link2     },
  { step: "03", title: "Manage and grow",             desc: "Track registered businesses, respond to support tickets, and watch your local SMME economy grow.", icon: TrendingUp },
];

const STATS = [
  { value: "Free",    label: "For municipalities" },
  { value: "100%",    label: "SA-focused platform" },
  { value: "1-click", label: "SMME onboarding"    },
  { value: "24/7",    label: "Platform access"    },
];

export default function MunicipalityLandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Helmet>
        <title>Municipality Portal | Masakhe — Empowering South African SMMEs</title>
      </Helmet>

      {/* ── Top bar ── */}
      <div className="hidden md:flex items-center justify-between bg-[#0a1628] text-white/70 text-xs px-8 py-2">
        <div className="flex items-center gap-6">
          <a href="tel:+27810383955" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="h-3 w-3" /> +27 (0)81 038 3955
          </a>
          <a href="mailto:hello@masakhegroup.co.za" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="h-3 w-3" /> hello@masakhegroup.co.za
          </a>
        </div>
        <span>Empowering South African Businesses Digitally</span>
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#0d1f3c] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/municipality" className="flex items-center gap-2.5">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-9 w-9 object-contain" />
            <span className="text-white text-lg font-bold tracking-tight">Masakhe <span className="text-[#22c55e] font-normal">Group</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <a href="#home"     className="hover:text-white transition-colors">Home</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#how"      className="hover:text-white transition-colors">How It Works</a>
            <a href="#contact"  className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/municipality/login"
              className="text-sm text-white/80 hover:text-white transition-colors px-4 py-2 rounded-lg border border-white/20 hover:border-white/50">
              Sign In
            </Link>
            <Link to="/municipality/register"
              className="text-sm font-semibold text-white px-5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
              style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
              Access Portal <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0d1f3c] border-t border-white/10 px-6 pb-5 space-y-3">
            {["#home","#services","#how","#contact"].map((href, i) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)}
                className="block text-white/80 hover:text-white text-sm py-2 border-b border-white/10 last:border-0">
                {["Home","Services","How It Works","Contact"][i]}
              </a>
            ))}
            <Link to="/municipality/login" className="block text-center text-white/80 border border-white/20 rounded-lg px-4 py-2 text-sm mt-2" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link to="/municipality/register" className="block text-center text-white font-semibold rounded-lg px-4 py-2.5 text-sm" style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }} onClick={() => setMobileOpen(false)}>
              Access Portal
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="home" className="relative min-h-[560px] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,31,60,0.93) 0%, rgba(15,40,80,0.88) 50%, rgba(10,22,40,0.92) 100%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] text-white/90 bg-white/10 border border-white/20 rounded px-3 py-1.5 mb-6 uppercase">
                Municipal SMME Management Platform
              </span>
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              The Masakhe<br />
              <span className="text-[#22c55e]">Municipality Portal</span>
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl">
              A dedicated platform for South African municipalities to register, manage, and support local SMMEs — driving economic growth at the grassroots level.
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link to="/municipality/register"
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-7 py-3.5 rounded-lg text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
                Register Your Municipality <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/municipality/login"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-7 py-3.5 rounded-lg text-sm border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all">
                Sign In to Portal
              </Link>
            </motion.div>

            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={4}
              className="text-white/50 text-xs">
              Free for municipalities · Reviewed and approved by Masakhe admin
            </motion.p>
          </div>

          {/* Floating stat cards */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden lg:grid grid-cols-2 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 text-center">
                <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                <p className="text-white/60 text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="bg-[#f0fdf4] border-y border-green-200 py-4">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-bold text-[#166534] uppercase tracking-widest">Why municipalities choose Masakhe</p>
          <div className="flex flex-wrap gap-6">
            {["100% Free for Municipalities","Real-time SMME Tracking","Dedicated Support System","SA-Built Platform"].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm text-[#166534] font-medium">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── About / Platform ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
              alt="Municipality platform"
              className="rounded-2xl shadow-2xl w-full object-cover"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-bold tracking-[0.2em] text-green-600 uppercase mb-3">About the Platform</p>
            <h2 className="text-4xl font-extrabold text-[#0d1f3c] leading-tight mb-5">
              One Portal. Every SMME in Your Municipality.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              The <strong className="text-[#0d1f3c]">Masakhe Municipality Portal</strong> is built specifically for South African local governments. It gives municipalities a powerful, free platform to track, support, and grow the small business ecosystem in their area.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              From issuing unique registration links to managing support tickets and monitoring SMME growth — everything is in one place, purpose-built for municipal use.
            </p>
            <div className="space-y-3">
              {[
                "Dedicated municipality code for SMME onboarding",
                "Real-time dashboard with SMME counts and stats",
                "Support ticket management for local businesses",
                "Free access to the full Masakhe SMME platform for all registered businesses",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-green-600 uppercase mb-3">What You Get</p>
            <h2 className="text-4xl font-extrabold text-[#0d1f3c] mb-4">Everything Your Municipality Needs</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">A full suite of tools for managing, supporting, and growing the SMME economy in your area.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0d1f3c] to-[#1e40af] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-green-600 uppercase">{s.tag}</span>
                <h3 className="text-base font-bold text-[#0d1f3c] mt-1 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-green-600 uppercase mb-3">Getting Started</p>
            <h2 className="text-4xl font-extrabold text-[#0d1f3c] mb-4">Simple. Fast. Effective.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Get your municipality portal live in three steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200 z-0" style={{ left: "16.67%", right: "16.67%" }} />

            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative z-10 text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0d1f3c] to-[#1e3a5f] flex flex-col items-center justify-center mx-auto mb-5 shadow-lg">
                  <span className="text-[10px] font-bold text-white/50 tracking-widest">{s.step}</span>
                  <s.icon className="h-8 w-8 text-white mt-1" />
                </div>
                <h3 className="text-lg font-bold text-[#0d1f3c] mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative py-20 overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1f3c 0%,#1e3a8a 60%,#0d1f3c 100%)" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-bold tracking-[0.2em] text-green-400 uppercase mb-4">Ready to get started?</p>
            <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">
              Join the Masakhe<br />Municipality Programme Today
            </h2>
            <p className="text-white/65 text-base leading-relaxed mb-8">
              Register your municipality for free, get your unique SMME registration link, and start building the digital economy in your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/municipality/register"
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
                Register Your Municipality <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/municipality/login"
                className="inline-flex items-center justify-center gap-2 text-white/90 font-semibold px-8 py-4 rounded-xl text-sm border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all">
                Sign In to Portal <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Phone,    label: "Phone",   val: "+27 (0)81 038 3955",      href: "tel:+27810383955"                },
              { icon: Mail,     label: "Email",   val: "hello@masakhegroup.co.za", href: "mailto:hello@masakhegroup.co.za" },
              { icon: MapPin,   label: "Country", val: "South Africa",             href: "#"                               },
            ].map((c, i) => (
              <a key={i} href={c.href}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0d1f3c] to-[#1e3a8a] flex items-center justify-center shrink-0">
                  <c.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{c.label}</p>
                  <p className="text-sm font-semibold text-[#0d1f3c]">{c.val}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0d1f3c] text-white/60 py-8">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-7 w-7 object-contain opacity-80" />
            <span className="text-white font-semibold text-sm">Masakhe Group</span>
          </div>
          <p className="text-xs text-center">© {new Date().getFullYear()} Masakhe Group. Empowering South African Businesses Digitally.</p>
          <div className="flex gap-4 text-xs">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms"   className="hover:text-white transition-colors">Terms</Link>
            <Link to="/municipality/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
