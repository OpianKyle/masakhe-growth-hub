import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { PenSquare, FileText, Edit3 } from "lucide-react";
import SocialPostEditor from "./SocialPostEditor";
import SocialPostTemplates from "./SocialPostTemplates";
import SocialCreate from "./SocialCreate";
import type { SiteConfig } from "@/types/site";

const SITE_CACHE_KEY = "masakhe_site_cache";

export default function SocialHub() {
  const location = useLocation();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [site, setSite] = useState<SiteConfig | null>(() => {
    try {
      const cached = localStorage.getItem(SITE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  useEffect(() => {
    fetch("/api/social/workspaces/mine", { credentials: "include" })
      .then(r => r.json())
      .then(d => setWorkspaceId(d.defaultId || ""))
      .catch(() => setWorkspaceId(""));

    fetch("/api/websites/mine", { credentials: "include" })
      .then(r => r.json())
      .then((data: any[]) => {
        if (data?.length > 0) {
          const siteData = data[0].content || data[0];
          setSite(siteData);
          try { localStorage.setItem(SITE_CACHE_KEY, JSON.stringify(siteData)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const currentPath = location.pathname
    .replace("/dashboard/social", "")
    .replace(/^\//, "");

  const subNav = [
    { icon: PenSquare, label: "Post Editor",   path: "",          active: !currentPath || currentPath === "" },
    { icon: FileText,  label: "Social Posts",  path: "templates", active: currentPath === "templates" },
    { icon: Edit3,     label: "Create Post",   path: "create",    active: currentPath === "create" || currentPath.startsWith("create") },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-nav */}
      <div className="border-b border-border bg-background px-6 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {subNav.map(item => (
            <Link
              key={item.path}
              to={`/dashboard/social${item.path ? "/" + item.path : ""}`}
              className={`flex items-center gap-2 px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                item.active
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          {/* Post Editor — the canvas-based designer */}
          <Route index element={<SocialPostEditor />} />

          {/* Social Posts — advertising & promotional templates */}
          <Route
            path="templates"
            element={
              workspaceId === null ? (
                <div className="p-8 space-y-4 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-48 bg-muted rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <SocialPostTemplates
                    workspaceId={workspaceId}
                    site={site}
                    createPath="/dashboard/social/create"
                  />
                </div>
              )
            }
          />

          {/* Create Post — text-based social post editor, handles ?template= params */}
          <Route
            path="create"
            element={
              workspaceId === null ? (
                <div className="p-8 space-y-4 animate-pulse">
                  <div className="h-8 bg-muted rounded w-1/2" />
                  <div className="h-48 bg-muted rounded-xl" />
                </div>
              ) : (
                <SocialCreate
                  workspaceId={workspaceId}
                  calendarPath="/dashboard/social/calendar"
                />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<SocialPostEditor />} />
        </Routes>
      </div>
    </div>
  );
}
