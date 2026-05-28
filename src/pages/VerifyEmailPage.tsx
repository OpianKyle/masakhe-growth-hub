import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "ready" | "confirming" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // On mount: only CHECK the token is valid — don't consume it yet.
  // Email security scanners follow links automatically; consuming on GET
  // would burn the token before the real user ever sees the page.
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in this link.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) setStatus("ready");
        else {
          setStatus("error");
          setErrorMsg(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Network error. Please try again.");
      });
  }, [token]);

  // Called when the user clicks the confirm button — this actually consumes the token.
  function handleConfirm() {
    if (!token) return;
    setStatus("confirming");
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) setStatus("success");
        else {
          setStatus("error");
          setErrorMsg(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Network error. Please try again.");
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-10 text-center">
        <div className="mb-6">
          <img src="/masakhe-logo.png" alt="Masakhe" className="h-12 w-12 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Email Verification</h1>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            <p className="text-slate-500 text-sm">Checking your verification link…</p>
          </div>
        )}

        {status === "ready" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <MailCheck className="h-9 w-9 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Confirm Your Email</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Click the button below to verify your email address and activate your Masakhe account.
            </p>
            <Button
              onClick={handleConfirm}
              className="mt-2 bg-green-700 hover:bg-green-800 text-white px-8"
            >
              Verify My Email
            </Button>
          </div>
        )}

        {status === "confirming" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            <p className="text-slate-500 text-sm">Verifying your email address…</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckCircle className="h-9 w-9 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Email Verified!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your email address has been successfully verified. Your Masakhe account is fully active.
            </p>
            <Link to="/dashboard">
              <Button className="mt-2 bg-green-700 hover:bg-green-800 text-white px-8">
                Go to My Dashboard
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <XCircle className="h-9 w-9 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Verification Failed</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{errorMsg}</p>
            <p className="text-slate-400 text-xs mt-1">
              The link may have expired (links are valid for 24 hours) or already been used.
            </p>
            <Link to="/dashboard">
              <Button variant="outline" className="mt-2">
                Go to Dashboard to Resend
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
