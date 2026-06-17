import { Helmet } from "react-helmet-async";
import { motion, type Easing } from "framer-motion";
import {
  Globe, Smartphone, Wallet, Users, Check, ArrowRight, Sparkles,
  Gift, Shield, Linkedin, Receipt, UserCheck, Banknote, Package,
  Megaphone, CalendarDays, Crown, Building2, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as Easing },
  }),
};

const MODULES = [
  {
    code: "web_builder",
    name: "Web Builder",
    price: "R299",
    priceSub: "/month",
    maxUsers: 2,
    gradient: "from-sky-500 to-emerald-500",
    bg: "from-sky-50 to-emerald-50",
    border: "border-sky-200",
    icon: Globe,
    iconBg: "bg-sky-500",
    features: [
      "Professional website builder",
      "44+ industry templates",
      "Custom domain support",
      "AI content generation",
      "Up to 2 user accounts",
    ],
  },
  {
    code: "social_biz",
    name: "Social Media & Biz Connect",
    price: "R349",
    priceSub: "/month",
    maxUsers: 4,
    gradient: "from-violet-500 to-fuchsia-500",
    bg: "from-violet-50 to-fuchsia-50",
    border: "border-violet-200",
    icon: Smartphone,
    iconBg: "bg-violet-500",
    features: [
      "Social Media Hub & scheduler",
      "Facebook, Instagram, LinkedIn",
      "AI post generation",
      "Biz Connect networking",
      "Up to 4 user accounts",
    ],
  },
  {
    code: "transactions_ops",
    name: "Transactions & Operations",
    price: "R799",
    priceSub: "/month",
    maxUsers: 4,
    gradient: "from-emerald-500 to-teal-500",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    icon: Wallet,
    iconBg: "bg-emerald-500",
    features: [
      "Income & expense tracking",
      "Quotes & invoicing",
      "Client & lead management",
      "Inventory management",
      "Campaigns & automations",
      "Up to 4 user accounts",
    ],
  },
  {
    code: "people_hr",
    name: "People & HR",
    price: "R499",
    priceSub: "/month",
    maxUsers: 3,
    gradient: "from-amber-500 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    icon: Users,
    iconBg: "bg-amber-500",
    features: [
      "Payroll management",
      "Leave & HR tools",
      "Employee records",
      "Team member accounts",
      "Up to 3 user accounts",
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) navigate("/dashboard/billing");
    else navigate("/register");
  };

  return (
    <>
      <Helmet>
        <title>Pricing — Masakhe Growth Hub</title>
        <meta name="description" content="Choose the modules your business needs. Start with a 7-day free trial." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Nav */}
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Masakhe</span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Button onClick={() => navigate("/dashboard")} className="bg-emerald-600 hover:bg-emerald-700">
                  Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild><Link to="/login">Sign In</Link></Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" asChild><Link to="/register">Get Started</Link></Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 pb-24">
          {/* Hero */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="pt-20 pb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
              <Gift className="h-4 w-4" />
              7-day free trial — no credit card required
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              Pay only for what<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">your business needs</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Choose the modules that fit your business. Mix and match, or take everything for one flat rate with a discount.
            </p>
          </motion.div>

          {/* Module cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.code}
                initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                className={`relative flex flex-col rounded-2xl border ${mod.border} bg-gradient-to-br ${mod.bg} p-6 shadow-sm transition-shadow hover:shadow-md`}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${mod.iconBg}`}>
                  <mod.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{mod.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-gray-900">{mod.price}</span>
                  <span className="text-gray-500 text-sm">{mod.priceSub}</span>
                </div>
                <p className="text-xs text-gray-500 mb-5">Up to {mod.maxUsers} user accounts</p>
                <ul className="flex-1 space-y-2.5 mb-6">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleCTA}
                  className={`w-full bg-gradient-to-r ${mod.gradient} text-white border-0 hover:opacity-90 transition-opacity`}
                >
                  Start free trial
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Bundle banner */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={5}
            className="mt-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-sm font-semibold text-amber-300 mb-3">
                  <Crown className="h-4 w-4" />
                  Best value — save R647/month
                </div>
                <h2 className="text-2xl font-extrabold mb-2">Complete Suite</h2>
                <p className="text-gray-400 max-w-xl">
                  All 4 modules bundled together — Web Builder, Social Media & Biz Connect, Transactions & Operations, and People & HR. Includes up to 10 user accounts.
                </p>
              </div>
              <div className="text-center md:text-right shrink-0">
                <div className="text-sm text-gray-400 line-through mb-1">R1,946/month</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-extrabold">R1,299</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <Button
                  onClick={handleCTA}
                  className="bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 font-bold hover:opacity-90 transition-opacity px-8"
                >
                  Get Complete Suite <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              {MODULES.map((m) => (
                <div key={m.code} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-gray-300">{m.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trial CTA */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={6}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-4">
              <Gift className="h-4 w-4" />
              7-day free trial — full access to all modules
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Ready to grow your business?</h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Start your 7-day free trial today. No credit card required. Access everything, then choose the modules you want.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleCTA}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                Start free trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/">Learn more</Link>
              </Button>
            </div>
          </motion.div>

          {/* Trust */}
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={7}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Shield, title: "Secure billing", desc: "All payments via Adumo Online, a registered SA payment gateway." },
              { icon: Star, title: "SA-built platform", desc: "Designed specifically for South African SMMEs and sole traders." },
              { icon: Building2, title: "No lock-in", desc: "Cancel anytime. Add or change modules as your business grows." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{title}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </>
  );
}
