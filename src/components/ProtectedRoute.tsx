import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { MasakheLoader } from "@/components/MasakheLoader";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [billingBlocked, setBillingBlocked] = useState(false);
  const [billingChecked, setBillingChecked] = useState(false);

  const checkAccess = useCallback(() => {
    if (!user) {
      setBillingChecked(true);
      return;
    }
    // Admins, partner/reseller accounts, and team members have their own billing path — skip SMME billing check
    if (user.role === "admin" || user.role === "franchise" || user.is_reseller || user.teamMember) {
      setBillingBlocked(false);
      setBillingChecked(true);
      return;
    }
    fetch("/api/billing/access-status", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setBillingBlocked(data.blocked === true);
        setBillingChecked(true);
      })
      .catch(() => {
        setBillingBlocked(false);
        setBillingChecked(true);
      });
  }, [user]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Re-check whenever the user navigates within /dashboard so a freshly-started
  // trial / paid subscription unlocks the rest of the app immediately, without
  // needing a hard refresh.
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin" || user.role === "franchise" || user.is_reseller || user.teamMember) return;
    checkAccess();
  }, [location.pathname, checkAccess, user]);

  // BillingPage dispatches a `billing:updated` event when the subscription
  // state changes — re-check immediately so the user can leave the billing
  // page on the very next click.
  useEffect(() => {
    const handler = () => checkAccess();
    window.addEventListener("billing:updated", handler);
    return () => window.removeEventListener("billing:updated", handler);
  }, [checkAccess]);

  if (loading || !billingChecked) {
    return <MasakheLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOnBillingPage = location.pathname.startsWith("/dashboard/billing");
  const isOnSettingsPage = location.pathname.startsWith("/dashboard/settings");
  const isOnTeamPage = location.pathname.startsWith("/dashboard/team");
  const isOnPartnerPage = location.pathname.startsWith("/dashboard/reseller") || location.pathname.startsWith("/partner");

  // Team members are blocked from owner-only sections
  if (user.teamMember && (isOnBillingPage || isOnSettingsPage || isOnTeamPage || isOnPartnerPage)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (billingBlocked && !isOnBillingPage) {
    return <Navigate to="/dashboard/billing" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <MasakheLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function FranchiseRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <MasakheLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "franchise" && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function MunicipalityRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <MasakheLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
