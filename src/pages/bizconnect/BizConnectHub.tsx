import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, PenSquare, Image, BarChart3,
  Linkedin, Plus, Trash2, CheckCircle2, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import LinkedInTemplates from "../social/LinkedInTemplates";
import type { SiteConfig } from "@/types/site";
import SocialCalendar from "../social/SocialCalendar";
import SocialCreate from "../social/SocialCreate";
import SocialMediaLibrary from "../social/SocialMedia";
import SocialAnalytics from "../social/SocialAnalytics";

interface Account {
  id: string;
  platform: string;
  account_name: string;
  profile_url?: string;
  is_mock: number;
  created_at: string;
}

const subNav = [
  { icon: LayoutDashboard, label: "Templates", path: "" },
  { icon: Calendar, label: "Calendar", path: "calendar" },
  { icon: PenSquare, label: "Create Post", path: "create" },
  { icon: Image, label: "Media Library", path: "media" },
  { icon: BarChart3, label: "Analytics", path: "analytics" },
];

const SITE_CACHE_KEY = "masakhe_site_cache";

export default function BizConnectHub() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showManageAccounts, setShowManageAccounts] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [site, setSite] = useState<SiteConfig | null>(() => {
    try {
      const cached = localStorage.getItem(SITE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const location = useLocation();

  useEffect(() => {
    fetch("/api/social/workspaces/mine", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setWorkspaceId(d.defaultId || ""); })
      .catch(() => { setWorkspaceId(""); });

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

  const loadAccounts = useCallback(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/accounts`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const all = d.accounts || [];
        setAccounts(all.filter((a: Account) => a.platform === "LINKEDIN"));
        setMockMode(d.mockMode);
      })
      .catch(() => {});
  }, [workspaceId]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "linkedin") {
      const name = params.get("name") || "LinkedIn account";
      toast.success(`${name} connected successfully!`);
      loadAccounts();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("error")) {
      toast.error(params.get("error") || "Connection failed");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [loadAccounts]);

  const handleLinkedInOAuth = async () => {
    if (!workspaceId) {
      toast.error("No workspace found. Please refresh and try again.");
      return;
    }
    setOauthLoading(true);
    try {
      const res = await fetch(`/api/social/ws/${workspaceId}/accounts/oauth/linkedin/start`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.mockMode) {
        toast.info("LinkedIn API not configured. Please contact support.");
        setOauthLoading(false);
      } else {
        toast.error(data.error || "Could not start LinkedIn connection");
        setOauthLoading(false);
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
      setOauthLoading(false);
    }
  };

  const handleQuickConnect = async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`/api/social/ws/${workspaceId}/accounts/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ platform: "LINKEDIN", accountName: "My LinkedIn" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("LinkedIn connected in demo mode!");
        loadAccounts();
      } else {
        toast.error(data.error || "Failed to connect");
      }
    } catch {
      toast.error("Failed to connect");
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}? This will unlink the account from your workspace.`)) return;
    const res = await fetch(`/api/social/ws/${workspaceId}/accounts/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success("Account removed");
      loadAccounts();
    } else {
      toast.error("Failed to remove account");
    }
  };

  const linkedInAccount = accounts[0] || null;
  const currentPath = location.pathname.replace("/dashboard/biz-connect", "").replace(/^\//, "");

  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <Linkedin className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">LinkedIn Account</h3>
              <p className="text-xs text-muted-foreground">Manage your LinkedIn presence</p>
            </div>
            {mockMode && (
              <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">DEMO MODE</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {linkedInAccount && (
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowManageAccounts(!showManageAccounts)}>
                {showManageAccounts ? "Hide Details" : "Manage Account"}
              </Button>
            )}
            {!linkedInAccount && (
              <Button
                size="sm"
                onClick={() => setShowConnectDialog(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white h-7 text-xs px-3"
              >
                <Plus className="h-3 w-3 mr-1" /> Connect LinkedIn
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center shadow-md relative transition-transform hover:scale-105`}>
              <Linkedin className="h-7 w-7 text-white" />
              {linkedInAccount && (
                <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-md border border-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-500 fill-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">LinkedIn</span>
              <Button
                variant={linkedInAccount ? "outline" : "default"}
                size="sm"
                disabled={oauthLoading}
                className={`h-7 text-[10px] px-3 font-semibold rounded-full min-w-[100px] transition-all ${
                  linkedInAccount
                    ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 shadow-sm"
                    : "bg-blue-700 hover:bg-blue-800 text-white shadow-md hover:shadow-lg active:scale-95"
                }`}
                onClick={() => {
                  if (linkedInAccount) {
                    setShowManageAccounts(true);
                  } else if (mockMode) {
                    handleQuickConnect();
                  } else {
                    setShowConnectDialog(true);
                  }
                }}
              >
                {linkedInAccount ? "Connected" : mockMode ? "Connect Demo" : oauthLoading ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>

          {linkedInAccount && !showManageAccounts && (
            <div className="flex-1 rounded-xl border bg-blue-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
                  <Linkedin className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">{linkedInAccount.account_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                    <span className="text-xs text-green-700 font-medium">
                      {linkedInAccount.is_mock ? "Demo account connected" : "LinkedIn connected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!linkedInAccount && (
            <div className="flex-1 rounded-xl border border-dashed border-blue-200 bg-blue-50/30 p-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">No LinkedIn account connected</p>
                  <p className="text-xs text-blue-700 mt-0.5">Connect your LinkedIn to publish posts, schedule content, and track performance directly from Masakhe.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {showManageAccounts && linkedInAccount && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center">
                  <Linkedin className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-medium">{linkedInAccount.account_name}</span>
                {linkedInAccount.is_mock ? (
                  <span className="text-[9px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 font-medium">DEMO</span>
                ) : (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
                <button
                  onClick={() => handleDisconnect(linkedInAccount.id, linkedInAccount.account_name)}
                  className="text-red-400 hover:text-red-600 ml-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showConnectDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowConnectDialog(false)}>
          <Card className="max-w-md w-full p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b bg-blue-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
                  <Linkedin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-lg">Connect LinkedIn</h3>
                  <p className="text-xs text-muted-foreground">Link your LinkedIn profile to Biz Connect</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Connect via LinkedIn OAuth</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Click below to sign in with LinkedIn. You'll be asked to authorise Masakhe to post on your behalf. Once connected, you can publish posts directly to your LinkedIn profile or company page.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="p-6 border-t bg-slate-50 space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleLinkedInOAuth}
                  disabled={oauthLoading}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  {oauthLoading ? "Redirecting to LinkedIn..." : "Connect with LinkedIn"}
                </Button>
                <Button variant="ghost" onClick={() => setShowConnectDialog(false)}>Cancel</Button>
              </div>
              {mockMode && (
                <button
                  onClick={() => { handleQuickConnect(); setShowConnectDialog(false); }}
                  className="w-full text-xs text-muted-foreground hover:text-primary py-1 transition-colors"
                >
                  or connect as demo account instead
                </button>
              )}
            </div>
          </Card>
        </div>
      )}

      <div className="border-b bg-muted/30 px-4 overflow-x-auto">
        <div className="flex gap-1">
          {subNav.map(item => {
            const active = currentPath === item.path || (item.path === "" && currentPath === "");
            return (
              <Link
                key={item.path}
                to={`/dashboard/biz-connect${item.path ? "/" + item.path : ""}`}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-blue-700 text-blue-700 font-medium"
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
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                  <div className="h-8 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Routes>
            <Route index element={<LinkedInTemplates workspaceId={workspaceId} businessName={site?.businessName} createPath="/dashboard/biz-connect/create" />} />
            <Route path="calendar" element={<SocialCalendar workspaceId={workspaceId} platformFilter="LINKEDIN" createPath="/dashboard/biz-connect/create" />} />
            <Route path="create" element={<SocialCreate workspaceId={workspaceId} platformFilter="LINKEDIN" calendarPath="/dashboard/biz-connect/calendar" />} />
            <Route path="media" element={<SocialMediaLibrary workspaceId={workspaceId} />} />
            <Route path="analytics" element={<SocialAnalytics workspaceId={workspaceId} platformFilter="LINKEDIN" />} />
            <Route path="*" element={<LinkedInTemplates workspaceId={workspaceId} businessName={site?.businessName} createPath="/dashboard/biz-connect/create" />} />
          </Routes>
        )}
      </div>
    </div>
  );
}
