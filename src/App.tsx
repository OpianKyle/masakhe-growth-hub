import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, FranchiseRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import ResellerRegisterPage from "./pages/ResellerRegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResellerPortal from "./pages/ResellerPortal";
import AdminDashboard from "./pages/AdminDashboard";
import FranchiseDashboard from "./pages/FranchiseDashboard";
import PublishedSite from "./pages/PublishedSite";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import PricingPage from "./pages/PricingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SetPasswordPage from "./pages/SetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import PayInvoice from "./pages/PayInvoice";
import SocialHubStandalone from "./pages/social/SocialHubStandalone";
import WebsiteBuilderStandalone from "./pages/WebsiteBuilderStandalone";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import MetaDeletionStatusPage from "./pages/MetaDeletionStatusPage";
import { useEffect, useState } from "react";
import { MasakheLoader } from "@/components/MasakheLoader";

const queryClient = new QueryClient();

const MAIN_DOMAINS = ["masakheportal.co.za", "localhost", "127.0.0.1"];

function CustomDomainGate({ children }: { children: React.ReactNode }) {
  const [domainSlug, setDomainSlug] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isMainDomain =
      MAIN_DOMAINS.includes(hostname) ||
      hostname.includes(".replit.") ||
      hostname.endsWith(".replit.dev") ||
      hostname.endsWith(".repl.co");

    if (isMainDomain) {
      setDomainSlug(null);
      return;
    }

    fetch(`/api/websites/by-domain?hostname=${encodeURIComponent(hostname)}`)
      .then((r) => r.json())
      .then((data) => setDomainSlug(data.site?.slug || null))
      .catch(() => setDomainSlug(null));
  }, []);

  if (domainSlug === undefined) {
    return <MasakheLoader />;
  }

  if (domainSlug) {
    return <PublishedSite slugOverride={domainSlug} />;
  }

  return <>{children}</>;
}

/**
 * Watches every route for a `?promo=` query param and stashes the code in
 * sessionStorage so the billing page can pick it up after sign-up — even if
 * the user lands first on the landing page or the partner portal.
 */
function PromoCodeCapture() {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("promo");
    if (code) {
      try { sessionStorage.setItem("masakhe.promoCode", code.trim().toUpperCase()); } catch {}
    }
  }, [location.search]);
  return null;
}

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CustomDomainGate>
          <BrowserRouter>
            <PromoCodeCapture />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/partner/register" element={<ResellerRegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/set-password" element={<SetPasswordPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/dashboard/social" element={<Navigate to="/social-hub" replace />} />
              <Route path="/dashboard/social/*" element={<Navigate to="/social-hub" replace />} />
              <Route path="/dashboard/website" element={<Navigate to="/website-builder" replace />} />
              <Route path="/dashboard/website/*" element={<Navigate to="/website-builder" replace />} />
              <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/social-hub/*" element={<ProtectedRoute><SocialHubStandalone /></ProtectedRoute>} />
              <Route path="/website-builder/*" element={<ProtectedRoute><WebsiteBuilderStandalone /></ProtectedRoute>} />
              <Route path="/partner" element={<ProtectedRoute><ResellerPortal /></ProtectedRoute>} />
              <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/franchise/*" element={<FranchiseRoute><FranchiseDashboard /></FranchiseRoute>} />
              <Route path="/site/:slug" element={<PublishedSite />} />
              <Route path="/site/:slug/vehicle/:vehicleId" element={<VehicleDetailPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/meta-deletion-status" element={<MetaDeletionStatusPage />} />
              <Route path="/pay/:token" element={<PayInvoice />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CustomDomainGate>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
