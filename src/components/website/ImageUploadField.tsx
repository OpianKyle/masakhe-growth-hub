import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImageUploadField = ({ value, onChange, label }: ImageUploadFieldProps) => {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok) {
        onChange(data.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2">
        <Input 
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder="Paste URL or upload image"
        />
        <Button 
          type="button" 
          variant="secondary" 
          size="icon" 
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleUpload}
        />
      </div>
      {value && (
        <div className="relative inline-block mt-2 group">
          <img 
            src={value} 
            alt="Preview" 
            className="h-24 w-32 object-cover rounded-md border shadow-sm"
          />
          <button 
            type="button"
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
