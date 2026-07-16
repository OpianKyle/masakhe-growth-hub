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
  BarChart3, Shield, BadgeCheck,
} from "lucide-react";

const MTN_YELLOW = "#FFCC00";
const MTN_DARK   = "#1a1a1a";

const features = [
  { icon: Globe,       label: "AI Website Builder",   desc: "Professional website for your business" },
  { icon: FileText,    label: "Invoicing & Quotes",   desc: "Send professional quotes in minutes" },
  { icon: Wallet,      label: "Financial Tracking",   desc: "Track income, expenses & cash flow" },
  { icon: Users,       label: "Client Management",    desc: "Full CRM — contacts, notes & deals" },
  { icon: Smartphone,  label: "Social Media Hub",     desc: "Schedule posts across all platforms" },
  { icon: CreditCard,  label: "Payroll Management",   desc: "Auto-calculate salaries & payslips" },
  { icon: BarChart3,   label: "Business Analytics",   desc: "Real-time reports & insights" },
  { icon: Shield,      label: "POPIA Compliance",     desc: "Stay compliant with SA regulations" },
];

function MTNLogo({ size = 40 }: { size?: number }) {
  const h = Math.round(size * 0.625);
  return (
    <svg width={size} height={h} viewBox="0 0 90 56" fill="none" aria-label="MTN">
      <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_YELLOW} strokeWidth="4" fill="none"/>
      <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_YELLOW} letterSpacing="1">MTN</text>
    </svg>
  );
}

export default function MTNPortalPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: MTN_DARK }}>

      {/* ── LEFT PANEL — dark sidebar matching MTNDashboard ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: MTN_DARK }}
      >
        {/* Dot pattern (matches dashboard hero) */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #FFCC00 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, #FFCC00 1.5px, transparent 1.5px)",
          backgroundSize: "50px 50px",
        }} />
        {/* Subtle gradient accent */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #222228 60%, #1a1a2e 100%)",
        }} />

        {/* Watermark MTN logo */}
        <div className="absolute right-8 bottom-24 opacity-[0.06]">
          <svg width="260" height="163" viewBox="0 0 90 56" fill="none">
            <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_YELLOW} strokeWidth="3" fill="none"/>
            <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_YELLOW}>MTN</text>
          </svg>
        </div>

        {/* Top: Logo + branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ backgroundColor: MTN_YELLOW }}>
              <svg width="30" height="19" viewBox="0 0 90 56" fill="none">
                <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="6" fill="none"/>
                <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Powered by</div>
              <div className="flex items-center gap-2 mt-0.5">
                <img src="/masakhe-logo.png" alt="Masakhe" className="h-6 w-6 object-contain" />
                <span className="text-lg font-bold text-white">Masakhe</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "rgba(255,204,0,0.15)", color: MTN_YELLOW, border: `1px solid rgba(255,204,0,0.3)` }}>
              MTN Business Portal
            </span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mt-4 text-white">
            Grow your MTN<br />business with<br />confidence.
          </h1>
          <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
            Everything MTN business partners and franchise clients need — invoicing, payroll, website, CRM, and more — all in one place.
          </p>

          {/* Partner badge — matching dashboard sidebar bottom badge */}
          <div className="flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl w-fit"
            style={{ backgroundColor: "rgba(255,204,0,0.12)", border: "1px solid rgba(255,204,0,0.2)" }}>
            <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: MTN_YELLOW }} />
            <span className="text-sm font-semibold" style={{ color: MTN_YELLOW }}>Exclusive MTN Partner Programme</span>
          </div>
        </div>

        {/* Feature grid */}
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Everything included
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl p-3 transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: MTN_YELLOW }}>
                  <Icon className="h-4 w-4" style={{ color: MTN_DARK }} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight text-white">{label}</p>
                  <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="relative z-10 mt-6">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Masakhe Technologies. MTN Business Portal is an exclusive service for MTN business partners and clients.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #23232e 0%, #1a1a1a 50%, #141420 100%)" }}>

        {/* Subtle dot pattern matching left panel */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle, #FFCC00 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Mobile logo */}
        <div className="relative z-10 flex lg:hidden items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: MTN_YELLOW }}>
            <svg width="24" height="15" viewBox="0 0 90 56" fill="none">
              <ellipse cx="45" cy="28" rx="43" ry="26" stroke={MTN_DARK} strokeWidth="6" fill="none"/>
              <text x="45" y="36" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="22" fill={MTN_DARK}>MTN</text>
            </svg>
          </div>
          <div className="h-6 w-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
          <img src="/masakhe-logo.png" alt="Masakhe" className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold text-white">Masakhe</span>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card — matches dashboard bg-card style but dark-themed */}
          <div className="rounded-2xl p-8 shadow-2xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}>

            {/* Tab switcher — matching dashboard nav style */}
            <div className="flex rounded-xl p-1 mb-7 gap-1"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                onClick={() => setTab("login")}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: tab === "login" ? MTN_YELLOW : "transparent",
                  color: tab === "login" ? MTN_DARK : "rgba(255,255,255,0.5)",
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("register")}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: tab === "register" ? MTN_YELLOW : "transparent",
                  color: tab === "register" ? MTN_DARK : "rgba(255,255,255,0.5)",
                }}
              >
                Register Business
              </button>
            </div>

            {tab === "login" ? <MTNLogin /> : <MTNRegister />}

            <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
              Not an MTN business partner?{" "}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: "rgba(255,204,0,0.7)" }}>
                Go to main portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared dark-themed field wrapper ─────────────────────────────────────── */
function DarkLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
      {children}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
};

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
      <h2 className="text-2xl font-extrabold text-white">Welcome back</h2>
      <p className="text-sm mt-1 mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>Sign in to your MTN business account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="block mb-1.5"><DarkLabel>Email address</DarkLabel></Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@business.co.za"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-11 placeholder:text-white/25 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/50"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password"><DarkLabel>Password</DarkLabel></Label>
            <Link to="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: "rgba(255,204,0,0.7)" }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-11 pr-11 placeholder:text-white/25 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/50"
              style={inputStyle}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-bold text-sm mt-2 gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign In to MTN Portal"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="mt-4 p-3.5 rounded-xl flex items-start gap-3"
        style={{ backgroundColor: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.18)" }}>
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: MTN_YELLOW }} />
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          This portal is exclusively for MTN business partners and registered MTN clients. If you haven't been onboarded yet, use the <strong className="text-white/70">Register Business</strong> tab.
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

  useEffect(() => {
    const code = searchParams.get("franchise");
    if (code) setFranchiseCode(code);
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
        franchiseCode: franchiseCode || undefined,
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
      <h2 className="text-2xl font-extrabold text-white">Register your business</h2>
      <p className="text-sm mt-1 mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>Join the MTN Business Portal as a Masakhe client</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="block mb-1"><DarkLabel>Full Name *</DarkLabel></Label>
            <Input className="h-10 placeholder:text-white/25 focus-visible:ring-yellow-400/50" style={inputStyle}
              placeholder="Jane Dlamini" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label className="block mb-1"><DarkLabel>Phone</DarkLabel></Label>
            <Input className="h-10 placeholder:text-white/25 focus-visible:ring-yellow-400/50" style={inputStyle}
              placeholder="082 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="block mb-1"><DarkLabel>Business Name</DarkLabel></Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <Input className="pl-9 h-10 placeholder:text-white/25 focus-visible:ring-yellow-400/50" style={inputStyle}
              placeholder="My MTN Store" value={businessName} onChange={e => setBusinessName(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="block mb-1"><DarkLabel>Email Address *</DarkLabel></Label>
          <Input className="h-10 placeholder:text-white/25 focus-visible:ring-yellow-400/50" style={inputStyle}
            type="email" placeholder="you@business.co.za" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="block mb-1"><DarkLabel>Password *</DarkLabel></Label>
            <div className="relative">
              <Input className="h-10 pr-9 placeholder:text-white/25 focus-visible:ring-yellow-400/50" style={inputStyle}
                type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.35)" }}>
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="block mb-1"><DarkLabel>Confirm Password *</DarkLabel></Label>
            <Input className="h-10 placeholder:text-white/25 focus-visible:ring-yellow-400/50" style={inputStyle}
              type="password" placeholder="Repeat password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
        </div>

        <div>
          <Label className="block mb-1"><DarkLabel>MTN Partner Code</DarkLabel></Label>
          <Input className="h-10 font-mono placeholder:text-white/25 focus-visible:ring-yellow-400/50" style={inputStyle}
            placeholder="Provided by your MTN representative"
            value={franchiseCode} onChange={e => setFranchiseCode(e.target.value)} />
          <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            Your MTN representative will provide this code to link your account.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-bold text-sm mt-1 gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: MTN_YELLOW, color: MTN_DARK, border: "none" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Creating account…" : "Create MTN Business Account"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="text-center text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
        By registering you agree to our{" "}
        <Link to="/terms" className="underline hover:opacity-80" style={{ color: "rgba(255,204,0,0.6)" }}>Terms of Service</Link>
        {" "}and{" "}
        <Link to="/privacy" className="underline hover:opacity-80" style={{ color: "rgba(255,204,0,0.6)" }}>Privacy Policy</Link>.
      </p>
    </div>
  );
}
