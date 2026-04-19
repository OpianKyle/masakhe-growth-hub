import { Helmet } from "react-helmet-async";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, User, Phone, Check,
  Lock, Loader2, ChevronRight, Award, TrendingUp, DollarSign, Users, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const BG_IMAGE = "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1400";

const STEPS = [
  { title: "Account",  icon: Lock,  desc: "Create your login" },
  { title: "Contact",  icon: Phone, desc: "Phone & address"   },
  { title: "Confirm",  icon: Check, desc: "Review & submit"   },
];

const PARTNER_BENEFITS = [
  { icon: DollarSign, heading: "20% direct commission",    body: "Earn 20% on every client subscription you refer." },
  { icon: Users,      heading: "5-level network earnings", body: "Build a team and earn from your sub-partners too." },
  { icon: TrendingUp, heading: "Rank bonuses up to R50k",  body: "Climb the ranks and unlock one-off cash bonuses." },
  { icon: Star,       heading: "Custom domain included",    body: "Upgrade to Reseller and connect your own domain to the platform." },
];

export default function ResellerRegisterPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || undefined;

  React.useEffect(() => {
    if (referralCode) {
      fetch(`/api/reseller/check/${referralCode}`)
        .then(r => r.json())
        .then(d => { if (d.valid) setReferrerName(d.name); })
        .catch(() => {});
    }
  }, [referralCode]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    whatsapp: "",
    physicalAddress: "",
    saId: "",
  });

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const next = () => {
    if (step === 0) {
      if (!form.fullName || !form.email || !form.password) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    if (step === 1 && !form.phone) {
      toast.error("Please enter your phone number");
      return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    const result = await register({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      referralCode,
      businessData: {
        businessName: form.fullName,
        tradingName: "",
        businessStatus: "reseller",
        businessType: "Sole Proprietor",
        industrySector: "Services",
        yearsOperating: null,
        employeeCount: null,
        saId: form.saId,
        cipcNumber: "",
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        email: form.email,
        physicalAddress: form.physicalAddress,
        popiaConsent: false,
      },
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Partner account created! Choose your package to get started.");
      navigate("/partner");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex">
      <Helmet>
        <title>Join the Partner Programme | Masakhe</title>
        <meta name="description" content="Become a Masakhe referral partner. Earn commissions by referring South African businesses to our all-in-one SMME platform." />
        <link rel="canonical" href="https://masakheportal.co.za/partner/register" />
      </Helmet>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-[38%] xl:w-[42%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ backgroundImage: `url(${BG_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/95 via-slate-900/90 to-slate-900/92" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-9 w-9 object-contain" />
            <span className="text-2xl font-bold font-heading text-white">Masakhe</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 mb-4">
              <Award className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-300 text-xs font-semibold tracking-wide uppercase">Partner Programme</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Earn by growing<br />South Africa's SMMEs
            </h2>
            <p className="text-white/55 text-base leading-relaxed">
              Refer businesses to Masakhe and earn recurring commissions — with no cap on how much you can make.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-green-400/10 border border-green-400/25 rounded-xl px-4 py-2.5">
              <span className="text-2xl font-extrabold text-green-400">30</span>
              <div>
                <p className="text-white text-xs font-semibold leading-tight">days free trial</p>
                <p className="text-white/40 text-[10px]">No credit card required</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {PARTNER_BENEFITS.map(b => (
              <div key={b.heading} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <b.icon className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{b.heading}</p>
                  <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { v: "20%",    l: "Direct commission" },
              { v: "5 Lvls", l: "Network earnings"  },
              { v: "R50k",   l: "Top rank bonus"    },
            ].map(s => (
              <div key={s.l} className="rounded-xl bg-white/5 border border-white/10 py-3 px-2">
                <p className="text-lg font-bold text-green-400">{s.v}</p>
                <p className="text-[11px] text-white/40 mt-0.5 leading-tight">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} Masakhe. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold font-heading text-slate-900">Masakhe</span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span className="mx-1 text-slate-300">·</span>
            <span className="font-medium text-slate-700">{STEPS[step].title}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Link to="/register" className="hover:text-slate-900 transition-colors font-medium">
              Register an SMME instead
            </Link>
            <span className="text-slate-300">·</span>
            <Link to="/login" className="hover:text-slate-900 transition-colors font-medium flex items-center gap-1">
              Already a partner? <span className="text-green-600 ml-1">Sign in</span>
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-100">
          <div
            className="h-full bg-green-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex items-start justify-center px-8 py-10">
          <div className="w-full max-w-xl">

            {/* Referrer banner */}
            {referrerName && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">Invited by {referrerName}</p>
                  <p className="text-xs text-green-600">You're joining via a partner referral link.</p>
                </div>
              </div>
            )}

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    i === step
                      ? "bg-green-600 text-white"
                      : i < step
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {i < step ? <Check className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                    <span className="hidden sm:inline">{s.title}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >

                {/* ── Step 0: Account ── */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">Create your partner account</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">Your login details for the Masakhe Partner Portal.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
                        <Input
                          placeholder="Your full name"
                          className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          value={form.fullName}
                          onChange={e => set("fullName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Email Address *</Label>
                        <Input
                          type="email"
                          placeholder="you@example.co.za"
                          className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          value={form.email}
                          onChange={e => set("email", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Password *</Label>
                          <Input
                            type="password"
                            placeholder="Min 6 characters"
                            className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            value={form.password}
                            onChange={e => set("password", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Confirm Password *</Label>
                          <Input
                            type="password"
                            placeholder="Repeat password"
                            className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            value={form.confirmPassword}
                            onChange={e => set("confirmPassword", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      By continuing you agree to our{" "}
                      <Link to="/terms" className="text-green-600 hover:underline">Terms of Service</Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>.
                    </p>
                  </div>
                )}

                {/* ── Step 1: Contact ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">Contact details</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">How clients and our team can reach you.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Phone Number *</Label>
                          <Input
                            placeholder="+27 82 000 0000"
                            className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            value={form.phone}
                            onChange={e => set("phone", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">WhatsApp <span className="text-slate-400 font-normal">(optional)</span></Label>
                          <Input
                            placeholder="Same as phone?"
                            className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            value={form.whatsapp}
                            onChange={e => set("whatsapp", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Physical Address <span className="text-slate-400 font-normal">(optional)</span></Label>
                        <Input
                          placeholder="Street, suburb, city"
                          className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                          value={form.physicalAddress}
                          onChange={e => set("physicalAddress", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">SA ID Number <span className="text-slate-400 font-normal">(optional — for verification)</span></Label>
                        <Input
                          placeholder="e.g. 8501015800087"
                          className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white font-mono"
                          value={form.saId}
                          onChange={e => set("saId", e.target.value)}
                        />
                        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Encrypted and stored securely. Never shared with third parties.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Confirm ── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 mb-4">
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">You're almost in!</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">
                        Review your details and create your partner account. You'll choose your package next.
                      </p>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
                      <div className="bg-green-600 px-4 py-3">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Partner Account Summary</p>
                      </div>
                      <div className="divide-y divide-green-100">
                        {[
                          { label: "Full Name",        value: form.fullName },
                          { label: "Email",            value: form.email },
                          { label: "Phone",            value: form.phone },
                          { label: "Account Type",     value: "Reseller / Referral Partner" },
                          { label: "Starting Rank",    value: "Starter (S1)" },
                          { label: "Direct Commission",value: "20% per referred client" },
                        ].map(row => (
                          <div key={row.label} className="flex items-center justify-between px-4 py-3">
                            <span className="text-sm text-green-700">{row.label}</span>
                            <span className="text-sm font-semibold text-green-900 text-right max-w-xs truncate">{row.value || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        { v: "20%",     l: "Direct commission"    },
                        { v: "5 Levels",l: "Network earnings"     },
                        { v: "R50,000", l: "Diamond Elite bonus"  },
                      ].map(s => (
                        <div key={s.l} className="rounded-xl border border-green-200 bg-white p-3">
                          <p className="text-lg font-bold text-green-700">{s.v}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm text-sm"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating partner account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Create Partner Account <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons (not on confirm step — it has its own submit button) */}
            {step < STEPS.length - 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                {step > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={prev}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-8 h-11 rounded-xl font-semibold"
                  onClick={next}
                >
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {step === STEPS.length - 1 && step > 0 && (
              <Button
                variant="ghost"
                onClick={prev}
                className="mt-4 flex items-center gap-2 text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
