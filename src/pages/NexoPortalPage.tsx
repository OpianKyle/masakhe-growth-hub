import { useState, useEffect } from "react";
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
const NEXO_SLATE = "#334155";

const features = [
  { icon: FileText,   label: "Invoicing & Quotes",    desc: "Send professional invoices in minutes" },
  { icon: Wallet,     label: "Financial Tracking",    desc: "Track income, expenses & cash flow" },
  { icon: Users,      label: "Client Management",     desc: "Full CRM — contacts, notes & deals" },
  { icon: CreditCard, label: "Payroll Management",    desc: "Auto-calculate salaries & payslips" },
  { icon: Package,    label: "Inventory Control",     desc: "Stock levels, suppliers & purchase orders" },
  { icon: Receipt,    label: "Business Automations",  desc: "Recurring invoices & follow-ups" },
  { icon: BarChart3,  label: "Business Analytics",    desc: "Real-time reports & insights" },
  { icon: Shield,     label: "POPIA Compliance",      desc: "Stay compliant with SA regulations" },
];

export default function NexoPortalPage() {
  const [searchParams] = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [tab, setTab] = useState<"login" | "register">(registered ? "login" : "login");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: NEXO_DARK }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 75%, ${NEXO_BLUE} 0%, transparent 45%), radial-gradient(circle at 75% 25%, ${NEXO_BLUE} 0%, transparent 45%)`,
          }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(${NEXO_BLUE} 1px, transparent 1px), linear-gradient(90deg, ${NEXO_BLUE} 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Top: Logo + branding */}
        <div className="relative z-10">
          <div className="mb-6">
            <div
              className="font-black tracking-tight leading-none select-none"
              style={{
                fontSize: 72,
                color: "#ffffff",
                textShadow: `0 0 40px ${NEXO_BLUE}99, 0 0 80px ${NEXO_BLUE}44`,
                letterSpacing: "-0.02em",
              }}
            >
              nexo
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-xs font-bold uppercase tracking-widest text-white/40">Powered by</div>
              <img src="/masakhe-logo.png" alt="Masakhe" className="h-5 w-5 object-contain" />
              <span className="text-sm font-semibold text-white/60">Masakhe</span>
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
          <p className="mt-4 text-base text-white/60">
            Everything Nexo business partners and clients need — invoicing, payroll, client management, and more — all in one platform.
          </p>
        </div>

        {/* Feature grid */}
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-white/40">
            Everything included
          </p>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl p-3.5 border transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${NEXO_BLUE}cc` }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight text-white">{label}</p>
                  <p className="text-xs mt-0.5 leading-snug text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="relative z-10 mt-6">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Masakhe Technologies. Nexo Business Portal is an exclusive service for Nexo business partners and clients.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/nexo-bg.png')" }} />
        {/* Dark overlay so form stays readable */}
        <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.82)" }} />
        {/* Blue glow */}
        <div className="absolute inset-0 opacity-25"
          style={{ backgroundImage: `radial-gradient(ellipse at 50% 0%, ${NEXO_BLUE} 0%, transparent 70%)` }} />

        {/* Mobile logo */}
        <div className="relative z-10 flex lg:hidden items-center gap-3 mb-8">
          <img src="/nexo-logo.png" alt="Nexo" className="h-14 object-contain"
            style={{ filter: "brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(190deg)" }} />
          <div className="h-6 w-px bg-white/30" />
          <img src="/masakhe-logo.png" alt="Masakhe" className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold text-white">Masakhe</span>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.98)",
              boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)`,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Registration success banner */}
            {registered && (
              <div className="mb-5 rounded-xl p-4 flex items-start gap-3"
                style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Account created!</p>
                  <p className="text-xs text-green-700 mt-0.5">Sign in below to access your Nexo Business Portal.</p>
                </div>
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex rounded-xl border border-gray-200 p-1 mb-7 gap-1">
              <button
                onClick={() => setTab("login")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "login" ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                style={{ backgroundColor: tab === "login" ? NEXO_DARK : "transparent" }}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("register")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "register" ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                style={{ backgroundColor: tab === "register" ? NEXO_DARK : "transparent" }}
              >
                Register Business
              </button>
            </div>

            {tab === "login" ? <NexoLogin /> : <NexoRegister />}

            {/* Back link */}
            <p className="text-center text-xs text-gray-400 mt-6">
              Not a Nexo business partner?{" "}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: NEXO_BLUE }}>
                Go to main portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sign In Form ─────────────────────────────────────────────────────────── */
function NexoLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      toast.success("Welcome back!");
      if (result.isAdmin) navigate("/admin", { replace: true });
      else if (result.isFranchise) navigate("/nexo/dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    } else {
      toast.error(result.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
      <p className="text-gray-500 text-sm mt-1 mb-6">Sign in to your Nexo business account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nexo-email" className="text-sm font-medium text-gray-700">Email address</Label>
          <Input
            id="nexo-email"
            type="email"
            autoComplete="email"
            placeholder="you@business.co.za"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1.5 h-11"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="nexo-password" className="text-sm font-medium text-gray-700">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: NEXO_BLUE }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              id="nexo-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-semibold text-sm mt-2 gap-2"
          style={{ backgroundColor: NEXO_BLUE, color: "#fff", border: "none" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign In to Nexo Portal"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="mt-4 p-3 rounded-xl flex items-start gap-3"
        style={{ backgroundColor: "#eff6ff", border: `1px solid ${NEXO_BLUE}22` }}>
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: NEXO_BLUE }} />
        <p className="text-xs text-blue-800">
          This portal is exclusively for Nexo business partners and registered clients. If you haven't been onboarded yet, use the <strong>Register Business</strong> tab.
        </p>
      </div>
    </div>
  );
}

/* ─── Register Form ────────────────────────────────────────────────────────── */
function NexoRegister() {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [franchiseCode, setFranchiseCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("franchise") || searchParams.get("ref");
    setFranchiseCode(code || "NEXO001");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) { toast.error("Please fill in all required fields"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const result = await register({
        fullName,
        email,
        password,
        franchiseCode: franchiseCode || "NEXO001",
        businessData: { businessName: businessName || fullName, phone: phone || undefined },
      });
      if (!result.ok) {
        setLoading(false);
        toast.error(result.error || "Registration failed. Please try again.");
        return;
      }
      const loginResult = await login(email, password);
      setLoading(false);
      if (loginResult.ok) {
        toast.success("Welcome to Nexo! Your account is ready.");
        navigate("/dashboard", { replace: true });
      } else {
        toast.success("Account created! Please sign in.");
        navigate("/nexo?registered=1", { replace: true });
      }
    } catch {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Register your business</h2>
      <p className="text-gray-500 text-sm mt-1 mb-6">Join the Nexo Business Portal as a Masakhe client</p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name *</Label>
            <Input className="mt-1 h-10" placeholder="Jane Dlamini" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</Label>
            <Input className="mt-1 h-10" placeholder="082 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Business Name</Label>
          <div className="relative mt-1">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9 h-10" placeholder="My Business" value={businessName} onChange={e => setBusinessName(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address *</Label>
          <Input className="mt-1 h-10" type="email" placeholder="you@business.co.za" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password *</Label>
            <div className="relative mt-1">
              <Input className="h-10 pr-9" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm Password *</Label>
            <Input className="mt-1 h-10" type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nexo Partner Code</Label>
          <div className="relative mt-1">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9 h-10 font-mono" placeholder="Provided by your Nexo representative" value={franchiseCode} onChange={e => setFranchiseCode(e.target.value)} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Your Nexo representative will provide this code to link your account.</p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-semibold text-sm mt-1 gap-2"
          style={{ backgroundColor: NEXO_BLUE, color: "#fff", border: "none" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Creating account…" : "Create Nexo Business Account"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-4">
        By registering you agree to our{" "}
        <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
        {" "}and{" "}
        <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
      </p>
    </div>
  );
}
