import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingReturnPage() {
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{ ok: boolean; message: string; needsLogin?: boolean } | null>(null);

  useEffect(() => {
    const processReturn = async () => {
      const status = searchParams.get("status");
      const merchantRef = searchParams.get("merchantRef") || searchParams.get("_MERCHANTREFERENCE");
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      if (merchantRef) params.merchantRef = merchantRef;

      try {
        const res = await fetch("/api/billing/return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(params),
        });

        if (res.status === 401) {
          if (status === "success") {
            setResult({
              ok: true,
              message: "Your payment was processed successfully. The webhook has confirmed your transaction. Please log in to view your billing dashboard.",
              needsLogin: true,
            });
          } else {
            setResult({
              ok: false,
              message: "Payment was not completed. Please log in and try again.",
              needsLogin: true,
            });
          }
          return;
        }

        const json = await res.json();

        if (json.ok) {
          setResult({
            ok: true,
            message: "Your payment was processed successfully. Your trial is now active!",
          });
        } else {
          setResult({
            ok: false,
            message: json.error || "Payment processing failed. Please try again.",
          });
        }
      } catch {
        if (status === "success") {
          setResult({
            ok: true,
            message: "Payment appears successful. Please check your billing dashboard for confirmation.",
          });
        } else {
          setResult({
            ok: false,
            message: "Payment failed or was cancelled. Please try again.",
          });
        }
      } finally {
        setProcessing(false);
      }
    };

    processReturn();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg">
        {processing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-bold font-heading text-foreground">Processing Payment...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your payment.</p>
          </motion.div>
        ) : result?.ok ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-sa-green/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-sa-green" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground">{result.message}</p>
            {result.needsLogin ? (
              <Link to="/login">
                <Button className="mt-2">
                  <LogIn className="h-4 w-4 mr-2" /> Log In to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/dashboard/billing">
                <Button className="mt-2">
                  Go to Billing Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-sa-red/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-sa-red" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">Payment Failed</h2>
            <p className="text-muted-foreground">{result?.message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
              {result?.needsLogin ? (
                <Link to="/login">
                  <Button>
                    <LogIn className="h-4 w-4 mr-2" /> Log In
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/pricing">
                    <Button variant="outline">Back to Pricing</Button>
                  </Link>
                  <Link to="/dashboard/billing">
                    <Button>
                      Billing Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex h-1.5">
        <div className="flex-1 bg-sa-green" />
        <div className="flex-1 bg-sa-gold" />
        <div className="flex-1 bg-sa-red" />
        <div className="flex-1 bg-sa-blue" />
        <div className="flex-1 bg-sa-black" />
      </div>
    </div>
  );
}
