import { Helmet } from "react-helmet-async";
import { motion, type Easing } from "framer-motion";
import { ArrowRight, Check, Globe, Smartphone, BarChart3, FileText, Shield, Megaphone, Calendar, Image, Headphones, Wallet, ClipboardCheck, Users, Banknote, BookOpen } from "lucide-react";
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
    name: "Enterprise",
    price: "R599",
    period: "/month",
    description: "Everything you need to get your SMME online and running.",
    features: [
      { icon: BarChart3, label: "Overview Dashboard" },
      { icon: Globe, label: "Website Builder" },
      { icon: Smartphone, label: "Social Media Builder" },
      { icon: Wallet, label: "Transactions" },
      { icon: Headphones, label: "Basic Support" },
    ],
    variant: "hero" as const,
    popular: false,
  },
  {
    code: "pro",
    name: "Enterprise Plus",
    price: "R899",
    period: "/month",
    description: "Everything in Enterprise plus business tools and employee management.",
    features: [
      { icon: Globe, label: "Everything in Enterprise" },
      { icon: BookOpen, label: "Business Toolkit" },
      { icon: Users, label: "Employee Management" },
      { icon: Headphones, label: "Priority Support" },
    ],
    variant: "gold" as const,
    popular: true,
  },
  {
    code: "premium",
    name: "Enterprise Premium",
    price: "R1,499",
    period: "/month",
    description: "Full suite with payroll, client and campaign management.",
    features: [
      { icon: Globe, label: "Everything in Enterprise Plus" },
      { icon: Banknote, label: "Payroll Management" },
      { icon: Users, label: "Client Management" },
      { icon: Megaphone, label: "Campaign Management" },
      { icon: Headphones, label: "Dedicated Support" },
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
        <link rel="canonical" href="https://masakhegroup.co.za/pricing" />
        <meta property="og:title" content="Masakhe Pricing | SMME Plans from R599/month" />
        <meta property="og:description" content="Affordable plans for South African small businesses. Website builder, tax compliance, social media & more — all in one place." />
        <meta property="og:url" content="https://masakhegroup.co.za/pricing" />
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

                <Button
                  variant={plan.variant}
                  size="lg"
                  className="w-full text-base"
                  onClick={() => handleStartTrial(plan.code)}
                >
                  Subscribe Now <ArrowRight className="ml-2 h-4 w-4" />
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
