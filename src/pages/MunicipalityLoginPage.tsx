import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

const FEATURES = [
  "Access your municipality dashboard",
  "View and manage registered SMMEs",
  "Respond to business support tickets",
  "Share your municipality registration link",
];

const BG = "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1400&q=80";

export default function MunicipalityLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Email and password are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }
      toast.success("Welcome back!");
      navigate("/municipality/portal");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <Helmet>
        <title>Municipality Portal Sign In | Masakhe</title>
      </Helmet>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col overflow-hidden"
        style={{ backgroundImage: `url(${BG})`, backgroundSize: "cover", backgroundPosition: "center 30%" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/92 via-slate-900/80 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-transparent to-blue-950/40" />

        <div className="relative flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-10 pt-10">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
            <span className="text-xl font-bold text-white tracking-tight">Masakhe</span>
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center px-10 pb-10">
            <div className="inline-flex items-center gap-2 mb-6 w-fit">
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/25 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
                <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">Municipality Portal</span>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Welcome back to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                Your Municipality Portal
              </span>
            </h1>

            <p className="text-slate-300 text-[15px] leading-relaxed mb-10 max-w-sm">
              Sign in to manage your registered SMMEs, respond to support requests, and track local business growth.
            </p>

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

            <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-fit">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-slate-300">Free for municipalities · SA platform</span>
            </div>
          </div>

          {/* SA flag strip */}
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
          <span className="text-lg font-bold tracking-tight">Masakhe</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Sign in to your portal</h2>
            <p className="text-muted-foreground text-sm mt-1.5">Enter your municipality account credentials below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email Address</Label>
              <Input
                type="email"
                placeholder="you@municipality.gov.za"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  className="pr-10"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.5)] transition-shadow"
              style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In to Portal
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/municipality/register" className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline">
                Register your municipality
              </Link>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/municipality" className="hover:underline">← Back to Municipality Portal</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
