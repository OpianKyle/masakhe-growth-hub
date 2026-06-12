import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Save, Rocket, Plus, Wand2, Smartphone, Monitor, ArrowLeft,
  Briefcase, UtensilsCrossed, ShoppingBag, Sparkles, HardHat, Palette,
  Layout, BarChart3, Star, Image as ImageIcon, Phone, FileText, MessageSquare, ChevronDown,
  Scale, Calculator, Home, HeartPulse, GraduationCap, Dumbbell, Wrench,
  MonitorSmartphone, Leaf, Truck, PartyPopper, Shield, MapPin, Lightbulb, Car, TrendingUp, Crown, Lock, Eye, X,
  Flower2, Cookie, Baby, Sun, Printer, Users, PawPrint, Church, BedDouble, Shirt,
  Camera, Scissors, Heart, Hammer, Pill, ChefHat, Navigation, Pickaxe, FileCheck, Search,
  Settings2,
} from "lucide-react";
import { WebsiteBuilderTour, TourRestartButton } from "@/components/website/WebsiteBuilderTour";

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
  contact_form: {
    title: "Get in Touch",
    subtitle: "Fill out the form below and we'll get back to you shortly.",
    buttonText: "Submit Enquiry",
    successMessage: "Thank you! We'll be in touch shortly.",
    showPhone: true,
    showMessage: true,
    showService: false,
    serviceOptions: [],
    trustBadges: ["Free, no-obligation consultation", "Response within 24 hours", "Your data stays private"],
    notifyEmail: "",
    requirePhone: false,
  },
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
        <div id="tour-template-search" className="flex flex-col sm:flex-row gap-3 mb-4">
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
            <div id="tour-template-grid" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
  const navigate = useNavigate();
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [editorWidth, setEditorWidth] = useState(340);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(340);
  const [showAddSection, setShowAddSection] = useState(false);
  const [isProPlan, setIsProPlan] = useState(false);
  const [previewSite, setPreviewSite] = useState<SiteConfig | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "sections">("settings");
  const [publishing, setPublishing] = useState(false);

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
        setLastSaved(new Date(existing.updated_at || existing.created_at).toLocaleTimeString());
      }
    }).finally(() => setLoadingExisting(false));
  }, []);

  const applyTemplate = (templateId: string) => {
    const newSite = buildTemplate(templateId);
    const existingId = siteId || site?.id || null;
    setSite({ ...newSite, id: existingId ?? undefined });
    if (existingId) setSiteId(existingId);
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

  const onSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = editorWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = ev.clientX - dragStartXRef.current;
      const next = Math.min(700, Math.max(260, dragStartWidthRef.current + delta));
      setEditorWidth(next);
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [editorWidth]);

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

  const onPublish = async () => {
    setPublishing(true);
    await onSave();
    const id = siteId || site?.id;
    if (!id) { setPublishing(false); return; }
    try {
      const res = await fetch(`/api/websites/${id}/publish`, { method: "POST", credentials: "include" });
      if (res.ok) {
        toast.success("Website published! 🎉 View it in Domain & Publish.", {
          action: { label: "Open", onClick: () => navigate("/website-builder/domain") },
        });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to publish");
      }
    } catch {
      toast.error("Failed to publish");
    } finally {
      setPublishing(false);
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
      <div className="flex h-full flex-col overflow-hidden bg-slate-100">
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
        <WebsiteBuilderTour phase="picker" />
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
            Switching will replace your current design with the new template's defaults. Your content will be overwritten — you can customise it again afterwards.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowTemplateConfirm(false); setPendingTemplateId(null); }}>Cancel</Button>
          <Button onClick={() => { if (pendingTemplateId) applyTemplate(pendingTemplateId); setShowTemplateConfirm(false); setPendingTemplateId(null); }}>
            Switch Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* ── WordPress-style editor shell ── */}
    <div className="flex flex-col h-full bg-[#f0f0f1]">

      {/* ── Top admin bar ── */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0 shadow-sm z-20">
        {/* Left: back + site name + saved */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSite(null)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </button>
          <div className="w-px h-5 bg-gray-200 shrink-0" />
          <span className="text-sm font-semibold text-gray-800 truncate">{site.businessName || "My Website"}</span>
          {lastSaved && (
            <span className="text-xs text-gray-400 hidden md:flex items-center gap-1 shrink-0">
              · Saved {lastSaved}
            </span>
          )}
        </div>

        {/* Right: preview toggle + tour + save + publish */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop / Mobile toggle */}
          <div id="tour-preview-toggle" className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setIsPreviewMobile(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!isPreviewMobile ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setIsPreviewMobile(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isPreviewMobile ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <TourRestartButton phase="editor" />

          <div id="tour-save-publish" className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              className="h-9 px-4 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save
            </Button>
            <Button
              size="sm"
              onClick={onPublish}
              disabled={publishing}
              className="h-9 px-4 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
            >
              <Rocket className="h-3.5 w-3.5 mr-1.5" />
              {publishing ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Content: sidebar + preview ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left settings sidebar ── */}
        <div
          className="flex flex-col bg-white border-r border-gray-200 shrink-0 shadow-sm"
          style={{ width: editorWidth }}
        >
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 shrink-0 bg-gray-50/50">
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === "settings"
                  ? "border-sky-500 text-sky-600 bg-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/60"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" /> Site Settings
            </button>
            <button
              onClick={() => setActiveTab("sections")}
              className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === "sections"
                  ? "border-sky-500 text-sky-600 bg-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/60"
              }`}
            >
              <Layout className="h-3.5 w-3.5" /> Sections
              <span className="ml-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{site.sections.length}</span>
            </button>
          </div>

          {/* ── Settings tab ── */}
          {activeTab === "settings" && (
            <div id="tour-site-settings" className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-6">

                {/* Business name */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Name</Label>
                  <Input
                    value={site.businessName}
                    onChange={(e) => updateSite((p) => ({ ...p, businessName: e.target.value }))}
                    className="h-10 text-sm border-gray-200 focus:border-sky-400 focus:ring-sky-300"
                    placeholder="My Business"
                  />
                </div>

                {/* URL slug */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL Slug</Label>
                    <button
                      type="button"
                      onClick={autoGenerateSlug}
                      className="text-[11px] text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <Wand2 className="h-3 w-3" /> Auto-generate
                    </button>
                  </div>
                  <div className="flex items-stretch">
                    <span className="flex items-center px-3 text-xs text-gray-400 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md font-mono whitespace-nowrap">
                      /site/
                    </span>
                    <Input
                      value={site.slug}
                      onChange={(e) => updateSite((p) => ({ ...p, slug: e.target.value }))}
                      className="h-10 text-sm rounded-l-none border-gray-200 focus:border-sky-400 focus:ring-sky-300 font-mono"
                      placeholder="my-business"
                    />
                  </div>
                </div>

                {/* Brand colours */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Colours</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-xs text-gray-500 font-medium">Primary</span>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={site.theme.primary}
                          onChange={(e) => updateSite((p) => ({ ...p, theme: { ...p.theme, primary: e.target.value } }))}
                          className="h-9 w-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0"
                        />
                        <Input
                          value={site.theme.primary}
                          onChange={(e) => updateSite((p) => ({ ...p, theme: { ...p.theme, primary: e.target.value } }))}
                          className="h-9 text-xs font-mono flex-1 border-gray-200 focus:border-sky-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs text-gray-500 font-medium">Accent</span>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={site.theme.accent}
                          onChange={(e) => updateSite((p) => ({ ...p, theme: { ...p.theme, accent: e.target.value } }))}
                          className="h-9 w-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0"
                        />
                        <Input
                          value={site.theme.accent}
                          onChange={(e) => updateSite((p) => ({ ...p, theme: { ...p.theme, accent: e.target.value } }))}
                          className="h-9 text-xs font-mono flex-1 border-gray-200 focus:border-sky-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media */}
                <div id="tour-logo-upload" className="space-y-4">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Media</Label>
                  <ImageUploadField
                    value={site.logoUrl}
                    onChange={(url) => updateSite((p) => ({ ...p, logoUrl: url }))}
                    label="Business Logo"
                  />
                  <ImageUploadField
                    value={site.photoUrl}
                    onChange={(url) => updateSite((p) => ({ ...p, photoUrl: url }))}
                    label="Hero Photo"
                  />
                </div>

              </div>
            </div>
          )}

          {/* ── Sections tab ── */}
          {activeTab === "sections" && (
            <div id="tour-sections-list" className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
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

                <div id="tour-add-section" className="relative pt-1">
                  <Button
                    variant="outline"
                    className="w-full text-xs border-dashed border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-400 h-10 font-medium"
                    onClick={() => setShowAddSection(!showAddSection)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Section
                    <ChevronDown className={`h-3.5 w-3.5 ml-1.5 transition-transform ${showAddSection ? "rotate-180" : ""}`} />
                  </Button>
                  {showAddSection && (
                    <div className="mt-1 rounded-xl border border-gray-200 bg-white shadow-lg z-30 p-2 grid grid-cols-2 gap-1">
                      {availableSections.map((type) => {
                        const Icon = sectionTypeIcons[type];
                        return (
                          <button
                            key={type}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs hover:bg-sky-50 hover:text-sky-700 text-left transition-colors font-medium text-gray-700"
                            onClick={() => addSection(type)}
                          >
                            <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>{SECTION_LABELS[type]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Drag splitter ── */}
        <div
          onMouseDown={onSplitterMouseDown}
          className="w-1 shrink-0 bg-gray-200 hover:bg-sky-400 active:bg-sky-500 cursor-col-resize transition-colors z-10"
          title="Drag to resize"
        />

        {/* ── Live preview ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f0f0f1]">
          {/* Preview label */}
          <div className="flex items-center justify-center py-2 border-b border-gray-200 bg-white/50 shrink-0">
            <span className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Live Preview</span>
          </div>
          <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
            <div className={`bg-white shadow-2xl rounded-xl overflow-hidden transition-all duration-300 ${isPreviewMobile ? "w-[390px]" : "w-full max-w-[1200px]"}`}>
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 130px)" }}>
                <SectionRenderer site={site} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <WebsiteBuilderTour phase="editor" />
    </>
  );
}
