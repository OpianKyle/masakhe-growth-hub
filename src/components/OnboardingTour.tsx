import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Globe, Megaphone, Receipt, Users, Wallet, Banknote,
  CheckCircle2, ArrowRight, ArrowLeft, X, Building2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  subtitle: string;
  bullets: string[];
}

const STEPS: Step[] = [
  {
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    title: "Website Builder",
    subtitle: "Go live in minutes with a professional website.",
    bullets: [
      "44+ industry-specific templates",
      "AI-powered content generation",
      "Custom domain & instant publishing",
    ],
  },
  {
    icon: Megaphone,
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-950/40",
    title: "Social Media Hub",
    subtitle: "Schedule and publish across all your social platforms.",
    bullets: [
      "Facebook, Instagram & LinkedIn",
      "Post scheduling & queue management",
      "AI-generated captions & hashtags",
    ],
  },
  {
    icon: Receipt,
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    title: "Invoicing & Quotes",
    subtitle: "Create professional invoices and get paid faster.",
    bullets: [
      "6 professional PDF invoice templates",
      "Quotes that convert to invoices in one click",
      "Automated payment reminders",
    ],
  },
  {
    icon: Wallet,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    title: "Financial Tracking",
    subtitle: "Know exactly where your money is going.",
    bullets: [
      "Income & expense tracking",
      "Real-time profit & loss view",
      "Categorised transactions",
    ],
  },
  {
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    title: "Client Management",
    subtitle: "Your entire client base, organised in one place.",
    bullets: [
      "Full CRM with notes & history",
      "Campaigns & follow-up automations",
      "Inventory management built in",
    ],
  },
  {
    icon: Banknote,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    title: "Payroll & HR",
    subtitle: "Pay your team and manage leave with ease.",
    bullets: [
      "Automated payslip generation",
      "Leave management & HR tools",
      "Employee records — fully compliant",
    ],
  },
];

export default function OnboardingTour() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(-1); // -1 = welcome screen
  const [visible, setVisible] = useState(true);

  const municipalityParam = searchParams.get("municipality");
  const [municipalityName, setMunicipalityName] = useState<string | null>(null);

  useEffect(() => {
    if (municipalityParam) {
      fetch(`/api/municipality/check/${encodeURIComponent(municipalityParam)}`)
        .then(r => r.json())
        .then(d => { if (d.valid) setMunicipalityName(d.name); })
        .catch(() => {});
    }
  }, [municipalityParam]);

  function finish() {
    setVisible(false);
    // Remove the onboarding params from the URL without re-navigating
    navigate("/dashboard", { replace: true });
  }

  if (!visible) return null;

  const totalSteps = STEPS.length;
  const isWelcome = step === -1;
  const isDone = step === totalSteps;
  const currentStep = !isWelcome && !isDone ? STEPS[step] : null;
  const progress = isWelcome ? 0 : isDone ? 100 : Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Progress bar */}
        <div className="h-1 bg-muted w-full">
          <div
            className="h-1 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-7 w-7 object-contain" />
            <span className="text-sm font-bold text-foreground">Masakhe</span>
          </div>
          <button
            onClick={finish}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex-1">

          {/* ── Welcome Screen ── */}
          {isWelcome && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Masakhe!</h2>
                {municipalityName ? (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    You've registered through{" "}
                    <span className="font-semibold text-foreground">{municipalityName}</span>.
                    Your <strong>14-day free trial</strong> is already active — no credit card needed.
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your <strong>14-day free trial</strong> is now active. Let's take a quick tour of everything Masakhe has to offer your business.
                  </p>
                )}
              </div>

              {municipalityName && (
                <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3 text-left">
                  <Building2 className="h-5 w-5 text-green-700 dark:text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">Trial activated by {municipalityName}</p>
                    <p className="text-xs text-green-700 dark:text-green-400">Your municipality has given you free access to explore the platform.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-1">
                {STEPS.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                ))}
              </div>
            </div>
          )}

          {/* ── Feature Step ── */}
          {currentStep && (
            <div className="space-y-5">
              <div className={`w-16 h-16 rounded-2xl ${currentStep.bg} flex items-center justify-center`}>
                <currentStep.icon className={`h-8 w-8 ${currentStep.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {step + 1} of {totalSteps}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1.5">{currentStep.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{currentStep.subtitle}</p>
              </div>
              <ul className="space-y-2.5">
                {currentStep.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
              {/* Dot progress */}
              <div className="flex items-center gap-1.5 pt-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Done Screen ── */}
          {isDone && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">You're all set!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Explore at your own pace. Use the sidebar to navigate between features. Your trial gives you full access to everything.
                </p>
              </div>
              {municipalityName && (
                <p className="text-xs text-muted-foreground bg-muted rounded-lg px-4 py-3">
                  Powered by your partnership with <strong className="text-foreground">{municipalityName}</strong> — supporting local SMMEs.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          {isWelcome ? (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={finish}>
                Skip tour
              </Button>
              <Button onClick={() => setStep(0)} className="gap-2">
                Start tour <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : isDone ? (
            <Button className="w-full gap-2" onClick={finish}>
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setStep(s => s - 1)}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                className="gap-2"
                onClick={() => setStep(s => s + 1)}
              >
                {step === totalSteps - 1 ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
