import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, PenSquare, Image, BarChart3,
  Facebook, Instagram, Linkedin, X as XIcon, Video, Globe,
  Plus, Trash2, CheckCircle2, Info, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SocialOverview from "./SocialOverview";
import SocialCalendar from "./SocialCalendar";
import SocialCreate from "./SocialCreate";
import SocialMediaLibrary from "./SocialMedia";
import SocialAnalytics from "./SocialAnalytics";

interface Account {
  id: string;
  platform: string;
  account_name: string;
  profile_url?: string;
  is_mock: number;
  created_at: string;
}

const PLATFORMS = [
  { id: "META_FACEBOOK", label: "Facebook", icon: Facebook, color: "bg-blue-600", placeholder: "Page or business name", urlPlaceholder: "https://facebook.com/yourbusiness" },
  { id: "META_INSTAGRAM", label: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", placeholder: "@yourbusiness", urlPlaceholder: "https://instagram.com/yourbusiness" },
  { id: "LINKEDIN", label: "LinkedIn", icon: Linkedin, color: "bg-blue-700", placeholder: "Company or profile name", urlPlaceholder: "https://linkedin.com/company/yourbusiness" },
  { id: "X", label: "X (Twitter)", icon: XIcon, color: "bg-black", placeholder: "@yourhandle", urlPlaceholder: "https://x.com/yourhandle" },
  { id: "TIKTOK", label: "TikTok", icon: Video, color: "bg-gray-900", placeholder: "@yourhandle", urlPlaceholder: "https://tiktok.com/@yourhandle" },
  { id: "YOUTUBE", label: "YouTube", icon: Video, color: "bg-red-600", placeholder: "Channel name", urlPlaceholder: "https://youtube.com/@yourchannel" },
];

const subNav = [
  { icon: LayoutDashboard, label: "Overview", path: "" },
  { icon: Calendar, label: "Calendar", path: "calendar" },
  { icon: PenSquare, label: "Create Post", path: "create" },
  { icon: Image, label: "Media Library", path: "media" },
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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [platform, setPlatform] = useState("");
  const [accountName, setAccountName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showManageAccounts, setShowManageAccounts] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/social/workspaces/mine", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setWorkspaceId(d.defaultId || ""); })
      .catch(() => { setWorkspaceId(""); });
  }, []);

  const loadAccounts = useCallback(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/accounts`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setAccounts(d.accounts || []); setMockMode(d.mockMode); })
      .catch(() => {});
  }, [workspaceId]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "meta") {
      const count = params.get("count") || "0";
      toast.success(`Successfully connected ${count} Meta account(s)!`);
      loadAccounts();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("error")) {
      toast.error(params.get("error") || "Connection failed");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [loadAccounts]);

  const currentPath = location.pathname.replace("/dashboard/social", "").replace(/^\//, "");
  const connectedPlatforms = accounts.map(a => a.platform);
  const selectedPlatform = PLATFORMS.find(p => p.id === platform);
  const isMetaPlatform = (pid: string) => pid === "META_FACEBOOK" || pid === "META_INSTAGRAM";

  const handleMetaOAuth = async () => {
    setOauthLoading(true);
    try {
      const res = await fetch(`/api/social/ws/${workspaceId}/accounts/oauth/meta/start`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.mockMode) {
        toast.info("Meta API not configured. Use manual linking instead.");
        setOauthLoading(false);
      } else {
        toast.error("Could not start Meta connection");
        setOauthLoading(false);
      }
    } catch {
      toast.error("Failed to start Meta connection");
      setOauthLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!platform || !accountName.trim()) {
      toast.error("Select a platform and enter your account name");
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch(`/api/social/ws/${workspaceId}/accounts/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ platform, accountName: accountName.trim(), profileUrl: profileUrl.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${accountName} linked successfully!`);
        closeConnectDialog();
        loadAccounts();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to connect");
    } finally {
      setConnecting(false);
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

  const closeConnectDialog = () => {
    setShowConnect(false);
    setPlatform("");
    setAccountName("");
    setProfileUrl("");
  };

  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Connected Accounts</h3>
            {mockMode && (
              <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">DEMO MODE</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {accounts.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowManageAccounts(!showManageAccounts)}>
                {showManageAccounts ? "Hide Details" : "Manage Accounts"}
              </Button>
            )}
            <Button size="sm" onClick={() => { setPlatform(""); setShowConnect(true); }} className="gradient-hero text-white h-7 text-xs px-3">
              <Plus className="h-3 w-3 mr-1" /> Add Account
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 py-2">
          {PLATFORMS.map(p => {
            const acc = accounts.find(a => a.platform === p.id);
            const Icon = p.icon;
            return (
              <div key={p.id} className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${p.color} flex items-center justify-center shadow-md relative transition-transform hover:scale-105`}>
                  <Icon className="h-6 w-6 text-white" />
                  {acc && (
                    <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-md border border-green-100">
                      <CheckCircle2 className="h-4 w-4 text-green-500 fill-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{p.label}</span>
                  <Button
                    variant={acc ? "outline" : "default"}
                    size="sm"
                    className={`h-7 text-[10px] px-3 font-semibold rounded-full min-w-[85px] transition-all ${
                      acc 
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 shadow-sm" 
                        : "gradient-hero text-white shadow-md hover:shadow-lg active:scale-95"
                    }`}
                    onClick={() => {
                      if (acc) {
                        setShowManageAccounts(true);
                        // Scroll to managed accounts or similar
                      } else {
                        setPlatform(p.id);
                        setShowConnect(true);
                      }
                    }}
                  >
                    {acc ? "Connected" : "Connect"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {showManageAccounts && accounts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {accounts.map(acc => {
                const plat = PLATFORMS.find(p => p.id === acc.platform);
                const Icon = plat?.icon || Globe;
                return (
                  <div key={acc.id} className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 shadow-sm">
                    <div className={`w-6 h-6 rounded-full ${plat?.color || "bg-gray-500"} flex items-center justify-center`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-medium">{acc.account_name}</span>
                    {acc.is_mock ? (
                      <span className="text-[9px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 font-medium">DEMO</span>
                    ) : (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                    <button
                      onClick={() => handleDisconnect(acc.id, acc.account_name)}
                      className="text-red-400 hover:text-red-600 ml-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showConnect && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeConnectDialog}>
          <Card className="max-w-lg w-full p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b bg-slate-50">
              <h3 className="font-bold font-heading text-lg">Link a Social Account</h3>
              <p className="text-sm text-muted-foreground mt-1">Connect your social media profile to post and manage content</p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <Label className="text-sm font-medium mb-3 block">Choose Platform</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map(p => {
                    const isConnected = connectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => !isConnected && setPlatform(p.id)}
                        disabled={isConnected}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs transition-all ${
                          isConnected
                            ? "border-green-200 bg-green-50 text-green-700 cursor-default"
                            : platform === p.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center ${isConnected ? "opacity-60" : ""}`}>
                          <p.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium">{p.label}</span>
                        {isConnected && (
                          <span className="flex items-center gap-0.5 text-[10px] text-green-600">
                            <CheckCircle2 className="h-3 w-3" /> Linked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {platform && !mockMode && isMetaPlatform(platform) ? (
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 text-sm">Connect via Facebook</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Click below to sign in with Facebook. This will automatically connect your Facebook Page
                        {platform === "META_INSTAGRAM" ? " and linked Instagram business account" : ""}.
                      </p>
                    </div>
                  </div>
                </Card>
              ) : platform ? (
                <>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Account Name / Handle</Label>
                    <Input
                      value={accountName}
                      onChange={e => setAccountName(e.target.value)}
                      placeholder={selectedPlatform?.placeholder || "Account name"}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      <span className="flex items-center gap-1.5">
                        <Link2 className="h-3.5 w-3.5" /> Profile URL
                      </span>
                    </Label>
                    <Input
                      value={profileUrl}
                      onChange={e => setProfileUrl(e.target.value)}
                      placeholder={selectedPlatform?.urlPlaceholder || "https://..."}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Paste your full profile link so visitors can find you
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-2">
              {platform && !mockMode && isMetaPlatform(platform) ? (
                <Button
                  onClick={handleMetaOAuth}
                  disabled={oauthLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  {oauthLoading ? "Redirecting to Facebook..." : "Connect with Facebook"}
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={connecting || !platform || !accountName.trim()}
                  className="flex-1 gradient-hero text-white"
                >
                  {connecting ? "Linking..." : "Link Account"}
                </Button>
              )}
              <Button variant="ghost" onClick={closeConnectDialog}>
                Cancel
              </Button>
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
            <Route path="analytics" element={<SocialAnalytics workspaceId={workspaceId} />} />
            <Route path="*" element={<SocialOverview workspaceId={workspaceId} />} />
          </Routes>
        )}
      </div>
    </div>
  );
}
