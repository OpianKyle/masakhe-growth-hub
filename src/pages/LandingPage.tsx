import { motion, type Easing } from "framer-motion";
import { ArrowRight, Globe, Smartphone, BarChart3, Bot, FileText, Shield, Megaphone, Check, Wallet, Calendar, Image, Headphones, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import smmeOwner from "@/assets/smme-owner.jpg";
import marketStall from "@/assets/market-stall.jpg";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as Easing },
  }),
};

const modules = [
  {
    icon: Bot,
    title: "AI Smart Registration",
    description: "CIPC integration, auto-fill business profiles, and intelligent onboarding in minutes.",
    color: "bg-primary",
  },
  {
    icon: Globe,
    title: "AI Website Builder",
    description: "Generate a professional website in 60 seconds with AI-powered content and design.",
    color: "bg-accent",
  },
  {
    icon: Smartphone,
    title: "Social Media Launch",
    description: "Automated social media setup with AI-generated content calendars and visuals.",
    color: "bg-secondary",
  },
  {
    icon: Megaphone,
    title: "AI Campaign Builder",
    description: "Set-and-forget advertising across Google, Facebook, and Instagram with AI optimization.",
    color: "bg-sa-red",
  },
  {
    icon: BarChart3,
    title: "AI Bookkeeping Lite",
    description: "Bank integration, smart categorization, invoicing, and cash flow projections.",
    color: "bg-primary",
  },
  {
    icon: FileText,
    title: "Tax & Compliance",
    description: "Automated SARS submissions, VAT201 generation, and compliance monitoring.",
    color: "bg-accent",
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
      { icon: Globe, label: "Website Builder" },
      { icon: Wallet, label: "Financial Tracking" },
      { icon: FileText, label: "Invoice Generation" },
      { icon: Shield, label: "Compliance Score" },
      { icon: ClipboardCheck, label: "Grant Readiness" },
      { icon: Headphones, label: "Basic Support" },
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
      { icon: Globe, label: "Everything in Starter" },
      { icon: Smartphone, label: "Social Media Hub" },
      { icon: Calendar, label: "Content Calendar" },
      { icon: Megaphone, label: "Multi-platform Publishing" },
      { icon: BarChart3, label: "Analytics Dashboard" },
      { icon: Image, label: "Media Library" },
      { icon: Headphones, label: "Priority Support" },
    ],
    popular: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <span className="text-lg font-bold text-primary-foreground font-heading">M</span>
            </div>
            <span className="text-xl font-bold font-heading text-foreground">Masakhe</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Modules</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="hero" size="sm">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} custom={0}>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                  <Shield className="h-3 w-3" /> Digital Platform for SMMEs
                </span>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                custom={1}
                className="text-4xl md:text-6xl font-bold font-heading leading-tight text-foreground"
              >
                Let us{" "}
                <span className="text-gradient-hero">build</span>{" "}
                your business,{" "}
                <span className="text-gradient-gold">together</span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                custom={2}
                className="text-lg text-muted-foreground max-w-lg leading-relaxed"
              >
                From registration to digital presence, tax compliance to customer engagement—everything your SMME needs to thrive in the digital economy.
              </motion.p>
              <motion.div variants={fadeInUp} custom={3} className="flex flex-wrap gap-4">
                <Link to="/onboarding">
                  <Button variant="hero" size="lg" className="text-base">
                    Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="text-base">
                    View Demo Dashboard
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp} custom={4} className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background gradient-hero" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">15,000+</strong> SMMEs already growing with Masakhe
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src={heroImage}
                  alt="South African entrepreneurs using digital tools in a vibrant marketplace"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sa-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-card p-4 shadow-elevated border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-sa-black" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue Growth</p>
                    <p className="text-lg font-bold font-heading text-primary">+47%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* SA Flag stripe accent */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-sa-green" />
          <div className="flex-1 bg-sa-gold" />
          <div className="flex-1 bg-sa-red" />
          <div className="flex-1 bg-sa-blue" />
          <div className="flex-1 bg-sa-black" />
        </div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold font-heading text-gradient-hero">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
              Everything Your Business Needs
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Six powerful AI-driven modules designed specifically for South African SMMEs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative rounded-xl border border-border bg-card p-6 hover:shadow-elevated transition-all duration-300"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${mod.color} mb-4`}>
                  <mod.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold font-heading text-foreground mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src={smmeOwner}
                alt="South African business owner showcasing their digital presence"
                className="rounded-2xl shadow-elevated w-full"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold font-heading text-foreground">
                Build Your Website in <span className="text-gradient-gold">60 Seconds</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Answer five simple questions and our AI generates a professional, mobile-first website complete with SEO optimization, WhatsApp integration, and Google Maps.
              </p>
              <ul className="space-y-3">
                {["Mobile-first responsive design", "WhatsApp chat integration", "Google Maps location", "SEO optimized content", "Custom domain support"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant="hero" className="mt-4">
                  Build My Website <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tax Compliance CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 order-2 md:order-1"
            >
              <h2 className="text-3xl font-bold font-heading text-foreground">
                The <span className="text-sa-red">Killer Feature:</span> Automated Tax Compliance
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Connect to SARS eFiling, auto-generate VAT201 returns, provisional tax estimates, and monitor your compliance status—all powered by AI.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Tax Health Score", value: "85/100" },
                  { label: "Savings Found", value: "R10,000" },
                  { label: "Returns Filed", value: "24" },
                  { label: "On-Time Rate", value: "100%" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-2xl font-bold font-heading text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <img
                src={marketStall}
                alt="South African market vendor using digital payment tools"
                className="rounded-2xl shadow-elevated w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Shield className="h-3 w-3" /> 14-Day Free Trial
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
              Simple, Transparent{" "}
              <span className="text-gradient-hero">Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. Start with a 14-day free trial — no commitment, cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className={`relative rounded-2xl border bg-card p-8 flex flex-col ${
                  plan.popular
                    ? "border-secondary shadow-elevated"
                    : "border-border shadow-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="gradient-gold text-sa-black text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-heading text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold font-heading text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {feature.label}
                    </li>
                  ))}
                </ul>

                <Link to={`/register?plan=${plan.code}`}>
                  <Button
                    variant={plan.popular ? "gold" : "hero"}
                    size="lg"
                    className="w-full text-base"
                  >
                    Start 14-day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            All prices in South African Rand (ZAR). No charge during your 14-day trial period.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-sa-gold blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-sa-blue blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary-foreground">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Join thousands of South African SMMEs already thriving with Masakhe. Registration takes less than 5 minutes.
            </p>
            <Link to="/register">
              <Button variant="gold" size="lg" className="text-base mt-4">
                Start Free Registration <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
                  <span className="text-sm font-bold text-primary-foreground font-heading">M</span>
                </div>
                <span className="text-lg font-bold font-heading text-foreground">Masakhe</span>
              </div>
              <p className="text-sm text-muted-foreground">"Let us build" — Empowering South African SMMEs through digital transformation.</p>
            </div>
            {[
              { title: "Platform", links: ["AI Registration", "Website Builder", "Social Media", "Campaigns"] },
              { title: "Resources", links: ["Documentation", "API Reference", "SARS Guide", "Support"] },
              { title: "Legal", links: [
                { label: "Privacy Policy (POPIA)", href: "/privacy" },
                { label: "Terms of Service", href: "#" },
                { label: "Security", href: "#" },
                { label: "Contact", href: "#" },
              ]},
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold font-heading text-foreground mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => {
                    const label = typeof link === "string" ? link : link.label;
                    const href = typeof link === "string" ? "#" : link.href;
                    const isInternal = href.startsWith("/");
                    return (
                      <li key={label}>
                        {isInternal ? (
                          <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                        ) : (
                          <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex h-1 mt-8 mb-4 rounded-full overflow-hidden">
            <div className="flex-1 bg-sa-green" />
            <div className="flex-1 bg-sa-gold" />
            <div className="flex-1 bg-sa-red" />
            <div className="flex-1 bg-sa-blue" />
            <div className="flex-1 bg-sa-black" />
          </div>
          <p className="text-xs text-muted-foreground text-center">© 2026 Masakhe. A digital platform for South African SMMEs.</p>
        </div>
      </footer>
    </div>
  );
}
