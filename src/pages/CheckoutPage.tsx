import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard, Shield, ArrowLeft, Loader2, CheckCircle, AlertTriangle, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Plan {
  id: number;
  code: string;
  name: string;
  price_cents: number;
  currency: string;
  bill_interval: string;
}

function formatCents(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const planCode = searchParams.get("plan") || "starter";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mockStep, setMockStep] = useState<"confirm" | "card" | "processing" | "done">("confirm");
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const formRef = useRef<HTMLFormElement>(null);

  const selectedPlan = plans.find((p) => p.code === planCode);

  useEffect(() => {
    fetch("/api/billing/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planCode }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: json.error || "Checkout failed.", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      setCheckoutData(json);

      if (json.mock) {
        setMockStep("card");
      } else if (json.formAction && json.formData) {
        setTimeout(() => {
          formRef.current?.submit();
        }, 100);
      }
    } catch {
      toast({ title: "Error", description: "Failed to start checkout.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockCardSubmit = async () => {
    setMockStep("processing");
    try {
      const res = await fetch("/api/billing/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          merchantRef: checkoutData.merchantRef,
          status: "success",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setMockStep("done");
        toast({ title: "Success!", description: "Your trial has been activated." });
        setTimeout(() => navigate("/dashboard/billing"), 2000);
      } else {
        toast({ title: "Error", description: json.error || "Payment failed.", variant: "destructive" });
        setMockStep("card");
      }
    } catch {
      toast({ title: "Error", description: "Payment processing failed.", variant: "destructive" });
      setMockStep("card");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold font-heading">Plan Not Found</h2>
          <p className="text-muted-foreground">The selected plan does not exist.</p>
          <Link to="/pricing">
            <Button>View Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/pricing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Pricing</span>
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Secure Checkout</span>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 container mx-auto px-4 max-w-2xl">
        {mockStep === "done" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-sa-green/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-sa-green" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">Trial Activated!</h2>
            <p className="text-muted-foreground">
              Your 14-day free trial of the <strong>{selectedPlan.name}</strong> plan is now active.
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to billing dashboard...</p>
            <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
          </motion.div>
        ) : mockStep === "processing" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-bold font-heading text-foreground">Processing Payment...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we process your card.</p>
          </motion.div>
        ) : mockStep === "card" && checkoutData?.mock ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-[hsl(225,100%,29%)]/20 bg-[hsl(225,100%,29%)]/5 p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-[hsl(225,100%,29%)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[hsl(225,100%,29%)]">Demo Mode</p>
                <p className="text-sm text-muted-foreground">No real charges — this is a simulated card capture.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-card space-y-6">
              <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Card Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Card Number</label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 1111 1111 1111"
                    className="font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Expiry</label>
                    <Input value="12/28" readOnly className="font-mono" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">CVV</label>
                    <Input value="123" readOnly className="font-mono" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trial Period</span>
                  <span className="text-foreground">14 days free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Then</span>
                  <span className="font-semibold text-foreground">{formatCents(selectedPlan.price_cents)}/month</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleMockCardSubmit}
              >
                Simulate Card Capture
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold font-heading text-foreground">Checkout</h1>
              <p className="text-muted-foreground">Review your order and start your free trial.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-card space-y-6">
              <h2 className="text-xl font-bold font-heading text-foreground">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">{selectedPlan.name} Plan</span>
                  <span className="text-lg font-bold text-foreground">{formatCents(selectedPlan.price_cents)}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Free Trial</span>
                    <span className="text-foreground font-medium">14 days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Today</span>
                    <span className="text-sa-green font-bold">R0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After Trial</span>
                    <span className="text-foreground">{formatCents(selectedPlan.price_cents)}/month</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p>
                  By continuing, you'll start a <strong>14-day free trial</strong>. Your card will be captured for verification but you
                  won't be charged until the trial ends. Cancel anytime.
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Starting Checkout...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Continue to Payment
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Secured by Adumo Payment Gateway</span>
            </div>
          </motion.div>
        )}

        {checkoutData && !checkoutData.mock && checkoutData.formAction && (
          <form
            ref={formRef}
            method="POST"
            action={checkoutData.formAction}
            style={{ display: "none" }}
          >
            {Object.entries(checkoutData.formData || {}).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value as string} />
            ))}
          </form>
        )}
      </div>

      <div className="flex h-1.5">
        <div className="flex-1 bg-sa-green" />
        <div className="flex-1 bg-sa-gold" />
        <div className="flex-1 bg-sa-red" />
        <div className="flex-1 bg-sa-blue" />
        <div className="flex-1 bg-sa-black" />
      </div>
    </div>
  );
}
