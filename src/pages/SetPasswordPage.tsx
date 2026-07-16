import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface InviteInfo {
  email: string;
  full_name: string | null;
  owner_full_name: string | null;
  owner_business_name: string | null;
}

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const portal = searchParams.get("portal");

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setVerifyError("Invalid or missing invite link.");
      return;
    }
    fetch(`/api/auth/setup-password/${encodeURIComponent(token)}`, { credentials: "include" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Invite link is invalid or has expired.");
        setInfo(data);
      })
      .catch((err) => setVerifyError(err.message || "Invite link is invalid or has expired."))
      .finally(() => setVerifying(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
        const redirectTo = portal ? `/${portal}` : "/dashboard";
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1500);
      } else {
        toast.error(data.error || "Failed to set password");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <span className="text-lg font-bold text-primary-foreground font-heading">M</span>
            </div>
            <span className="text-xl font-bold font-heading text-foreground">Masakhe</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-card">
          {verifying ? (
            <div className="text-center py-6 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Checking your invite…</p>
            </div>
          ) : verifyError ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold font-heading text-foreground">Invite link invalid</h1>
              <p className="text-muted-foreground text-sm">{verifyError}</p>
              <p className="text-xs text-muted-foreground">
                Ask your business owner to resend your invite from the Team Members page.
              </p>
              <Link to="/login">
                <Button variant="hero" className="w-full mt-2">Go to Sign In</Button>
              </Link>
            </div>
          ) : success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-sa-green/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-sa-green" />
              </div>
              <h1 className="text-2xl font-bold font-heading text-foreground">Welcome aboard!</h1>
              <p className="text-muted-foreground text-sm">Your password is set. Taking you to the dashboard…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold font-heading text-foreground">Set your password</h1>
                {info && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {info.owner_full_name || "Your business owner"}
                    {info.owner_business_name ? <> from <span className="font-semibold text-foreground">{info.owner_business_name}</span></> : null}
                    {" "}invited you ({info.email}) to join their Masakhe workspace. Choose a password to get started.
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="mt-1.5"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                  {submitting ? "Setting password…" : "Set Password & Sign In"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
