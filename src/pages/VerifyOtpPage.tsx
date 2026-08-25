import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function VerifyOtpPage() {
  const { user, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [phoneHint, setPhoneHint] = useState("your registered phone");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
    fetch("/api/auth/otp/status", { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPhoneHint(data.phoneHint);
      })
      .catch((err) => {
        toast.error(err.message || "Please sign in again.");
        navigate("/login", { replace: true });
      });
  }, [user, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    const result = await verifyOtp(code);
    setLoading(false);
    if (result.ok) {
      toast.success("Phone verified. Welcome back!");
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(result.error || "Verification failed");
      setCode("");
    }
  };

  const resend = async () => {
    setResending(true);
    const result = await resendOtp();
    setResending(false);
    if (result.ok) toast.success("A new code was sent.");
    else toast.error(result.error || "Could not resend code");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Helmet><title>Verify your phone | Masakhe</title></Helmet>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-center text-2xl font-bold text-slate-900">Verify your phone</h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Enter the 6-digit code sent to <strong className="text-slate-700">{phoneHint}</strong>. The code expires in 10 minutes.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-6">
          <InputOTP maxLength={6} value={code} onChange={setCode} disabled={loading} containerClassName="justify-center">
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
          <Button type="submit" disabled={loading || code.length !== 6} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Verifying..." : <span className="flex items-center gap-2">Verify and sign in <ArrowRight className="h-4 w-4" /></span>}
          </Button>
        </form>
        <button type="button" onClick={resend} disabled={resending} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} /> {resending ? "Sending..." : "Resend code"}
        </button>
        <Link to="/login" className="mt-5 block text-center text-sm text-slate-400 hover:text-slate-600">Use a different account</Link>
      </div>
    </main>
  );
}