import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Upload, X, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComplianceStatus {
  ficaUploaded: boolean;
  businessRegUploaded: boolean;
  allUploaded: boolean;
  daysLeft: number;
  gracePeriodExpired: boolean;
  isBlocked: boolean;
}

const REMINDER_SESSION_KEY = "compliance_reminder_dismissed";

const FICA_ENFORCEMENT_ENABLED = false;

export default function ComplianceDocsGate() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!FICA_ENFORCEMENT_ENABLED) return;
    if (!user || user.role === "admin") return;
    try {
      const res = await fetch("/api/fica-docs/status", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
      if (!data.allUploaded && !sessionStorage.getItem(REMINDER_SESSION_KEY)) {
        setShowModal(true);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (!FICA_ENFORCEMENT_ENABLED) return null;

  const dismissModal = () => {
    sessionStorage.setItem(REMINDER_SESSION_KEY, "1");
    setShowModal(false);
  };

  const goToSettings = () => {
    dismissModal();
    navigate("/dashboard/settings?tab=docs");
  };

  if (!user || user.role === "admin" || !status) return null;

  const isOnSettings = location.pathname === "/dashboard/settings";
  const isOnBilling = location.pathname.startsWith("/dashboard/billing");
  const daysLeftCeil = Math.ceil(status.daysLeft);

  return (
    <>
      {status.isBlocked && !isOnSettings && !isOnBilling && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-5 p-8 max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading mb-2">Account Verification Required</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your 2-day document submission window has passed. Please upload your compliance
                documents in Settings to continue using Masakhe.
              </p>
            </div>
            <div className="rounded-lg border p-4 text-left space-y-3">
              <div className="flex items-center gap-3 text-sm">
                {status.ficaUploaded
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <div className="h-4 w-4 rounded-full border-2 border-destructive shrink-0" />}
                <span className={status.ficaUploaded ? "text-green-700" : "text-destructive font-medium"}>
                  FICA Document (ID + Proof of Address) {status.ficaUploaded ? "— Uploaded" : "— Missing"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {status.businessRegUploaded
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <div className="h-4 w-4 rounded-full border-2 border-destructive shrink-0" />}
                <span className={status.businessRegUploaded ? "text-green-700" : "text-destructive font-medium"}>
                  Business Registration Document {status.businessRegUploaded ? "— Uploaded" : "— Missing"}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/settings?tab=docs")}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Upload Documents Now
            </button>
          </div>
        </div>
      )}

      {showModal && !status.isBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-foreground">Documents Required</h3>
                  <p className="text-xs text-muted-foreground">Compliance verification pending</p>
                </div>
              </div>
              <button
                onClick={dismissModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              To keep your account active and compliant, please upload your required documents. You have{" "}
              <span className="font-semibold text-amber-600">
                {status.daysLeft < 1
                  ? "less than 1 day"
                  : `${daysLeftCeil} day${daysLeftCeil !== 1 ? "s" : ""}`}
              </span>{" "}
              remaining before your account is blocked.
            </p>

            <div className="rounded-lg border bg-muted/40 p-3 space-y-2.5 mb-5">
              <div className="flex items-center gap-2.5 text-sm">
                {status.ficaUploaded
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <Clock className="h-4 w-4 text-amber-500 shrink-0" />}
                <span className={status.ficaUploaded ? "text-green-700 text-xs" : "text-foreground"}>
                  FICA Document (ID + Proof of Address)
                </span>
                {status.ficaUploaded && (
                  <span className="text-xs text-green-600 font-medium ml-auto">Uploaded</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                {status.businessRegUploaded
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <Clock className="h-4 w-4 text-amber-500 shrink-0" />}
                <span className={status.businessRegUploaded ? "text-green-700 text-xs" : "text-foreground"}>
                  Business Registration Certificate
                </span>
                {status.businessRegUploaded && (
                  <span className="text-xs text-green-600 font-medium ml-auto">Uploaded</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={goToSettings} className="w-full sm:flex-1">
                <Upload className="h-4 w-4 mr-2" /> Upload Now
              </Button>
              <Button variant="ghost" onClick={dismissModal} className="w-full sm:w-auto">
                Remind me later
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
