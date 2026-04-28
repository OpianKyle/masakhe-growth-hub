import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "./ImageUploadField";
import { SiteSection, SectionType, SECTION_LABELS } from "@/types/site";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, GripVertical,
  Briefcase, UtensilsCrossed, ShoppingBag, Layout, BarChart3, Star, Image, Phone, FileText, MessageSquare, Car, ClipboardList
} from "lucide-react";

const sectionIcons: Record<SectionType, React.ElementType> = {
  hero: Layout,
  stats: BarChart3,
  features: FileText,
  about: MessageSquare,
  services: Briefcase,
  gallery: Image,
  testimonials: Star,
  contact: Phone,
  contact_form: ClipboardList,
  vehicle_listings: Car,
};

interface SectionEditorProps {
  section: SiteSection;
  index: number;
  totalSections: number;
  onChange: (index: number, data: any) => void;
  onToggle: (index: number) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function ArrayEditor({ items, onUpdate, fields, addLabel, minItems, maxItems }: {
  items: any[];
  onUpdate: (items: any[]) => void;
  fields: Array<{ key: string; label: string; type?: string; placeholder?: string }>;
  addLabel: string;
  minItems?: number;
  maxItems?: number;
}) {
  const addItem = () => {
    const newItem: any = {};
    fields.forEach((f) => (newItem[f.key] = ""));
    onUpdate([...items, newItem]);
  };

  const removeItem = (i: number) => {
    onUpdate(items.filter((_, idx) => idx !== i));
  };

  const updateItem = (i: number, key: string, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [key]: value };
    onUpdate(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="relative rounded-lg border bg-slate-50 p-3 space-y-2 group">
          {(!minItems || items.length > minItems) && (
            <button type="button" className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center" onClick={() => removeItem(i)}>
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          {fields.map((f) => (
            <div key={f.key}>
              <Label className="text-[10px] text-slate-500">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea value={item[f.key] || ""} onChange={(e) => updateItem(i, f.key, e.target.value)} placeholder={f.placeholder} className="h-16 text-xs mt-0.5" />
              ) : (
                <Input value={item[f.key] || ""} onChange={(e) => updateItem(i, f.key, e.target.value)} placeholder={f.placeholder} className="h-8 text-xs mt-0.5" />
              )}
            </div>
          ))}
        </div>
      ))}
      {(!maxItems || items.length < maxItems) && (
        <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={addItem}>
          <Plus className="h-3 w-3 mr-1" /> {addLabel}
        </Button>
      )}
    </div>
  );
}

const heroStyleOptions = [
  { value: "corporate", label: "Corporate", desc: "Dark split layout with image" },
  { value: "centered", label: "Centered", desc: "Full background image overlay" },
  { value: "bold", label: "Bold", desc: "Vibrant gradient with shapes" },
  { value: "gradient", label: "Gradient", desc: "Diagonal gradient with accents" },
  { value: "cinematic", label: "Cinematic", desc: "Full-bleed dark editorial" },
  { value: "minimal", label: "Minimal", desc: "Clean white minimal layout" },
  { value: "carousel", label: "Carousel", desc: "Auto-rotating slideshow banner" },
] as const;

function HeroEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const update = (key: string, val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-semibold">Hero Style</Label>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {heroStyleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                const updated: any = { ...data, heroStyle: opt.value };
                if (opt.value === "carousel" && (!data.carouselSlides || data.carouselSlides.length === 0)) {
                  updated.carouselSlides = [
                    { headline: "Protect What Matters Most", subtext: "Comprehensive Insurance Solutions", image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80" },
                    { headline: "Grow Your Wealth", subtext: "Expert Financial Planning", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80" },
                    { headline: "Secure Your Legacy", subtext: "Estate & Retirement Solutions", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80" },
                  ];
                }
                onChange(updated);
              }}
              className={`rounded-lg border-2 p-2 text-left transition-all ${
                (data.heroStyle || "corporate") === opt.value
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-xs font-bold">{opt.label}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div><Label className="text-xs">Badge Label</Label><Input value={data.badgeText || ""} onChange={(e) => update("badgeText", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Main Heading</Label><Textarea value={data.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1 text-sm" /></div>
      <div><Label className="text-xs">Sub-heading</Label><Textarea value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} className="mt-1 text-sm" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Primary Button</Label><Input value={data.ctaPrimaryText || ""} onChange={(e) => update("ctaPrimaryText", e.target.value)} className="mt-1 h-8 text-sm" /></div>
        <div><Label className="text-xs">Secondary Button</Label><Input value={data.ctaSecondaryText || ""} onChange={(e) => update("ctaSecondaryText", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      </div>
      {data.heroStyle !== "carousel" && (
        <div><Label className="text-xs">Background Image URL</Label><Input value={data.backgroundImageUrl || ""} onChange={(e) => update("backgroundImageUrl", e.target.value)} placeholder="https://..." className="mt-1 h-8 text-sm" /></div>
      )}
      {data.heroStyle === "carousel" && (
        <div className="space-y-3 mt-2">
          <Label className="text-xs font-semibold">Carousel Slides</Label>
          {(data.carouselSlides || []).map((slide: any, i: number) => (
            <div key={i} className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Slide {i + 1}</span>
                {(data.carouselSlides || []).length > 2 && (
                  <button type="button" className="text-xs text-red-400 hover:text-red-600" onClick={() => {
                    const slides = [...(data.carouselSlides || [])];
                    slides.splice(i, 1);
                    onChange({ ...data, carouselSlides: slides });
                  }}>Remove</button>
                )}
              </div>
              <Input value={slide.headline || ""} onChange={(e) => {
                const slides = [...(data.carouselSlides || [])];
                slides[i] = { ...slides[i], headline: e.target.value };
                onChange({ ...data, carouselSlides: slides });
              }} placeholder="Slide headline" className="h-8 text-sm" />
              <Input value={slide.subtext || ""} onChange={(e) => {
                const slides = [...(data.carouselSlides || [])];
                slides[i] = { ...slides[i], subtext: e.target.value };
                onChange({ ...data, carouselSlides: slides });
              }} placeholder="Slide subtext" className="h-8 text-sm" />
              <Input value={slide.image || ""} onChange={(e) => {
                const slides = [...(data.carouselSlides || [])];
                slides[i] = { ...slides[i], image: e.target.value };
                onChange({ ...data, carouselSlides: slides });
              }} placeholder="Image URL" className="h-8 text-sm" />
            </div>
          ))}
          {(data.carouselSlides || []).length < 5 && (
            <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => {
              const slides = [...(data.carouselSlides || [])];
              slides.push({ headline: "New Slide", subtext: "Description", image: "" });
              onChange({ ...data, carouselSlides: slides });
            }}>
              <Plus className="h-3 w-3 mr-1" /> Add Slide
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function StatsEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <ArrayEditor
      items={data.items || []}
      onUpdate={(items) => onChange({ ...data, items })}
      fields={[
        { key: "value", label: "Value", placeholder: "e.g. 500+" },
        { key: "label", label: "Label", placeholder: "e.g. Happy Clients" },
      ]}
      addLabel="Add Stat"
      minItems={2}
      maxItems={6}
    />
  );
}

function FeaturesEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const update = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Section Title</Label><Input value={data.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Badge Text</Label><Input value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <ImageUploadField value={data.imageUrl} onChange={(url) => update("imageUrl", url)} label="Section Image" />
      <div>
        <Label className="text-xs">Image Position</Label>
        <div className="flex gap-2 mt-1">
          {(["left", "right"] as const).map((pos) => (
            <Button key={pos} type="button" variant={data.imagePosition === pos ? "default" : "outline"} size="sm" className="text-xs flex-1" onClick={() => update("imagePosition", pos)}>{pos === "left" ? "Left" : "Right"}</Button>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t">
        <Label className="text-xs font-semibold">Feature Items</Label>
        <div className="mt-2">
          <ArrayEditor
            items={data.items || []}
            onUpdate={(items) => update("items", items)}
            fields={[
              { key: "title", label: "Title", placeholder: "Feature name" },
              { key: "desc", label: "Description", placeholder: "Short description", type: "textarea" },
            ]}
            addLabel="Add Feature"
            minItems={2}
            maxItems={6}
          />
        </div>
      </div>
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const update = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Section Title</Label><Input value={data.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Featured Quote</Label><Textarea value={data.quote || ""} onChange={(e) => update("quote", e.target.value)} className="mt-1 text-sm" /></div>
      <ImageUploadField value={data.imageUrl} onChange={(url) => update("imageUrl", url)} label="Section Image" />
      <div>
        <Label className="text-xs">Image Position</Label>
        <div className="flex gap-2 mt-1">
          {(["left", "right"] as const).map((pos) => (
            <Button key={pos} type="button" variant={data.imagePosition === pos ? "default" : "outline"} size="sm" className="text-xs flex-1" onClick={() => update("imagePosition", pos)}>{pos === "left" ? "Left" : "Right"}</Button>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t">
        <Label className="text-xs font-semibold">Key Points</Label>
        <div className="mt-2">
          <ArrayEditor
            items={data.items || []}
            onUpdate={(items) => update("items", items)}
            fields={[
              { key: "title", label: "Title" },
              { key: "desc", label: "Description" },
            ]}
            addLabel="Add Point"
            minItems={1}
            maxItems={6}
          />
        </div>
      </div>
    </div>
  );
}

function ServicesEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const update = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Section Title</Label><Input value={data.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Badge Text</Label><Input value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div className="pt-2 border-t">
        <Label className="text-xs font-semibold">Services / Items</Label>
        <div className="mt-2">
          <ArrayEditor
            items={data.items || []}
            onUpdate={(items) => update("items", items)}
            fields={[
              { key: "title", label: "Name" },
              { key: "desc", label: "Description" },
              { key: "price", label: "Price (optional)", placeholder: "e.g. R150" },
            ]}
            addLabel="Add Service"
            minItems={1}
            maxItems={12}
          />
        </div>
      </div>
    </div>
  );
}

function GalleryEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const update = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Section Title</Label><Input value={data.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div className="pt-2 border-t">
        <Label className="text-xs font-semibold">Images</Label>
        <div className="mt-2">
          <ArrayEditor
            items={data.images || []}
            onUpdate={(images) => update("images", images)}
            fields={[
              { key: "url", label: "Image URL", placeholder: "Paste URL or upload" },
              { key: "caption", label: "Caption (optional)" },
            ]}
            addLabel="Add Image"
            minItems={1}
            maxItems={9}
          />
        </div>
      </div>
    </div>
  );
}

function TestimonialsEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const update = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Section Title</Label><Input value={data.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div className="pt-2 border-t">
        <Label className="text-xs font-semibold">Reviews</Label>
        <div className="mt-2">
          <ArrayEditor
            items={data.items || []}
            onUpdate={(items) => update("items", items)}
            fields={[
              { key: "name", label: "Customer Name" },
              { key: "role", label: "Role / Title" },
              { key: "text", label: "Review", type: "textarea" },
            ]}
            addLabel="Add Testimonial"
            minItems={1}
            maxItems={6}
          />
        </div>
      </div>
    </div>
  );
}

function ContactEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const update = (key: string, val: any) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Section Title</Label><Input value={data.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Phone</Label><Input value={data.phone || ""} onChange={(e) => update("phone", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Email</Label><Input value={data.email || ""} onChange={(e) => update("email", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Address</Label><Input value={data.address || ""} onChange={(e) => update("address", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">WhatsApp Number</Label><Input value={data.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div className="flex items-center gap-2">
        <Switch checked={data.enableWhatsApp || false} onCheckedChange={(v) => update("enableWhatsApp", v)} />
        <Label className="text-xs">Show WhatsApp button</Label>
      </div>
    </div>
  );
}

function VehicleListingsEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Section Title</Label>
        <Input value={data.title || ""} onChange={e => onChange({ ...data, title: e.target.value })} placeholder="Our Vehicles" />
      </div>
      <div>
        <Label className="text-xs">Subtitle</Label>
        <Input value={data.subtitle || ""} onChange={e => onChange({ ...data, subtitle: e.target.value })} placeholder="Browse our inventory" />
      </div>
      <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
        Vehicles are managed from the <strong>Vehicle Inventory</strong> page in your dashboard. This section will automatically display your listed vehicles on the published site.
      </p>
    </div>
  );
}

function ContactFormEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const update = (key: string, val: any) => onChange({ ...data, [key]: val });
  const serviceOptions: string[] = Array.isArray(data.serviceOptions) ? data.serviceOptions : [];
  const trustBadges: string[] = Array.isArray(data.trustBadges) ? data.trustBadges : [];

  const updateList = (key: string, list: string[]) => update(key, list);
  const addItem = (key: string, list: string[]) => updateList(key, [...list, ""]);
  const setItem = (key: string, list: string[], i: number, val: string) => {
    const next = [...list]; next[i] = val; updateList(key, next);
  };
  const removeItem = (key: string, list: string[], i: number) => {
    const next = list.filter((_, idx) => idx !== i); updateList(key, next);
  };

  const Toggle = ({ label, value, onToggle, hint }: { label: string; value: boolean; onToggle: () => void; hint?: string }) => (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-left"
    >
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-700">{label}</div>
        {hint && <div className="text-[10px] text-slate-400">{hint}</div>}
      </div>
      <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${value ? "bg-blue-600" : "bg-slate-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );

  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Section Title</Label><Input value={data.title || ""} onChange={(e) => update("title", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div><Label className="text-xs">Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} className="mt-1 h-8 text-sm" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-xs">Button Text</Label><Input value={data.buttonText || ""} onChange={(e) => update("buttonText", e.target.value)} className="mt-1 h-8 text-sm" placeholder="Submit Enquiry" /></div>
        <div><Label className="text-xs">Success Message</Label><Input value={data.successMessage || ""} onChange={(e) => update("successMessage", e.target.value)} className="mt-1 h-8 text-sm" placeholder="Thank you!" /></div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Form fields</Label>
        <div className="mt-2 space-y-1.5">
          <Toggle label="Show phone number field" value={data.showPhone !== false} onToggle={() => update("showPhone", data.showPhone === false)} />
          {data.showPhone !== false && (
            <Toggle label="Make phone number required" value={!!data.requirePhone} onToggle={() => update("requirePhone", !data.requirePhone)} hint="Visitors must enter a phone before submitting" />
          )}
          <Toggle label="Show message field" value={data.showMessage !== false} onToggle={() => update("showMessage", data.showMessage === false)} />
          <Toggle label="Show service / interest dropdown" value={!!data.showService} onToggle={() => update("showService", !data.showService)} hint="Let visitors pick what they're enquiring about" />
        </div>
      </div>

      {data.showService && (
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Dropdown options</Label>
            <button type="button" onClick={() => addItem("serviceOptions", serviceOptions)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add option</button>
          </div>
          {serviceOptions.length === 0 && (
            <p className="text-[10px] text-slate-400 italic">No options yet — add at least one to use the dropdown.</p>
          )}
          <div className="space-y-1.5">
            {serviceOptions.map((opt, i) => (
              <div key={i} className="flex gap-1">
                <Input value={opt} onChange={(e) => setItem("serviceOptions", serviceOptions, i, e.target.value)} className="h-8 text-sm" placeholder={`Option ${i + 1}`} />
                <button type="button" onClick={() => removeItem("serviceOptions", serviceOptions, i)} className="px-2 text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Trust badges</Label>
          <button type="button" onClick={() => addItem("trustBadges", trustBadges)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add badge</button>
        </div>
        <p className="text-[10px] text-slate-400 mb-1.5">Short reassurances shown next to the form (e.g. "Free quote", "Response within 24 hours").</p>
        <div className="space-y-1.5">
          {trustBadges.map((b, i) => (
            <div key={i} className="flex gap-1">
              <Input value={b} onChange={(e) => setItem("trustBadges", trustBadges, i, e.target.value)} className="h-8 text-sm" placeholder={`Badge ${i + 1}`} />
              <button type="button" onClick={() => removeItem("trustBadges", trustBadges, i)} className="px-2 text-red-400 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Notifications</Label>
        <div className="mt-1.5">
          <Label className="text-xs">Email me at (optional)</Label>
          <Input
            type="email"
            value={data.notifyEmail || ""}
            onChange={(e) => update("notifyEmail", e.target.value)}
            className="mt-1 h-8 text-sm"
            placeholder="leads@yourbusiness.co.za"
          />
          <p className="text-[10px] text-slate-400 mt-1">When set, every new submission also gets emailed here. Leads always appear in your Leads dashboard.</p>
        </div>
      </div>
    </div>
  );
}

const editorComponents: Record<SectionType, React.ComponentType<{ data: any; onChange: (d: any) => void }>> = {
  hero: HeroEditor,
  stats: StatsEditor,
  features: FeaturesEditor,
  about: AboutEditor,
  services: ServicesEditor,
  gallery: GalleryEditor,
  testimonials: TestimonialsEditor,
  contact: ContactEditor,
  contact_form: ContactFormEditor,
  vehicle_listings: VehicleListingsEditor,
};

export function SectionEditor({ section, index, totalSections, onChange, onToggle, onRemove, onMoveUp, onMoveDown }: SectionEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const Icon = sectionIcons[section.type] || Layout;
  const EditorComponent = editorComponents[section.type];

  return (
    <div className={`rounded-lg border ${section.enabled ? "border-slate-200 bg-white" : "border-dashed border-slate-300 bg-slate-50 opacity-60"}`}>
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
        <Icon className="h-4 w-4 text-slate-500 shrink-0" />
        <span className="flex-1 text-sm font-semibold truncate">{SECTION_LABELS[section.type]}</span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" onClick={() => onMoveUp(index)} disabled={index === 0} title="Move up">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" onClick={() => onMoveDown(index)} disabled={index === totalSections - 1} title="Move down">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-600" onClick={() => onToggle(index)} title={section.enabled ? "Hide" : "Show"}>
            {section.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button className="p-1 text-red-400 hover:text-red-600" onClick={() => onRemove(index)} title="Remove">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {expanded && section.enabled && EditorComponent && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-3">
          <EditorComponent data={section.data} onChange={(newData) => onChange(index, newData)} />
        </div>
      )}
    </div>
  );
}
