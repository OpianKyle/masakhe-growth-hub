import { motion, type Easing } from "framer-motion";
import {
  ArrowRight, Globe, Smartphone, BarChart3, Bot, FileText, Shield,
  Megaphone, Check, Wallet, Calendar, Image, Headphones, ClipboardCheck,
  Users, TrendingUp, Zap, ChevronRight
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
  {
    icon: Bot,
    title: "AI Smart Registration",
    description: "CIPC integration, auto-fill business profiles, and intelligent onboarding in minutes.",
    tag: "Registration",
  },
  {
    icon: Globe,
    title: "AI Website Builder",
    description: "Generate a professional website in minutes with AI-powered content and design.",
    tag: "Online Presence",
  },
  {
    icon: Smartphone,
    title: "Social Media Launch",
    description: "Automated social media setup with AI-generated content calendars and visuals.",
    tag: "Marketing",
  },
  {
    icon: Megaphone,
    title: "AI Campaign Builder",
    description: "Set-and-forget advertising across Google, Facebook, and Instagram with AI optimisation.",
    tag: "Advertising",
  },
  {
    icon: BarChart3,
    title: "AI Bookkeeping Lite",
    description: "Bank integration, smart categorisation, invoicing, and cash flow projections.",
    tag: "Finance",
  },
  {
    icon: FileText,
    title: "Tax & Compliance",
    description: "Automated SARS submissions, VAT201 generation, and compliance monitoring.",
    tag: "Compliance",
  },
];

const stats = [
  { value: "15,000+", label: "SMMEs Registered" },
  { value: "85%", label: "Tax Compliance Rate" },
  { value: "R2.3B", label: "Revenue Generated" },
  { value: "12,000+", label: "Jobs Created" },
];

const pricingPlans = [
  {
    code: "starter",
    name: "Starter",
    price: "R899",
    period: "/month",
    description: "Everything you need to get your SMME online and compliant.",
    features: [
      "Website Builder",
      "Financial Tracking",
      "Invoice Generation",
      "Compliance Score",
      "Funding Scoring",
      "Basic Support",
    ],
    popular: false,
  },
  {
    code: "pro",
    name: "Pro",
    price: "R2,500",
    period: "/month",
    description: "Full suite with social media management and advanced analytics.",
    features: [
      "Everything in Starter",
      "Social Media Hub",
      "Content Calendar",
      "Multi-platform Publishing",
      "Analytics Dashboard",
      "Media Library",
      "Priority Support",
    ],
    popular: true,
  },
];

const testimonials = [
  {
    name: "Thandi Nkosi",
    role: "Fashion Designer, Soweto",
    text: "Masakhe helped me get my business online in one day. I got my first website enquiry the very same week.",
    initials: "TN",
    color: "bg-blue-500",
  },
  {
    name: "Sipho Dlamini",
    role: "Construction, Pretoria",
    text: "The funding toolkit alone is worth it. We accessed R600,000 in SEFA funding within two months of signing up.",
    initials: "SD",
    color: "bg-emerald-500",
  },
  {
    name: "Priya Naidoo",
    role: "Accounting Practice, Durban",
    text: "The payroll module saves us 8 hours a month. PAYE calculations are accurate and the payslips look professional.",
    initials: "PN",
    color: "bg-purple-500",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold font-heading text-slate-900">Masakhe</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#modules" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Platform</a>
            <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#impact" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-slate-600">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4">
                Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        <div className="relative container mx-auto px-6 py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-2xl space-y-8"
          >
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
              From registration to digital presence, tax compliance to customer engagement — everything your SMME needs to thrive in the digital economy.
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
                {["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500"].map((c, i) => (
                  <div key={i} className={`h-8 w-8 rounded-full border-2 border-slate-950 ${c} flex items-center justify-center text-white text-xs font-bold`}>
                    {["T", "S", "P", "M"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/50">
                <strong className="text-white font-semibold">15,000+</strong> South African businesses growing with Masakhe
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex h-1">
          <div className="flex-1 bg-green-500" />
          <div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-red-500" />
          <div className="flex-1 bg-blue-700" />
          <div className="flex-1 bg-slate-900" />
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section id="impact" className="bg-slate-900 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center md:px-10"
              >
                <p className="text-4xl md:text-5xl font-bold font-heading text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-2 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Modules / Platform ─── */}
      <section id="modules" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-16"
          >
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">The Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 leading-tight">
              Six powerful tools.<br />One dashboard.
            </h2>
            <p className="text-slate-500 mt-5 text-lg leading-relaxed">
              Every module is designed for South African SMMEs — no generic global software, no complexity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-0 border border-slate-100 rounded-2xl overflow-hidden">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`group flex items-start gap-5 p-8 hover:bg-slate-50 transition-colors border-slate-100 ${
                  i % 2 === 0 && i < modules.length - 1 ? "md:border-r" : ""
                } ${i < modules.length - 2 ? "border-b" : ""}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <mod.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{mod.tag}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{mod.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0 mt-1 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature 1: Website Builder ─── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src={smmeOwner} alt="Business owner with digital presence" className="w-full h-auto object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Website live in</p>
                  <p className="text-lg font-bold text-slate-900">3 minutes</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-7"
            >
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Website Builder</p>
                <h2 className="text-4xl font-bold font-heading text-slate-900 leading-tight">
                  A professional website in{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">minutes</span>
                </h2>
              </div>
              <p className="text-slate-500 leading-relaxed text-lg">
                Answer five simple questions and our AI generates a professional, mobile-first website with SEO optimisation, WhatsApp integration, and Google Maps — ready to publish immediately.
              </p>
              <ul className="space-y-4">
                {[
                  { label: "Mobile-first responsive design", sub: "Looks great on every device" },
                  { label: "WhatsApp chat integration", sub: "Convert visitors to customers instantly" },
                  { label: "34 industry templates", sub: "From bakeries to law firms" },
                  { label: "Custom domain support", sub: "Your own .co.za address" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6">
                  Build My Website <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Feature 2: Finance & Compliance ─── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-7 order-2 md:order-1"
            >
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Finance & Compliance</p>
                <h2 className="text-4xl font-bold font-heading text-slate-900 leading-tight">
                  Stay compliant,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">stay funded</span>
                </h2>
              </div>
              <p className="text-slate-500 leading-relaxed text-lg">
                Generate your own financial records, access accounting tools, and maintain a strong compliance score that unlocks government funding opportunities.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Tax Health Score", value: "85/100", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Savings Found", value: "R10,000", color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Returns Filed", value: "24", color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "On-Time Rate", value: "100%", color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl ${stat.bg} p-5`}>
                    <p className={`text-2xl font-bold font-heading ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Link to="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 px-6">
                  Improve My Compliance Score <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-1 md:order-2"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src={marketStall} alt="South African market vendor" className="w-full h-auto object-cover" />
              </div>
              <div className="absolute -top-5 -left-5 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Revenue Growth</p>
                  <p className="text-lg font-bold text-slate-900">+47% avg</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Customer Stories</p>
            <h2 className="text-4xl font-bold font-heading text-white">
              Trusted by thousands of SMMEs
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 transition-colors"
              >
                <div className="flex mb-4 gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/75 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 mb-4">
              <Shield className="h-3 w-3" /> 14-Day Free Trial — No Credit Card Required
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">
              Start free, upgrade when you're ready. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.55 }}
                className={`relative rounded-2xl flex flex-col overflow-hidden ${
                  plan.popular
                    ? "bg-slate-900 shadow-2xl shadow-slate-900/30"
                    : "bg-white border border-slate-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-xs font-bold text-center py-2 tracking-wider uppercase">
                    Most Popular — Best Value
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className={`text-xl font-bold font-heading ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                    <p className={`text-sm mt-1 ${plan.popular ? "text-white/50" : "text-slate-500"}`}>{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <span className={`text-5xl font-bold font-heading ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.price}</span>
                    <span className={`ml-1 text-sm ${plan.popular ? "text-white/40" : "text-slate-400"}`}>{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-white/15" : "bg-blue-50"}`}>
                          <Check className={`h-3 w-3 ${plan.popular ? "text-white" : "text-blue-600"}`} />
                        </div>
                        <span className={plan.popular ? "text-white/80" : "text-slate-700"}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={`/register?plan=${plan.code}`} className="block">
                    <Button
                      className={`w-full h-12 font-semibold text-sm rounded-xl ${
                        plan.popular
                          ? "bg-amber-400 hover:bg-amber-300 text-slate-900"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      Start 14-day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-slate-400 mt-8"
          >
            All prices in South African Rand (ZAR). No charge during your 14-day trial.
          </motion.p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-28 overflow-hidden bg-blue-600">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/40 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-7"
          >
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

      {/* ─── Footer ─── */}
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
              { title: "Platform", links: [
                { label: "AI Registration", href: "#" },
                { label: "Website Builder", href: "#" },
                { label: "Social Media Hub", href: "#" },
                { label: "Campaign Builder", href: "#" },
                { label: "Payroll & HR", href: "#" },
              ]},
              { title: "Resources", links: [
                { label: "Getting Started", href: "#" },
                { label: "Funding Toolkit", href: "#" },
                { label: "SARS Guide", href: "#" },
                { label: "Support Centre", href: "#" },
              ]},
              { title: "Legal", links: [
                { label: "Privacy Policy (POPIA)", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Security", href: "#" },
                { label: "Contact Us", href: "#" },
              ]},
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{col.title}</h4>
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
            <div className="flex items-center gap-2">
              <img src="/masakhe-logo.png" alt="Masakhe" className="h-5 w-5 object-contain opacity-60" />
              <p className="text-sm text-slate-500">© {new Date().getFullYear()} Masakhe Business Solutions (Pty) Ltd. All rights reserved.</p>
            </div>
            <p className="text-xs text-slate-600">Registered in South Africa · POPIA Compliant · BEE Verified</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
