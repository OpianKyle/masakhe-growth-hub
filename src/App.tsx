import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import Onboarding from "./pages/Onboarding";
import PublishedSite from "./pages/PublishedSite";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import PricingPage from "./pages/PricingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import MetaDeletionStatusPage from "./pages/MetaDeletionStatusPage";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const MAIN_DOMAINS = ["masakhegroup.co.za", "localhost", "127.0.0.1"];

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
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (domainSlug) {
    return <PublishedSite slugOverride={domainSlug} />;
  }

  return <>{children}</>;
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
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/site/:slug" element={<PublishedSite />} />
              <Route path="/site/:slug/vehicle/:vehicleId" element={<VehicleDetailPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/meta-deletion-status" element={<MetaDeletionStatusPage />} />
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
