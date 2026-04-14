import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/website/ImageUploadField";
import { SectionRenderer } from "@/components/website/SectionRenderer";
import { SectionEditor } from "@/components/website/SectionEditor";
import { templateList, buildTemplate } from "@/components/website/templates";
import { SiteConfig, SiteSection, SectionType, SECTION_LABELS, makeSectionId } from "@/types/site";
import { toast } from "sonner";
import {
  Save, Rocket, Copy, Plus, Wand2, Smartphone, Monitor, ArrowLeft,
  Briefcase, UtensilsCrossed, ShoppingBag, Sparkles, HardHat, Palette,
  Layout, BarChart3, Star, Image as ImageIcon, Phone, FileText, MessageSquare, ChevronDown,
  Scale, Calculator, Home, HeartPulse, GraduationCap, Dumbbell, Wrench,
  MonitorSmartphone, Leaf, Truck, PartyPopper, Shield, MapPin, Lightbulb, Car, TrendingUp, Crown, Lock, Eye, X,
  Flower2, Cookie, Baby, Sun, Printer, Users, PawPrint, Church, BedDouble, Shirt,
  Camera, Scissors, Heart, Hammer, Pill, ChefHat, Navigation, Pickaxe, FileCheck, Search, Globe, ChevronRight
} from "lucide-react";

const templateIcons: Record<string, React.ElementType> = {
  professional: Briefcase,
  restaurant: UtensilsCrossed,
  retail: ShoppingBag,
  beauty: Sparkles,
  construction: HardHat,
  creative: Palette,
  legal: Scale,
  accounting: Calculator,
  realestate: Home,
  healthcare: HeartPulse,
  education: GraduationCap,
  fitness: Dumbbell,
  automotive: Wrench,
  cleaning: Sparkles,
  technology: MonitorSmartphone,
  agriculture: Leaf,
  transport: Truck,
  events: PartyPopper,
  security: Shield,
  travel: MapPin,
  consulting: Lightbulb,
  showroom: Car,
  brokerage: TrendingUp,
  luxury_estate: Home,
  funeral: Flower2,
  bakery: Cookie,
  childcare: Baby,
  solar: Sun,
  printing: Printer,
  staffing: Users,
  petcare: PawPrint,
  church: Church,
  guesthouse: BedDouble,
  fashion: Shirt,
  plumbing: Hammer,
  photography: Camera,
  catering: ChefHat,
  drivingschool: Navigation,
  pharmacy: Pill,
  nonprofit: Heart,
  mining: Pickaxe,
  hairsalon: Scissors,
  insurance: FileCheck,
  homeimprovement: Hammer,
};

const sectionTypeIcons: Record<SectionType, React.ElementType> = {
  hero: Layout,
  stats: BarChart3,
  features: FileText,
  about: MessageSquare,
  services: Briefcase,
  gallery: ImageIcon,
  testimonials: Star,
  contact: Phone,
  contact_form: FileText,
  vehicle_listings: Car,
};

const defaultSectionData: Record<SectionType, any> = {
  hero: { title: "Your Business Headline", subtitle: "A short description of what you do.", badgeText: "Verified Business", ctaPrimaryText: "Get Started", ctaSecondaryText: "Learn More" },
  stats: { items: [{ value: "100+", label: "Clients" }, { value: "5+", label: "Years" }, { value: "24/7", label: "Support" }, { value: "A+", label: "Rating" }] },
  features: { title: "Our Features", subtitle: "What We Offer", imagePosition: "right", items: [{ title: "Feature 1", desc: "Description of this feature" }, { title: "Feature 2", desc: "Description of this feature" }] },
  about: { title: "About Us", quote: "Our mission statement goes here.", imagePosition: "left", items: [{ title: "Key Point", desc: "Details about this point" }] },
  services: { title: "Our Services", subtitle: "What We Do", items: [{ title: "Service 1", desc: "Description", price: "" }, { title: "Service 2", desc: "Description", price: "" }] },
  gallery: { title: "Gallery", subtitle: "Our Work", images: [{ url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600", caption: "Image 1" }] },
  testimonials: { title: "Testimonials", subtitle: "What Customers Say", items: [{ name: "Customer", role: "Client", text: "Great service!" }] },
  contact: { title: "Contact Us", subtitle: "Get in touch today", phone: "", email: "", address: "", whatsapp: "", enableWhatsApp: false },
  contact_form: { title: "Get in Touch", subtitle: "Fill out the form below and we'll get back to you shortly.", buttonText: "Submit Enquiry", successMessage: "Thank you! We'll be in touch shortly." },
  vehicle_listings: { title: "Our Vehicles", subtitle: "Browse our current inventory" },
};

const CATEGORY_MAP: Record<string, string> = {
  professional: "Professional Services", legal: "Professional Services", consulting: "Professional Services",
  staffing: "Professional Services", funeral: "Professional Services", mining: "Professional Services",
  accounting: "Finance & Legal", insurance: "Finance & Legal", brokerage: "Finance & Legal",
  restaurant: "Food & Hospitality", bakery: "Food & Hospitality", guesthouse: "Food & Hospitality",
  travel: "Food & Hospitality", catering: "Food & Hospitality",
  healthcare: "Health & Wellness", fitness: "Health & Wellness", beauty: "Health & Wellness",
  childcare: "Health & Wellness", petcare: "Health & Wellness", pharmacy: "Health & Wellness", hairsalon: "Health & Wellness",
  construction: "Trade & Construction", automotive: "Trade & Construction", cleaning: "Trade & Construction",
  solar: "Trade & Construction", security: "Trade & Construction", plumbing: "Trade & Construction", homeimprovement: "Trade & Construction",
  technology: "Technology",
  retail: "Retail & Commerce", fashion: "Retail & Commerce",
  creative: "Creative & Media", printing: "Creative & Media", photography: "Creative & Media",
  education: "Education & Community", church: "Education & Community", nonprofit: "Education & Community", drivingschool: "Education & Community",
  agriculture: "Agriculture & Transport", transport: "Agriculture & Transport",
  realestate: "Property", events: "Events",
  showroom: "Premium", luxury_estate: "Premium",
};

const CATEGORIES = [
  "All", "Trade & Construction", "Food & Hospitality", "Health & Wellness",
  "Professional Services", "Finance & Legal", "Creative & Media", "Retail & Commerce",
  "Technology", "Property", "Agriculture & Transport", "Education & Community", "Events", "Premium",
];

const HERO_STYLE_FALLBACKS: Record<string, string> = {
  corporate: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800",
  centered: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
  bold: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=800",
  minimal: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
};

interface HeroPreviewData {
  bgImage: string;
  primary: string;
  title: string;
  subtitle: string;
}

function buildHeroPreviews(): Record<string, HeroPreviewData> {
  const map: Record<string, HeroPreviewData> = {};
  for (const tmpl of templateList) {
    try {
      const config = buildTemplate(tmpl.id);
      const heroSection = config.sections.find((s: any) => s.type === "hero");
      const data = heroSection?.data || {};
      const style: string = data.heroStyle || "corporate";
      map[tmpl.id] = {
        bgImage: data.backgroundImageUrl || HERO_STYLE_FALLBACKS[style] || HERO_STYLE_FALLBACKS.corporate,
        primary: config.theme?.primary || "#2563eb",
        title: data.title || config.businessName || tmpl.name,
        subtitle: data.subtitle || tmpl.description,
      };
    } catch {
      map[tmpl.id] = {
        bgImage: HERO_STYLE_FALLBACKS.corporate,
        primary: "#2563eb",
        title: tmpl.name,
        subtitle: tmpl.description,
      };
    }
  }
  return map;
}

const HERO_PREVIEWS = buildHeroPreviews();

// Preload all hero images immediately when the module loads
if (typeof window !== "undefined") {
  Object.values(HERO_PREVIEWS).forEach(({ bgImage }) => {
    const img = new window.Image();
    img.src = bgImage;
  });
}

function TemplatePicker({ onSelect, onPreview, isProPlan }: { onSelect: (templateId: string) => void; onPreview: (templateId: string) => void; isProPlan: boolean }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "az" | "za">("default");
  const [categoryFilter, setCategoryFilter] = useState("All");

  let displayed = templateList.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const cat = CATEGORY_MAP[t.id] || "Other";
    const matchCat = categoryFilter === "All" || cat === categoryFilter;
    return matchSearch && matchCat;
  });

  if (sortBy === "az") displayed = [...displayed].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "za") displayed = [...displayed].sort((a, b) => b.name.localeCompare(a.name));

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-7">
          <h2 className="text-3xl font-bold font-heading mb-2">Choose a Template</h2>
          <p className="text-slate-500">Pick a starting point for your website. You can customize everything afterwards.</p>
          <p className="text-sm text-slate-400 mt-1">{templateList.length} templates available</p>
        </div>

        {/* Search + Sort controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates by name or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="default">Sort: Default</option>
            <option value="az">Sort: A → Z</option>
            <option value="za">Sort: Z → A</option>
          </select>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                categoryFilter === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-slate-200 text-slate-600 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm mt-1">Try a different search term or select a different category</p>
            <button onClick={() => { setSearch(""); setCategoryFilter("All"); }} className="mt-3 text-sm text-primary hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-3">{displayed.length} template{displayed.length !== 1 ? "s" : ""}</p>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {displayed.map((tmpl) => {
                const isPremiumLocked = tmpl.premium && !isProPlan;
                const category = CATEGORY_MAP[tmpl.id];
                return (
                  <Card
                    key={tmpl.id}
                    className={`group transition-all border-2 overflow-hidden ${isPremiumLocked ? "border-transparent hover:border-amber-400" : "cursor-pointer hover:shadow-xl hover:-translate-y-1 border-transparent hover:border-primary"} ${tmpl.premium ? "ring-1 ring-amber-400/50" : ""}`}
                    onClick={() => { if (!isPremiumLocked) onSelect(tmpl.id); }}
                  >
                    {/* Hero preview thumbnail */}
                    <div className={`relative h-36 w-full overflow-hidden ${tmpl.color}`}>
                      <img
                        src={HERO_PREVIEWS[tmpl.id]?.bgImage}
                        alt={tmpl.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      {/* Color overlay */}
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to bottom, ${HERO_PREVIEWS[tmpl.id]?.primary}55 0%, ${HERO_PREVIEWS[tmpl.id]?.primary}dd 100%)` }}
                      />
                      {/* Premium badge */}
                      {tmpl.premium && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] px-1.5 py-0.5 gap-1 shadow-md">
                            <Crown className="h-2.5 w-2.5" /> PREMIUM
                          </Badge>
                        </div>
                      )}
                      {/* Hero text overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-xs leading-tight line-clamp-1 drop-shadow-md">
                          {HERO_PREVIEWS[tmpl.id]?.title}
                        </p>
                        <p className="text-white/75 text-[10px] line-clamp-1 drop-shadow mt-0.5">
                          {HERO_PREVIEWS[tmpl.id]?.subtitle}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-sm font-bold leading-tight">{tmpl.name}</h3>
                        {category && (
                          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            {category}
                          </span>
                        )}
                      </div>
                      {isPremiumLocked ? (
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="flex-1 text-xs border-amber-400 text-amber-600 hover:bg-amber-50 gap-1" onClick={(e) => { e.stopPropagation(); onPreview(tmpl.id); }}>
                            <Eye className="h-3 w-3" /> Preview
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-xs border-slate-200 text-slate-400 gap-1 cursor-default">
                            <Lock className="h-3 w-3" /> Pro Only
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                          Use Template
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function WebsiteBuilder() {
  const { user } = useAuth();
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [isProPlan, setIsProPlan] = useState(false);
  const [previewSite, setPreviewSite] = useState<SiteConfig | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [savedDomain, setSavedDomain] = useState<string | null>(null);
  const [savingDomain, setSavingDomain] = useState(false);
  const [showDomainDialog, setShowDomainDialog] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      setIsProPlan(true);
    }
    Promise.all([
      fetch("/api/billing/status", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
      fetch("/api/websites/mine", { credentials: "include" }).then(r => r.json()).catch(() => []),
    ]).then(([billing, sites]) => {
      if (user?.role === "admin" || (billing.plan === "pro" && (billing.status === "ACTIVE" || billing.status === "TRIAL"))) {
        setIsProPlan(true);
      }
      const list = Array.isArray(sites) ? sites : [];
      if (list.length > 0) {
        const existing = list[0];
        setSite({ ...(existing.content as SiteConfig), id: existing.id });
        setSiteId(existing.id);
        if (existing.status === "published") {
          setPublishedUrl(`${window.location.origin}/site/${existing.slug}`);
        }
        if (existing.custom_domain) {
          setSavedDomain(existing.custom_domain);
          setCustomDomain(existing.custom_domain);
        }
        setLastSaved(new Date(existing.updated_at || existing.created_at).toLocaleTimeString());
      }
    }).finally(() => setLoadingExisting(false));
  }, []);

  const applyTemplate = (templateId: string) => {
    const newSite = buildTemplate(templateId);
    const existingId = siteId || site?.id || null;
    setSite({ ...newSite, id: existingId ?? undefined });
    if (existingId) setSiteId(existingId);
    setPublishedUrl(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (siteId || site?.id) {
      setPendingTemplateId(templateId);
      setShowTemplateConfirm(true);
    } else {
      applyTemplate(templateId);
    }
  };

  const handlePreview = (templateId: string) => {
    setPreviewSite(buildTemplate(templateId));
  };

  const updateSite = useCallback((updater: (prev: SiteConfig) => SiteConfig) => {
    setSite((prev) => prev ? updater(prev) : prev);
  }, []);

  const updateSection = useCallback((index: number, newData: any) => {
    updateSite((prev) => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], data: newData };
      return { ...prev, sections };
    });
  }, [updateSite]);

  const toggleSection = useCallback((index: number) => {
    updateSite((prev) => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], enabled: !sections[index].enabled };
      return { ...prev, sections };
    });
  }, [updateSite]);

  const removeSection = useCallback((index: number) => {
    updateSite((prev) => {
      const sections = prev.sections.filter((_, i) => i !== index);
      return { ...prev, sections };
    });
  }, [updateSite]);

  const moveSection = useCallback((index: number, direction: "up" | "down") => {
    updateSite((prev) => {
      const sections = [...prev.sections];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sections.length) return prev;
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      return { ...prev, sections };
    });
  }, [updateSite]);

  const addSection = useCallback((type: SectionType) => {
    updateSite((prev) => ({
      ...prev,
      sections: [...prev.sections, { id: makeSectionId(), type, enabled: true, data: { ...defaultSectionData[type] } }],
    }));
    setShowAddSection(false);
  }, [updateSite]);

  const autoGenerateSlug = () => {
    if (!site) return;
    const slug = site.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    updateSite((prev) => ({ ...prev, slug }));
  };

  const onSave = async () => {
    if (!site) return;
    if (!site.businessName || !site.slug) {
      toast.error("Business name and URL slug are required");
      return;
    }
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: siteId || site.id, slug: site.slug, content: site }),
      });
      const result = await res.json();
      if (res.ok) {
        if (!site.id) {
          updateSite((prev) => ({ ...prev, id: result.id }));
          setSiteId(result.id);
        }
        setLastSaved(new Date().toLocaleTimeString());
        toast.success("Draft saved successfully");
      } else {
        toast.error(result.error || "Failed to save draft");
      }
    } catch {
      toast.error("Network error saving draft");
    }
  };

  const saveDomain = async () => {
    if (!siteId) { toast.error("Save your site first before setting a custom domain"); return; }
    setSavingDomain(true);
    try {
      const res = await fetch(`/api/websites/${siteId}/domain`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ customDomain: customDomain.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedDomain(data.customDomain || null);
        toast.success(data.customDomain ? "Custom domain saved!" : "Custom domain removed");
      } else {
        toast.error(data.error || "Failed to save domain");
      }
    } catch {
      toast.error("Network error saving domain");
    } finally {
      setSavingDomain(false);
    }
  };

  const onPublish = async () => {
    await onSave();
    if (!site?.id) return;
    try {
      const res = await fetch(`/api/websites/${site.id}/publish`, { method: "POST", credentials: "include" });
      if (res.ok) {
        setPublishedUrl(`${window.location.origin}/site/${site.slug}`);
        toast.success("Website published!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to publish");
      }
    } catch {
      toast.error("Failed to publish");
    }
  };

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm gap-2">
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading your website...
      </div>
    );
  }

  if (previewSite) {
    const previewTemplateName = templateList.find(t => t.id === previewSite.templateId)?.name || previewSite.templateId;
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-slate-100">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setPreviewSite(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-bold">Previewing: {previewTemplateName}</span>
              </div>
              <p className="text-xs text-white/80">This is a read-only preview. Upgrade to Pro to use this template.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs bg-white text-amber-600 hover:bg-white/90 font-bold" onClick={() => { window.location.href = "/dashboard/billing"; }}>
              <Crown className="h-3.5 w-3.5 mr-1" /> Upgrade to Pro
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setPreviewSite(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden w-full max-w-[1200px]">
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 10rem)" }}>
              <SectionRenderer site={previewSite} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <>
        <Dialog open={showTemplateConfirm} onOpenChange={setShowTemplateConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Switch Template?</DialogTitle>
              <DialogDescription>
                Switching to a new template will replace your current website design. Your layout and content will be overwritten with the new template's defaults — you can customise it again afterwards.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowTemplateConfirm(false); setPendingTemplateId(null); }}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (pendingTemplateId) applyTemplate(pendingTemplateId);
                setShowTemplateConfirm(false);
                setPendingTemplateId(null);
              }}>
                Switch Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <TemplatePicker onSelect={handleTemplateSelect} onPreview={handlePreview} isProPlan={isProPlan} />
      </>
    );
  }

  const availableSections: SectionType[] = site.templateId === "showroom"
    ? ["hero", "stats", "vehicle_listings", "features", "about", "services", "gallery", "testimonials", "contact", "contact_form"]
    : site.templateId === "brokerage"
    ? ["hero", "stats", "features", "about", "services", "gallery", "testimonials", "contact", "contact_form", "vehicle_listings"]
    : ["hero", "stats", "features", "about", "services", "gallery", "testimonials", "contact", "contact_form"];

  return (
    <>
    <Dialog open={showTemplateConfirm} onOpenChange={setShowTemplateConfirm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch Template?</DialogTitle>
          <DialogDescription>
            Switching to a new template will replace your current website design. Your existing website record will be updated — nothing is permanently deleted, but your current layout and content will be overwritten with the new template's defaults. You can customise it again afterwards.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowTemplateConfirm(false); setPendingTemplateId(null); }}>
            Cancel
          </Button>
          <Button onClick={() => {
            if (pendingTemplateId) applyTemplate(pendingTemplateId);
            setShowTemplateConfirm(false);
            setPendingTemplateId(null);
          }}>
            Switch Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" />
            Custom Domain
          </DialogTitle>
          <DialogDescription>
            Connect your own domain name to this website.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="flex gap-2">
            <Input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value.replace(/^https?:\/\//, "").replace(/\/$/, ""))}
              className="text-sm"
              placeholder="e.g. www.mybusiness.co.za"
            />
            <Button className="shrink-0" onClick={async () => { await saveDomain(); }} disabled={savingDomain}>
              {savingDomain ? "Saving…" : "Save"}
            </Button>
          </div>

          {savedDomain && (
            <div className="space-y-3">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-blue-800">DNS Records — add these in Xneelo / your registrar:</p>
                <div className="rounded bg-white border border-blue-100 p-2 font-mono text-xs space-y-1.5 text-slate-700">
                  <div className="grid grid-cols-3 gap-2 text-blue-500 font-semibold text-[11px]">
                    <span>Type</span><span>Name</span><span>Value</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <span>CNAME</span>
                    <span>{savedDomain.startsWith("www.") ? "www" : savedDomain.split(".")[0]}</span>
                    <span className="break-all">masakheportal.co.za</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <span>A</span><span>@</span><span>154.65.110.84</span>
                  </div>
                </div>
                <p className="text-[10px] text-blue-600">Allow up to 24 hours for DNS propagation after saving records.</p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-amber-800">🔒 Enable HTTPS (Free)</p>
                <p className="text-[11px] text-amber-700">Your site will show "Not Secure" until SSL is set up. Use Cloudflare for free HTTPS:</p>
                <ol className="text-[11px] text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Create a free account at <span className="font-mono font-semibold">cloudflare.com</span></li>
                  <li>Add your domain and follow the setup wizard</li>
                  <li>Update your registrar's nameservers to Cloudflare's</li>
                  <li>In Cloudflare DNS, add the A record above with the <span className="font-semibold">Proxy (orange cloud) ON</span></li>
                  <li>HTTPS activates automatically — no extra cost</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      <div className="w-[420px] flex flex-col border-r bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSite(null)} title="Back to templates">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-sm font-bold leading-tight">Edit Site</h2>
              {lastSaved && <p className="text-[10px] text-slate-400">Saved {lastSaved}</p>}
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onSave}>
              <Save className="mr-1 h-3.5 w-3.5" />Save
            </Button>
            <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={onPublish}>
              <Rocket className="mr-1 h-3.5 w-3.5" />Publish
            </Button>
          </div>
        </div>

        {publishedUrl && (
          <div className="mx-4 mt-3 rounded-lg border-green-200 bg-green-50 p-3 border">
            <p className="text-[10px] font-bold text-green-800 uppercase mb-1">Published URL</p>
            <div className="flex gap-1">
              <Input value={publishedUrl} readOnly className="bg-white text-[11px] h-7" />
              <Button size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={() => { navigator.clipboard.writeText(publishedUrl); toast.success("Copied!"); }}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowDomainDialog(true)}
          className="mx-4 mt-3 flex items-center justify-between w-[calc(100%-2rem)] rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <div className="text-left">
              <p className="text-[11px] font-semibold text-blue-800">Custom Domain</p>
              <p className="text-[10px] text-blue-500">{savedDomain || "Not configured"}</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        </button>


        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="rounded-lg border bg-slate-50 p-3 space-y-3">
            <div>
              <Label className="text-xs font-semibold">Business Name</Label>
              <Input value={site.businessName} onChange={(e) => updateSite((p) => ({ ...p, businessName: e.target.value }))} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">URL Slug</Label>
                <button type="button" className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5" onClick={autoGenerateSlug}>
                  <Wand2 className="h-2.5 w-2.5" /> Auto
                </button>
              </div>
              <Input value={site.slug} onChange={(e) => updateSite((p) => ({ ...p, slug: e.target.value }))} className="mt-1 h-8 text-sm" placeholder="my-business" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Primary Color</Label>
                <div className="flex gap-1 mt-1">
                  <Input type="color" value={site.theme.primary} onChange={(e) => updateSite((p) => ({ ...p, theme: { ...p.theme, primary: e.target.value } }))} className="h-8 w-8 p-0.5" />
                  <Input value={site.theme.primary} onChange={(e) => updateSite((p) => ({ ...p, theme: { ...p.theme, primary: e.target.value } }))} className="h-8 text-xs flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Accent Color</Label>
                <div className="flex gap-1 mt-1">
                  <Input type="color" value={site.theme.accent} onChange={(e) => updateSite((p) => ({ ...p, theme: { ...p.theme, accent: e.target.value } }))} className="h-8 w-8 p-0.5" />
                  <Input value={site.theme.accent} onChange={(e) => updateSite((p) => ({ ...p, theme: { ...p.theme, accent: e.target.value } }))} className="h-8 text-xs flex-1" />
                </div>
              </div>
            </div>
            <ImageUploadField value={site.logoUrl} onChange={(url) => updateSite((p) => ({ ...p, logoUrl: url }))} label="Business Logo" />
            <ImageUploadField value={site.photoUrl} onChange={(url) => updateSite((p) => ({ ...p, photoUrl: url }))} label="Hero Photo" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Sections ({site.sections.length})</h3>
            </div>

            {site.sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={index}
                totalSections={site.sections.length}
                onChange={updateSection}
                onToggle={toggleSection}
                onRemove={removeSection}
                onMoveUp={() => moveSection(index, "up")}
                onMoveDown={() => moveSection(index, "down")}
              />
            ))}

            <div className="relative">
              <Button variant="outline" className="w-full text-xs border-dashed" onClick={() => setShowAddSection(!showAddSection)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Section <ChevronDown className={`h-3.5 w-3.5 ml-1 transition-transform ${showAddSection ? "rotate-180" : ""}`} />
              </Button>
              {showAddSection && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-white shadow-lg z-30 p-2 grid grid-cols-2 gap-1">
                  {availableSections.map((type) => {
                    const Icon = sectionTypeIcons[type];
                    return (
                      <button key={type} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-slate-100 text-left" onClick={() => addSection(type)}>
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span>{SECTION_LABELS[type]}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
          <div className="flex items-center gap-2">
            <Button variant={isPreviewMobile ? "ghost" : "default"} size="sm" className="h-7 text-xs" onClick={() => setIsPreviewMobile(false)}>
              <Monitor className="h-3.5 w-3.5 mr-1" /> Desktop
            </Button>
            <Button variant={isPreviewMobile ? "default" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setIsPreviewMobile(true)}>
              <Smartphone className="h-3.5 w-3.5 mr-1" /> Mobile
            </Button>
          </div>
          <p className="text-[10px] text-slate-400">Live Preview</p>
        </div>
        <div className="flex-1 overflow-auto bg-slate-100 p-4 flex justify-center">
          <div className={`bg-white shadow-2xl rounded-xl overflow-hidden transition-all ${isPreviewMobile ? "w-[375px]" : "w-full max-w-[1200px]"}`}>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 10rem)" }}>
              <SectionRenderer site={site} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
