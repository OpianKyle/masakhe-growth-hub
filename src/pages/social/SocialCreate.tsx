import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Send, Clock, FileText, Image, Hash, Facebook, Linkedin, Instagram, X, ChevronLeft, Globe
} from "lucide-react";

interface Account {
  id: string;
  platform: string;
  account_name: string;
}

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  file_name: string;
}

interface Props {
  workspaceId: string;
}

const PLATFORM_ICONS: Record<string, any> = {
  META_FACEBOOK: Facebook,
  META_INSTAGRAM: Instagram,
  LINKEDIN: Linkedin,
  X: X,
  TIKTOK: Globe,
  YOUTUBE: Globe,
};

const PLATFORM_LIMITS: Record<string, number> = {
  META_FACEBOOK: 63206,
  META_INSTAGRAM: 2200,
  LINKEDIN: 3000,
  X: 280,
  TIKTOK: 2200,
  YOUTUBE: 5000,
};

const HASHTAG_SUGGESTIONS = [
  "#SmallBusiness", "#SMME", "#SouthAfrica", "#Entrepreneur", "#BusinessGrowth",
  "#ShopLocal", "#SupportLocal", "#Startup", "#Digital", "#Masakhe"
];

export default function SocialCreate({ workspaceId }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [contentText, setContentText] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [previewPlatform, setPreviewPlatform] = useState("META_FACEBOOK");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/accounts`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setAccounts(d.accounts || []))
      .catch(() => {});
    fetch(`/api/social/ws/${workspaceId}/media`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setMediaAssets(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [workspaceId]);

  useEffect(() => {
    if (editId && workspaceId) {
      fetch(`/api/social/ws/${workspaceId}/posts/${editId}`, { credentials: "include" })
        .then(r => r.json())
        .then(post => {
          setContentText(post.content_text || "");
          setSelectedMedia(post.media_asset_ids || []);
          if (post.scheduled_at) {
            const d = new Date(post.scheduled_at);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setScheduledAt(d.toISOString().slice(0, 16));
          }
          if (post.targets) setSelectedAccounts(post.targets.map((t: any) => t.social_account_id));
        })
        .catch(() => {});
    }
  }, [editId, workspaceId]);

  const toggleAccount = (id: string) => {
    setSelectedAccounts(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleMedia = (id: string) => {
    setSelectedMedia(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const addHashtag = (tag: string) => {
    setContentText(prev => (prev + " " + tag).trim());
  };

  const handleSubmit = async (action: "draft" | "schedule" | "publish") => {
    if (!contentText.trim() && selectedMedia.length === 0) {
      toast.error("Add some text or media to your post");
      return;
    }
    if (action === "publish" && selectedAccounts.length === 0) {
      toast.error("Select at least one account to publish to");
      return;
    }
    if (action === "schedule" && !scheduledAt) {
      toast.error("Select a date and time to schedule");
      return;
    }

    setSaving(true);
    try {
      const url = editId
        ? `/api/social/ws/${workspaceId}/posts/${editId}`
        : `/api/social/ws/${workspaceId}/posts`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contentText,
          mediaAssetIds: selectedMedia,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          targetAccountIds: selectedAccounts,
          action,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(action === "draft" ? "Draft saved" : action === "schedule" ? "Post scheduled" : "Post published");
        navigate("/dashboard/social/calendar");
      } else {
        toast.error(data.error || "Failed to save post");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const selectedPlatforms = accounts.filter(a => selectedAccounts.includes(a.id)).map(a => a.platform);
  const charLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map(p => PLATFORM_LIMITS[p] || 5000))
    : 5000;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold font-heading">{editId ? "Edit Post" : "Create Post"}</h2>
          <p className="text-muted-foreground">Compose and publish across your connected platforms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <Label className="text-sm font-medium mb-2 block">Select Accounts</Label>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts connected. Use the "Link Account" button above to connect one first.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {accounts.map(acc => {
                  const Icon = PLATFORM_ICONS[acc.platform] || Globe;
                  const selected = selectedAccounts.includes(acc.id);
                  return (
                    <button key={acc.id} onClick={() => toggleAccount(acc.id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${selected ? "border-primary bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                      <Icon className="h-4 w-4" />
                      {acc.account_name}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Post Content</Label>
              <span className={`text-xs ${contentText.length > charLimit ? "text-red-600 font-bold" : "text-muted-foreground"}`}>
                {contentText.length}/{charLimit}
              </span>
            </div>
            <textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="What would you like to share with your audience?"
              className="w-full rounded-lg border bg-background p-3 text-sm min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Hash className="h-3 w-3" /> Hashtag Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {HASHTAG_SUGGESTIONS.map(tag => (
                  <button key={tag} onClick={() => addHashtag(tag)} className="rounded-full bg-muted px-2.5 py-0.5 text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <Label className="text-sm font-medium mb-2 block">Attach Media</Label>
            {mediaAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No media uploaded yet. <a href="/dashboard/social/media" className="text-primary underline">Upload media</a> first.</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {mediaAssets.slice(0, 24).map(asset => {
                  const selected = selectedMedia.includes(asset.id);
                  return (
                    <button key={asset.id} onClick={() => toggleMedia(asset.id)} className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all ${selected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"}`}>
                      {asset.type === "IMAGE" ? (
                        <img src={asset.url} alt={asset.file_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-xs">Video</div>
                      )}
                      {selected && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span></div>}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <Label className="text-sm font-medium mb-2 block">Schedule (Africa/Johannesburg)</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="max-w-xs" />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold font-heading text-sm mb-3">Preview</h3>
            <div className="flex gap-1 mb-3">
              {["META_FACEBOOK", "META_INSTAGRAM", "LINKEDIN"].map(p => {
                const Icon = PLATFORM_ICONS[p] || Globe;
                return (
                  <button key={p} onClick={() => setPreviewPlatform(p)} className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${previewPlatform === p ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}>
                    <Icon className="h-3 w-3" /> {p.replace("META_", "")}
                  </button>
                );
              })}
            </div>
            <div className="rounded-lg border p-4 bg-white min-h-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><span className="text-xs font-bold text-primary">B</span></div>
                <div>
                  <p className="text-xs font-bold">Your Business</p>
                  <p className="text-[10px] text-muted-foreground">Just now</p>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap">{contentText || "Your post content will appear here..."}</p>
              {selectedMedia.length > 0 && (
                <div className="mt-3 rounded-lg bg-muted h-32 flex items-center justify-center text-xs text-muted-foreground">
                  <Image className="h-5 w-5 mr-1" /> {selectedMedia.length} media attached
                </div>
              )}
              {contentText.length > (PLATFORM_LIMITS[previewPlatform] || 5000) && (
                <p className="text-xs text-red-600 mt-2">⚠ Exceeds {previewPlatform.replace("META_", "")} character limit</p>
              )}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <Button onClick={() => handleSubmit("draft")} disabled={saving} variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" /> Save as Draft
            </Button>
            <Button onClick={() => handleSubmit("schedule")} disabled={saving || !scheduledAt} variant="outline" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" /> Schedule Post
            </Button>
            <Button onClick={() => handleSubmit("publish")} disabled={saving || selectedAccounts.length === 0} className="w-full justify-start gradient-hero text-white">
              <Send className="h-4 w-4 mr-2" /> Publish Now
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
