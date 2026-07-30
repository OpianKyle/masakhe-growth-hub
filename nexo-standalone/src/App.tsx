import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import NexoPortalPage from "./pages/NexoPortalPage";
import NexoDashboard from "./pages/NexoDashboard";
import NexoAdminPage from "./pages/NexoAdminPage";

function FranchiseRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a]"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/nexo" replace />;
  if (user.role !== "franchise" && user.role !== "admin") return <Navigate to="/nexo" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a]"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/nexo" replace />;
  if (user.role !== "admin") return <Navigate to="/nexo" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/nexo" replace />} />
      <Route path="/nexo" element={<NexoPortalPage />} />
      <Route path="/nexo/login" element={<NexoPortalPage />} />
      <Route path="/nexo/register" element={<NexoPortalPage />} />
      <Route path="/nexo/dashboard" element={<FranchiseRoute><NexoDashboard /></FranchiseRoute>} />
      <Route path="/nexo/admin" element={<AdminRoute><NexoAdminPage /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/nexo" replace />} />
    </Routes>
  );
}
