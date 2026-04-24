import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { PenSquare, FileText } from "lucide-react";
import SocialPostEditor from "./SocialPostEditor";
import SocialPostTemplates from "./SocialPostTemplates";
import type { SiteConfig } from "@/types/site";

const SITE_CACHE_KEY = "masakhe_site_cache";

const subNav = [
  { icon: PenSquare, label: "Post Editor", path: "" },
  { icon: FileText, label: "Social Posts", path: "templates" },
];

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

  const isTemplates = currentPath === "templates";

  return (
    <div className="flex flex-col h-full">
      {/* Sub-nav — only show when not in the full-screen Post Editor */}
      <div className="border-b border-border bg-background px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {subNav.map(item => {
            const active =
              item.path === ""
                ? !isTemplates
                : currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={`/dashboard/social${item.path ? "/" + item.path : ""}`}
                className={`flex items-center gap-2 px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
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

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<SocialPostEditor />} />
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
          <Route path="create" element={<SocialPostEditor />} />
          <Route path="*" element={<SocialPostEditor />} />
        </Routes>
      </div>
    </div>
  );
}
