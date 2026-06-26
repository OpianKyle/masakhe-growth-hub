import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, MapPin, Phone, Mail, User, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

const SA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

export default function MunicipalityRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    municipality_name: "", province: "", district: "",
    contact_person: "", contact_email: "", contact_phone: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const STEPS = [
    { title: "Account", icon: User, desc: "Create your login" },
    { title: "Municipality", icon: Building2, desc: "Municipality details" },
    { title: "Contact", icon: Phone, desc: "Primary contact info" },
  ];

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.password) { toast.error("Please complete account details"); return; }
    if (!form.municipality_name || !form.province) { toast.error("Municipality name and province are required"); return; }
    setSaving(true);
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          businessStatus: "municipality",
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

      toast.success("Municipality registered! Redirecting to your portal…");
      setTimeout(() => navigate("/municipality"), 1200);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex">
      <Helmet>
        <title>Municipality Portal Registration | Masakhe</title>
        <meta name="description" content="Register your municipality on Masakhe to support and track local SMMEs in your area." />
      </Helmet>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 via-green-800 to-emerald-900 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">Masakhe</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Empower Local SMMEs<br />in Your Municipality
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Get a dedicated portal to register, manage, and support small businesses in your area — all in one place.
          </p>
          <div className="space-y-4">
            {[
              "Register and track local SMMEs",
              "View business activity and growth",
              "Manage support requests from businesses",
              "Generate reports on local economic activity",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-300 flex-shrink-0" />
                <span className="text-green-100">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-green-300 text-sm">Free for municipalities · Approved by Masakhe admin</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 bg-background">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">Municipality Registration</h2>
            <p className="text-muted-foreground text-sm">Step {step + 1} of {STEPS.length} — {STEPS[step].desc}</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  i < step ? "bg-green-600 text-white" : i === step ? "bg-green-700 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 rounded-full transition-colors ${i < step ? "bg-green-600" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input className="mt-1" placeholder="Your full name" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
              </div>
              <div>
                <Label>Email Address *</Label>
                <Input className="mt-1" type="email" placeholder="you@municipality.gov.za" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div>
                <Label>Password *</Label>
                <Input className="mt-1" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
              </div>
              <Button className="w-full bg-green-700 hover:bg-green-800 text-white mt-2" onClick={() => {
                if (!form.full_name || !form.email || !form.password) { toast.error("All fields required"); return; }
                if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
                setStep(1);
              }}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 1: Municipality details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Municipality Name *</Label>
                <Input className="mt-1" placeholder="e.g. City of Cape Town" value={form.municipality_name} onChange={e => set("municipality_name", e.target.value)} />
              </div>
              <div>
                <Label>Province *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={form.province} onChange={e => set("province", e.target.value)}>
                  <option value="">Select province</option>
                  {SA_PROVINCES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <Label>District / Region</Label>
                <Input className="mt-1" placeholder="e.g. Cape Winelands District" value={form.district} onChange={e => set("district", e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1 bg-green-700 hover:bg-green-800 text-white" onClick={() => {
                  if (!form.municipality_name || !form.province) { toast.error("Name and province required"); return; }
                  setStep(2);
                }}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Contact Person Name</Label>
                <Input className="mt-1" placeholder="Primary contact at municipality" value={form.contact_person} onChange={e => set("contact_person", e.target.value)} />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input className="mt-1" type="email" placeholder="contact@municipality.gov.za" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input className="mt-1" placeholder="+27 21 000 0000" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} />
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
                Your registration will be reviewed by the Masakhe admin team before activation.
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 bg-green-700 hover:bg-green-800 text-white" onClick={handleSubmit} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Registration
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already registered? <Link to="/municipality" className="text-green-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
