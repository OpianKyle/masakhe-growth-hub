import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, X, Lock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface BillingStatus {
  subscription: {
    status: string;
    trial_end_at: string | null;
  } | null;
  plan: { name: string } | null;
}

function daysRemaining(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

export default function TrialBanner() {
  const navigate = useNavigate();
  const [billingData, setBillingData] = useState<BillingStatus | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showTrialPopup, setShowTrialPopup] = useState(false);
  const [showNoSubPopup, setShowNoSubPopup] = useState(false);

  useEffect(() => {
    fetch("/api/billing/subscription", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setBillingData(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const shownKey = "masakhe_trial_popup_shown";
    const alreadyShown = sessionStorage.getItem(shownKey);

    if (!billingData?.subscription) {
      if (!alreadyShown) {
        sessionStorage.setItem(shownKey, "1");
        setShowNoSubPopup(true);
      }
      return;
    }

    const { status, trial_end_at } = billingData.subscription;

    if (status === "TRIAL") {
      const days = daysRemaining(trial_end_at);
      if (days === 0) {
        setShowExpiredModal(true);
        return;
      }
      if (!alreadyShown) {
        sessionStorage.setItem(shownKey, "1");
        setShowTrialPopup(true);
      }
    }

    if (status === "PAST_DUE") {
      setShowExpiredModal(true);
    }
  }, [loaded, billingData]);

  if (!loaded) return null;

  const hasSub = !!billingData?.subscription;
  const status = billingData?.subscription?.status;
  const trial_end_at = billingData?.subscription?.trial_end_at || null;
  const days = daysRemaining(trial_end_at);

  if (status === "ACTIVE") return null;

  return (
    <>
      {!hasSub && !dismissed && (
        <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-[hsl(225,100%,29%)] to-[hsl(225,80%,40%)] text-white text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Your <strong>14-day free trial</strong> is active. Subscribe before it ends to keep access to all features.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs bg-white text-[hsl(225,100%,29%)] hover:bg-white/90"
              onClick={() => navigate("/dashboard/billing")}
            >
              Subscribe Now
            </Button>
            <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {status === "TRIAL" && days > 0 && !dismissed && (
        <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 bg-[hsl(225,100%,29%)] text-white text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              <strong>{days} day{days !== 1 ? "s" : ""}</strong> remaining in your free trial.
              After {days === 1 ? "today" : `${days} days`}, all features will be locked until you subscribe.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs bg-white text-[hsl(225,100%,29%)] hover:bg-white/90"
              onClick={() => navigate("/dashboard/billing")}
            >
              Subscribe Now
            </Button>
            <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog open={showNoSubPopup} onOpenChange={setShowNoSubPopup}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(225,100%,29%)]/20 to-primary/10 flex items-center justify-center">
              <Gift className="h-7 w-7 text-[hsl(225,100%,29%)]" />
            </div>
            <h2 className="text-xl font-bold font-heading">Welcome to Masakhe!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your <strong>14-day free trial</strong> has started! Explore all of Masakhe's powerful tools at no cost.
              Subscribe before your trial ends to keep full access to everything.
            </p>
            <div className="rounded-lg bg-muted/50 p-3 text-left space-y-1.5">
              {[
                "Website Builder",
                "Financial Tracking & Invoicing",
                "Social Media Hub",
                "Funding Readiness Tools",
                "Business Tenders",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => { setShowNoSubPopup(false); navigate("/dashboard/billing"); }}>
                Subscribe Now
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowNoSubPopup(false)}>
                Explore First
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTrialPopup} onOpenChange={setShowTrialPopup}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-[hsl(225,100%,29%)]/10 flex items-center justify-center">
              <Clock className="h-7 w-7 text-[hsl(225,100%,29%)]" />
            </div>
            <h2 className="text-xl font-bold font-heading">You're on a 14-Day Free Trial</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You have <strong>{days} day{days !== 1 ? "s" : ""}</strong> left to explore all of Masakhe's features at no cost.
              After your trial ends, all functionality will be locked until an active subscription is in place.
            </p>
            <div className="rounded-lg bg-muted/50 p-3 text-left space-y-1.5">
              {[
                "Website Builder",
                "Financial Tracking & Invoicing",
                "Social Media Hub",
                "Funding Readiness Tools",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => { setShowTrialPopup(false); navigate("/dashboard/billing"); }}>
                Subscribe Now
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowTrialPopup(false)}>
                Continue Trial
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExpiredModal}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <div className="text-center space-y-4 py-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-xl font-bold font-heading">
              {status === "PAST_DUE" ? "Payment Past Due" : "Trial Expired"}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {status === "PAST_DUE"
                ? "Your last payment failed. Please update your subscription to continue using Masakhe."
                : "Your 14-day trial has ended. Subscribe now to regain access to all features — your data is safely preserved."}
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => { setShowExpiredModal(false); navigate("/dashboard/billing"); }}>
                Subscribe Now
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowExpiredModal(false)}>
                View Dashboard
              </Button>
            </div>
            {status === "TRIAL" && (
              <p className="text-xs text-muted-foreground">
                Your data is saved and will be accessible once you subscribe.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
