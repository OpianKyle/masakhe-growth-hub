import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sparkles, Copy, ArrowRight, Globe, Building2, Star, Phone,
  Tag, Users, BarChart3, RefreshCw, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import type { SiteConfig, ServicesData, AboutData, HeroData, TestimonialsData, StatsData, ContactData } from "@/types/site";

interface Props {
  workspaceId: string;
  site: SiteConfig | null;
}

interface PostTemplate {
  id: string;
  category: string;
  categoryIcon: any;
  categoryColor: string;
  categoryBg: string;
  categoryBgRGB: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  mockImage: string;
}

const CATEGORY_IMAGES: Record<string, string> = {
  Introduction: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
  Services: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
  "Our Story": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
  Features: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
  Testimonials: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
  Milestones: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
  Contact: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
  Engagement: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
};

const CATEGORY_COLORS: Record<string, { color: string; bg: string; rgb: string }> = {
  Introduction: { color: "text-blue-600", bg: "bg-blue-500/10", rgb: "100, 116, 204" },
  Services: { color: "text-green-600", bg: "bg-green-500/10", rgb: "34, 197, 94" },
  "Our Story": { color: "text-purple-600", bg: "bg-purple-500/10", rgb: "147, 51, 234" },
  Features: { color: "text-yellow-600", bg: "bg-yellow-500/10", rgb: "202, 138, 4" },
  Testimonials: { color: "text-amber-600", bg: "bg-amber-500/10", rgb: "217, 119, 6" },
  Milestones: { color: "text-cyan-600", bg: "bg-cyan-500/10", rgb: "6, 182, 212" },
  Contact: { color: "text-red-600", bg: "bg-red-500/10", rgb: "220, 38, 38" },
  Engagement: { color: "text-pink-600", bg: "bg-pink-500/10", rgb: "236, 72, 153" },
};

// Preload category images
if (typeof window !== "undefined") {
  Object.values(CATEGORY_IMAGES).forEach((url) => {
    const img = new window.Image();
    img.src = url;
  });
}

function generateTemplates(site: SiteConfig): PostTemplate[] {
  const templates: PostTemplate[] = [];
  const biz = site.businessName || "our business";
  const getCategory = (cat: string) => CATEGORY_COLORS[cat] || { color: "text-blue-600", bg: "bg-blue-500/10", rgb: "59, 130, 246" };

  const hero = site.sections.find(s => s.type === "hero" && s.enabled)?.data as HeroData | undefined;
  const servicesSection = site.sections.find(s => s.type === "services" && s.enabled)?.data as ServicesData | undefined;
  const aboutSection = site.sections.find(s => s.type === "about" && s.enabled)?.data as AboutData | undefined;
  const testimonialsSection = site.sections.find(s => s.type === "testimonials" && s.enabled)?.data as TestimonialsData | undefined;
  const statsSection = site.sections.find(s => s.type === "stats" && s.enabled)?.data as StatsData | undefined;
  const contactSection = site.sections.find(s => s.type === "contact" && s.enabled)?.data as ContactData | undefined;
  const featuresSection = site.sections.find(s => s.type === "features" && s.enabled)?.data;

  // --- INTRODUCTION TEMPLATES ---
  if (hero) {
    const cat = getCategory("Introduction");
    templates.push({
      id: "intro-1",
      category: "Introduction",
      categoryIcon: Building2,
      categoryColor: cat.color,
      categoryBg: cat.bg,
      categoryBgRGB: cat.rgb,
      title: "Meet Our Business",
      description: `Introduce ${biz} to your audience`,
      content: `👋 Introducing ${biz}!\n\n${hero.subtitle || hero.title || "We're here to serve you."}\n\n${hero.ctaPrimaryText ? `${hero.ctaPrimaryText} today — ` : ""}we'd love to work with you.\n\n#SmallBusiness #${biz.replace(/\s+/g, "")} #SouthAfrica #SMME`,
      tags: ["#SmallBusiness", "#SMME", "#SouthAfrica"],
      mockImage: CATEGORY_IMAGES["Introduction"],
    });

    const cat2 = getCategory("Introduction");
    templates.push({
      id: "intro-2",
      category: "Introduction",
      categoryIcon: Building2,
      categoryColor: cat2.color,
      categoryBg: cat2.bg,
      categoryBgRGB: cat2.rgb,
      title: "What We Do",
      description: `Explain what ${biz} offers`,
      content: `✨ At ${biz}, we believe in making a difference.\n\n${hero.subtitle || "We offer top-quality products and services tailored to your needs."}\n\nGet in touch — we're ready to help!\n\n#${biz.replace(/\s+/g, "")} #BusinessGrowth #ShopLocal`,
      tags: ["#BusinessGrowth", "#ShopLocal"],
      mockImage: CATEGORY_IMAGES["Introduction"],
    });
  }

  // --- SERVICE TEMPLATES ---
  if (servicesSection?.items?.length) {
    const catSvc = getCategory("Services");
    servicesSection.items.slice(0, 4).forEach((service, i) => {
      templates.push({
        id: `service-${i}`,
        category: "Services",
        categoryIcon: Tag,
        categoryColor: catSvc.color,
        categoryBg: catSvc.bg,
        categoryBgRGB: catSvc.rgb,
        title: `Spotlight: ${service.title}`,
        description: `Promote service: ${service.title}`,
        content: `🌟 Service Spotlight: ${service.title}\n\n${service.desc || "One of our most popular offerings."}\n\n${service.price ? `Starting from ${service.price} — ` : ""}Contact ${biz} today to learn more!\n\n#${biz.replace(/\s+/g, "")} #Services #SouthAfrica #SMME`,
        tags: ["#Services", "#SMME"],
        mockImage: CATEGORY_IMAGES["Services"],
      });
    });

    if (servicesSection.items.length > 1) {
      const serviceList = servicesSection.items.slice(0, 5).map(s => `• ${s.title}${s.price ? ` — ${s.price}` : ""}`).join("\n");
      templates.push({
        id: "services-all",
        category: "Services",
        categoryIcon: Tag,
        categoryColor: catSvc.color,
        categoryBg: catSvc.bg,
        categoryBgRGB: catSvc.rgb,
        title: "All Our Services",
        description: "Showcase all offerings",
        content: `💼 Here's what we offer at ${biz}:\n\n${serviceList}\n\nReady to get started? Reach out to us today!\n\n#${biz.replace(/\s+/g, "")} #Services #BusinessGrowth #ShopLocal`,
        tags: ["#Services", "#ShopLocal"],
        mockImage: CATEGORY_IMAGES["Services"],
      });
    }
  }

  // --- ABOUT / STORY TEMPLATES ---
  if (aboutSection) {
    const catStory = getCategory("Our Story");
    const storyText = aboutSection.quote || (aboutSection.items?.[0]?.desc) || "";
    templates.push({
      id: "about-1",
      category: "Our Story",
      categoryIcon: Users,
      categoryColor: catStory.color,
      categoryBg: catStory.bg,
      categoryBgRGB: catStory.rgb,
      title: "Our Story",
      description: "Share your business journey",
      content: `📖 The Story Behind ${biz}\n\n${storyText || "Every business has a story. Ours is built on passion, hard work, and dedication to our customers."}\n\nWe're proud of where we've come from and excited about where we're going. Thank you for being part of our journey! 🙏\n\n#OurStory #${biz.replace(/\s+/g, "")} #SouthAfrica #Entrepreneur`,
      tags: ["#OurStory", "#Entrepreneur"],
      mockImage: CATEGORY_IMAGES["Our Story"],
    });

    if (aboutSection.items?.length > 0) {
      const point = aboutSection.items[0];
      templates.push({
        id: "about-2",
        category: "Our Story",
        categoryIcon: Users,
        categoryColor: catStory.color,
        categoryBg: catStory.bg,
        categoryBgRGB: catStory.rgb,
        title: "Why Choose Us",
        description: "Highlight your unique value",
        content: `💪 Why choose ${biz}?\n\n${aboutSection.items.slice(0, 3).map(item => `✅ ${item.title}: ${item.desc}`).join("\n\n")}\n\nDiscover the difference — reach out today!\n\n#WhyChooseUs #${biz.replace(/\s+/g, "")} #QualityService`,
        tags: ["#WhyChooseUs", "#QualityService"],
        mockImage: CATEGORY_IMAGES["Our Story"],
      });
    }
  }

  // --- FEATURES TEMPLATES ---
  if (featuresSection?.items?.length) {
    const catFeat = getCategory("Features");
    templates.push({
      id: "features-1",
      category: "Features",
      categoryIcon: Sparkles,
      categoryColor: catFeat.color,
      categoryBg: catFeat.bg,
      categoryBgRGB: catFeat.rgb,
      title: "What Makes Us Different",
      description: "Emphasize your unique features",
      content: `⭐ What sets ${biz} apart?\n\n${featuresSection.items.slice(0, 3).map((f: any) => `🔹 ${f.title}: ${f.desc}`).join("\n\n")}\n\nExperience the ${biz} difference today.\n\n#Excellence #${biz.replace(/\s+/g, "")} #BusinessGrowth`,
      tags: ["#Excellence", "#BusinessGrowth"],
      mockImage: CATEGORY_IMAGES["Features"],
    });
  }

  // --- TESTIMONIAL TEMPLATES ---
  if (testimonialsSection?.items?.length) {
    const catTest = getCategory("Testimonials");
    testimonialsSection.items.slice(0, 2).forEach((t, i) => {
      templates.push({
        id: `testimonial-${i}`,
        category: "Testimonials",
        categoryIcon: Star,
        categoryColor: catTest.color,
        categoryBg: catTest.bg,
        categoryBgRGB: catTest.rgb,
        title: `Review from ${t.name}`,
        description: `Customer testimonial: ${t.name}`,
        content: `⭐ What our customers say about ${biz}:\n\n"${t.text}"\n— ${t.name}${t.role ? `, ${t.role}` : ""}\n\nWe love hearing from our customers! Share your experience with us.\n\n#CustomerLove #${biz.replace(/\s+/g, "")} #Testimonial #SouthAfrica`,
        tags: ["#CustomerLove", "#Testimonial"],
        mockImage: CATEGORY_IMAGES["Testimonials"],
      });
    });
  }

  // --- STATS TEMPLATES ---
  if (statsSection?.items?.length) {
    const catMile = getCategory("Milestones");
    const statsList = statsSection.items.map(s => `📊 ${s.value} ${s.label}`).join("\n");
    templates.push({
      id: "stats-1",
      category: "Milestones",
      categoryIcon: BarChart3,
      categoryColor: catMile.color,
      categoryBg: catMile.bg,
      categoryBgRGB: catMile.rgb,
      title: "Our Achievements",
      description: "Celebrate your milestones",
      content: `🎉 Celebrating milestones at ${biz}!\n\n${statsList}\n\nNone of this would be possible without our amazing customers. Thank you! 🙌\n\n#Milestones #${biz.replace(/\s+/g, "")} #Grateful #Entrepreneur`,
      tags: ["#Milestones", "#Grateful"],
      mockImage: CATEGORY_IMAGES["Milestones"],
    });
  }

  // --- CONTACT / CTA TEMPLATES ---
  if (contactSection) {
    const catCont = getCategory("Contact");
    const contactLines = [
      contactSection.email ? `📧 ${contactSection.email}` : null,
      contactSection.phone ? `📞 ${contactSection.phone}` : null,
      contactSection.whatsapp ? `💬 WhatsApp: ${contactSection.whatsapp}` : null,
      contactSection.address ? `📍 ${contactSection.address}` : null,
    ].filter(Boolean).join("\n");

    templates.push({
      id: "contact-1",
      category: "Contact",
      categoryIcon: Phone,
      categoryColor: catCont.color,
      categoryBg: catCont.bg,
      categoryBgRGB: catCont.rgb,
      title: "Get in Touch",
      description: "Encourage contact and inquiries",
      content: `📣 Ready to work with ${biz}? We'd love to hear from you!\n\n${contactLines || "Reach out and let's chat."}\n\nDon't hesitate — let's make something great together! 💼\n\n#ContactUs #${biz.replace(/\s+/g, "")} #GetInTouch #SouthAfrica`,
      tags: ["#ContactUs", "#GetInTouch"],
      mockImage: CATEGORY_IMAGES["Contact"],
    });

    templates.push({
      id: "contact-2",
      category: "Contact",
      categoryIcon: Phone,
      categoryColor: catCont.color,
      categoryBg: catCont.bg,
      categoryBgRGB: catCont.rgb,
      title: "Weekend Special CTA",
      description: "Weekly call-to-action post",
      content: `🌟 This week at ${biz}!\n\nLooking for quality ${servicesSection?.items?.[0]?.title || "services"}? You've found the right team.\n\n${contactLines || "Get in touch today."}\n\n#WeekendSpecial #${biz.replace(/\s+/g, "")} #SouthAfrica #ShopLocal`,
      tags: ["#WeekendSpecial", "#ShopLocal"],
      mockImage: CATEGORY_IMAGES["Contact"],
    });
  }

  // --- GENERIC FALLBACK if no site data ---
  if (templates.length === 0) {
    const catIntro = getCategory("Introduction");
    const catEngage = getCategory("Engagement");
    templates.push(
      {
        id: "generic-1",
        category: "Introduction",
        categoryIcon: Building2,
        categoryColor: catIntro.color,
        categoryBg: catIntro.bg,
        categoryBgRGB: catIntro.rgb,
        title: "Business Introduction",
        description: "Introduce your business",
        content: `👋 Hello! We're ${biz} and we're excited to connect with you on social media.\n\nStay tuned for updates, offers, and more!\n\n#SmallBusiness #SMME #SouthAfrica`,
        tags: ["#SmallBusiness", "#SMME"],
        mockImage: CATEGORY_IMAGES["Introduction"],
      },
      {
        id: "generic-2",
        category: "Engagement",
        categoryIcon: Star,
        categoryColor: catEngage.color,
        categoryBg: catEngage.bg,
        categoryBgRGB: catEngage.rgb,
        title: "Customer Appreciation",
        description: "Thank your customers",
        content: `🙏 A huge THANK YOU to all our customers! Your support means everything to us at ${biz}.\n\nWe're committed to giving you the best — every single day.\n\n#ThankYou #CustomerAppreciation #${biz.replace(/\s+/g, "")}`,
        tags: ["#ThankYou", "#CustomerAppreciation"],
        mockImage: CATEGORY_IMAGES["Engagement"],
      }
    );
  }

  return templates;
}

const CATEGORY_ORDER = ["Introduction", "Services", "Our Story", "Features", "Testimonials", "Milestones", "Contact", "Engagement"];

export default function SocialPostTemplates({ workspaceId, site }: Props) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templates = site ? generateTemplates(site) : [];
  const categories = ["All", ...CATEGORY_ORDER.filter(c => templates.some(t => t.category === c))];
  const filtered = selectedCategory === "All" ? templates : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template: PostTemplate) => {
    navigate(`/dashboard/social/create?template=${encodeURIComponent(template.content)}`);
  };

  const handleCopy = async (template: PostTemplate) => {
    await navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    toast.success("Post copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Post Templates
          </h2>
          <p className="text-muted-foreground mt-0.5">
            {site
              ? `Smart posts generated from your ${site.businessName} website`
              : "Complete your website in the Website Builder to unlock personalised templates"}
          </p>
        </div>
        {!site && (
          <Button onClick={() => navigate("/dashboard/website")} className="gradient-hero text-white">
            <Globe className="h-4 w-4 mr-2" /> Build Your Website
          </Button>
        )}
      </div>

      {!site ? (
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-bold text-lg mb-1">No Website Found</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Build your website first using the Website Builder. We'll use your business name, services, and story to generate personalised social media posts for you.
          </p>
          <Button onClick={() => navigate("/dashboard/website")} className="gradient-hero text-white">
            <Globe className="h-4 w-4 mr-2" /> Go to Website Builder <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Card>
      ) : (
        <>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
                  selectedCategory === cat
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat} {cat === "All" ? `(${templates.length})` : `(${templates.filter(t => t.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((template, i) => {
              const Icon = template.categoryIcon;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="group transition-all border-2 overflow-hidden hover:shadow-lg hover:-translate-y-1 border-transparent hover:border-primary cursor-pointer">
                    {/* Mock image with gradient overlay */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-200">
                      <img
                        src={template.mockImage}
                        alt={template.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to bottom, rgba(${template.categoryBgRGB}, 0.4) 0%, rgba(${template.categoryBgRGB}, 0.8) 100%)` }}
                      />
                      {/* Category icon overlay */}
                      <div className="absolute top-3 right-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${template.categoryBg}`}>
                          <Icon className={`h-5 w-5 ${template.categoryColor}`} />
                        </div>
                      </div>
                      {/* Text overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm leading-tight drop-shadow-md">{template.title}</p>
                        <p className="text-white/80 text-xs drop-shadow mt-0.5">{template.description}</p>
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-4 space-y-3">
                      <div className="flex-1 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed overflow-hidden max-h-24 relative">
                        {template.content}
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-50 to-transparent" />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1 gradient-hero text-white"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use Template <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(template)}
                          className={copiedId === template.id ? "border-green-300 text-green-600" : ""}
                        >
                          {copiedId === template.id ? (
                            <><RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Copied!</>
                          ) : (
                            <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
