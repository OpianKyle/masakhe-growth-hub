import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Globe, FileText, Users, Wallet, Smartphone, Headphones } from "lucide-react";

const BG_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1400";

const features = [
  { icon: Globe,       label: "AI Website Builder",    desc: "Go live in minutes" },
  { icon: FileText,    label: "Invoicing & Quotes",    desc: "7 professional templates" },
  { icon: Wallet,      label: "Financial Tracking",    desc: "Income & expense management" },
  { icon: Users,       label: "Client Management",     desc: "Full CRM built-in" },
  { icon: Smartphone,  label: "Social Media Hub",      desc: "Schedule & publish posts" },
  { icon: Headphones,  label: "Payroll Management",    desc: "Salaries & payslips" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      if (result.isAdmin) {
        toast.success("Welcome back!");
        navigate("/admin", { replace: true });
      } else if (result.isReseller) {
        toast.success("Welcome back, Partner!");
        navigate("/partner", { replace: true });
      } else {
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      }
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      <Helmet>
        <title>Sign In | Masakhe SMME Platform</title>
        <meta name="description" content="Sign in to your Masakhe SMME account. Manage your business registration, compliance, invoicing, payroll, and more." />
        <link rel="canonical" href="https://masakheportal.co.za/login" />
        <meta property="og:title" content="Sign In | Masakhe SMME Platform" />
        <meta property="og:url" content="https://masakheportal.co.za/login" />
      </Helmet>
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundImage: `url(${BG_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/88 to-blue-950/92" />

        <div className="relative z-10">
          <Link to="/landing" className="flex items-center gap-3">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-9 w-9 object-contain" />
            <span className="text-2xl font-bold font-heading text-white">Masakhe</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-3">South Africa's SMME Platform</p>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Grow your business<br />with confidence
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Manage invoices, payroll, your website, clients, and social media — all from a single powerful dashboard built for South African SMMEs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            {features.map((f) => (
              <div key={f.label} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 flex-shrink-0">
                  <f.icon className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">{f.label}</p>
                  <p className="text-white/45 text-xs mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Masakhe Business Solutions. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <div className="flex items-center justify-between px-8 py-6 lg:hidden border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold font-heading text-slate-900">Masakhe</span>
          </Link>
          <Link to="/landing" className="text-sm text-slate-500 hover:text-slate-900">← Back to Home</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="hidden lg:flex items-center justify-end mb-10">
                <Link to="/landing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">← Back to Home</Link>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 font-heading">Welcome back</h2>
              <p className="text-slate-500 mt-2">Sign in to your Masakhe account to continue.</p>
            </div>

            <a
              href="/api/auth/google"
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
              <span className="text-xs text-slate-400 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.co.za"
                  className="mt-1.5 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-slate-50 focus:bg-white transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-slate-50 focus:bg-white transition-colors pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Register your business
                </Link>
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-center text-xs text-slate-400">
                Protected by enterprise-grade security. Your data stays private and compliant with POPIA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
