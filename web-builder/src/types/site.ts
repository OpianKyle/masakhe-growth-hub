export interface SiteConfig {
  id?: string;
  businessName: string;
  slug: string;
  templateId: string;
  logoUrl?: string;
  photoUrl?: string;
  theme: { primary: string; accent: string };
  social: { linkedIn?: string; facebook?: string; instagram?: string; x?: string };
  sections: SiteSection[];
}

export type SectionType = "hero" | "stats" | "features" | "about" | "services" | "gallery" | "testimonials" | "contact" | "contact_form" | "vehicle_listings";

export interface SiteSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  data: any;
}

export type HeroStyle = "corporate" | "centered" | "bold" | "minimal" | "gradient" | "cinematic" | "carousel";

export interface HeroData {
  title: string;
  subtitle: string;
  badgeText?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
  heroStyle?: HeroStyle;
  backgroundImageUrl?: string;
}

export interface StatsData {
  items: Array<{ value: string; label: string }>;
}

export interface FeaturesData {
  title: string;
  subtitle: string;
  imageUrl?: string;
  imagePosition: "left" | "right";
  items: Array<{ title: string; desc: string }>;
}

export interface AboutData {
  title: string;
  quote: string;
  imageUrl?: string;
  imagePosition: "left" | "right";
  items: Array<{ title: string; desc: string }>;
}

export interface ServicesData {
  title: string;
  subtitle: string;
  imageUrl?: string;
  items: Array<{ title: string; desc: string; price?: string }>;
}

export interface GalleryData {
  title: string;
  subtitle: string;
  images: Array<{ url: string; caption?: string }>;
}

export interface TestimonialsData {
  title: string;
  subtitle: string;
  items: Array<{ name: string; role: string; text: string; avatar?: string }>;
}

export interface ContactData {
  title: string;
  subtitle: string;
  email?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  enableWhatsApp?: boolean;
}

export interface VehicleListingsData {
  title: string;
  subtitle: string;
  websiteId?: string;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero Banner",
  stats: "Statistics Bar",
  features: "Features",
  about: "About / Story",
  services: "Services / Menu",
  gallery: "Image Gallery",
  testimonials: "Testimonials",
  contact: "Contact Info",
  contact_form: "Contact Form (Lead Gen)",
  vehicle_listings: "Vehicle Listings",
};

let sectionCounter = 0;
export function makeSectionId(): string {
  return `sec_${Date.now()}_${++sectionCounter}`;
}
