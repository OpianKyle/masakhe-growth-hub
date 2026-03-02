import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard, Calendar, AlertTriangle,
  Clock, Info, Loader2, Wallet, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface Plan {
  id: number;
  code: string;
  name: string;
  price_cents: number;
  currency: string;
  bill_interval: string;
}

interface Subscription {
  id: number;
  workspace_id: string;
  plan_id: number;
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
  trial_start_at: string | null;
  trial_end_at: string | null;
  next_billing_at: string | null;
  cancelled_at: string | null;
}

interface BillingInvoice {
  id: number;
  amount_cents: number;
  currency: string;
  status: string;
  merchant_ref: string | null;
  created_at: string;
  paid_at: string | null;
}

interface BillingData {
  subscription: Subscription | null;
  plan: Plan | null;
  invoices?: BillingInvoice[];
}

const planOptions = [
  {
    code: "starter",
    name: "Starter",
    price: "R899",
    priceCents: 89900,
    description: "Website Builder, Financial Tracking, Invoices, Compliance Score, Grant Readiness",
  },
  {
    code: "pro",
    name: "Pro",
    price: "R2,500",
    priceCents: 250000,
    description: "Everything in Starter + Social Media Hub, Content Calendar, Analytics, Media Library",
    popular: true,
  },
];

function formatCents(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}

function daysRemaining(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

function statusBadge(status: string) {
  const variants: Record<string, { className: string; label: string }> = {
    TRIAL: { className: "bg-sa-blue/10 text-[hsl(225,100%,29%)] border-[hsl(225,100%,29%)]/20", label: "Trial" },
    ACTIVE: { className: "bg-sa-green/10 text-[hsl(155,100%,24%)] border-[hsl(155,100%,24%)]/20", label: "Active" },
    PAST_DUE: { className: "bg-sa-red/10 text-[hsl(2,72%,54%)] border-[hsl(2,72%,54%)]/20", label: "Past Due" },
    CANCELLED: { className: "bg-muted text-muted-foreground border-border", label: "Cancelled" },
    PAID: { className: "bg-sa-green/10 text-[hsl(155,100%,24%)] border-[hsl(155,100%,24%)]/20", label: "Paid" },
    PENDING: { className: "bg-sa-gold/10 text-[hsl(41,100%,40%)] border-[hsl(41,100%,40%)]/20", label: "Pending" },
    FAILED: { className: "bg-sa-red/10 text-[hsl(2,72%,54%)] border-[hsl(2,72%,54%)]/20", label: "Failed" },
  };
  const v = variants[status] || { className: "bg-muted text-muted-foreground", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${v.className}`}>
      {v.label}
    </span>
  );
}

function InlineSubscribeForm({ onSuccess }: { onSuccess: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const plan = planOptions.find((p) => p.code === selectedPlan)!;

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planCode: selectedPlan }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error === "You already have an active subscription") {
          toast({ title: "Already subscribed", description: "You already have an active subscription." });
          onSuccess();
          return;
        }
        toast({ title: "Error", description: json.error || "Failed to subscribe.", variant: "destructive" });
        return;
      }

      if (json.ok) {
        toast({ title: "Subscription Activated!", description: "Your 14-day free trial is now active." });
        onSuccess();
      } else {
        toast({ title: "Error", description: json.error || "Subscription failed.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to process subscription.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Choose a Plan
        </h3>
        <div className="grid gap-3">
          {planOptions.map((p) => (
            <label
              key={p.code}
              className={`relative flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                selectedPlan === p.code
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={p.code}
                checked={selectedPlan === p.code}
                onChange={() => setSelectedPlan(p.code)}
                className="mt-1 accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground font-heading">{p.name}</span>
                  {p.popular && (
                    <span className="gradient-gold text-sa-black text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>
                  )}
                </div>
                <p className="text-lg font-bold font-heading text-foreground">
                  {p.price}<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-semibold text-foreground">{plan.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trial Period</span>
          <span className="text-sa-green font-semibold">14 days free</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Then</span>
          <span className="font-semibold text-foreground">{plan.price}/month</span>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        className="w-full"
        size="lg"
        disabled={submitting}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing...</>
        ) : (
          <><Check className="h-4 w-4 mr-2" />Activate Free Trial</>
        )}
      </Button>
    </div>
  );
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/subscription", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData({ subscription: null, plan: null });
      }
    } catch {
      setData({ subscription: null, plan: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBilling(); }, []);

  useEffect(() => {
    const paymentResult = searchParams.get("payment");
    if (paymentResult) {
      if (paymentResult === "success") {
        toast({ title: "Subscription Active!", description: "Your subscription is now active. Welcome to Masakhe!" });
      } else if (paymentResult === "failed") {
        toast({ title: "Subscription Failed", description: "There was an issue. Please try again.", variant: "destructive" });
      }
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Subscription cancelled", description: "Your subscription has been cancelled." });
        fetchBilling();
      } else {
        toast({ title: "Error", description: json.error || "Failed to cancel.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to cancel subscription.", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { subscription, plan, invoices } = data || {};

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold font-heading text-foreground">Billing</h2>
        <p className="text-muted-foreground mt-1">Manage your subscription and view billing history.</p>
      </motion.div>

      {!subscription ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-8 shadow-card space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-full gradient-hero flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold font-heading text-foreground">Subscribe to Masakhe</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Start your 14-day free trial. Cancel anytime.
            </p>
          </div>
          <InlineSubscribeForm onSuccess={fetchBilling} />
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h3 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Current Plan
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-heading text-foreground">{plan?.name || "Unknown"}</span>
                  {statusBadge(subscription.status)}
                </div>
                <p className="text-muted-foreground">
                  {plan ? `${formatCents(plan.price_cents)} / month` : ""}
                </p>
              </div>
            </div>
          </motion.div>

          {subscription.status === "TRIAL" && subscription.trial_end_at && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-[hsl(41,100%,54%)]/30 bg-[hsl(41,100%,54%)]/5 p-6 shadow-card"
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[hsl(41,100%,54%)]" />
                Trial Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold text-foreground">{daysRemaining(subscription.trial_end_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trial Ends</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(subscription.trial_end_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount After Trial</p>
                  <p className="text-lg font-semibold text-foreground">{plan ? formatCents(plan.price_cents) : "—"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {subscription.status === "ACTIVE" && subscription.next_billing_at && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Next Billing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Next Charge Date</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(subscription.next_billing_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold text-foreground">{plan ? formatCents(plan.price_cents) : "—"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {subscription.status === "PAST_DUE" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-[hsl(2,72%,54%)]/30 bg-[hsl(2,72%,54%)]/5 p-8 shadow-card space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-bold font-heading text-foreground">Payment Past Due</h3>
                <p className="text-sm text-muted-foreground">Your last payment failed. Re-subscribe below to restore access to all features.</p>
              </div>
              <InlineSubscribeForm onSuccess={fetchBilling} />
            </motion.div>
          )}

          {(subscription.status === "TRIAL" || subscription.status === "ACTIVE") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-2">Cancel Subscription</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {subscription.status === "TRIAL"
                  ? "Cancel your trial. You won't be charged."
                  : "Cancel your subscription. You'll retain access until the end of your current billing period."}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {subscription.status === "TRIAL"
                        ? "Your trial will end immediately and you won't be charged."
                        : "Your subscription will be cancelled. You'll lose access to premium features at the end of your billing period."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          )}
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-lg font-bold font-heading text-foreground mb-4">Billing History</h3>
        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Reference</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 px-3 text-foreground">{formatDate(inv.created_at)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{inv.merchant_ref || `INV-${inv.id}`}</td>
                    <td className="py-2.5 px-3 text-foreground text-right">{formatCents(inv.amount_cents)}</td>
                    <td className="py-2.5 px-3 text-center">{statusBadge(inv.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No billing history yet.</p>
        )}
      </motion.div>
    </div>
  );
}
