import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, ArrowLeft, LayoutDashboard, Globe, Wallet, Receipt, ClipboardCheck, Smartphone, CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "masakhe_walkthrough_done";

const steps = [
  {
    title: "Welcome to Masakhe!",
    description: "Let us show you around your business dashboard. You'll be up and running in under a minute.",
    icon: LayoutDashboard,
    path: "/dashboard",
    color: "bg-primary",
  },
  {
    title: "Website Builder",
    description: "Create a professional website for your business in minutes. Choose a template, add your content, and go live instantly.",
    icon: Globe,
    path: "/dashboard/website",
    color: "bg-sa-green",
  },
  {
    title: "Social Media Hub",
    description: "Manage all your social media platforms from one place. Schedule posts, track engagement, and grow your audience.",
    icon: Smartphone,
    path: "/dashboard/social",
    color: "bg-pink-600",
  },
  {
    title: "Financial Tracking",
    description: "Track your income, expenses, and cash flow. Get a real-time view of your business finances with visual reports.",
    icon: Wallet,
    path: "/dashboard/finance",
    color: "bg-sa-blue",
  },
  {
    title: "Invoice Generation",
    description: "Create and send professional invoices to your customers in seconds. Download as PDF or send directly by email.",
    icon: Receipt,
    path: "/dashboard/invoices",
    color: "bg-sa-gold",
  },
  {
    title: "Funding Readiness",
    description: "Track your compliance score and see how ready your business is to apply for grants and government funding opportunities.",
    icon: ClipboardCheck,
    path: "/dashboard/funding",
    color: "bg-purple-600",
  },
  {
    title: "Billing & Subscription",
    description: "Manage your subscription here. Set up your debit order to keep access to all features after your trial ends.",
    icon: CreditCard,
    path: "/dashboard/billing",
    color: "bg-sa-red",
  },
  {
    title: "You're all set!",
    description: "You now know your way around Masakhe. Your trial is active — explore everything at no cost and subscribe to keep access.",
    icon: Settings,
    path: "/dashboard",
    color: "bg-primary",
  },
];

export default function DashboardWalkthrough() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      navigate(steps[nextStep].path);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      navigate(steps[prevStep].path);
    }
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="mx-2 mb-2">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-1 bg-primary/20">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className={`w-8 h-8 rounded-lg ${current.color} flex items-center justify-center shrink-0`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground p-0.5 rounded">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Step {step + 1} of {steps.length}</p>
            <h3 className="text-sm font-bold font-heading text-foreground leading-tight">{current.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{current.description}</p>
          </div>

          <div className="flex gap-1.5">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={prev} className="flex-none h-7 text-xs px-2">
                <ArrowLeft className="h-3 w-3 mr-0.5" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={next} className="flex-1 h-7 text-xs">
              {step === steps.length - 1 ? "Get Started" : (
                <>
                  Next
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </>
              )}
            </Button>
          </div>

          <button onClick={dismiss} className="text-[10px] text-muted-foreground hover:text-foreground block mx-auto">
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
