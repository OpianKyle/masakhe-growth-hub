import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [billingBlocked, setBillingBlocked] = useState(false);
  const [billingChecked, setBillingChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setBillingChecked(true);
      return;
    }
    if (user.role === "admin") {
      setBillingBlocked(false);
      setBillingChecked(true);
      return;
    }
    fetch("/api/billing/access-status", { credentials: "include" })
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

  if (loading || !billingChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOnBillingPage = location.pathname.startsWith("/dashboard/billing");

  if (billingBlocked && !isOnBillingPage) {
    return <Navigate to="/dashboard/billing" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
