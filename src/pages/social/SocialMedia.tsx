import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Image, Video, Trash2, FileText, X } from "lucide-react";

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  file_name: string;
  size: number;
  uploader_name: string;
  created_at: string;
}

interface Props {
  workspaceId: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function SocialMediaLibrary({ workspaceId }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/media`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setAssets(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [workspaceId]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/social/ws/${workspaceId}/media/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Uploaded ${file.name}`);
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`);
        }
      }
      load();
      setShowUpload(false);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const res = await fetch(`/api/social/ws/${workspaceId}/media/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success("Deleted");
      load();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Media Library</h2>
          <p className="text-muted-foreground">{assets.length} files uploaded</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="gradient-hero text-white">
          <Upload className="h-4 w-4 mr-2" /> Upload Media
        </Button>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <Card className="max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-heading">Upload Media</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowUpload(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
              onDragLeave={e => { e.currentTarget.classList.remove("border-primary"); }}
              onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="font-medium text-sm">Click or drag files here</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP, MP4, MOV (max 25MB)</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
            {uploading && <p className="text-sm text-center mt-3 text-primary">Uploading...</p>}
          </Card>
        </div>
      )}

      {assets.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Image className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="font-bold text-lg mb-1">No media yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Upload images and videos to use in your social media posts.</p>
          <Button onClick={() => setShowUpload(true)} className="gradient-hero text-white">Upload Your First File</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map(asset => (
            <Card key={asset.id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted">
                {asset.type === "IMAGE" ? (
                  <img src={asset.url} alt={asset.file_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(asset.id, asset.file_name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <span className={`absolute top-1 right-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${asset.type === "VIDEO" ? "bg-purple-500 text-white" : "bg-blue-500 text-white"}`}>
                  {asset.type}
                </span>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{asset.file_name}</p>
                <p className="text-[10px] text-muted-foreground">{formatBytes(asset.size)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
