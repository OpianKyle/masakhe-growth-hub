import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Send, Clock, FileText, Image, Hash, Facebook, Linkedin, Instagram, X, ChevronLeft, Globe, Sparkles, Loader2, Maximize2, XCircle, Heart, MessageCircle, Share2, Repeat2, ThumbsUp, Bookmark, Upload
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
  const templateParam = searchParams.get("template");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [contentText, setContentText] = useState(templateParam ? decodeURIComponent(templateParam) : "");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [previewPlatform, setPreviewPlatform] = useState("META_FACEBOOK");
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

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

  const generateAdImage = async () => {
    setGeneratingImage(true);
    try {
      const res = await fetch(`/api/social/ws/${workspaceId}/media/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: generatePrompt || undefined,
          postContent: contentText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");
      const newAsset: MediaAsset = { id: data.id, url: data.url, type: "IMAGE", file_name: data.fileName };
      setMediaAssets(prev => [newAsset, ...prev]);
      setSelectedMedia(prev => [...prev, data.id]);
      setShowGeneratePanel(false);
      setGeneratePrompt("");
      toast.success("Ad image generated and added to your post!");
    } catch (err: any) {
      toast.error(err.message || "Image generation failed");
    } finally {
      setGeneratingImage(false);
    }
  };

  const uploadMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/social/ws/${workspaceId}/media/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const newAsset: MediaAsset = { id: data.id, url: data.url, type: data.type, file_name: data.fileName };
      setMediaAssets(prev => [newAsset, ...prev]);
      setSelectedMedia(prev => [...prev, data.id]);
      toast.success("Image uploaded and added to your post!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingMedia(false);
      if (mediaFileInputRef.current) mediaFileInputRef.current.value = "";
    }
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
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Attach Media</Label>
              <div className="flex gap-2">
                <input
                  ref={mediaFileInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/quicktime"
                  className="hidden"
                  onChange={uploadMediaFile}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => mediaFileInputRef.current?.click()}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" /> Add Media</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
                  onClick={() => setShowGeneratePanel(p => !p)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate with AI
                </Button>
              </div>
            </div>

            {showGeneratePanel && (
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> AI Ad Image Generator
                </p>
                <p className="text-xs text-muted-foreground">
                  Leave blank to auto-generate based on your post content, or describe what you want.
                </p>
                <textarea
                  value={generatePrompt}
                  onChange={e => setGeneratePrompt(e.target.value)}
                  placeholder="e.g. A vibrant South African market scene with colourful textiles and smiling people..."
                  className="w-full rounded-lg border bg-white p-2.5 text-xs min-h-[72px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={generateAdImage}
                    disabled={generatingImage}
                    size="sm"
                    className="gradient-hero text-white gap-1.5"
                  >
                    {generatingImage ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="h-3.5 w-3.5" /> Generate Image</>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowGeneratePanel(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {mediaAssets.length === 0 && !showGeneratePanel ? (
              <p className="text-sm text-muted-foreground">No media yet. Click <strong>Add Media</strong> to upload an image, or use <strong>Generate with AI</strong> above.</p>
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold font-heading text-sm">Preview</h3>
              <button onClick={() => setShowFullPreview(true)} className="text-muted-foreground hover:text-primary transition-colors" title="Fullscreen preview">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
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
            <PostPreviewCard platform={previewPlatform} contentText={contentText} mediaAssets={mediaAssets} selectedMedia={selectedMedia} compact />
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

      {showFullPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowFullPreview(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50">
                <div>
                  <h3 className="font-bold font-heading text-base">Post Preview</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">How your post will look on each platform</p>
                </div>
                <button onClick={() => setShowFullPreview(false)} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-1.5">
                  {["META_FACEBOOK", "META_INSTAGRAM", "LINKEDIN"].map(p => {
                    const Icon = PLATFORM_ICONS[p] || Globe;
                    return (
                      <button key={p} onClick={() => setPreviewPlatform(p)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${previewPlatform === p ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}>
                        <Icon className="h-3.5 w-3.5" /> {p.replace("META_", "")}
                      </button>
                    );
                  })}
                </div>
                <PostPreviewCard platform={previewPlatform} contentText={contentText} mediaAssets={mediaAssets} selectedMedia={selectedMedia} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PostPreviewCardProps {
  platform: string;
  contentText: string;
  mediaAssets: MediaAsset[];
  selectedMedia: string[];
  compact?: boolean;
}

function PostPreviewCard({ platform, contentText, mediaAssets, selectedMedia, compact }: PostPreviewCardProps) {
  const selected = mediaAssets.filter(a => selectedMedia.includes(a.id));
  const images = selected.filter(a => a.type === "IMAGE");
  const videos = selected.filter(a => a.type !== "IMAGE");
  const overLimit = contentText.length > (PLATFORM_LIMITS[platform] || 5000);

  const isInstagram = platform === "META_INSTAGRAM";
  const isLinkedIn = platform === "LINKEDIN";
  const isX = platform === "X";

  return (
    <div className={`rounded-xl border bg-white overflow-hidden shadow-sm ${compact ? "min-h-[180px]" : ""}`}>
      {selected.length > 0 && (
        <div className={`w-full ${images.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}`}>
          {images.slice(0, 4).map((asset, i) => (
            <div key={asset.id} className={`relative bg-muted ${images.length === 1 ? (isInstagram ? "aspect-square" : "aspect-[4/3]") : "aspect-square"} ${images.length === 3 && i === 0 ? "col-span-2" : ""}`}>
              <img src={asset.url} alt={asset.file_name} className="w-full h-full object-cover" />
              {images.length > 4 && i === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">+{images.length - 4}</div>
              )}
            </div>
          ))}
          {videos.map(asset => (
            <div key={asset.id} className="aspect-video bg-muted flex items-center justify-center text-xs text-muted-foreground col-span-2">
              <Image className="h-4 w-4 mr-1" /> Video attached
            </div>
          ))}
        </div>
      )}

      <div className={compact ? "p-3" : "p-4"}>
        <div className={`flex items-center gap-2 ${compact ? "mb-2" : "mb-3"}`}>
          <div className={`${compact ? "w-7 h-7" : "w-9 h-9"} rounded-full bg-primary/20 flex items-center justify-center shrink-0`}>
            <span className={`${compact ? "text-[10px]" : "text-xs"} font-bold text-primary`}>B</span>
          </div>
          <div>
            <p className={`${compact ? "text-[11px]" : "text-sm"} font-bold leading-tight`}>Your Business</p>
            <p className={`${compact ? "text-[9px]" : "text-[11px]"} text-muted-foreground`}>
              {isLinkedIn ? "1st · Just now" : isInstagram ? "Just now" : "Just now · Public"}
            </p>
          </div>
        </div>

        <p className={`${compact ? "text-xs" : "text-sm"} whitespace-pre-wrap leading-relaxed`}>
          {contentText || <span className="text-muted-foreground italic">Your post content will appear here...</span>}
        </p>

        {overLimit && (
          <p className="text-xs text-red-600 mt-2">⚠ Exceeds {platform.replace("META_", "")} character limit</p>
        )}

        {!compact && (
          <div className={`mt-4 pt-3 border-t flex items-center gap-4 text-muted-foreground`}>
            {isInstagram ? (
              <>
                <button className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart className="h-4 w-4" /> <span className="text-xs">Like</span></button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors"><MessageCircle className="h-4 w-4" /> <span className="text-xs">Comment</span></button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"><Bookmark className="h-4 w-4" /></button>
              </>
            ) : isX ? (
              <>
                <button className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart className="h-4 w-4" /> <span className="text-xs">Like</span></button>
                <button className="flex items-center gap-1 hover:text-green-500 transition-colors"><Repeat2 className="h-4 w-4" /> <span className="text-xs">Repost</span></button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors"><MessageCircle className="h-4 w-4" /> <span className="text-xs">Reply</span></button>
              </>
            ) : isLinkedIn ? (
              <>
                <button className="flex items-center gap-1 hover:text-blue-600 transition-colors"><ThumbsUp className="h-4 w-4" /> <span className="text-xs">Like</span></button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors"><MessageCircle className="h-4 w-4" /> <span className="text-xs">Comment</span></button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors"><Share2 className="h-4 w-4" /> <span className="text-xs">Share</span></button>
              </>
            ) : (
              <>
                <button className="flex items-center gap-1 hover:text-blue-600 transition-colors"><ThumbsUp className="h-4 w-4" /> <span className="text-xs">Like</span></button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors"><MessageCircle className="h-4 w-4" /> <span className="text-xs">Comment</span></button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors"><Share2 className="h-4 w-4" /> <span className="text-xs">Share</span></button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
