import { SiteConfig, SiteSection, HeroStyle } from "@/types/site";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, MessageSquare, CheckCircle2, Globe, Star, Quote, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function HeroCorporate({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full opacity-20 blur-[100px]" style={{ backgroundColor: site.theme.primary }} />
      <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: site.theme.accent }} />
      <div className="container relative mx-auto px-4">
        <nav className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.businessName} className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <Globe className="h-6 w-6" style={{ color: site.theme.primary }} />
            )}
            <span className="text-xl font-bold tracking-tight">{site.businessName}</span>
          </div>
          {data.badgeText && (
            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${site.theme.primary}20`, color: site.theme.primary }}>
              <CheckCircle2 className="mr-1 h-3 w-3" />{data.badgeText}
            </Badge>
          )}
        </nav>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tighter md:text-6xl">{data.title}</h1>
            <p className="mb-8 text-xl text-slate-400">{data.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              {data.ctaPrimaryText && <Button size="lg" className="text-white font-semibold px-8" style={{ backgroundColor: site.theme.primary }}>{data.ctaPrimaryText}</Button>}
              {data.ctaSecondaryText && <Button size="lg" variant="outline" className="border-slate-700 bg-transparent text-white hover:bg-slate-900">{data.ctaSecondaryText}</Button>}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
            <img src={data.backgroundImageUrl || site.photoUrl || "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80"} alt={site.businessName} className="h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top right, ${site.theme.primary}15, transparent)` }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroCentered({ data, site }: { data: any; site: SiteConfig }) {
  const bgImage = data.backgroundImageUrl || site.photoUrl || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80";
  return (
    <section className="relative min-h-[600px] overflow-hidden text-white">
      <div className="absolute inset-0">
        <img src={bgImage} alt={site.businessName} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${site.theme.primary}40, transparent 60%)` }} />
      </div>
      <div className="container relative z-10 mx-auto flex min-h-[600px] flex-col px-4">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.businessName} className="h-10 w-10 rounded-full object-contain bg-white/10 backdrop-blur-sm" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30">
                <span className="text-lg font-bold">{site.businessName[0]}</span>
              </div>
            )}
            <span className="text-xl font-bold">{site.businessName}</span>
          </div>
          {data.badgeText && (
            <Badge className="border border-white/20 bg-white/10 text-white text-xs backdrop-blur-sm">
              <Sparkles className="mr-1 h-3 w-3" />{data.badgeText}
            </Badge>
          )}
        </nav>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <h1 className="mb-6 text-5xl font-extrabold leading-tight md:text-7xl" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              {data.title}
            </h1>
            <p className="mx-auto mb-10 max-w-xl text-xl text-white/80">{data.subtitle}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {data.ctaPrimaryText && (
                <Button size="lg" className="text-white font-semibold px-10 py-6 text-lg shadow-xl" style={{ backgroundColor: site.theme.primary }}>
                  {data.ctaPrimaryText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              {data.ctaSecondaryText && (
                <Button size="lg" className="border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm px-10 py-6 text-lg hover:bg-white/20">
                  {data.ctaSecondaryText}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
        <div className="flex justify-center pb-8">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="h-10 w-6 rounded-full border-2 border-white/30 p-1">
            <div className="h-2 w-full rounded-full bg-white/60" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroBold({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${site.theme.primary}, ${site.theme.accent})` }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20" />
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-black/10" />
        <div className="absolute right-1/3 top-1/2 h-64 w-64 rotate-45 rounded-3xl bg-white/10" />
      </div>
      <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" style={{ height: "80px" }}>
        <path d="M0 40 C360 100, 1080 0, 1440 60 L1440 100 L0 100 Z" fill="white" />
      </svg>
      <div className="container relative z-10 mx-auto px-4 py-8">
        <nav className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.businessName} className="h-10 w-10 rounded-xl object-contain bg-white/20 backdrop-blur-sm" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm font-bold text-lg">
                {site.businessName[0]}
              </div>
            )}
            <span className="text-xl font-bold">{site.businessName}</span>
          </div>
          {data.badgeText && (
            <Badge className="bg-white/20 text-white text-xs backdrop-blur-sm border-0">
              <CheckCircle2 className="mr-1 h-3 w-3" />{data.badgeText}
            </Badge>
          )}
        </nav>
        <div className="grid items-center gap-12 pb-24 lg:grid-cols-5">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-3">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              {data.badgeText || site.businessName}
            </motion.div>
            <h1 className="mb-6 text-5xl font-black leading-none tracking-tight md:text-7xl">
              {data.title}
            </h1>
            <p className="mb-10 max-w-lg text-lg text-white/80">{data.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              {data.ctaPrimaryText && (
                <Button size="lg" className="bg-white font-bold px-8 py-6 text-base shadow-xl hover:bg-white/90" style={{ color: site.theme.primary }}>
                  {data.ctaPrimaryText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              {data.ctaSecondaryText && (
                <Button size="lg" className="border-2 border-white/40 bg-transparent text-white px-8 py-6 text-base hover:bg-white/10">
                  {data.ctaSecondaryText}
                </Button>
              )}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.85, rotate: 3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/20">
              <img
                src={data.backgroundImageUrl || site.photoUrl || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80"}
                alt={site.businessName}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl shadow-lg flex items-center justify-center text-3xl font-black"
              style={{ backgroundColor: site.theme.accent, color: "white" }}>
              <Star className="h-10 w-10 fill-white" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroSection({ data, site }: { data: any; site: SiteConfig }) {
  const style: HeroStyle = data.heroStyle || "corporate";
  switch (style) {
    case "centered": return <HeroCentered data={data} site={site} />;
    case "bold": return <HeroBold data={data} site={site} />;
    default: return <HeroCorporate data={data} site={site} />;
  }
}

function StatsSection({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="border-b border-slate-100 bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {(data.items || []).map((stat: any, i: number) => (
            <div key={i} className="text-center">
              <div className="mb-1 text-3xl font-bold" style={{ color: site.theme.primary }}>{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className={data.imagePosition === "left" ? "order-2" : "order-1"}>
            <Badge className="mb-4" style={{ backgroundColor: `${site.theme.primary}20`, color: site.theme.primary }}>{data.subtitle}</Badge>
            <h2 className="mb-8 text-4xl font-bold tracking-tight">{data.title}</h2>
            <div className="grid gap-6">
              {(data.items || []).map((item: any, i: number) => (
                <Card key={i} className="flex gap-4 border-none bg-slate-50 p-6 shadow-none transition-shadow hover:shadow-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <CheckCircle2 className="h-6 w-6" style={{ color: site.theme.primary }} />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold">{item.title}</h3>
                    <p className="text-slate-500">{item.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className={`overflow-hidden rounded-2xl shadow-2xl ${data.imagePosition === "left" ? "order-1" : "order-2"}`}>
            <img src={data.imageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80"} className="aspect-square w-full object-cover" alt="Features" />
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className={`overflow-hidden rounded-2xl shadow-2xl ${data.imagePosition === "left" ? "order-1" : "order-2"}`}>
            <img src={data.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"} className="aspect-video w-full object-cover" alt="About" />
          </div>
          <div className={data.imagePosition === "left" ? "order-2" : "order-1"}>
            <h2 className="mb-6 text-4xl font-bold tracking-tight">{data.title}</h2>
            {data.quote && (
              <div className="mb-8 border-l-4 pl-6 text-2xl italic text-slate-600" style={{ borderColor: site.theme.primary }}>
                "{data.quote}"
              </div>
            )}
            <div className="grid gap-4">
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${site.theme.primary}20`, color: site.theme.primary }}>
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-bold">{item.title}: </span>
                    <span className="text-slate-500">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4" style={{ backgroundColor: `${site.theme.accent}20`, color: site.theme.accent }}>{data.subtitle}</Badge>
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data.items || []).map((service: any, i: number) => (
            <Card key={i} className="p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <h3 className="mb-2 text-lg font-bold">{service.title}</h3>
              <p className="text-sm text-slate-500">{service.desc}</p>
              {service.price && <p className="mt-3 text-xl font-bold" style={{ color: site.theme.primary }}>{service.price}</p>}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection({ data, site }: { data: any; site: SiteConfig }) {
  const images = data.images || [];
  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          {data.subtitle && <Badge className="mb-4" style={{ backgroundColor: `${site.theme.primary}20`, color: site.theme.primary }}>{data.subtitle}</Badge>}
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        <div className={`grid gap-4 ${images.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {images.map((img: any, i: number) => (
            <div key={i} className="group relative overflow-hidden rounded-xl shadow-md">
              <img src={img.url} alt={img.caption || ""} className="aspect-video w-full object-cover transition-transform group-hover:scale-105" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4">
                  <p className="text-sm font-medium text-white">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          {data.subtitle && <Badge className="mb-4" style={{ backgroundColor: `${site.theme.primary}20`, color: site.theme.primary }}>{data.subtitle}</Badge>}
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {(data.items || []).map((item: any, i: number) => (
            <Card key={i} className="p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-600 mb-4 italic">"{item.text}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: site.theme.primary }}>
                  {item.name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h2 className="mb-4 text-4xl font-bold">{data.title}</h2>
          <p className="mb-12 text-xl text-slate-400">{data.subtitle}</p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.phone && (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900" style={{ color: site.theme.primary }}>
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase">Phone</div>
                  <div className="font-bold">{data.phone}</div>
                </div>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900" style={{ color: site.theme.primary }}>
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase">Email</div>
                  <div className="font-bold">{data.email}</div>
                </div>
              </div>
            )}
            {data.address && (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900" style={{ color: site.theme.primary }}>
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase">Address</div>
                  <div className="font-bold">{data.address}</div>
                </div>
              </div>
            )}
            {data.enableWhatsApp && data.whatsapp && (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-green-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 uppercase">WhatsApp</div>
                  <a href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-green-400 transition-colors">Chat Now</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const sectionComponents: Record<string, React.ComponentType<{ data: any; site: SiteConfig }>> = {
  hero: HeroSection,
  stats: StatsSection,
  features: FeaturesSection,
  about: AboutSection,
  services: ServicesSection,
  gallery: GallerySection,
  testimonials: TestimonialsSection,
  contact: ContactSection,
};

export function SectionRenderer({ site }: { site: SiteConfig }) {
  const enabledSections = site.sections.filter((s) => s.enabled);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {enabledSections.map((section) => {
        const Component = sectionComponents[section.type];
        if (!Component) return null;
        return <Component key={section.id} data={section.data} site={site} />;
      })}
      <footer className="border-t border-slate-100 py-8 text-center text-slate-400">
        <div className="container mx-auto px-4 flex flex-col items-center gap-2">
          {site.logoUrl && (
            <img src={site.logoUrl} alt={site.businessName} className="h-8 w-8 rounded object-contain" />
          )}
          <p>&copy; {new Date().getFullYear()} {site.businessName}. Built with Masakhe Growth Hub.</p>
        </div>
      </footer>
    </div>
  );
}
