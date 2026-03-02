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
              <img src={site.logoUrl} alt={site.businessName} className="h-12 max-w-[160px] rounded-lg object-contain" />
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
              <img src={site.logoUrl} alt={site.businessName} className="h-12 max-w-[160px] rounded-lg object-contain bg-white/10 backdrop-blur-sm p-1" />
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
              <img src={site.logoUrl} alt={site.businessName} className="h-12 max-w-[160px] rounded-xl object-contain bg-white/20 backdrop-blur-sm p-1" />
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

function HeroMinimal({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: site.theme.primary }} />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-5 blur-3xl" style={{ backgroundColor: site.theme.primary }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ backgroundColor: site.theme.accent }} />
      <div className="container relative mx-auto px-4">
        <nav className="mb-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.businessName} className="h-12 max-w-[160px] rounded-lg object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: site.theme.primary }}>
                <span className="text-lg font-bold text-white">{site.businessName[0]}</span>
              </div>
            )}
            <span className="text-xl font-bold text-slate-900">{site.businessName}</span>
          </div>
          {data.badgeText && (
            <Badge className="text-xs border" style={{ backgroundColor: `${site.theme.primary}10`, color: site.theme.primary, borderColor: `${site.theme.primary}30` }}>
              {data.badgeText}
            </Badge>
          )}
        </nav>
        <div className="max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 h-1.5 w-16 rounded-full" style={{ backgroundColor: site.theme.primary }} />
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-7xl">
              {data.title}
            </h1>
            <p className="mb-10 max-w-2xl text-xl text-slate-500 leading-relaxed">{data.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              {data.ctaPrimaryText && (
                <Button size="lg" className="text-white font-semibold px-8 py-6 text-base rounded-full" style={{ backgroundColor: site.theme.primary }}>
                  {data.ctaPrimaryText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              {data.ctaSecondaryText && (
                <Button size="lg" variant="outline" className="px-8 py-6 text-base rounded-full border-2" style={{ borderColor: site.theme.primary, color: site.theme.primary }}>
                  {data.ctaSecondaryText}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
        {data.backgroundImageUrl && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 overflow-hidden rounded-2xl shadow-lg">
            <img src={data.backgroundImageUrl} alt={site.businessName} className="w-full aspect-[21/9] object-cover" />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function HeroGradient({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="relative overflow-hidden text-white min-h-[580px]"
      style={{ background: `linear-gradient(160deg, ${site.theme.primary} 0%, ${site.theme.accent} 50%, ${site.theme.primary}dd 100%)` }}>
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-black/10 blur-3xl" />
      </div>
      <div className="container relative z-10 mx-auto px-4 py-8">
        <nav className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.businessName} className="h-12 max-w-[160px] rounded-xl object-contain bg-white/15 backdrop-blur-sm p-1" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm font-bold text-lg">
                {site.businessName[0]}
              </div>
            )}
            <span className="text-xl font-bold">{site.businessName}</span>
          </div>
          {data.badgeText && (
            <Badge className="bg-white/15 text-white text-xs backdrop-blur-sm border border-white/20">
              <Sparkles className="mr-1 h-3 w-3" />{data.badgeText}
            </Badge>
          )}
        </nav>
        <div className="grid items-center gap-12 pb-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight md:text-6xl">
              {data.title}
            </h1>
            <p className="mb-10 max-w-lg text-lg text-white/75 leading-relaxed">{data.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              {data.ctaPrimaryText && (
                <Button size="lg" className="bg-white font-bold px-8 py-6 text-base shadow-xl hover:bg-white/90" style={{ color: site.theme.primary }}>
                  {data.ctaPrimaryText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
              {data.ctaSecondaryText && (
                <Button size="lg" className="border-2 border-white/30 bg-transparent text-white px-8 py-6 text-base hover:bg-white/10 backdrop-blur-sm">
                  {data.ctaSecondaryText}
                </Button>
              )}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10">
              <img
                src={data.backgroundImageUrl || site.photoUrl || "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80"}
                alt={site.businessName}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            </div>
            <div className="absolute -bottom-3 -left-3 h-16 w-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: site.theme.accent }}>
              <CheckCircle2 className="h-8 w-8 text-white" />
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
    case "minimal": return <HeroMinimal data={data} site={site} />;
    case "gradient": return <HeroGradient data={data} site={site} />;
    default: return <HeroCorporate data={data} site={site} />;
  }
}

function StatsDefault({ data, site }: { data: any; site: SiteConfig }) {
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

function StatsCards({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(data.items || []).map((stat: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full" style={{ backgroundColor: site.theme.primary }} />
              <div className="text-3xl font-extrabold" style={{ color: site.theme.primary }}>{stat.value}</div>
              <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsDark({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-12" style={{ backgroundColor: site.theme.primary }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {(data.items || []).map((stat: any, i: number) => (
            <div key={i} className="text-center">
              <div className="mb-1 text-3xl font-extrabold text-white">{stat.value}</div>
              <div className="text-sm font-medium text-white/60 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ data, site }: { data: any; site: SiteConfig }) {
  const variant = data.variant || "default";
  switch (variant) {
    case "cards": return <StatsCards data={data} site={site} />;
    case "dark": return <StatsDark data={data} site={site} />;
    default: return <StatsDefault data={data} site={site} />;
  }
}

function FeaturesDefault({ data, site }: { data: any; site: SiteConfig }) {
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

function FeaturesIconGrid({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4" style={{ backgroundColor: `${site.theme.primary}15`, color: site.theme.primary }}>{data.subtitle}</Badge>
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="group rounded-2xl border border-slate-100 bg-white p-8 text-center transition-all hover:shadow-lg hover:border-slate-200">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors"
                style={{ backgroundColor: `${site.theme.primary}12` }}>
                <CheckCircle2 className="h-7 w-7" style={{ color: site.theme.primary }} />
              </div>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesNumbered({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-4" style={{ backgroundColor: `${site.theme.primary}15`, color: site.theme.primary }}>{data.subtitle}</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-12">{data.title}</h2>
          <div className="space-y-0">
            {(data.items || []).map((item: any, i: number) => (
              <div key={i} className="flex gap-6 pb-10 relative">
                {i < (data.items || []).length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-slate-200" />
                )}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold shadow-md"
                  style={{ backgroundColor: site.theme.primary }}>
                  {i + 1}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ data, site }: { data: any; site: SiteConfig }) {
  const variant = data.variant || "default";
  switch (variant) {
    case "icon-grid": return <FeaturesIconGrid data={data} site={site} />;
    case "numbered": return <FeaturesNumbered data={data} site={site} />;
    default: return <FeaturesDefault data={data} site={site} />;
  }
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

function ServicesDefault({ data, site }: { data: any; site: SiteConfig }) {
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

function ServicesBordered({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4" style={{ backgroundColor: `${site.theme.accent}15`, color: site.theme.accent }}>{data.subtitle}</Badge>
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data.items || []).map((service: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-6 border-l-4 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderLeftColor: site.theme.primary }}>
              <h3 className="mb-2 text-lg font-bold">{service.title}</h3>
              <p className="text-sm text-slate-500">{service.desc}</p>
              {service.price && <p className="mt-3 text-xl font-bold" style={{ color: site.theme.primary }}>{service.price}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesCompact({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <Badge className="mb-4" style={{ backgroundColor: `${site.theme.accent}15`, color: site.theme.accent }}>{data.subtitle}</Badge>
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {(data.items || []).map((service: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${site.theme.primary}12` }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: site.theme.primary }} />
                </div>
                <div>
                  <h3 className="font-bold">{service.title}</h3>
                  <p className="text-sm text-slate-500">{service.desc}</p>
                </div>
              </div>
              {service.price && <span className="text-lg font-bold shrink-0 ml-4" style={{ color: site.theme.primary }}>{service.price}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ data, site }: { data: any; site: SiteConfig }) {
  const variant = data.variant || "default";
  switch (variant) {
    case "bordered": return <ServicesBordered data={data} site={site} />;
    case "compact": return <ServicesCompact data={data} site={site} />;
    default: return <ServicesDefault data={data} site={site} />;
  }
}

function GalleryDefault({ data, site }: { data: any; site: SiteConfig }) {
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

function GalleryMasonry({ data, site }: { data: any; site: SiteConfig }) {
  const images = data.images || [];
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          {data.subtitle && <Badge className="mb-4" style={{ backgroundColor: `${site.theme.primary}15`, color: site.theme.primary }}>{data.subtitle}</Badge>}
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img: any, i: number) => (
            <div key={i} className={`group relative overflow-hidden rounded-2xl shadow-md ${i === 0 ? "sm:row-span-2" : ""}`}>
              <img src={img.url} alt={img.caption || ""} className={`w-full object-cover transition-transform group-hover:scale-105 ${i === 0 ? "aspect-square" : "aspect-video"}`} />
              {img.caption && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm font-semibold text-white">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryFeatured({ data, site }: { data: any; site: SiteConfig }) {
  const images = data.images || [];
  const main = images[0];
  const rest = images.slice(1);
  return (
    <section className="py-24" style={{ backgroundColor: `${site.theme.primary}06` }}>
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          {data.subtitle && <Badge className="mb-4" style={{ backgroundColor: `${site.theme.primary}15`, color: site.theme.primary }}>{data.subtitle}</Badge>}
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        {main && (
          <div className="mb-4 group relative overflow-hidden rounded-2xl shadow-lg">
            <img src={main.url} alt={main.caption || ""} className="w-full aspect-[21/9] object-cover transition-transform group-hover:scale-105" />
            {main.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 p-6">
                <p className="text-lg font-semibold text-white">{main.caption}</p>
              </div>
            )}
          </div>
        )}
        {rest.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((img: any, i: number) => (
              <div key={i} className="group relative overflow-hidden rounded-xl shadow-md">
                <img src={img.url} alt={img.caption || ""} className="aspect-video w-full object-cover transition-transform group-hover:scale-105" />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-3">
                    <p className="text-sm font-medium text-white">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function GallerySection({ data, site }: { data: any; site: SiteConfig }) {
  const variant = data.variant || "default";
  switch (variant) {
    case "masonry": return <GalleryMasonry data={data} site={site} />;
    case "featured": return <GalleryFeatured data={data} site={site} />;
    default: return <GalleryDefault data={data} site={site} />;
  }
}

function TestimonialsDefault({ data, site }: { data: any; site: SiteConfig }) {
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

function TestimonialsLargeQuote({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24" style={{ backgroundColor: `${site.theme.primary}06` }}>
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          {data.subtitle && <Badge className="mb-4" style={{ backgroundColor: `${site.theme.primary}15`, color: site.theme.primary }}>{data.subtitle}</Badge>}
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <Quote className="absolute top-6 right-6 h-10 w-10 opacity-10" style={{ color: site.theme.primary }} />
              <p className="text-lg text-slate-700 mb-6 leading-relaxed italic">"{item.text}"</p>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-white text-base font-bold"
                  style={{ backgroundColor: site.theme.primary }}>
                  {item.name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsMinimal({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-4xl font-bold tracking-tight">{data.title}</h2>
          {data.subtitle && <p className="mt-2 text-slate-500">{data.subtitle}</p>}
        </div>
        <div className="grid gap-0 divide-y divide-slate-100">
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="py-8 grid md:grid-cols-3 gap-6 items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: site.theme.primary }}>
                  {item.name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.role}</p>
                </div>
              </div>
              <p className="md:col-span-2 text-slate-600 leading-relaxed">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ data, site }: { data: any; site: SiteConfig }) {
  const variant = data.variant || "default";
  switch (variant) {
    case "large-quote": return <TestimonialsLargeQuote data={data} site={site} />;
    case "minimal": return <TestimonialsMinimal data={data} site={site} />;
    default: return <TestimonialsDefault data={data} site={site} />;
  }
}

function ContactDefault({ data, site }: { data: any; site: SiteConfig }) {
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

function ContactLight({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900">{data.title}</h2>
          <p className="mb-12 text-lg text-slate-500">{data.subtitle}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.phone && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${site.theme.primary}12`, color: site.theme.primary }}>
                  <Phone className="h-5 w-5" />
                </div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Phone</div>
                <div className="font-bold text-slate-900 text-sm">{data.phone}</div>
              </div>
            )}
            {data.email && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${site.theme.primary}12`, color: site.theme.primary }}>
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Email</div>
                <div className="font-bold text-slate-900 text-sm">{data.email}</div>
              </div>
            )}
            {data.address && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${site.theme.primary}12`, color: site.theme.primary }}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Address</div>
                <div className="font-bold text-slate-900 text-sm">{data.address}</div>
              </div>
            )}
            {data.enableWhatsApp && data.whatsapp && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="text-xs text-slate-400 uppercase font-semibold mb-1">WhatsApp</div>
                <a href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 text-sm hover:underline">Chat Now</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactGradient({ data, site }: { data: any; site: SiteConfig }) {
  return (
    <section className="py-24 text-white" style={{ background: `linear-gradient(135deg, ${site.theme.primary}, ${site.theme.accent})` }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h2 className="mb-4 text-4xl font-bold">{data.title}</h2>
          <p className="mb-12 text-xl text-white/70">{data.subtitle}</p>
          <div className="grid gap-6 md:grid-cols-2">
            {data.phone && (
              <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase font-semibold">Phone</div>
                  <div className="font-bold">{data.phone}</div>
                </div>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase font-semibold">Email</div>
                  <div className="font-bold">{data.email}</div>
                </div>
              </div>
            )}
            {data.address && (
              <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase font-semibold">Address</div>
                  <div className="font-bold">{data.address}</div>
                </div>
              </div>
            )}
            {data.enableWhatsApp && data.whatsapp && (
              <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase font-semibold">WhatsApp</div>
                  <a href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">Chat Now</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection({ data, site }: { data: any; site: SiteConfig }) {
  const variant = data.variant || "default";
  switch (variant) {
    case "light": return <ContactLight data={data} site={site} />;
    case "gradient": return <ContactGradient data={data} site={site} />;
    default: return <ContactDefault data={data} site={site} />;
  }
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
            <img src={site.logoUrl} alt={site.businessName} className="h-10 max-w-[140px] rounded object-contain" />
          )}
          <p>&copy; {new Date().getFullYear()} {site.businessName}. Built with Masakhe Growth Hub.</p>
        </div>
      </footer>
    </div>
  );
}
