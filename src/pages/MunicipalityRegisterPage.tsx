import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2, ChevronRight, CheckCircle2, Loader2, Eye, EyeOff, MapPin, Phone, User,
} from "lucide-react";

const SA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

const FEATURES = [
  "Track and register local SMMEs in your area",
  "Monitor SMME business activity and growth",
  "Manage support requests from local businesses",
  "Dedicated municipality code for SMME onboarding",
];

const STEPS = [
  { title: "Account",      desc: "Create your login" },
  { title: "Municipality", desc: "Municipality details" },
  { title: "Contact",      desc: "Primary contact info" },
];

const BG = "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1400&q=80";

export default function MunicipalityRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    municipality_name: "", province: "", district: "",
    contact_person: "", contact_email: "", contact_phone: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const doJoin = async () => {
    const joinRes = await fetch("/api/municipality/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        municipality_name: form.municipality_name,
        province: form.province,
        district: form.district,
        contact_person: form.contact_person || form.full_name,
        contact_email: form.contact_email || form.email,
        contact_phone: form.contact_phone,
      }),
    });
    if (!joinRes.ok) {
      const d = await joinRes.json().catch(() => ({}));
      throw new Error(d.error || "Failed to register municipality");
    }
  };

  const handleSubmit = async () => {
    if (!form.municipality_name || !form.province) {
      toast.error("Municipality name and province are required");
      return;
    }
    setSaving(true);
    try {
      // Step 1: register new account
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: form.full_name,
          email: form.email,
          password: form.password,
          businessData: { businessStatus: "municipality" },
        }),
      });

      if (!regRes.ok) {
        const d = await regRes.json().catch(() => ({}));
        const msg: string = d.error || "";

        // Account already exists — try logging in so we can still call /join
        if (msg.toLowerCase().includes("already exists")) {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email: form.email, password: form.password }),
          });
          if (!loginRes.ok) {
            toast.error("An account with this email already exists. Please check your password or sign in separately.");
            setSaving(false);
            return;
          }
        } else {
          toast.error(msg || "Registration failed");
          setSaving(false);
          return;
        }
      }

      // Step 2: create the municipality entry
      await doJoin();

      toast.success("Registration submitted! Taking you to your portal…");
      setTimeout(() => navigate("/municipality"), 1200);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <Helmet>
        <title>Municipality Portal Registration | Masakhe</title>
      </Helmet>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col overflow-hidden"
        style={{
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Dark overlay — heavier at top, lighter at bottom to show city */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/92 via-slate-900/80 to-slate-950/90" />
        {/* Subtle blue tint layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-transparent to-blue-950/40" />

        {/* Content sits above overlays */}
        <div className="relative flex flex-col h-full">

          {/* Top bar — logo */}
          <div className="flex items-center gap-3 px-10 pt-10">
            <img
              src="/masakhe-logo.png"
              alt="Masakhe"
              className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]"
            />
            <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading, inherit)" }}>
              Masakhe
            </span>
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center px-10 pb-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 w-fit">
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/25 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
                <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">Municipality Programme</span>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Empower Local SMMEs<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                in Your Community
              </span>
            </h1>

            <p className="text-slate-300 text-[15px] leading-relaxed mb-10 max-w-sm">
              Get a dedicated portal to register, manage, and support small businesses — driving economic growth in your municipality.
            </p>

            {/* Feature list */}
            <div className="space-y-3.5 mb-10">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                  </div>
                  <span className="text-slate-200 text-sm leading-relaxed">{f}</span>
                </div>
              ))}
            </div>

            {/* Bottom badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-fit">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-slate-300">Free for municipalities · Reviewed by Masakhe admin</span>
            </div>
          </div>

          {/* SA flag colour strip */}
          <div className="relative flex h-1.5">
            <div className="flex-1 bg-[#007A4D]" />
            <div className="flex-1 bg-[#FFB612]" />
            <div className="flex-1 bg-[#001489]" />
            <div className="flex-1 bg-white"    />
            <div className="flex-1 bg-[#DE3831]" />
            <div className="flex-1 bg-black"    />
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 bg-white dark:bg-slate-950">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <img src="/masakhe-logo.png" alt="Masakhe" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-heading, inherit)" }}>Masakhe</span>
        </div>

        <div className="max-w-md w-full mx-auto">

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Municipality Registration</h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Step {step + 1} of {STEPS.length} — {STEPS[step].desc}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                  i < step   ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : i === step ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-cyan-500 ring-offset-2"
                : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${i < step ? "bg-cyan-500" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 0: Account ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Your full name" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="you@municipality.gov.za" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Password <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} className="pr-10" placeholder="Min. 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                className="w-full text-white font-semibold mt-1 shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.5)] transition-shadow"
                style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}
                onClick={() => {
                  if (!form.full_name || !form.email || !form.password) { toast.error("All fields are required"); return; }
                  if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
                  setStep(1);
                }}
              >
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* ── Step 1: Municipality ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Municipality Name <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="e.g. City of Cape Town" value={form.municipality_name} onChange={e => set("municipality_name", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Province <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                    value={form.province}
                    onChange={e => set("province", e.target.value)}
                  >
                    <option value="">Select province…</option>
                    {SA_PROVINCES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">District / Region <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input placeholder="e.g. Cape Winelands District Municipality" value={form.district} onChange={e => set("district", e.target.value)} />
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button
                  className="flex-1 text-white font-semibold shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.5)] transition-shadow"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}
                  onClick={() => {
                    if (!form.municipality_name || !form.province) { toast.error("Name and province are required"); return; }
                    setStep(2);
                  }}
                >
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Contact ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Contact Person Name</Label>
                <Input placeholder="Primary contact at the municipality" value={form.contact_person} onChange={e => set("contact_person", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Contact Email</Label>
                <Input type="email" placeholder="contact@municipality.gov.za" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="+27 21 000 0000" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} />
                </div>
              </div>

              {/* Notice box */}
              <div className="rounded-xl border border-cyan-200 dark:border-cyan-800/50 bg-cyan-50 dark:bg-cyan-950/30 p-4 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-cyan-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-xs text-cyan-800 dark:text-cyan-300 leading-relaxed">
                  Your registration will be reviewed and approved by the Masakhe admin team before your portal is activated.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1 text-white font-semibold shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.5)] transition-shadow"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Registration
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already registered?{" "}
            <Link to="/login" className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline">
              Sign in to your portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
