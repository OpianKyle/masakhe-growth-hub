import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Facebook, Instagram, Linkedin, X as XIcon, Plus, Trash2, Globe, Info,
  ExternalLink, Link2, CheckCircle2, Video
} from "lucide-react";

interface Account {
  id: string;
  platform: string;
  account_name: string;
  profile_url?: string;
  is_mock: number;
  created_at: string;
}

interface Props {
  workspaceId: string;
}

const PLATFORMS = [
  {
    id: "META_FACEBOOK",
    label: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    placeholder: "Page or business name",
    urlPlaceholder: "https://facebook.com/yourbusiness",
    urlPrefix: "facebook.com/",
  },
  {
    id: "META_INSTAGRAM",
    label: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    placeholder: "@yourbusiness",
    urlPlaceholder: "https://instagram.com/yourbusiness",
    urlPrefix: "instagram.com/",
  },
  {
    id: "LINKEDIN",
    label: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700",
    placeholder: "Company or profile name",
    urlPlaceholder: "https://linkedin.com/company/yourbusiness",
    urlPrefix: "linkedin.com/",
  },
  {
    id: "X",
    label: "X (Twitter)",
    icon: XIcon,
    color: "bg-black",
    placeholder: "@yourhandle",
    urlPlaceholder: "https://x.com/yourhandle",
    urlPrefix: "x.com/",
  },
  {
    id: "TIKTOK",
    label: "TikTok",
    icon: Video,
    color: "bg-gray-900",
    placeholder: "@yourhandle",
    urlPlaceholder: "https://tiktok.com/@yourhandle",
    urlPrefix: "tiktok.com/",
  },
  {
    id: "YOUTUBE",
    label: "YouTube",
    icon: Video,
    color: "bg-red-600",
    placeholder: "Channel name",
    urlPlaceholder: "https://youtube.com/@yourchannel",
    urlPrefix: "youtube.com/",
  },
];

export default function SocialAccounts({ workspaceId }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [platform, setPlatform] = useState("");
  const [accountName, setAccountName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const load = useCallback(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/accounts`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setAccounts(d.accounts || []); setMockMode(d.mockMode); })
      .catch(() => {});
  }, [workspaceId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "meta") {
      const count = parseInt(params.get("count") || "0", 10);
      const igFound = params.get("instagram") === "1";
      if (count > 0) {
        toast.success(`Successfully connected ${count} account${count !== 1 ? "s" : ""}!`);
      }
      if (!igFound) {
        toast.warning("No Instagram Business Account found. Make sure your Instagram is set to a Business or Creator account and linked to your Facebook Page.", { duration: 8000 });
      }
      load();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("error")) {
      toast.error(params.get("error") || "Connection failed");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [load]);

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);

  const isMetaPlatform = (platformId: string) =>
    platformId === "META_FACEBOOK" || platformId === "META_INSTAGRAM";

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
        setShowConnect(false);
        setPlatform("");
        setAccountName("");
        setProfileUrl("");
        load();
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
      load();
    } else {
      toast.error("Failed to remove account");
    }
  };

  const connectedPlatforms = accounts.map(a => a.platform);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Linked Accounts</h2>
          <p className="text-muted-foreground">Connect your social media profiles to manage content across platforms</p>
        </div>
        <Button onClick={() => setShowConnect(true)} className="gradient-hero text-white">
          <Plus className="h-4 w-4 mr-2" /> Link Account
        </Button>
      </div>

      {mockMode && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 text-sm">Demo Mode</p>
              <p className="text-xs text-blue-700 mt-0.5">
                You can link your social accounts now. Publishing will be simulated until API keys are configured.
                Your profile links will still be saved and displayed on your website.
              </p>
            </div>
          </div>
        </Card>
      )}

      {showConnect && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowConnect(false)}>
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

              {platform === "META_INSTAGRAM" && !mockMode ? (
                <div className="space-y-3">
                  <Card className="p-4 border-blue-200 bg-blue-50">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 text-sm">Instagram connects via Facebook</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Instagram Business accounts are linked through your Facebook Page. Click below — if your Instagram is correctly set up, it will connect automatically.
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-amber-200 bg-amber-50">
                    <p className="font-medium text-amber-900 text-xs mb-2">Instagram requirements:</p>
                    <ul className="text-xs text-amber-800 space-y-1 list-none">
                      <li>✅ Your Instagram must be a <strong>Business</strong> or <strong>Creator</strong> account (not personal)</li>
                      <li>✅ Your Instagram must be <strong>linked to a Facebook Page</strong> you manage</li>
                      <li>✅ You must be an <strong>admin</strong> of that Facebook Page</li>
                    </ul>
                    <p className="text-xs text-amber-700 mt-2">
                      To switch to a Business account: open Instagram → Settings → Account → Switch to Professional Account.
                      Then link it to your Facebook Page under Settings → Linked Accounts.
                    </p>
                  </Card>
                </div>
              ) : platform && !mockMode && isMetaPlatform(platform) ? (
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 text-sm">Connect via Facebook</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Sign in with Facebook to connect your Facebook Page. If a Business Instagram account is linked to that Page, it will connect automatically too.
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
              <Button variant="ghost" onClick={() => { setShowConnect(false); setPlatform(""); setAccountName(""); setProfileUrl(""); }}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {accounts.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Link2 className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-bold text-lg mb-1">No Accounts Linked</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Link your social media accounts to start managing your online presence. You can connect Facebook, Instagram, LinkedIn, X, TikTok, and YouTube.
          </p>
          <Button onClick={() => setShowConnect(true)} className="gradient-hero text-white">
            <Plus className="h-4 w-4 mr-2" /> Link Your First Account
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map(acc => {
            const plat = PLATFORMS.find(p => p.id === acc.platform);
            const Icon = plat?.icon || Globe;
            return (
              <Card key={acc.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${plat?.color || "bg-gray-500"} flex items-center justify-center shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{acc.account_name}</p>
                        {acc.is_mock ? (
                          <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">DEMO</span>
                        ) : (
                          <span className="text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">LIVE</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{plat?.label || acc.platform}</p>
                      {acc.profile_url && (
                        <a
                          href={acc.profile_url.startsWith("http") ? acc.profile_url : `https://${acc.profile_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {acc.profile_url.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Linked {new Date(acc.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDisconnect(acc.id, acc.account_name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-5 bg-slate-50 border-dashed">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-slate-700">How account linking works</p>
            <ul className="text-xs text-slate-500 mt-2 space-y-1.5">
              <li>1. Choose a platform and enter your account name or handle</li>
              <li>2. Paste your profile URL so visitors and the system can find your page</li>
              <li>3. Once linked, you can create and schedule posts targeting that account</li>
              <li>4. For automated publishing, API credentials will need to be configured (contact your admin)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
