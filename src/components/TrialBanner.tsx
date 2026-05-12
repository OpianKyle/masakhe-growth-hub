import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function TrialBanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fetchStatus = () => {
    fetch("/api/billing/status", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.active ? "ACTIVE" : (data.status || "NONE"));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Re-check whenever the user navigates so a freshly-started trial /
  // subscription is reflected immediately (no hard refresh needed).
  useEffect(() => {
    fetchStatus();
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("payment") === "success") {
      fetchStatus();
      setDismissed(false);
    }
  }, [location.search]);

  // BillingPage dispatches `billing:updated` after starting a trial / paying.
  useEffect(() => {
    const handler = () => { fetchStatus(); setDismissed(false); };
    window.addEventListener("billing:updated", handler);
    return () => window.removeEventListener("billing:updated", handler);
  }, []);

  if (user?.role === "admin") return null;
  if (!loaded) return null;
  if (status === "ACTIVE") return null;
  if (status === "NONE" || !status) return null;
  if (dismissed) return null;
  if (location.pathname.startsWith("/dashboard/billing")) return null;

  return (
    <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm shrink-0">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 shrink-0" />
        <span>
          <strong>Upgrade your plan</strong> to unlock Social Media, Finance, Payroll and more.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs bg-white text-amber-700 hover:bg-white/90"
          onClick={() => navigate("/dashboard/billing")}
        >
          View Plans
        </Button>
        <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
