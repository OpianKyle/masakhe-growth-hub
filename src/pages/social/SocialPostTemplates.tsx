import { useState } from "react";
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
  title: string;
  content: string;
  tags: string[];
}

function generateTemplates(site: SiteConfig): PostTemplate[] {
  const templates: PostTemplate[] = [];
  const biz = site.businessName || "our business";

  const hero = site.sections.find(s => s.type === "hero" && s.enabled)?.data as HeroData | undefined;
  const servicesSection = site.sections.find(s => s.type === "services" && s.enabled)?.data as ServicesData | undefined;
  const aboutSection = site.sections.find(s => s.type === "about" && s.enabled)?.data as AboutData | undefined;
  const testimonialsSection = site.sections.find(s => s.type === "testimonials" && s.enabled)?.data as TestimonialsData | undefined;
  const statsSection = site.sections.find(s => s.type === "stats" && s.enabled)?.data as StatsData | undefined;
  const contactSection = site.sections.find(s => s.type === "contact" && s.enabled)?.data as ContactData | undefined;
  const featuresSection = site.sections.find(s => s.type === "features" && s.enabled)?.data;

  // --- INTRODUCTION TEMPLATES ---
  if (hero) {
    templates.push({
      id: "intro-1",
      category: "Introduction",
      categoryIcon: Building2,
      categoryColor: "bg-blue-500/10 text-blue-600",
      title: "Meet Our Business",
      content: `👋 Introducing ${biz}!\n\n${hero.subtitle || hero.title || "We're here to serve you."}\n\n${hero.ctaPrimaryText ? `${hero.ctaPrimaryText} today — ` : ""}we'd love to work with you.\n\n#SmallBusiness #${biz.replace(/\s+/g, "")} #SouthAfrica #SMME`,
      tags: ["#SmallBusiness", "#SMME", "#SouthAfrica"],
    });

    templates.push({
      id: "intro-2",
      category: "Introduction",
      categoryIcon: Building2,
      categoryColor: "bg-blue-500/10 text-blue-600",
      title: "What We Do",
      content: `✨ At ${biz}, we believe in making a difference.\n\n${hero.subtitle || "We offer top-quality products and services tailored to your needs."}\n\nGet in touch — we're ready to help!\n\n#${biz.replace(/\s+/g, "")} #BusinessGrowth #ShopLocal`,
      tags: ["#BusinessGrowth", "#ShopLocal"],
    });
  }

  // --- SERVICE TEMPLATES ---
  if (servicesSection?.items?.length) {
    servicesSection.items.slice(0, 4).forEach((service, i) => {
      templates.push({
        id: `service-${i}`,
        category: "Services",
        categoryIcon: Tag,
        categoryColor: "bg-green-500/10 text-green-600",
        title: `Spotlight: ${service.title}`,
        content: `🌟 Service Spotlight: ${service.title}\n\n${service.desc || "One of our most popular offerings."}\n\n${service.price ? `Starting from ${service.price} — ` : ""}Contact ${biz} today to learn more!\n\n#${biz.replace(/\s+/g, "")} #Services #SouthAfrica #SMME`,
        tags: ["#Services", "#SMME"],
      });
    });

    if (servicesSection.items.length > 1) {
      const serviceList = servicesSection.items.slice(0, 5).map(s => `• ${s.title}${s.price ? ` — ${s.price}` : ""}`).join("\n");
      templates.push({
        id: "services-all",
        category: "Services",
        categoryIcon: Tag,
        categoryColor: "bg-green-500/10 text-green-600",
        title: "All Our Services",
        content: `💼 Here's what we offer at ${biz}:\n\n${serviceList}\n\nReady to get started? Reach out to us today!\n\n#${biz.replace(/\s+/g, "")} #Services #BusinessGrowth #ShopLocal`,
        tags: ["#Services", "#ShopLocal"],
      });
    }
  }

  // --- ABOUT / STORY TEMPLATES ---
  if (aboutSection) {
    const storyText = aboutSection.quote || (aboutSection.items?.[0]?.desc) || "";
    templates.push({
      id: "about-1",
      category: "Our Story",
      categoryIcon: Users,
      categoryColor: "bg-purple-500/10 text-purple-600",
      title: "Our Story",
      content: `📖 The Story Behind ${biz}\n\n${storyText || "Every business has a story. Ours is built on passion, hard work, and dedication to our customers."}\n\nWe're proud of where we've come from and excited about where we're going. Thank you for being part of our journey! 🙏\n\n#OurStory #${biz.replace(/\s+/g, "")} #SouthAfrica #Entrepreneur`,
      tags: ["#OurStory", "#Entrepreneur"],
    });

    if (aboutSection.items?.length > 0) {
      const point = aboutSection.items[0];
      templates.push({
        id: "about-2",
        category: "Our Story",
        categoryIcon: Users,
        categoryColor: "bg-purple-500/10 text-purple-600",
        title: "Why Choose Us",
        content: `💪 Why choose ${biz}?\n\n${aboutSection.items.slice(0, 3).map(item => `✅ ${item.title}: ${item.desc}`).join("\n\n")}\n\nDiscover the difference — reach out today!\n\n#WhyChooseUs #${biz.replace(/\s+/g, "")} #QualityService`,
        tags: ["#WhyChooseUs", "#QualityService"],
      });
    }
  }

  // --- FEATURES TEMPLATES ---
  if (featuresSection?.items?.length) {
    templates.push({
      id: "features-1",
      category: "Features",
      categoryIcon: Sparkles,
      categoryColor: "bg-yellow-500/10 text-yellow-600",
      title: "What Makes Us Different",
      content: `⭐ What sets ${biz} apart?\n\n${featuresSection.items.slice(0, 3).map((f: any) => `🔹 ${f.title}: ${f.desc}`).join("\n\n")}\n\nExperience the ${biz} difference today.\n\n#Excellence #${biz.replace(/\s+/g, "")} #BusinessGrowth`,
      tags: ["#Excellence", "#BusinessGrowth"],
    });
  }

  // --- TESTIMONIAL TEMPLATES ---
  if (testimonialsSection?.items?.length) {
    testimonialsSection.items.slice(0, 2).forEach((t, i) => {
      templates.push({
        id: `testimonial-${i}`,
        category: "Testimonials",
        categoryIcon: Star,
        categoryColor: "bg-amber-500/10 text-amber-600",
        title: `Review from ${t.name}`,
        content: `⭐ What our customers say about ${biz}:\n\n"${t.text}"\n— ${t.name}${t.role ? `, ${t.role}` : ""}\n\nWe love hearing from our customers! Share your experience with us.\n\n#CustomerLove #${biz.replace(/\s+/g, "")} #Testimonial #SouthAfrica`,
        tags: ["#CustomerLove", "#Testimonial"],
      });
    });
  }

  // --- STATS TEMPLATES ---
  if (statsSection?.items?.length) {
    const statsList = statsSection.items.map(s => `📊 ${s.value} ${s.label}`).join("\n");
    templates.push({
      id: "stats-1",
      category: "Milestones",
      categoryIcon: BarChart3,
      categoryColor: "bg-cyan-500/10 text-cyan-600",
      title: "Our Achievements",
      content: `🎉 Celebrating milestones at ${biz}!\n\n${statsList}\n\nNone of this would be possible without our amazing customers. Thank you! 🙌\n\n#Milestones #${biz.replace(/\s+/g, "")} #Grateful #Entrepreneur`,
      tags: ["#Milestones", "#Grateful"],
    });
  }

  // --- CONTACT / CTA TEMPLATES ---
  if (contactSection) {
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
      categoryColor: "bg-red-500/10 text-red-600",
      title: "Get in Touch",
      content: `📣 Ready to work with ${biz}? We'd love to hear from you!\n\n${contactLines || "Reach out and let's chat."}\n\nDon't hesitate — let's make something great together! 💼\n\n#ContactUs #${biz.replace(/\s+/g, "")} #GetInTouch #SouthAfrica`,
      tags: ["#ContactUs", "#GetInTouch"],
    });

    templates.push({
      id: "contact-2",
      category: "Contact",
      categoryIcon: Phone,
      categoryColor: "bg-red-500/10 text-red-600",
      title: "Weekend Special CTA",
      content: `🌟 This week at ${biz}!\n\nLooking for quality ${servicesSection?.items?.[0]?.title || "services"}? You've found the right team.\n\n${contactLines || "Get in touch today."}\n\n#WeekendSpecial #${biz.replace(/\s+/g, "")} #SouthAfrica #ShopLocal`,
      tags: ["#WeekendSpecial", "#ShopLocal"],
    });
  }

  // --- GENERIC FALLBACK if no site data ---
  if (templates.length === 0) {
    templates.push(
      {
        id: "generic-1",
        category: "Introduction",
        categoryIcon: Building2,
        categoryColor: "bg-blue-500/10 text-blue-600",
        title: "Business Introduction",
        content: `👋 Hello! We're ${biz} and we're excited to connect with you on social media.\n\nStay tuned for updates, offers, and more!\n\n#SmallBusiness #SMME #SouthAfrica`,
        tags: ["#SmallBusiness", "#SMME"],
      },
      {
        id: "generic-2",
        category: "Engagement",
        categoryIcon: Star,
        categoryColor: "bg-amber-500/10 text-amber-600",
        title: "Customer Appreciation",
        content: `🙏 A huge THANK YOU to all our customers! Your support means everything to us at ${biz}.\n\nWe're committed to giving you the best — every single day.\n\n#ThankYou #CustomerAppreciation #${biz.replace(/\s+/g, "")}`,
        tags: ["#ThankYou", "#CustomerAppreciation"],
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
                  <Card className="p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${template.categoryColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{template.title}</p>
                          <p className="text-[11px] text-muted-foreground">{template.category}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed overflow-hidden max-h-36 relative">
                      {template.content}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent" />
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
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
