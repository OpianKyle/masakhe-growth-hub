import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, MessageSquare, CheckCircle2, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface SiteConfig {
  businessName: string;
  slug: string;
  photoUrl?: string;
  theme: { primary?: string; accent?: string };
  hero: { 
    title: string; 
    subtitle: string; 
    badgeText?: string; 
    ctaPrimaryText?: string; 
    ctaSecondaryText?: string 
  };
  stats: Array<{ value: string; label: string }>;
  section1: { 
    title: string; 
    subtitle: string; 
    imageUrl?: string; 
    imagePosition: 'left' | 'right';
    cards: Array<{ icon?: string; title: string; desc: string }> 
  };
  section2: { 
    title: string; 
    quote: string; 
    imageUrl?: string; 
    imagePosition: 'left' | 'right';
    bullets: Array<{ title: string; desc: string }> 
  };
  section3: { 
    title: string; 
    subtitle: string; 
    imageUrl?: string; 
    imagePosition: 'left' | 'right';
    services: Array<{ title: string; desc: string }> 
  };
  contact: { 
    title: string; 
    subtitle: string; 
    email?: string; 
    phone?: string; 
    address?: string; 
    whatsapp?: string;
    enableWhatsApp?: boolean;
  };
  social: { linkedIn?: string; facebook?: string; instagram?: string; x?: string };
}

export const SMMEWebsiteTemplate = ({ site }: { site: SiteConfig }) => {
  const primaryColor = site.theme.primary || "#16a34a"; // Default Masakhe Green

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-green-500/20 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
        
        <div className="container relative mx-auto px-4">
          <nav className="mb-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold tracking-tight">{site.businessName}</span>
            </div>
            <div className="hidden md:block">
              <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {site.hero.badgeText || "Masakhe Verified SMME"}
              </Badge>
            </div>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tighter md:text-6xl">
                {site.hero.title}
              </h1>
              <p className="mb-8 text-xl text-slate-400">
                {site.hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8">
                  {site.hero.ctaPrimaryText || "Get Started"}
                </Button>
                <Button size="lg" variant="outline" className="border-slate-800 bg-transparent text-white hover:bg-slate-900">
                  {site.hero.ctaSecondaryText || "Contact Us"}
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 shadow-2xl"
            >
              <img 
                src={site.photoUrl || "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80"} 
                alt={site.businessName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-slate-100 bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {site.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mb-1 text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 1: Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className={`grid items-center gap-16 lg:grid-cols-2 ${site.section1.imagePosition === 'left' ? '' : 'lg:flex-row-reverse'}`}>
            <div className={site.section1.imagePosition === 'left' ? 'order-1' : 'order-2'}>
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">{site.section1.subtitle}</Badge>
              <h2 className="mb-8 text-4xl font-bold tracking-tight">{site.section1.title}</h2>
              <div className="grid gap-6">
                {site.section1.cards.map((card, i) => (
                  <Card key={i} className="flex gap-4 border-none bg-slate-50 p-6 shadow-none transition-shadow hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                       <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-bold">{card.title}</h3>
                      <p className="text-slate-500">{card.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div className={`overflow-hidden rounded-2xl shadow-2xl ${site.section1.imagePosition === 'left' ? 'order-2' : 'order-1'}`}>
              <img 
                src={site.section1.imageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80"} 
                className="aspect-square w-full object-cover"
                alt="Feature"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Story/Quote */}
      {site.section2 && site.section2.title && (
        <section className="bg-slate-50 py-24">
          <div className="container mx-auto px-4">
            <div className={`grid items-center gap-16 lg:grid-cols-2 ${site.section2.imagePosition === 'left' ? '' : 'lg:flex-row-reverse'}`}>
              <div className={`overflow-hidden rounded-2xl shadow-2xl ${site.section2.imagePosition === 'left' ? 'order-1' : 'order-2'}`}>
                <img 
                  src={site.section2.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"} 
                  className="aspect-video w-full object-cover"
                  alt="Story"
                />
              </div>
              <div className={site.section2.imagePosition === 'left' ? 'order-2' : 'order-1'}>
                <h2 className="mb-6 text-4xl font-bold tracking-tight">{site.section2.title}</h2>
                <div className="mb-8 border-l-4 border-green-500 pl-6 text-2xl italic text-slate-600">
                  "{site.section2.quote}"
                </div>
                <div className="grid gap-4">
                  {site.section2.bullets.map((bullet, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <div>
                        <span className="font-bold">{bullet.title}: </span>
                        <span className="text-slate-500">{bullet.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Services */}
      {site.section3 && site.section3.title && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">{site.section3.subtitle}</Badge>
              <h2 className="text-4xl font-bold tracking-tight">{site.section3.title}</h2>
            </div>
            <div className={`grid items-center gap-16 lg:grid-cols-2 ${site.section3.imagePosition === 'left' ? '' : 'lg:flex-row-reverse'}`}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {site.section3.services.map((service, i) => (
                  <Card key={i} className="p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                    <h3 className="mb-2 text-lg font-bold">{service.title}</h3>
                    <p className="text-sm text-slate-500">{service.desc}</p>
                  </Card>
                ))}
              </div>
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src={site.section3.imageUrl || "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80"} 
                  className="aspect-square w-full object-cover"
                  alt="Services"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="bg-slate-950 py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 className="mb-4 text-4xl font-bold">{site.contact.title}</h2>
            <p className="mb-12 text-xl text-slate-400">{site.contact.subtitle}</p>
            
            <div className="grid gap-8 md:grid-cols-3">
              {site.contact.phone && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-green-500">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 uppercase">Phone</div>
                    <div className="font-bold">{site.contact.phone}</div>
                  </div>
                </div>
              )}
              {site.contact.email && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-green-500">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 uppercase">Email</div>
                    <div className="font-bold">{site.contact.email}</div>
                  </div>
                </div>
              )}
              {site.contact.address && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-green-500">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 uppercase">Address</div>
                    <div className="font-bold">{site.contact.address}</div>
                  </div>
                </div>
              )}
              {site.contact.enableWhatsApp && site.contact.whatsapp && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-green-400">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 uppercase">WhatsApp</div>
                    <a 
                      href={`https://wa.me/${site.contact.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold hover:text-green-400 transition-colors"
                    >
                      Chat Now
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <footer className="border-t border-slate-100 py-8 text-center text-slate-400">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} {site.businessName}. Built with Masakhe Growth Hub.</p>
        </div>
      </footer>
    </div>
  );
};
