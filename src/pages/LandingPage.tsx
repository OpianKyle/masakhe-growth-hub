import { motion, type Easing } from "framer-motion";
import {
  ArrowRight, Globe, Smartphone, BarChart3, Bot, FileText, Shield,
  Megaphone, Check, Wallet, Headphones, ClipboardCheck,
  TrendingUp, ChevronRight, Users, Zap, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import smmeOwner from "@/assets/smme-owner.jpg";
import marketStall from "@/assets/market-stall.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as Easing },
  }),
};

const modules = [
  { icon: Bot,        title: "AI Smart Registration",  description: "CIPC integration, auto-fill business profiles, and intelligent onboarding in minutes.", tag: "Registration" },
  { icon: Globe,      title: "AI Website Builder",      description: "Generate a professional website in minutes with AI-powered content and design.",           tag: "Online Presence" },
  { icon: Smartphone, title: "Social Media Launch",     description: "Automated social media setup with AI-generated content calendars and visuals.",           tag: "Marketing" },
  { icon: Megaphone,  title: "AI Campaign Builder",     description: "Set-and-forget advertising across Google, Facebook, and Instagram with AI optimisation.", tag: "Advertising" },
  { icon: BarChart3,  title: "AI Bookkeeping Lite",     description: "Bank integration, smart categorisation, invoicing, and cash flow projections.",           tag: "Finance" },
  { icon: FileText,   title: "Tax & Compliance",        description: "Automated SARS submissions, VAT201 generation, and compliance monitoring.",               tag: "Compliance" },
];

const stats = [
  { value: "15,000+", label: "SMMEs Registered" },
  { value: "85%",     label: "Tax Compliance Rate" },
  { value: "R2.3B",   label: "Revenue Generated" },
  { value: "12,000+", label: "Jobs Created" },
];

const howItWorks = [
  { step: "01", title: "Register your business", desc: "Create your account and complete our guided onboarding in under 10 minutes.", icon: Lock },
  { step: "02", title: "Set up your digital presence", desc: "Choose a template, answer five questions, and your professional website goes live — complete with WhatsApp, maps, and SEO.", icon: Globe },
  { step: "03", title: "Access funding & grow", desc: "Use your compliance score to unlock SEFA, SEDA, and DTI funding. Manage payroll, invoices, and social media from one dashboard.", icon: TrendingUp },
];

const pricingPlans = [
  {
    code: "starter",
    name: "Starter",
    price: "R899",
    period: "/month",
    description: "Everything to get your SMME online and compliant.",
    features: ["Website Builder", "Financial Tracking", "Invoice Generation", "Compliance Score", "Funding Scoring", "Basic Support"],
    popular: false,
  },
  {
    code: "pro",
    name: "Pro",
    price: "R2,500",
    period: "/month",
    description: "Full suite with social media and advanced analytics.",
    features: ["Everything in Starter", "Social Media Hub", "Content Calendar", "Multi-platform Publishing", "Analytics Dashboard", "Media Library", "Priority Support"],
    popular: true,
  },
];

const testimonials = [
  { name: "Sipho Dlamini",  role: "Construction, Pretoria",       text: "The funding toolkit alone is worth it. We accessed R600,000 in SEFA funding within two months of signing up.",              initials: "SD", color: "bg-emerald-500" },
  { name: "Priya Naidoo",   role: "Accounting Practice, Durban",  text: "The payroll module saves us 8 hours a month. PAYE calculations are accurate and the payslips look professional.",          initials: "PN", color: "bg-purple-500" },
  { name: "Marcus Petersen",role: "Retail Shop, Cape Town",       text: "My website was live on a Monday. By Friday I had three new customer enquiries through the WhatsApp button.",                initials: "MP", color: "bg-blue-500" },
];

const complianceBadges = [
  { label: "POPIA Compliant", color: "border-blue-200 text-blue-700 bg-blue-50" },
  { label: "SARS Ready", color: "border-emerald-200 text-emerald-700 bg-emerald-50" },
  { label: "BEE Verified", color: "border-amber-200 text-amber-700 bg-amber-50" },
  { label: "CIPC Integrated", color: "border-purple-200 text-purple-700 bg-purple-50" },
  { label: "SEFA Partner", color: "border-red-200 text-red-700 bg-red-50" },
  { label: "SEDA Aligned", color: "border-teal-200 text-teal-700 bg-teal-50" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold font-heading text-slate-900">Masakhe</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {["Platform", "Features", "Pricing", "Impact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm" className="text-slate-600">Sign In</Button></Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4">
                Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero: full-bleed cinematic ── */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        <div className="relative container mx-auto px-6 py-24">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl space-y-8">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-sm">
                <Shield className="h-3 w-3" /> South Africa's #1 SMME Platform
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-bold font-heading leading-[1.05] text-white">
              Let us{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">build</span>{" "}
              your business,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">together</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
              From registration to digital presence, invoicing, payroll and social media to business plans — everything your SMME needs to thrive in the digital economy.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 pt-2">
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base h-12 px-7 shadow-lg shadow-blue-900/30">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="border-white/20 text-white bg-white/8 hover:bg-white/15 backdrop-blur-sm text-base h-12 px-7">
                  View Demo
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {["bg-blue-500","bg-emerald-500","bg-purple-500","bg-amber-500"].map((c, i) => (
                  <div key={i} className={`h-8 w-8 rounded-full border-2 border-slate-950 ${c} flex items-center justify-center text-white text-xs font-bold`}>
                    {["T","S","P","M"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/50">
                <strong className="text-white font-semibold">15,000+</strong> South African businesses growing with Masakhe
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
          <div className="flex-1 bg-green-500" /><div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-red-500" /><div className="flex-1 bg-blue-700" /><div className="flex-1 bg-slate-900" />
        </div>
      </section>

      {/* ── Stats: dark numbered strip ── */}
      <section id="impact" className="bg-slate-900 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/10">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center md:px-10">
                <p className="text-4xl md:text-5xl font-bold font-heading text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-2 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance Badges strip ── */}
      <section className="bg-slate-50 border-y border-slate-100 py-5">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {complianceBadges.map((b) => (
              <span key={b.label} className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1.5 ${b.color}`}>
                <Check className="h-3 w-3" /> {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Modules: large numbered editorial rows ── */}
      <section id="platform" className="py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-4">The Platform</p>
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 leading-tight">
                Six tools.<br />One dashboard.
              </h2>
              <p className="text-slate-500 mt-5 text-lg leading-relaxed">
                Every module built exclusively for South African SMMEs — no global generic software, no complexity.
              </p>
              <Link to="/register" className="mt-8 inline-block">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6">
                  Explore the Platform <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="space-y-0 divide-y divide-slate-100">
              {modules.map((mod, i) => (
                <motion.div
                  key={mod.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group flex items-start gap-6 py-8 hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-colors cursor-default"
                >
                  <span className="text-5xl font-bold font-heading text-slate-100 group-hover:text-blue-100 transition-colors leading-none w-14 flex-shrink-0 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 flex-shrink-0">
                        <mod.icon className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{mod.title}</h3>
                      <span className="hidden sm:inline text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{mod.tag}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{mod.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-blue-400 flex-shrink-0 mt-3 group-hover:translate-x-0.5 transition-all" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works: horizontal timeline ── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Getting Started</p>
            <h2 className="text-4xl font-bold font-heading text-white">Up and running in 3 steps</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-0 relative">
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center px-8 relative"
              >
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/8 border border-white/15 backdrop-blur-sm">
                    <step.icon className="h-9 w-9 text-blue-300" />
                  </div>
                  <span className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900">
                    {i + 1}
                  </span>
                </div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Step {step.step}</div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-14">
            <Link to="/register">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 px-8">
                Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Website Builder: full-bleed image + overlay text ── */}
      <section id="features" className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${smmeOwner})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/20" />

        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-xl">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-7">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Website Builder</p>
                <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 leading-tight">
                  Professional website.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">3 minutes. Done.</span>
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                Answer five simple questions and our AI generates a mobile-first website with SEO, WhatsApp integration, and Google Maps — instantly published.
              </p>
              <ul className="space-y-3">
                {[
                  { label: "34 industry templates", sub: "Bakeries, law firms, salons & more" },
                  { label: "WhatsApp chat built-in",  sub: "Convert visitors instantly" },
                  { label: "SEO-optimised content",   sub: "Google-ready from day one" },
                  { label: "Custom .co.za domain",    sub: "Look professional online" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                      <span className="text-sm text-slate-500 ml-2">— {item.sub}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4">
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6">
                    Build My Website <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-xs text-slate-500 leading-none">Live in</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight">3 minutes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Finance & Compliance: dark left | image right ── */}
      <section className="grid lg:grid-cols-2 min-h-[70vh]">
        <div className="bg-slate-900 flex items-center py-20">
          <div className="px-8 lg:px-14 xl:px-20 max-w-xl w-full">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div>
                <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Finance & Compliance</p>
                <h2 className="text-4xl font-bold font-heading text-white leading-tight">
                  Stay compliant.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Unlock funding.</span>
                </h2>
              </div>
              <p className="text-white/60 leading-relaxed text-lg">
                Generate financial records, automate SARS submissions, and maintain a compliance score that opens doors to government funding.
              </p>

              <div className="space-y-4">
                {[
                  { label: "Tax Health Score",  value: "85/100", bar: 85,  color: "bg-emerald-500" },
                  { label: "On-Time Rate",       value: "100%",  bar: 100, color: "bg-blue-500" },
                  { label: "Returns Filed",      value: "24/24", bar: 100, color: "bg-purple-500" },
                  { label: "Funding Readiness",  value: "9/10",  bar: 90,  color: "bg-amber-500" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white/70 font-medium">{m.label}</span>
                      <span className="text-white font-bold">{m.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.bar}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        className={`h-full rounded-full ${m.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/register">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold h-11 px-6 mt-[30px]">
                  Improve My Score <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="relative overflow-hidden min-h-[50vh] lg:min-h-0">
          <img src={marketStall} alt="Market vendor" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900/20" />
          <div className="absolute bottom-8 left-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-400 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Average revenue growth</p>
                <p className="text-white text-lg font-bold">+47% per year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials: large featured quote + row ── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Customer Stories</p>
            <h2 className="text-4xl font-bold font-heading text-slate-900">What our clients say</h2>
          </motion.div>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-600 rounded-3xl p-10 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-0.5 mb-6">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400 text-xl">★</span>)}
                </div>
                <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-8">
                  "Masakhe helped me get my business online in one day. I got my first website enquiry the very same week. The funding toolkit helped us access R800,000 from government — money we didn't even know existed."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 text-sm font-bold flex-shrink-0">TN</div>
                <div>
                  <p className="text-white font-bold">Thandi Nkosi</p>
                  <p className="text-blue-200 text-sm">Fashion Designer & Owner, Soweto</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400 text-xs">★</span>)}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.initials}</div>
                    <div>
                      <p className="text-slate-900 text-xs font-bold">{t.name}</p>
                      <p className="text-slate-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing: dark full-section ── */}
      <section id="pricing" className="py-24 bg-slate-950">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-blue-300 mb-5">
              <Shield className="h-3 w-3" /> 14-Day Free Trial — No Credit Card Required
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white">Simple, transparent pricing</h2>
            <p className="text-slate-400 mt-4 text-lg max-w-xl mx-auto">Start free, upgrade when ready. Cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl flex flex-col overflow-hidden ${
                  plan.popular
                    ? "bg-white"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-xs font-bold text-center py-2 tracking-wider uppercase">
                    Most Popular — Best Value
                  </div>
                )}
                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-5">
                    <h3 className={`text-xl font-bold font-heading ${plan.popular ? "text-slate-900" : "text-white"}`}>{plan.name}</h3>
                    <p className={`text-sm mt-1 ${plan.popular ? "text-slate-500" : "text-white/50"}`}>{plan.description}</p>
                  </div>
                  <div className="mb-8">
                    <span className={`text-5xl font-bold font-heading ${plan.popular ? "text-slate-900" : "text-white"}`}>{plan.price}</span>
                    <span className={`ml-1 text-sm ${plan.popular ? "text-slate-400" : "text-white/40"}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-blue-50" : "bg-white/10"}`}>
                          <Check className={`h-3 w-3 ${plan.popular ? "text-blue-600" : "text-white"}`} />
                        </div>
                        <span className={plan.popular ? "text-slate-700" : "text-white/75"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/register?plan=${plan.code}`} className="block">
                    <Button className={`w-full h-12 font-semibold text-sm rounded-xl ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}>
                      Start 14-day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-sm text-slate-500 mt-8">
            All prices in South African Rand (ZAR). No charge during your 14-day trial period.
          </motion.p>
        </div>
      </section>

      {/* ── CTA: bright blue ── */}
      <section className="relative py-28 overflow-hidden bg-blue-600">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/40 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto space-y-7">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white leading-tight">
              Ready to grow your<br />business with Masakhe?
            </h2>
            <p className="text-lg text-white/70">
              Join 15,000+ South African entrepreneurs already building their future. Registration takes less than 5 minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link to="/register">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-base h-12 px-8 shadow-lg">
                  Start Free Registration <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button className="border-2 border-white/30 text-white bg-transparent hover:bg-white/10 font-semibold text-base h-12 px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/50">14-day free trial · No credit card required · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-white/8">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
                <span className="text-lg font-bold font-heading text-white">Masakhe</span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                "Let us build" — Empowering South African SMMEs through digital transformation.
              </p>
              <div className="flex gap-2 mt-5">
                <div className="h-1.5 flex-1 rounded bg-green-500" />
                <div className="h-1.5 flex-1 rounded bg-amber-400" />
                <div className="h-1.5 flex-1 rounded bg-red-500" />
                <div className="h-1.5 flex-1 rounded bg-blue-700" />
              </div>
            </div>
            {[
              { title: "Platform", links: [{ label: "AI Registration", href: "#" }, { label: "Website Builder", href: "#" }, { label: "Social Media Hub", href: "#" }, { label: "Campaign Builder", href: "#" }, { label: "Payroll & HR", href: "#" }] },
              { title: "Resources", links: [{ label: "Getting Started", href: "#" }, { label: "Funding Toolkit", href: "#" }, { label: "SARS Guide", href: "#" }, { label: "Support Centre", href: "#" }] },
              { title: "Legal", links: [{ label: "Privacy Policy (POPIA)", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Security", href: "#" }, { label: "Contact Us", href: "#" }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-widest">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link to={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link>
                      ) : (
                        <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/masakhe-logo.png" alt="Masakhe" className="h-5 w-5 object-contain opacity-50" />
              <p className="text-sm text-slate-500">© {new Date().getFullYear()} Masakhe Business Solutions (Pty) Ltd. All rights reserved.</p>
            </div>
            <p className="text-xs text-slate-600">Registered in South Africa · POPIA Compliant · BEE Verified</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
