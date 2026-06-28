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

  const handleSubmit = async () => {
    if (!form.municipality_name || !form.province) {
      toast.error("Municipality name and province are required");
      return;
    }
    setSaving(true);
    try {
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
        const d = await regRes.json();
        toast.error(d.error || "Registration failed");
        setSaving(false);
        return;
      }

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
        const d = await joinRes.json();
        toast.error(d.error || "Failed to register municipality");
        setSaving(false);
        return;
      }

      toast.success("Registration submitted! Taking you to your portal…");
      setTimeout(() => navigate("/municipality"), 1200);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Helmet>
        <title>Municipality Portal Registration | Masakhe</title>
      </Helmet>

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-slate-950 flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-8 pt-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500">
            <span className="text-sm font-bold text-white font-heading">M</span>
          </div>
          <span className="text-lg font-bold text-white font-heading">Masakhe</span>
        </div>

        {/* Centre copy */}
        <div className="flex-1 flex flex-col justify-center px-10 pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-6">
            <Building2 className="h-3.5 w-3.5" />
            Municipality Programme
          </div>
          <h1 className="text-3xl font-bold text-white leading-snug mb-4">
            Empower Local SMMEs<br />in Your Community
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Get a dedicated portal to register, manage, and support small businesses — driving economic growth in your municipality.
          </p>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-amber-400" />
                </div>
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Approved badge */}
          <div className="mt-10 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 w-fit">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs text-slate-400">Free for municipalities · Reviewed by Masakhe admin</span>
          </div>
        </div>

        {/* Bottom colour strip */}
        <div className="flex h-1">
          <div className="flex-1 bg-amber-500" />
          <div className="flex-1 bg-amber-600" />
          <div className="flex-1 bg-amber-700" />
          <div className="flex-1 bg-amber-800" />
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-lg font-bold font-heading">Masakhe</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground">Municipality Registration</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Step {step + 1} of {STEPS.length} — {STEPS[step].desc}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors duration-200 ${
                  i < step  ? "bg-amber-500 text-white"
                : i === step ? "bg-slate-900 text-white ring-2 ring-amber-500 ring-offset-2"
                : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors duration-200 ${i < step ? "bg-amber-500" : "bg-border"}`} />
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
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold mt-1"
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
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
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
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3.5 flex gap-3">
                <Building2 className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Your registration will be reviewed and approved by the Masakhe admin team before your portal is activated.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
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
            <Link to="/login" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
              Sign in to your portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
