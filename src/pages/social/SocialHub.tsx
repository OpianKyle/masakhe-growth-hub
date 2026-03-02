import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, PenSquare, Image, Globe, BarChart3
} from "lucide-react";
import SocialOverview from "./SocialOverview";
import SocialCalendar from "./SocialCalendar";
import SocialCreate from "./SocialCreate";
import SocialMediaLibrary from "./SocialMedia";
import SocialAccounts from "./SocialAccounts";
import SocialAnalytics from "./SocialAnalytics";

const subNav = [
  { icon: LayoutDashboard, label: "Overview", path: "" },
  { icon: Calendar, label: "Calendar", path: "calendar" },
  { icon: PenSquare, label: "Create Post", path: "create" },
  { icon: Image, label: "Media Library", path: "media" },
  { icon: Globe, label: "Accounts", path: "accounts" },
  { icon: BarChart3, label: "Analytics", path: "analytics" },
];

function ContentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-8 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-48 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function SocialHub() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/social/workspaces/mine", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setWorkspaceId(d.defaultId || ""); })
      .catch(() => { setWorkspaceId(""); });
  }, []);

  const currentPath = location.pathname.replace("/dashboard/social", "").replace(/^\//, "");

  return (
    <div>
      <div className="border-b bg-muted/30 px-4 overflow-x-auto">
        <div className="flex gap-1">
          {subNav.map(item => {
            const active = currentPath === item.path || (item.path === "" && currentPath === "");
            return (
              <Link
                key={item.path}
                to={`/dashboard/social${item.path ? "/" + item.path : ""}`}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {workspaceId === null ? (
          <ContentSkeleton />
        ) : (
          <Routes>
            <Route index element={<SocialOverview workspaceId={workspaceId} />} />
            <Route path="calendar" element={<SocialCalendar workspaceId={workspaceId} />} />
            <Route path="create" element={<SocialCreate workspaceId={workspaceId} />} />
            <Route path="media" element={<SocialMediaLibrary workspaceId={workspaceId} />} />
            <Route path="accounts" element={<SocialAccounts workspaceId={workspaceId} />} />
            <Route path="analytics" element={<SocialAnalytics workspaceId={workspaceId} />} />
            <Route path="*" element={<SocialOverview workspaceId={workspaceId} />} />
          </Routes>
        )}
      </div>
    </div>
  );
}
