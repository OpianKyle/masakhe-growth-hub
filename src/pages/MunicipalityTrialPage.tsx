import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const MODULES = [
  {
    icon: Globe,
    name: "Web Builder",
    description: "Create a professional online presence",
    color: "from-sky-500 to-cyan-500",
  },
  {
    icon: Smartphone,
    name: "Social Media Hub",
    description: "Plan and publish polished posts",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Wallet,
    name: "Transactions & Operations",
    description: "Track finances, invoices, and clients",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    name: "Human Capital",
    description: "Manage people, payroll, and leave",
    color: "from-amber-500 to-orange-500",
  },
];

interface MunicipalityInfo {
  name: string;
  province?: string | null;
}

export default function MunicipalityTrialPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const municipalityCode = searchParams.get("municipality") || "";
  const [municipality, setMunicipality] = useState<MunicipalityInfo | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadWelcomeData() {
      try {
        const requests: Promise<Response>[] = [
          fetch("/api/billing/status", { credentials: "include", cache: "no-store" }),
        ];
        if (municipalityCode) {
          requests.push(fetch(`/api/municipality/check/${encodeURIComponent(municipalityCode)}`));
        }

        const responses = await Promise.all(requests);
        const billing = await responses[0].json();
        const municipalityData = municipalityCode ? await responses[1].json() : null;

        if (cancelled) return;
        if (municipalityData?.valid) {
          setMunicipality({ name: municipalityData.name, province: municipalityData.province });
        }
        if (billing?.trialEndsAt) setTrialEndsAt(billing.trialEndsAt);
      } catch {
        // The welcome screen remains useful even if the optional details fail.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWelcomeData();
    return () => { cancelled = true; };
  }, [municipalityCode]);

  const formattedEnd = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const continueToWorkspace = () => {
    const query = municipalityCode
      ? `?onboarding=1&municipality=${encodeURIComponent(municipalityCode)}`
      : "?onboarding=1";
    navigate(`/dashboard${query}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Helmet>
        <title>Welcome to Your Municipality Trial | Masakhe</title>
        <meta
          name="description"
          content="Access your 14-day Masakhe business platform trial through your municipality."
        />
      </Helmet>

      <div className="relative overflow-hidden bg-gradient-to-br from-[#071a2d] via-[#0b3150] to-[#075985] px-6 py-12 text-white md:py-16">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-3">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold tracking-tight">
              Masakhe <span className="font-normal text-cyan-300">Group</span>
            </span>
          </div>

          <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Municipality business programme
              </div>
              <h1 className="max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">
                Your business tools are ready.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}. Your municipality has connected you to Masakhe, giving your business full access for 14 days at no cost.
              </p>
              {municipality && (
                <div className="mt-6 flex items-center gap-3 text-sm text-cyan-100">
                  <Building2 className="h-5 w-5 text-cyan-300" />
                  <span>
                    Access provided through <strong>{municipality.name}</strong>
                    {municipality.province ? ` · ${municipality.province}` : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-sm md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-cyan-200">Included with your registration</p>
                  <p className="text-2xl font-extrabold">14-day free trial</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-300" />
                  Full access to all four Masakhe modules
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-300" />
                  No payment required to get started
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-300" />
                  Trial access ends{formattedEnd ? ` on ${formattedEnd}` : " after 14 days"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="mb-7 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Everything in one place</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            Tools to help your business grow
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Explore the platform, set up your business profile, and start using the tools your municipality has made available.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((module) => (
            <div
              key={module.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${module.color}`}>
                <module.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{module.name}</h3>
              <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">{module.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 text-center dark:border-cyan-900 dark:from-cyan-950/30 dark:to-blue-950/30 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ready to get started?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">
            Your 14-day municipality trial is active. Continue to your workspace to complete your setup and explore Masakhe.
          </p>
          <Button
            onClick={continueToWorkspace}
            disabled={loading}
            size="lg"
            className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 px-7 text-white shadow-lg hover:from-cyan-700 hover:to-blue-700"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            Continue to my workspace
          </Button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">No credit card required · Supported by your municipality</p>
        </div>
      </main>
    </div>
  );
}