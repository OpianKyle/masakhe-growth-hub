import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { motion, type Easing } from "framer-motion";
import {
  ArrowRight, Globe, Smartphone, BarChart3, FileText, Shield,
  Megaphone, Check, Headphones, Users, Zap, Lock, Wallet,
  Fingerprint, Tag, Building2, AlertTriangle, CreditCard,
  PiggyBank, BadgeCheck, Award, MapPin, Mail, MessageSquare, Send,
  Handshake, Phone, Play, Sparkles
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
  { icon: Globe, title: "Website Builder", description: "Build a professional business website with industry templates and AI-generated content. No coding required.", tag: "Online presence" },
  { icon: Smartphone, title: "Social Media Hub", description: "Create social posts from scratch or start with ready-made templates, all from your dashboard.", tag: "Marketing" },
  { icon: Handshake, title: "Biz Connect", description: "Plan and schedule LinkedIn updates to grow your professional presence from one place.", tag: "Networking" },
  { icon: Wallet, title: "Income & Expenses", description: "Track every rand coming in and going out, and keep a clear view of your business cash flow.", tag: "Finance" },
  { icon: FileText, title: "Quotes & Invoices", description: "Create professional quotes and invoices, track payment status, and follow up with customers.", tag: "Finance" },
  { icon: Headphones, title: "Payroll, Leave & HR", description: "Manage employee records, payroll, and leave information from one organised workspace.", tag: "People" },
  { icon: Users, title: "Client Management", description: "Track client conversations and follow-ups from first contact through to conversion.", tag: "CRM" },
  { icon: Megaphone, title: "Campaign Builder", description: "Plan and launch marketing campaigns to help more customers discover your business.", tag: "Growth" },
  { icon: Award, title: "Partner Program", description: "Refer businesses in your network and take part in the Masakhe Partner Program.", tag: "Partnerships" },
];

const benefits = [
  { icon: Zap, title: "Less admin", description: "Bring routine business tasks together so you can spend more time serving customers." },
  { icon: Wallet, title: "Core tools are free", description: "Use the core Masakhe platform without a subscription, trial period, or platform payment." },
  { icon: Building2, title: "Made for South African SMMEs", description: "Get practical business tools designed with local small businesses in mind." },
  { icon: Users, title: "Fewer disconnected tools", description: "Manage your website, clients, finances, and day-to-day operations in one place." },
  { icon: Sparkles, title: "Keeps improving", description: "New improvements help the platform keep supporting your business as it grows." },
  { icon: PiggyBank, title: "No extra specialists needed", description: "Handle more everyday business work yourself with tools in one accessible workspace." },
];

const howItWorks = [
  { step: "01", title: "Create your account", desc: "Sign up in minutes and complete your business profile with guided onboarding.", icon: Lock },
  { step: "02", title: "Set up your digital presence", desc: "Use the AI website builder to create a professional site. Connect your social media and start publishing content.", icon: Globe },
  { step: "03", title: "Run your business", desc: "Manage invoices, track finances, handle payroll, and grow your client base — all from one dashboard.", icon: Zap },
];

const regSteps = [
  { label: "Create Account",         icon: Lock,           color: "bg-blue-500",   above: true  },
  { label: "Business Status",        icon: Building2,      color: "bg-teal-500",   above: false },
  { label: "Identity Verification",  icon: Fingerprint,    color: "bg-green-500",  above: true  },
  { label: "Business Details",       icon: FileText,       color: "bg-slate-500",  above: false },
  { label: "Contact & Location",     icon: MapPin,         color: "bg-orange-400", above: true  },
  { label: "Confirmation",           icon: BadgeCheck,     color: "bg-emerald-500",above: false },
];

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("submitting");
    setContactError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setContactStatus("success");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setContactError(err.message || "Something went wrong. Please try again.");
      setContactStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Helmet>
        <title>Masakhe | South African SMME Business Platform</title>
        <meta name="description" content="Run your South African SMME with free business tools for websites, social media, invoicing, payroll, clients, campaigns, and more." />
        <meta name="keywords" content="SMME South Africa, invoicing, payroll, website builder, social media, small business platform, Masakhe" />
        <link rel="canonical" href="https://masakheportal.co.za/" />
        <meta property="og:title" content="Masakhe | South African SMME Business Platform" />
        <meta property="og:description" content="Free business tools for South African SMMEs: websites, social media, invoicing, payroll, clients, campaigns, and more." />
        <meta property="og:url" content="https://masakheportal.co.za/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Masakhe | South Africa's SMME Business Platform" />
        <meta name="twitter:description" content="Free business tools for South African SMMEs. Build, invoice, manage, and grow in one place." />
      </Helmet>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold font-heading text-slate-900">Masakhe</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {[
              { label: "About", href: "#about" },
              { label: "Platform", href: "#platform" },
              { label: "Benefits", href: "#benefits" },
              { label: "Free access", href: "#access" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <a key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                {item.label}
              </a>
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

      {/* ── Hero ── */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        <div className="relative container mx-auto px-6 py-24">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl space-y-8">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-sm">
                <Shield className="h-3 w-3" /> Built for South African SMMEs
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-bold font-heading leading-[1.05] text-white">
              Let us{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">build</span>{" "}
              your business,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">together</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
              Website builder, invoicing, payroll, social media, and client management — everything your SMME needs to grow, in one place.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-sm font-semibold text-emerald-300">
              Every Masakhe feature is free. No trial or subscription required.
            </motion.p>
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4 pt-2">
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base h-12 px-7 shadow-lg shadow-blue-900/30">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
          <div className="flex-1 bg-green-500" /><div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-red-500" /><div className="flex-1 bg-blue-700" /><div className="flex-1 bg-slate-900" />
        </div>
      </section>

      {/* ── About Masakhe ── */}
      <section id="about" className="scroll-mt-20 py-20 md:py-24">
        <div className="container mx-auto grid items-center gap-12 px-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">About the platform</p>
            <h2 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              One platform for the work behind your business.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Masakhe is a cloud-based platform built for small businesses. Bring your website, social media, invoices, payroll, client follow-ups, and funding proposals together in one workspace.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Spend less time switching between tools and more time looking after your customers and moving your business forward.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="bg-blue-600 font-semibold text-white hover:bg-blue-700">
                  Create your free account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#platform" className="inline-flex h-10 items-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">
                Explore the tools
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }} className="relative">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
              <img src={smmeOwner} alt="South African small business owner at work" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-xl border border-slate-100 bg-white p-4 shadow-lg sm:left-auto sm:w-[min(22rem,calc(100%-2.5rem))]">
              <p className="text-sm font-bold text-slate-900">Built around real small-business work</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">From your first website to invoices, clients, and day-to-day operations.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Platform Modules ── */}
      <section id="platform" className="scroll-mt-20 py-20 bg-white md:py-28">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-4">The Platform</p>
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 leading-tight">
                Nine tools.<br />One dashboard.
              </h2>
              <p className="text-slate-500 mt-5 text-lg leading-relaxed">
                Everything from your online presence to daily operations, designed for South African SMMEs.
              </p>
              <Link to="/register" className="mt-8 inline-block">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6">
                  Explore the platform <ArrowRight className="ml-2 h-4 w-4" />
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="scroll-mt-20 bg-slate-50 py-20 md:py-24">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">Why Masakhe</p>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Practical support for the work you do every day.</h2>
            <p className="mt-4 leading-relaxed text-slate-600">One accessible workspace for South African small businesses, with core platform features available for free.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => (
              <motion.article
                key={benefit.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-950 relative overflow-hidden md:py-24">
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
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Registration Process ── */}
      <section className="hidden py-20 bg-[#efefef]">
        <div className="container mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Registration Process</h2>
            <div className="w-14 h-0.5 bg-slate-500 mt-3" />
          </div>

          {/* Desktop timeline */}
          <div className="hidden lg:block">
            <div className="relative flex items-stretch" style={{ minHeight: 220 }}>
              {/* Coloured line — sits at vertical centre */}
              <div className="absolute left-14 right-14 top-1/2 -translate-y-1/2 h-2 rounded-full overflow-hidden pointer-events-none">
                <div className="h-full w-full bg-gradient-to-r from-green-400 via-teal-400 via-purple-400 via-blue-400 to-amber-400" />
              </div>

              {/* START label */}
              <div className="relative z-10 flex-shrink-0 w-14 flex items-center">
                <span className="text-green-600 font-black text-sm tracking-widest uppercase">START</span>
              </div>

              {/* Step columns */}
              {regSteps.map((step) => (
                <div key={step.label} className="relative z-10 flex-1 flex flex-col items-center">
                  {/* Above area */}
                  <div className="h-[90px] flex flex-col items-center justify-end pb-0">
                    {step.above ? (
                      <>
                        <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wide leading-tight mb-2 px-1">
                          {step.label}
                        </p>
                        <div className={`h-12 w-12 rounded-xl ${step.color} flex items-center justify-center shadow-md`}>
                          <step.icon className="h-5 w-5 text-white" />
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Connector + dot */}
                  <div className="flex flex-col items-center" style={{ height: 20 }}>
                    {step.above && <div className="w-px flex-1 bg-slate-400" />}
                    <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-400 flex-shrink-0" />
                    {!step.above && <div className="w-px flex-1 bg-slate-400" />}
                  </div>

                  {/* Below area */}
                  <div className="h-[90px] flex flex-col items-center justify-start pt-0">
                    {!step.above ? (
                      <>
                        <div className={`h-12 w-12 rounded-xl ${step.color} flex items-center justify-center shadow-md`}>
                          <step.icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wide leading-tight mt-2 px-1">
                          {step.label}
                        </p>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}

              {/* END label */}
              <div className="relative z-10 flex-shrink-0 w-14 flex items-center justify-end">
                <span className="text-amber-600 font-black text-sm tracking-widest uppercase">END</span>
              </div>
            </div>
          </div>

          {/* Mobile: vertical list */}
          <div className="lg:hidden grid grid-cols-2 gap-4">
            {regSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Step {i + 1}</p>
                  <p className="text-xs font-bold text-slate-700 uppercase leading-tight">{step.label}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs font-bold text-slate-600 mt-12 uppercase tracking-wide">
            Free access to every Masakhe feature{" "}
            <span className="font-normal normal-case text-slate-500">· No subscription or payment required.</span>
          </p>
        </div>
      </section>

      {/* ── Website Builder feature ── */}
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Done in minutes</span>
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                Answer a few simple questions and our AI generates a complete, professional website with multiple sections — ready to preview and publish instantly.
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Industry-specific templates",  sub: "Bakeries, law firms, salons & more" },
                  { label: "AI-generated content",         sub: "Hero, services, gallery, testimonials" },
                  { label: "Multiple section types",       sub: "Mix and match to suit your business" },
                  { label: "Instant live preview",         sub: "See your site before publishing" },
                  { label: "Custom domain support",        sub: "Connect your own .co.za domain" },
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
                  <p className="text-sm font-bold text-slate-900 leading-tight">Live in minutes</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Invoicing & Finance feature ── */}
      <section id="finance" className="grid lg:grid-cols-2 min-h-[70vh]">
        <div className="bg-slate-900 flex items-center py-20">
          <div className="px-8 lg:px-14 xl:px-20 max-w-xl w-full">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div>
                <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Invoicing & Finance</p>
                <h2 className="text-4xl font-bold font-heading text-white leading-tight">
                  Get paid faster.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Stay organised.</span>
                </h2>
              </div>
              <p className="text-white/60 leading-relaxed text-lg">
                Create professional invoices and quotes in seconds, track your income and expenses, and keep your business finances in order.
              </p>

              <ul className="space-y-4">
                {[
                  { icon: FileText, label: "8 professional PDF templates", sub: "Choose a layout that fits your business" },
                  { icon: Check,    label: "Quotes that convert to invoices", sub: "One click to convert any quote" },
                  { icon: BarChart3, label: "Transaction tracking", sub: "Log and categorise income & expenses" },
                  { icon: Wallet,   label: "VAT-inclusive invoicing", sub: "15% VAT auto-calculated" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold h-11 px-6">
                  Start Invoicing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="relative overflow-hidden min-h-[50vh] lg:min-h-0">
          <img src={marketStall} alt="Market vendor" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900/20" />
        </div>
      </section>

      {/* ── Platform video ── */}
      <section className="bg-slate-50 py-20 md:py-24">
        <div className="container mx-auto grid items-center gap-10 px-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">See Masakhe in action</p>
            <h2 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">A clearer way to run your business.</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-slate-600">
              Take a quick look at the Masakhe SME Builder and see how your everyday business tools fit together.
            </p>
            <a
              href="https://youtube.com/shorts/KAXpRTpojbk"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"
            >
              <Play className="h-4 w-4" /> Watch the video on YouTube
            </a>
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-xl">
            <iframe
              src="https://www.youtube-nocookie.com/embed/KAXpRTpojbk"
              title="Masakhe SME Builder overview"
              className="h-full w-full border-0"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="access" className="scroll-mt-20 bg-slate-950 py-20 md:py-24">
        <div className="container mx-auto grid items-center gap-12 px-6 lg:grid-cols-[1fr_1.1fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-emerald-300">
              <Shield className="h-3.5 w-3.5" /> Full platform access
            </span>
            <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">Simple, transparent access.</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
              Use Masakhe’s core business tools without a subscription, trial period, or platform payment.
            </p>
            <Link to="/register" className="mt-7 inline-block">
              <Button className="h-12 bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">
                Create your free account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "No subscription", description: "Core platform features are available without a monthly platform fee." },
              { title: "No trial countdown", description: "Get started without a trial that expires or a credit card requirement." },
              { title: "Tools in one place", description: "Bring business admin, customer follow-up, and marketing together." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <Check className="mb-4 h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 overflow-hidden md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-green-600/20 blur-[120px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-blue-600/25 blur-[100px]" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-amber-500/15 blur-[120px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-0 left-0 right-0 flex h-1">
          <div className="flex-1 bg-green-500" />
          <div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-red-500" />
          <div className="flex-1 bg-blue-700" />
          <div className="flex-1 bg-white/30" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-black font-heading text-white leading-tight mb-6">
              Ready to grow your{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-400 via-green-400 to-amber-400 bg-clip-text text-transparent">
                  business
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-green-400 to-amber-400 rounded-full opacity-60" />
              </span>
              {" "}with Masakhe?
            </h2>

            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto">
              Sign up in minutes. Website, payroll, invoicing, and client management — all in one place.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Link to="/register">
                <Button className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-base h-14 px-10 rounded-xl shadow-2xl shadow-blue-600/40 hover:shadow-blue-500/50 transition-all duration-300 group">
                  Create Your Free Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              <Link to="/login">
                <Button className="border-2 border-white/20 text-white bg-white/5 backdrop-blur-sm hover:bg-white/15 hover:border-white/40 font-semibold text-base h-14 px-8 rounded-xl transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-500">
              {["All features included", "No subscription required", "Free to use"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Form ── */}
      <section id="contact" className="scroll-mt-20 bg-slate-50 py-20 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p custom={0} variants={fadeUp} className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Get In Touch</motion.p>
            <motion.h2 custom={1} variants={fadeUp} className="text-4xl font-bold font-heading text-slate-900 mb-4">We'd love to hear from you</motion.h2>
            <motion.p custom={2} variants={fadeUp} className="text-slate-500 text-lg max-w-xl mx-auto">Have a question about the platform or Partner Program? Send us a message and the Masakhe team will get back to you.</motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Info cards */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 flex flex-col gap-5 justify-center">
              {[
                { icon: Mail, title: "Email the team", desc: "hello@masakhegroup.co.za", sub: "Send us your question", href: "mailto:hello@masakhegroup.co.za" },
                { icon: Phone, title: "Call us", desc: "+27 (0)81 038 3955", sub: "Speak with the Masakhe team", href: "tel:+27810383955" },
                { icon: MessageSquare, title: "Live chat support", desc: "Available inside the platform", sub: "Sign in to start a chat", href: "/login" },
              ].map(({ icon: Icon, title, desc, sub, href }) => (
                <div key={title} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 flex-shrink-0">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{title}</p>
                    {href.startsWith("/") ? (
                      <Link to={href} className="mt-0.5 block text-sm text-slate-700 hover:text-blue-700">
                        {desc}
                      </Link>
                    ) : (
                      <a href={href} className="mt-0.5 block text-sm text-slate-700 hover:text-blue-700">
                        {desc}
                      </a>
                    )}
                    <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              {contactStatus === "success" ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Message sent!</h3>
                  <p className="text-slate-500 max-w-xs">Thank you for reaching out. We'll be in touch with you shortly.</p>
                  <button onClick={() => setContactStatus("idle")} className="mt-2 text-sm text-blue-600 hover:underline font-medium">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us more about your enquiry..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                  {contactStatus === "error" && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{contactError}</p>
                  )}
                  <Button
                    type="submit"
                    disabled={contactStatus === "submitting"}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {contactStatus === "submitting" ? (
                      <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Sending…</span>
                    ) : (
                      <><Send className="h-4 w-4" /> Send Message</>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── B-BEE Banner ── */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 py-5">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-wide leading-tight">
                B-BBEE LEVEL 1 CONTRIBUTOR
              </p>
              <p className="text-green-100 font-semibold text-sm tracking-widest uppercase">
                135% Procurement Recognition
              </p>
            </div>
          </div>
        </div>
      </div>

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
              { title: "Platform", links: [{ label: "All platform tools", href: "#platform" }, { label: "Website Builder", href: "#features" }, { label: "Invoicing & Finance", href: "#finance" }, { label: "Benefits", href: "#benefits" }, { label: "Free access", href: "#access" }] },
              { title: "Account", links: [{ label: "Sign Up", href: "/register" }, { label: "Sign In", href: "/login" }, { label: "Support", href: "#" }] },
              { title: "Legal", links: [{ label: "Privacy Policy (POPIA)", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Contact Us", href: "#contact" }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-widest">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") || link.href.startsWith("#") ? (
                        link.href.startsWith("/") ? (
                          <Link to={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link>
                        ) : (
                          <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</a>
                        )
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
            <p className="text-xs text-slate-600">Registered in South Africa · POPIA Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
