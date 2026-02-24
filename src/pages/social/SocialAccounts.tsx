import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Facebook, Instagram, Linkedin, X as XIcon, Plus, Trash2, Globe, AlertTriangle, Info
} from "lucide-react";

interface Account {
  id: string;
  platform: string;
  account_name: string;
  is_mock: number;
  created_at: string;
}

interface Props {
  workspaceId: string;
}

const PLATFORMS = [
  { id: "META_FACEBOOK", label: "Facebook Page", icon: Facebook, color: "bg-blue-600" },
  { id: "META_INSTAGRAM", label: "Instagram Business", icon: Instagram, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "LINKEDIN", label: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
  { id: "X", label: "X (Twitter)", icon: XIcon, color: "bg-black" },
];

export default function SocialAccounts({ workspaceId }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [platform, setPlatform] = useState("");
  const [accountName, setAccountName] = useState("");
  const [connecting, setConnecting] = useState(false);

  const load = () => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/accounts`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setAccounts(d.accounts || []); setMockMode(d.mockMode); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, [workspaceId]);

  const handleConnect = async () => {
    if (!platform || !accountName.trim()) {
      toast.error("Select a platform and enter account name");
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch(`/api/social/ws/${workspaceId}/accounts/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ platform, accountName: accountName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Connected ${accountName} (${mockMode ? "demo mode" : "live"})`);
        setShowConnect(false);
        setPlatform("");
        setAccountName("");
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
    if (!confirm(`Disconnect ${name}? Posts targeting this account won't be published.`)) return;
    const res = await fetch(`/api/social/ws/${workspaceId}/accounts/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success("Account disconnected");
      load();
    } else {
      toast.error("Failed to disconnect");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Connected Accounts</h2>
          <p className="text-muted-foreground">{accounts.length} social accounts linked</p>
        </div>
        <Button onClick={() => setShowConnect(true)} className="gradient-hero text-white">
          <Plus className="h-4 w-4 mr-2" /> Connect Account
        </Button>
      </div>

      {mockMode && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 text-sm">Demo Mode Active</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Social API credentials are not configured. Accounts are simulated for demonstration.
                Posts will show simulated results. To enable real posting, configure Meta and LinkedIn API keys.
              </p>
            </div>
          </div>
        </Card>
      )}

      {showConnect && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowConnect(false)}>
          <Card className="max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold font-heading text-lg mb-4">Connect Social Account</h3>

            <Label className="text-sm mb-2 block">Platform</Label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)} className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${platform === p.id ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted"}`}>
                  <div className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center`}>
                    <p.icon className="h-4 w-4 text-white" />
                  </div>
                  {p.label}
                </button>
              ))}
            </div>

            <Label className="text-sm mb-2 block">Account Name / Page Name</Label>
            <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="e.g. My Business Page" className="mb-4" />

            <div className="flex gap-2">
              <Button onClick={handleConnect} disabled={connecting || !platform || !accountName.trim()} className="flex-1 gradient-hero text-white">
                {connecting ? "Connecting..." : mockMode ? "Connect (Demo)" : "Connect"}
              </Button>
              <Button variant="ghost" onClick={() => setShowConnect(false)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {accounts.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="font-bold text-lg mb-1">No Accounts Connected</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Connect your social media accounts to start scheduling and publishing content.
          </p>
          <Button onClick={() => setShowConnect(true)} className="gradient-hero text-white">Connect Your First Account</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(acc => {
            const plat = PLATFORMS.find(p => p.id === acc.platform);
            const Icon = plat?.icon || Globe;
            return (
              <Card key={acc.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${plat?.color || "bg-gray-500"} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{acc.account_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{plat?.label || acc.platform}</span>
                        {acc.is_mock ? (
                          <span className="text-[10px] bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 font-medium">DEMO</span>
                        ) : (
                          <span className="text-[10px] bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-medium">LIVE</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDisconnect(acc.id, acc.account_name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Connected {new Date(acc.created_at).toLocaleDateString()}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
