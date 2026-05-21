import { Helmet } from "react-helmet-async";
import { motion, type Easing } from "framer-motion";
import { ArrowRight, Check, Globe, Smartphone, BarChart3, FileText, Shield, Megaphone, Calendar, Image, Headphones, Wallet, ClipboardCheck, Users, Banknote, BookOpen, MessageCircle, Linkedin, Receipt, UserCog, UserCheck, Sparkles, Crown, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as Easing },
  }),
};

const plans = [
  {
    code: "starter",
    name: "Enterprize",
    price: "Free",
    period: "",
    description: "Start building your business online — no subscription, no credit card.",
    features: [
      { icon: Globe, label: "Website Builder" },
      { icon: BarChart3, label: "Overview Dashboard" },
      { icon: MessageCircle, label: "WhatsApp Support Portal" },
    ],
    variant: "hero" as const,
    popular: false,
    isFree: true,
  },
  {
    code: "pro",
    name: "Enterprize Plus",
    price: "R899",
    period: "/month",
    description: "Everything in Enterprize free, plus social media, Biz Connect and transactions.",
    features: [
      { icon: Gift, label: "7-Day Free Trial included" },
      { icon: UserCheck, label: "3 User Accounts (Owner + 2)" },
      { icon: BarChart3, label: "Overview Dashboard" },
      { icon: Globe, label: "Website Builder" },
      { icon: Smartphone, label: "Social Media Hub" },
      { icon: Linkedin, label: "Biz Connect" },
      { icon: Wallet, label: "Financial Transactions (Income / Expenses, Quotes / Invoices)" },
      { icon: Headphones, label: "Priority Support" },
    ],
    variant: "gold" as const,
    popular: true,
  },
  {
    code: "premium",
    name: "Enterprize Premium",
    price: "R1,499",
    period: "/month",
    description: "Full multi-user suite with operations, payroll, employee management and premium support.",
    features: [
      { icon: Gift, label: "7-Day Free Trial included" },
      { icon: UserCog, label: "5 User Accounts (Owner + 4)" },
      { icon: BarChart3, label: "Overview Dashboard" },
      { icon: Globe, label: "Website Builder" },
      { icon: Smartphone, label: "Social Media Hub" },
      { icon: Linkedin, label: "Biz Connect" },
      { icon: Wallet, label: "Financial Transactions (Income / Expenses, Quotes / Invoices)" },
      { icon: Users, label: "Clients & Inventory Management" },
      { icon: Megaphone, label: "Campaigns & Automations" },
      { icon: UserCheck, label: "Manage Employees" },
      { icon: Banknote, label: "Manage Payroll" },
      { icon: Sparkles, label: "All Future Updates for Free" },
      { icon: Crown, label: "Premium Support" },
    ],
    variant: "hero" as const,
    popular: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartTrial = (planCode: string) => {
    if (!user) {
      navigate(`/register?plan=${planCode}`);
    } else {
      navigate(`/dashboard/billing`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing Plans | Masakhe SMME Platform — From R599/month</title>
        <meta name="description" content="Simple, transparent pricing for South African SMMEs. Basic from R599/month — includes website builder, invoicing, compliance & more. No hidden fees." />
        <link rel="canonical" href="https://masakheportal.co.za/pricing" />
        <meta property="og:title" content="Masakhe Pricing | SMME Plans from R599/month" />
        <meta property="og:description" content="Affordable plans for South African small businesses. Website builder, tax compliance, social media & more — all in one place." />
        <meta property="og:url" content="https://masakheportal.co.za/pricing" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PriceSpecification",
          "name": "Masakhe Pricing Plans",
          "description": "Pricing plans for Masakhe SMME Platform",
          "offers": [
            { "@type": "Offer", "name": "Basic", "price": "599", "priceCurrency": "ZAR", "description": "Website builder, invoicing, compliance score, and funding scoring." },
            { "@type": "Offer", "name": "Pro", "price": "2500", "priceCurrency": "ZAR", "description": "Everything in Basic plus social media hub, content calendar, and analytics." },
            { "@type": "Offer", "name": "Enterprise", "price": "5500", "priceCurrency": "ZAR", "description": "Full platform access with multi-location, white-label, and dedicated support." }
          ]
        })}</script>
      </Helmet>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold font-heading text-foreground">Masakhe</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="sm">Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero" size="sm">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            className="text-center mb-16 space-y-4"
          >
            <motion.span
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary"
            >
              <Shield className="h-3 w-3" /> Simple Monthly Billing
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-4xl md:text-5xl font-bold font-heading text-foreground"
            >
              Simple, Transparent{" "}
              <span className="text-gradient-hero">Pricing</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Choose the plan that fits your business. Billed monthly — no contract, cancel anytime.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative rounded-2xl border backdrop-blur-sm p-8 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? "border-secondary/60 bg-gradient-to-br from-secondary/20 via-card to-card shadow-2xl shadow-secondary/20 scale-105"
                    : "border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-primary/30 shadow-lg hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/60 rounded-full blur-lg opacity-50"></div>
                      <span className="relative gradient-gold text-sa-black text-xs font-bold px-5 py-1.5 rounded-full block shadow-lg shadow-secondary/30">
                        ★ Most Popular
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-3xl font-bold font-heading bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <span className="text-5xl font-black font-heading text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm ml-2 font-medium">{plan.period}</span>}
                  {(plan as any).isFree && <span className="text-muted-foreground text-sm ml-2 font-medium">forever</span>}
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-3 text-sm text-foreground/90">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular 
                          ? "bg-gradient-to-br from-secondary to-secondary/60" 
                          : "bg-primary/15"
                      }`}>
                        <Check className={`h-3.5 w-3.5 ${plan.popular ? "text-white" : "text-primary"}`} />
                      </div>
                      <span className="font-medium">{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.variant}
                  size="lg"
                  className={`w-full text-base font-semibold rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? "shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => handleStartTrial(plan.code)}
                >
                  {(plan as any).isFree ? (
                    <>Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Subscribe Now <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            All prices in South African Rand (ZAR). Billed monthly via debit order. Cancel anytime.
          </motion.p>
        </div>
      </section>

      <div className="flex h-1.5">
        <div className="flex-1 bg-sa-green" />
        <div className="flex-1 bg-sa-gold" />
        <div className="flex-1 bg-sa-red" />
        <div className="flex-1 bg-sa-blue" />
        <div className="flex-1 bg-sa-black" />
      </div>

      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">© 2026 Masakhe. A digital platform for South African SMMEs.</p>
        </div>
      </footer>
    </div>
  );
}
