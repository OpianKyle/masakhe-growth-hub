import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setSent(true);
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
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
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-card">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-sa-green/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-sa-green" />
              </div>
              <h1 className="text-2xl font-bold font-heading text-foreground">Check your email</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If an account exists with <strong>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <p className="text-muted-foreground text-xs">The link will expire in 1 hour.</p>
              <Link to="/login">
                <Button variant="outline" className="mt-4 w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold font-heading text-foreground">Forgot your password?</h1>
                <p className="text-muted-foreground mt-2 text-sm">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@business.co.za"
                    className="mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
