import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Car, Plus, Pencil, Trash2, Upload, X, Search, Filter,
  Image as ImageIcon, Star, StarOff, Loader2, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Vehicle {
  id: string;
  website_id: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  body_type?: string;
  description?: string;
  features: string[];
  images: string[];
  status: string;
  featured: number;
  created_at: string;
}

interface Website {
  id: string;
  business_name: string;
  slug: string;
  template_id: string;
}

const emptyForm = {
  make: "",
  model: "",
  variant: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  fuelType: "petrol",
  transmission: "manual",
  color: "",
  bodyType: "sedan",
  description: "",
  features: [] as string[],
  status: "available",
  featured: false,
};

export default function VehicleManagementPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/websites/mine", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const sites = Array.isArray(data) ? data : data.websites || [];
        setWebsites(sites);
        if (sites.length > 0) setSelectedWebsite(sites[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedWebsite) return;
    setLoading(true);
    fetch(`/api/vehicles?websiteId=${selectedWebsite}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setVehicles(Array.isArray(data) ? data : []);
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [selectedWebsite]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEditImages([]);
    setDialogOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setForm({
      make: v.make,
      model: v.model,
      variant: v.variant || "",
      year: v.year,
      price: v.price,
      mileage: v.mileage || 0,
      fuelType: v.fuel_type || "petrol",
      transmission: v.transmission || "manual",
      color: v.color || "",
      bodyType: v.body_type || "sedan",
      description: v.description || "",
      features: v.features || [],
      status: v.status,
      featured: !!v.featured,
    });
    setEditImages(v.images || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.make || !form.model || !form.year || form.price === undefined) {
      toast({ title: "Missing fields", description: "Make, model, year and price are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, websiteId: selectedWebsite, images: editImages };
      const url = editingId ? `/api/vehicles/${editingId}` : "/api/vehicles";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok || data.id) {
        toast({ title: editingId ? "Vehicle updated" : "Vehicle added" });
        setDialogOpen(false);
        const refreshRes = await fetch(`/api/vehicles?websiteId=${selectedWebsite}`, { credentials: "include" });
        const refreshData = await refreshRes.json();
        setVehicles(Array.isArray(refreshData) ? refreshData : []);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save vehicle.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        toast({ title: "Vehicle deleted" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }

    if (editingId) {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(`/api/vehicles/${editingId}/images`, { method: "POST", credentials: "include", body: fd });
        const data = await res.json();
        if (data.ok) {
          setEditImages(data.images);
          toast({ title: "Image uploaded" });
        }
      } catch {
        toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setEditImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm((prev) => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
      setFeatureInput("");
    }
  };

  const removeFeature = (idx: number) => {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  const filtered = vehicles.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return `${v.make} ${v.model} ${v.variant || ""} ${v.year}`.toLowerCase().includes(q);
  });

  const formatPrice = (cents: number) => `R${(cents / 100).toLocaleString("en-ZA")}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              Vehicle Inventory
            </h2>
            <p className="text-muted-foreground mt-1">Manage your vehicle listings for your website.</p>
          </div>
          <Button onClick={openAdd} disabled={!selectedWebsite}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        {websites.length > 1 && (
          <select
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {websites.map((w) => (
              <option key={w.id} value={w.id}>{w.business_name}</option>
            ))}
          </select>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No vehicles yet</p>
          <p className="text-sm mt-1">Add your first vehicle listing to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
            >
              <div className="aspect-video bg-muted relative">
                {v.images && v.images.length > 0 ? (
                  <img src={v.images[0]} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                {v.featured ? (
                  <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
                    <Star className="h-3 w-3 mr-1" />Featured
                  </Badge>
                ) : null}
                <Badge
                  className={`absolute top-2 right-2 ${v.status === "available" ? "bg-green-500" : v.status === "sold" ? "bg-red-500" : "bg-yellow-500"} text-white`}
                >
                  {v.status}
                </Badge>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-foreground">
                  {v.year} {v.make} {v.model} {v.variant || ""}
                </h3>
                <p className="text-xl font-bold text-primary">{formatPrice(v.price)}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {v.mileage ? <span>{v.mileage.toLocaleString()} km</span> : null}
                  {v.fuel_type ? <span>• {v.fuel_type}</span> : null}
                  {v.transmission ? <span>• {v.transmission}</span> : null}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(v)} className="flex-1">
                    <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(v.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-bold font-heading mb-4">
            {editingId ? "Edit Vehicle" : "Add Vehicle"}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Make *</label>
                <Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="e.g. Toyota" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Model *</label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Corolla" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Variant</label>
                <Input value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} placeholder="e.g. 1.8 XS" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Year *</label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Price (cents) *</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Mileage (km)</label>
                <Input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Fuel Type</label>
                <select
                  value={form.fuelType}
                  onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Transmission</label>
                <select
                  value={form.transmission}
                  onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Color</label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="e.g. White" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Body Type</label>
                <select
                  value={form.bodyType}
                  onChange={(e) => setForm({ ...form, bodyType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="sedan">Sedan</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="suv">SUV</option>
                  <option value="bakkie">Bakkie</option>
                  <option value="coupe">Coupe</option>
                  <option value="van">Van</option>
                  <option value="wagon">Wagon</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Star className="h-4 w-4 text-amber-500" />
                  Featured
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                placeholder="Vehicle description..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Features</label>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  placeholder="e.g. Bluetooth, Sunroof"
                />
                <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {f}
                    <button onClick={() => removeFeature(i)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Images</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="grid grid-cols-4 gap-2">
                {editImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  <span className="text-xs mt-1">{uploading ? "Uploading" : "Add"}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingId ? "Save Changes" : "Add Vehicle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
