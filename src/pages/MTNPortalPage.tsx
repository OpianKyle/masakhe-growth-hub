import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Eye, EyeOff, Globe, FileText, Users, Wallet, Smartphone,
  CheckCircle2, ArrowRight, Loader2, Building2, CreditCard,
  BarChart3, Headphones, Shield,
} from "lucide-react";

const MTN_YELLOW = "#FFCC00";
const MTN_DARK   = "#1a1a1a";

const features = [
  { icon: Globe,       label: "AI Website Builder",   desc: "Professional website for your MTN store" },
  { icon: FileText,    label: "Invoicing & Quotes",   desc: "Send professional quotes in minutes" },
  { icon: Wallet,      label: "Financial Tracking",   desc: "Track income, expenses & cash flow" },
  { icon: Users,       label: "Client Management",    desc: "Full CRM — contacts, notes & deals" },
  { icon: Smartphone,  label: "Social Media Hub",     desc: "Schedule posts across all platforms" },
  { icon: CreditCard,  label: "Payroll Management",   desc: "Auto-calculate salaries & payslips" },
  { icon: BarChart3,   label: "Business Analytics",   desc: "Real-time reports & insights" },
  { icon: Shield,      label: "POPIA Compliance",     desc: "Stay compliant with SA regulations" },
];

export default function MTNPortalPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: MTN_YELLOW }}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #000 0%, transparent 50%), radial-gradient(circle at 80% 20%, #000 0%, transparent 50%)" }}
        />

        {/* Top: Logo + branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            {/* MTN oval logo — dark on yellow */}
            <svg width="90" height="56" viewBox="0 0 90 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MTN">
              <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="4" fill="none"/>
              <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK} letterSpacing="1">MTN</text>
            </svg>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: MTN_DARK, opacity: 0.6 }}>Powered by</div>
              <div className="flex items-center gap-2 mt-0.5">
                <img src="/masakhe-logo.png" alt="Masakhe" className="h-7 w-7 object-contain" />
                <span className="text-xl font-bold" style={{ color: MTN_DARK }}>Masakhe</span>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: MTN_DARK, color: MTN_YELLOW }}>
              MTN Business Portal
            </span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mt-4" style={{ color: MTN_DARK }}>
            Grow your MTN<br />business with<br />confidence.
          </h1>
          <p className="mt-4 text-base" style={{ color: MTN_DARK, opacity: 0.75 }}>
            Everything MTN business partners and franchise clients need — invoicing, payroll, website, CRM, and more — all in one place.
          </p>
        </div>

        {/* Feature grid */}
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MTN_DARK, opacity: 0.55 }}>
            Everything included
          </p>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl p-3.5 border transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.92)",
                  borderColor: "rgba(255,255,255,0.6)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: MTN_YELLOW, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: MTN_DARK }} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight" style={{ color: MTN_DARK }}>{label}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "#555" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="relative z-10 mt-6">
          <p className="text-xs" style={{ color: MTN_DARK, opacity: 0.5 }}>
            © {new Date().getFullYear()} Masakhe Technologies. MTN Business Portal is an exclusive service for MTN business partners and clients.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0 relative overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1400')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,10,0.78) 0%, rgba(26,26,26,0.72) 50%, rgba(0,0,0,0.82) 100%)" }} />

        {/* Mobile logo */}
        <div className="relative z-10 flex lg:hidden items-center gap-3 mb-8">
          <svg width="60" height="38" viewBox="0 0 90 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MTN">
            <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_YELLOW} strokeWidth="4" fill="none"/>
            <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="22" fill={MTN_YELLOW} letterSpacing="1">MTN</text>
          </svg>
          <div className="h-6 w-px bg-white/30" />
          <img src="/masakhe-logo.png" alt="Masakhe" className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold text-white">Masakhe</span>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Glassmorphic card wrapper */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.25)",
              backdropFilter: "blur(20px)",
            }}
          >
          {/* Tab switcher */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-7 gap-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "login" ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              style={{ backgroundColor: tab === "login" ? MTN_DARK : "transparent" }}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "register" ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              style={{ backgroundColor: tab === "register" ? MTN_DARK : "transparent" }}
            >
              Register Business
            </button>
          </div>

          {tab === "login" ? <MTNLogin /> : <MTNRegister />}

          {/* Back link */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Not an MTN business partner?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: MTN_DARK }}>
              Go to main portal →
            </Link>
          </p>
          </div>{/* end glassmorphic card */}
        </div>{/* end max-w-md */}
      </div>{/* end right panel */}
    </div>
  );
}

/* ─── Sign In Form ─────────────────────────────────────────────────────────── */
function MTNLogin() {
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
      else if (result.isFranchise) navigate("/mtn/dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    } else {
      toast.error(result.error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
      <p className="text-gray-500 text-sm mt-1 mb-6">Sign in to your MTN business account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
          <Input
            id="email"
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
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: MTN_DARK }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              id="password"
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
          className="w-full h-11 font-semibold text-sm mt-2"
          style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Signing in…" : "Sign In to MTN Portal"}
          {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </form>

      <div className="mt-4 p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: "#FFFBEA" }}>
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#92400E" }} />
        <p className="text-xs" style={{ color: "#92400E" }}>
          This portal is exclusively for MTN business partners and registered MTN clients. If you haven't been onboarded yet, use the <strong>Register Business</strong> tab.
        </p>
      </div>
    </div>
  );
}

/* ─── Register Form ────────────────────────────────────────────────────────── */
function MTNRegister() {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [franchiseCode, setFranchiseCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Always pre-fill with MTN001 as the base franchise; override with URL param if provided
  useEffect(() => {
    const code = searchParams.get("franchise") || searchParams.get("ref");
    setFranchiseCode(code || "MTN001");
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
        franchiseCode: franchiseCode || "MTN001",
        businessData: { businessName: businessName || fullName, phone: phone || undefined, industrySector: "telecommunications" },
      });
      setLoading(false);
      if (result.ok) {
        toast.success("Account created! Welcome to the MTN Business Portal.");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Register your business</h2>
      <p className="text-gray-500 text-sm mt-1 mb-6">Join the MTN Business Portal as a Masakhe client</p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name *</Label>
            <Input
              className="mt-1 h-10"
              placeholder="Jane Dlamini"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</Label>
            <Input
              className="mt-1 h-10"
              placeholder="082 000 0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Business Name</Label>
          <div className="relative mt-1">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 h-10"
              placeholder="My MTN Store"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address *</Label>
          <Input
            className="mt-1 h-10"
            type="email"
            placeholder="you@business.co.za"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password *</Label>
            <div className="relative mt-1">
              <Input
                className="h-10 pr-9"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm Password *</Label>
            <Input
              className="mt-1 h-10"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">MTN Partner Code</Label>
          <Input
            className="mt-1 h-10 font-mono"
            placeholder="Provided by your MTN representative"
            value={franchiseCode}
            onChange={e => setFranchiseCode(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">Your MTN representative will provide this code to link your account to the MTN portal.</p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-semibold text-sm mt-1"
          style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? "Creating account…" : "Create MTN Business Account"}
          {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
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
