import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, PenSquare, Image, BarChart3,
  Facebook, Instagram, Globe, Plus, Trash2, CheckCircle2, Info, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import SocialPostTemplates from "./SocialPostTemplates";
import SocialCalendar from "./SocialCalendar";
import SocialCreate from "./SocialCreate";
import SocialMediaLibrary from "./SocialMedia";
import SocialAnalytics from "./SocialAnalytics";
import type { SiteConfig } from "@/types/site";

interface Account {
  id: string;
  platform: string;
  account_name: string;
  profile_url?: string;
  is_mock: number;
  created_at: string;
}

const PLATFORM_META = {
  META_FACEBOOK: {
    label: "Facebook",
    color: "bg-[#1877F2]",
    textColor: "text-[#1877F2]",
    borderColor: "border-[#1877F2]",
    bgLight: "bg-[#1877F2]/10",
    Icon: Facebook,
  },
  META_INSTAGRAM: {
    label: "Instagram",
    color: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]",
    textColor: "text-[#E1306C]",
    borderColor: "border-[#E1306C]",
    bgLight: "bg-[#E1306C]/10",
    Icon: Instagram,
  },
  TWITTER: {
    label: "X (Twitter)",
    color: "bg-black",
    textColor: "text-black",
    borderColor: "border-black",
    bgLight: "bg-black/5",
    Icon: X,
  },
  TIKTOK: {
    label: "TikTok",
    color: "bg-black",
    textColor: "text-black",
    borderColor: "border-black",
    bgLight: "bg-black/5",
    Icon: Globe,
  },
} as const;

type SupportedPlatform = keyof typeof PLATFORM_META;
const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_META) as SupportedPlatform[];

const subNav = [
  { icon: LayoutDashboard, label: "Templates",    path: ""         },
  { icon: Calendar,        label: "Calendar",     path: "calendar" },
  { icon: PenSquare,       label: "Create Post",  path: "create"   },
  { icon: Image,           label: "Media Library",path: "media"    },
  { icon: BarChart3,       label: "Analytics",    path: "analytics"},
];

const SITE_CACHE_KEY = "masakhe_site_cache";

export default function SocialHub() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showManageAccounts, setShowManageAccounts] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState<SupportedPlatform | null>(null);
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

  const loadAccounts = useCallback(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/accounts`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const all: Account[] = d.accounts || [];
        setAccounts(all.filter(a => SUPPORTED_PLATFORMS.includes(a.platform as SupportedPlatform)));
        setMockMode(d.mockMode);
      })
      .catch(() => {});
  }, [workspaceId]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected && connected !== "linkedin") {
      toast.success(`${params.get("name") || "Account"} connected successfully!`);
      loadAccounts();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("error")) {
      toast.error(params.get("error") || "Connection failed");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [loadAccounts]);

  const handleQuickConnect = async (platform: SupportedPlatform) => {
    if (!workspaceId) return;
    setConnectingPlatform(platform);
    try {
      const res = await fetch(`/api/social/ws/${workspaceId}/accounts/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ platform, accountName: `My ${PLATFORM_META[platform].label}` }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${PLATFORM_META[platform].label} connected in demo mode!`);
        loadAccounts();
        setShowConnectDialog(null);
      } else {
        toast.error(data.error || "Failed to connect");
      }
    } catch {
      toast.error("Failed to connect. Please try again.");
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}? This will unlink the account from your workspace.`)) return;
    const res = await fetch(`/api/social/ws/${workspaceId}/accounts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Account removed");
      loadAccounts();
    } else {
      toast.error("Failed to remove account");
    }
  };

  const currentPath = location.pathname
    .replace("/dashboard/social", "")
    .replace(/^\//, "");

  const connectedByPlatform = (p: SupportedPlatform) =>
    accounts.find(a => a.platform === p) ?? null;

  return (
    <div>
      {/* ── Account header ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#1877F2] flex items-center justify-center z-30 ring-2 ring-background">
                <Facebook className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] flex items-center justify-center z-20 ring-2 ring-background">
                <Instagram className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center z-10 ring-2 ring-background">
                <X className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Social Media Accounts</h3>
              <p className="text-xs text-muted-foreground">Facebook, Instagram, X & TikTok</p>
            </div>
            {mockMode && (
              <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">DEMO MODE</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {accounts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setShowManageAccounts(v => !v)}
              >
                {showManageAccounts ? "Hide Accounts" : "Manage Accounts"}
              </Button>
            )}
            {accounts.length === 0 && (
              <Button
                size="sm"
                onClick={() => setShowConnectDialog("META_FACEBOOK")}
                className="h-7 text-xs px-3 gradient-hero text-white"
              >
                <Plus className="h-3 w-3 mr-1" /> Connect Account
              </Button>
            )}
          </div>
        </div>

        {/* Platform tiles */}
        <div className="flex items-start gap-3 py-2 flex-wrap">
          {SUPPORTED_PLATFORMS.map(platform => {
            const meta = PLATFORM_META[platform];
            const Icon = meta.Icon;
            const connected = connectedByPlatform(platform);
            return (
              <div key={platform} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl ${meta.color} flex items-center justify-center shadow-md relative transition-transform hover:scale-105`}>
                  <Icon className="h-6 w-6 text-white" />
                  {connected && (
                    <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-md border border-green-100">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    {meta.label.split(" ")[0]}
                  </span>
                  <Button
                    variant={connected ? "outline" : "default"}
                    size="sm"
                    disabled={connectingPlatform === platform}
                    className={`h-6 text-[10px] px-2.5 font-semibold rounded-full min-w-[80px] transition-all ${
                      connected
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        : `${meta.bgLight} ${meta.textColor} border ${meta.borderColor} hover:opacity-90`
                    }`}
                    onClick={() => {
                      if (connected) {
                        setShowManageAccounts(true);
                      } else if (mockMode) {
                        handleQuickConnect(platform);
                      } else {
                        setShowConnectDialog(platform);
                      }
                    }}
                  >
                    {connected
                      ? "Connected"
                      : connectingPlatform === platform
                      ? "Connecting..."
                      : mockMode ? "Connect Demo" : "Connect"}
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Info panel — show connected account or empty state */}
          <div className="flex-1 min-w-[220px]">
            {accounts.length > 0 && !showManageAccounts ? (
              <div className="rounded-xl border bg-muted/30 p-3 space-y-1.5">
                {accounts.map(a => {
                  const meta = PLATFORM_META[a.platform as SupportedPlatform];
                  const Icon = meta?.Icon || Globe;
                  return (
                    <div key={a.id} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md ${meta?.color || "bg-gray-500"} flex items-center justify-center shrink-0`}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{a.account_name}</p>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5 text-green-500 shrink-0" />
                          <span className="text-[10px] text-green-700">
                            {a.is_mock ? "Demo" : "Connected"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">No accounts connected</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Connect Facebook, Instagram, X or TikTok to publish and schedule posts directly from Masakhe.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Manage accounts list */}
        {showManageAccounts && accounts.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {accounts.map(a => {
                const meta = PLATFORM_META[a.platform as SupportedPlatform];
                const Icon = meta?.Icon || Globe;
                return (
                  <div key={a.id} className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 shadow-sm">
                    <div className={`w-5 h-5 rounded-full ${meta?.color || "bg-gray-500"} flex items-center justify-center`}>
                      <Icon className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-xs font-medium">{a.account_name}</span>
                    {a.is_mock
                      ? <span className="text-[9px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 font-medium">DEMO</span>
                      : <CheckCircle2 className="h-3 w-3 text-green-500" />
                    }
                    <button
                      onClick={() => handleDisconnect(a.id, a.account_name)}
                      className="text-red-400 hover:text-red-600 ml-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-8 text-xs"
                onClick={() => setShowConnectDialog("META_FACEBOOK")}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Connect dialog ─────────────────────────────────────────────── */}
      {showConnectDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowConnectDialog(null)}
        >
          <Card className="max-w-md w-full p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b bg-muted/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-1">
                  {SUPPORTED_PLATFORMS.map(p => {
                    const m = PLATFORM_META[p];
                    const Icon = m.Icon;
                    return (
                      <div key={p} className={`w-8 h-8 rounded-lg ${m.color} flex items-center justify-center ring-2 ring-background`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    );
                  })}
                </div>
                <div>
                  <h3 className="font-bold font-heading text-base">Connect Social Media</h3>
                  <p className="text-xs text-muted-foreground">Link an account to publish from Masakhe</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <Card className="p-4 border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Full Meta (Facebook & Instagram) and Twitter/X OAuth integration is coming soon.
                    Use demo mode to explore the full workflow today — your content and scheduling work exactly the same.
                  </p>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_PLATFORMS.map(platform => {
                  const meta = PLATFORM_META[platform];
                  const Icon = meta.Icon;
                  const connected = connectedByPlatform(platform);
                  return (
                    <button
                      key={platform}
                      disabled={!!connected || connectingPlatform === platform}
                      onClick={() => handleQuickConnect(platform)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                        connected
                          ? "border-green-200 bg-green-50 opacity-70 cursor-not-allowed"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${meta.color} flex items-center justify-center shrink-0`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{meta.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {connected
                            ? "Already connected"
                            : connectingPlatform === platform
                            ? "Connecting…"
                            : "Connect demo"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t bg-muted/20 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowConnectDialog(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Sub-nav ────────────────────────────────────────────────────── */}
      <div className="border-b bg-muted/30 px-4 overflow-x-auto">
        <div className="flex gap-1">
          {subNav.map(item => {
            const active =
              item.path === ""
                ? currentPath === "" || currentPath === undefined
                : currentPath === item.path;
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

      {/* ── Content ────────────────────────────────────────────────────── */}
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
            <Route
              index
              element={
                <SocialPostTemplates
                  workspaceId={workspaceId}
                  site={site}
                  createPath="/dashboard/social/create"
                />
              }
            />
            <Route
              path="calendar"
              element={
                <SocialCalendar
                  workspaceId={workspaceId}
                  createPath="/dashboard/social/create"
                />
              }
            />
            <Route
              path="create"
              element={
                <SocialCreate
                  workspaceId={workspaceId}
                  calendarPath="/dashboard/social/calendar"
                />
              }
            />
            <Route path="media" element={<SocialMediaLibrary workspaceId={workspaceId} />} />
            <Route path="analytics" element={<SocialAnalytics workspaceId={workspaceId} />} />
            <Route
              path="*"
              element={
                <SocialPostTemplates
                  workspaceId={workspaceId}
                  site={site}
                  createPath="/dashboard/social/create"
                />
              }
            />
          </Routes>
        )}
      </div>
    </div>
  );
}
