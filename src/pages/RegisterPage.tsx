import { Helmet } from "react-helmet-async";
import React, { useState } from "react";
import { Check, Loader2, Eye, EyeOff, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const BG_IMAGE = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1400";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [franchiseName, setFranchiseName] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || undefined;
  const promoCode = searchParams.get("promo") || undefined;
  const franchiseCode = searchParams.get("franchise") || undefined;
  const source = searchParams.get("source") || undefined;
  const fromEmail = source === "email" || source === "masakhemail";

  // Stash a promo code from the URL (e.g. coming from a marketing-site popup)
  // so we can re-apply it on the billing page after sign-up.
  React.useEffect(() => {
    if (promoCode) {
      try { sessionStorage.setItem("masakhe.promoCode", promoCode); } catch {}
    }
  }, [promoCode]);

  React.useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_not_configured") setUrlError("Google sign-in is not yet configured for this platform.");
    else if (err) setUrlError("Sign-in failed. Please try again or use email below.");
  }, [searchParams]);

  React.useEffect(() => {
    if (referralCode) {
      fetch(`/api/reseller/check/${referralCode}`)
        .then(r => r.json())
        .then(d => { if (d.valid) setReferrerName(d.name); })
        .catch(() => {});
    }
  }, [referralCode]);

  React.useEffect(() => {
    if (franchiseCode) {
      fetch(`/api/franchise/info/${encodeURIComponent(franchiseCode)}`)
        .then(r => r.json())
        .then(d => { if (d.name) setFranchiseName(d.name); })
        .catch(() => {});
    }
  }, [franchiseCode]);

  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    email: "",
    cell: "",
    password: "",
    confirmPassword: "",
  });

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.surname || !form.email || !form.password) {
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

    setLoading(true);
    const result = await register({
      email: form.email,
      password: form.password,
      fullName: `${form.firstName} ${form.surname}`.trim(),
      referralCode,
      franchiseCode,
      businessData: form.cell ? { phone: form.cell } : undefined,
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Welcome to Masakhe! Pick a plan to start your free trial.");
      navigate(promoCode ? `/dashboard/billing?promo=${encodeURIComponent(promoCode)}` : "/dashboard/billing");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  const googleQs = [
    referralCode ? `ref=${encodeURIComponent(referralCode)}` : "",
    promoCode ? `promo=${encodeURIComponent(promoCode)}` : "",
  ].filter(Boolean).join("&");
  const googleHref = `/api/auth/google${googleQs ? `?${googleQs}` : ""}`;

  return (
    <div className="min-h-screen flex">
      <Helmet>
        <title>Create Your Free Account | Masakhe SMME Platform</title>
        <meta name="description" content="Create your account. Register your South African SMME on Masakhe — website builder, invoicing, payroll & social media in one place." />
        <link rel="canonical" href="https://masakheportal.co.za/register" />
      </Helmet>

      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-[38%] xl:w-[42%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ backgroundImage: `url(${BG_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/88 to-blue-950/92" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-9 w-9 object-contain" />
            <span className="text-2xl font-bold font-heading text-white">Masakhe</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-3">Get started today</p>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Everything your<br />business needs
            </h2>
            <p className="text-white/55 text-base leading-relaxed">
              One platform to manage your website, invoices, payroll, clients, and social media — built for South African SMMEs.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "AI website builder — go live in minutes",
              "Invoicing & quotes with 6 PDF templates",
              "Payroll management & payslip generation",
              "Client management (CRM) built-in",
              "Social media scheduling & publishing",
              "Financial transaction tracking",
            ].map(feat => (
              <div key={feat} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/25 flex-shrink-0">
                  <Check className="h-3 w-3 text-blue-300" />
                </div>
                <p className="text-white/70 text-sm">{feat}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-sm leading-relaxed mb-2">
              Start with a <span className="text-white font-semibold">14-day free trial</span> — no credit card required.
            </p>
            <p className="text-white/45 text-xs">Plans from R599/month after your trial.</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} Masakhe. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold font-heading text-slate-900">Masakhe</span>
            </Link>
          </div>
          <div className="hidden lg:block" />
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
            Already have an account?{" "}<span className="text-blue-600">Sign in</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            {/* Email campaign banner */}
            {fromEmail && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">You're signing up via the Masakhe newsletter</p>
                  <p className="text-xs text-blue-600">Welcome! Create your account below to get started.</p>
                </div>
              </div>
            )}

            {/* Franchise banner */}
            {franchiseName && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-800">Signing up under {franchiseName}</p>
                  <p className="text-xs text-indigo-600">Your account will be linked to this franchise partner.</p>
                </div>
              </div>
            )}

            {/* Referral banner */}
            {referralCode && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    {referrerName ? `Referred by ${referrerName}` : "You're signing up via a referral link"}
                  </p>
                  <p className="text-xs text-green-600">You're signing up via a partner referral link.</p>
                </div>
              </div>
            )}

            {/* Error banner */}
            {urlError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{urlError}</p>
              </div>
            )}

            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900 font-heading">Create your account</h1>
              <p className="text-slate-500 mt-1.5 text-sm">Free 14-day trial — no credit card required.</p>
            </div>

            {/* Google button */}
            <a
              href={googleHref}
              className="flex items-center justify-center gap-3 w-full h-11 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm mb-5"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">or sign up with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-slate-700">First Name *</Label>
                  <Input
                    placeholder="Thabo"
                    className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                    value={form.firstName}
                    onChange={e => set("firstName", e.target.value)}
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Surname *</Label>
                  <Input
                    placeholder="Dlamini"
                    className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                    value={form.surname}
                    onChange={e => set("surname", e.target.value)}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Email Address *</Label>
                <Input
                  type="email"
                  placeholder="you@business.co.za"
                  className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Cell Number</Label>
                <Input
                  type="tel"
                  placeholder="+27 81 234 5678"
                  className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                  value={form.cell}
                  onChange={e => set("cell", e.target.value)}
                  autoComplete="tel"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Password *</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white pr-10"
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Confirm Password *</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white pr-10"
                    value={form.confirmPassword}
                    onChange={e => set("confirmPassword", e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 gradient-hero text-white font-semibold mt-2"
              >
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account…</> : "Create Account — Free"}
              </Button>

              <p className="text-xs text-slate-400 text-center pt-1">
                By creating an account you agree to our{" "}
                <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
