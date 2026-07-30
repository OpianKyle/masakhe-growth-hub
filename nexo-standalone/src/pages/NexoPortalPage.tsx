import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Eye, EyeOff, FileText, Users, Wallet,
  CheckCircle2, ArrowRight, Loader2, Building2, CreditCard,
  BarChart3, Shield, Receipt, Package, UserCheck,
} from "lucide-react";

const NEXO_BLUE = "#2563eb";
const NEXO_DARK = "#0f172a";

const features = [
  { icon: FileText,   label: "Invoicing & Quotes",   desc: "Send professional invoices in minutes" },
  { icon: Wallet,     label: "Financial Tracking",   desc: "Track income, expenses & cash flow" },
  { icon: Users,      label: "Client Management",    desc: "Full CRM — contacts, notes & deals" },
  { icon: CreditCard, label: "Payroll Management",   desc: "Auto-calculate salaries & payslips" },
  { icon: Package,    label: "Inventory Control",    desc: "Stock levels, suppliers & purchase orders" },
  { icon: Receipt,    label: "Automations",          desc: "Recurring invoices & follow-ups" },
  { icon: BarChart3,  label: "Business Analytics",   desc: "Real-time reports & insights" },
  { icon: Shield,     label: "POPIA Compliance",     desc: "Stay compliant with SA regulations" },
];

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) { toast.error(result.error); return; }
    if (result.isAdmin) { navigate("/nexo/admin"); return; }
    navigate("/nexo/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div>
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address</Label>
        <Input className="mt-1 h-10" type="email" placeholder="you@business.co.za"
          value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</Label>
        <div className="relative mt-1">
          <Input className="h-10 pr-9" type={showPassword ? "text" : "password"} placeholder="Your password"
            value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 font-semibold gap-2"
        style={{ backgroundColor: NEXO_BLUE, color: "#fff", border: "none" }}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Signing in…" : "Sign In to Nexo"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm({ onDone }: { onDone: () => void }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", businessName: "", phone: "",
    password: "", confirmPassword: "", franchiseCode: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const result = await register({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      businessData: { businessName: form.businessName, phone: form.phone },
      franchiseCode: form.franchiseCode || undefined,
    });
    setLoading(false);
    if (!result.ok) { toast.error(result.error); return; }
    toast.success("Account created! Please sign in.");
    navigate("/nexo/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name *</Label>
          <Input className="mt-1 h-10" placeholder="Your full name" value={form.fullName} onChange={set("fullName")} required />
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Business Name</Label>
          <Input className="mt-1 h-10" placeholder="Your business" value={form.businessName} onChange={set("businessName")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address *</Label>
          <Input className="mt-1 h-10" type="email" placeholder="you@business.co.za" value={form.email} onChange={set("email")} required />
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</Label>
          <Input className="mt-1 h-10" type="tel" placeholder="+27 ..." value={form.phone} onChange={set("phone")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password *</Label>
          <div className="relative mt-1">
            <Input className="h-10 pr-9" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
              value={form.password} onChange={set("password")} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm Password *</Label>
          <Input className="mt-1 h-10" type="password" placeholder="Repeat password"
            value={form.confirmPassword} onChange={set("confirmPassword")} required />
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nexo Partner Code</Label>
        <div className="relative mt-1">
          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9 h-10 font-mono" placeholder="Provided by your Nexo representative"
            value={form.franchiseCode} onChange={set("franchiseCode")} />
        </div>
        <p className="text-xs text-gray-400 mt-1">Your Nexo representative will provide this code to link your account.</p>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 font-semibold gap-2 mt-1"
        style={{ backgroundColor: NEXO_BLUE, color: "#fff", border: "none" }}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Creating account…" : "Create Nexo Business Account"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
      <p className="text-center text-xs text-gray-400 mt-2">
        By registering you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NexoPortalPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: NEXO_DARK }}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `radial-gradient(circle at 25% 75%, ${NEXO_BLUE} 0%, transparent 45%), radial-gradient(circle at 75% 25%, ${NEXO_BLUE} 0%, transparent 45%)` }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `linear-gradient(${NEXO_BLUE} 1px, transparent 1px), linear-gradient(90deg, ${NEXO_BLUE} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />

        <div className="relative z-10">
          <div className="mb-6">
            <div className="font-black tracking-tight leading-none select-none"
              style={{ fontSize: 72, color: "#ffffff", textShadow: `0 0 40px ${NEXO_BLUE}99`, letterSpacing: "-0.02em" }}>
              nexo
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-xs font-bold uppercase tracking-widest text-white/40">Powered by</div>
              <Building2 className="h-4 w-4 text-white/40" />
              <span className="text-sm font-semibold text-white/60">Masakhe Digital</span>
            </div>
          </div>

          <div className="mb-3">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ backgroundColor: NEXO_BLUE, color: "#fff" }}>
              Nexo Business Portal
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mt-4 text-white">
            Power your business<br />with Nexo.
          </h1>
          <p className="mt-4 text-base text-white/60 max-w-sm">
            A complete business management suite — invoicing, payroll, CRM, inventory and more — all in one platform.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-10">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${NEXO_BLUE}30` }}>
                  <Icon className="h-4 w-4" style={{ color: "#93c5fd" }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white/90">{label}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 mt-8 pt-8 border-t border-white/[0.06]">
          <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: NEXO_BLUE }} />
          <div className="text-sm text-white/50">
            Managed by <span className="text-white/80 font-semibold">Nexo representatives</span> — your local support partner.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="font-black tracking-tight text-4xl" style={{ color: NEXO_DARK }}>nexo</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              {(["login", "register"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
                <p className="text-sm text-gray-500 mb-6">Sign in to your Nexo business account</p>
                <LoginForm />
                <p className="text-center text-sm text-gray-500 mt-5">
                  No account?{" "}
                  <button onClick={() => setTab("register")} className="font-semibold hover:underline" style={{ color: NEXO_BLUE }}>
                    Create one
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Get started</h2>
                <p className="text-sm text-gray-500 mb-6">Create your free Nexo business account</p>
                <RegisterForm onDone={() => setTab("login")} />
                <p className="text-center text-sm text-gray-500 mt-4">
                  Already have an account?{" "}
                  <button onClick={() => setTab("login")} className="font-semibold hover:underline" style={{ color: NEXO_BLUE }}>
                    Sign in
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
