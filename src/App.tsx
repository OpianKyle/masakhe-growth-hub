import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, FranchiseRoute, MunicipalityRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import ResellerRegisterPage from "./pages/ResellerRegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResellerPortal from "./pages/ResellerPortal";
import AdminDashboard from "./pages/AdminDashboard";
import FranchiseDashboard from "./pages/FranchiseDashboard";
import MunicipalityPortal from "./pages/MunicipalityPortal";
import MunicipalityRegisterPage from "./pages/MunicipalityRegisterPage";
import MunicipalityLandingPage from "./pages/MunicipalityLandingPage";
import MunicipalityLoginPage from "./pages/MunicipalityLoginPage";
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
import AdRequirementsPage from "./pages/AdRequirementsPage";
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
              <Route path="/municipality" element={<MunicipalityLandingPage />} />
              <Route path="/municipality/login" element={<MunicipalityLoginPage />} />
              <Route path="/municipality/register" element={<MunicipalityRegisterPage />} />
              <Route path="/municipality/portal" element={<MunicipalityRoute><MunicipalityPortal /></MunicipalityRoute>} />
              <Route path="/site/:slug" element={<PublishedSite />} />
              <Route path="/site/:slug/vehicle/:vehicleId" element={<VehicleDetailPage />} />
              <Route path="/ad-requirements" element={<AdRequirementsPage />} />
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
    <a
      href="https://wa.me/27640700868"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{
        position: "fixed",
        bottom: 76,
        right: 16,
        zIndex: 9999,
        width: 52,
        height: 52,
        borderRadius: "50%",
        backgroundColor: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        textDecoration: "none",
        transition: "transform 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.07)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <svg viewBox="0 0 24 24" fill="white" width={26} height={26}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.847L.057 23.882a.5.5 0 0 0 .61.61l6.118-1.503A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 0 1-5.044-1.378l-.361-.214-3.737.917.951-3.646-.235-.374A9.867 9.867 0 0 1 2.106 12C2.106 6.533 6.533 2.106 12 2.106S21.894 6.533 21.894 12 17.467 21.894 12 21.894z"/>
      </svg>
    </a>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
