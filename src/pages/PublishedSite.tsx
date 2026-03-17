import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SectionRenderer } from "@/components/website/SectionRenderer";
import { SiteConfig } from "@/types/site";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function migrateLegacyConfig(raw: any): SiteConfig {
  if (raw.sections && Array.isArray(raw.sections)) return raw as SiteConfig;

  const sections: SiteConfig["sections"] = [];
  let id = 1;
  if (raw.hero) sections.push({ id: `legacy_${id++}`, type: "hero", enabled: true, data: raw.hero });
  if (raw.stats) sections.push({ id: `legacy_${id++}`, type: "stats", enabled: true, data: { items: raw.stats } });
  if (raw.section1) sections.push({ id: `legacy_${id++}`, type: "features", enabled: true, data: { title: raw.section1.title, subtitle: raw.section1.subtitle, imageUrl: raw.section1.imageUrl, imagePosition: raw.section1.imagePosition, items: raw.section1.cards } });
  if (raw.section2) sections.push({ id: `legacy_${id++}`, type: "about", enabled: true, data: { title: raw.section2.title, quote: raw.section2.quote, imageUrl: raw.section2.imageUrl, imagePosition: raw.section2.imagePosition, items: raw.section2.bullets } });
  if (raw.section3) sections.push({ id: `legacy_${id++}`, type: "services", enabled: true, data: { title: raw.section3.title, subtitle: raw.section3.subtitle, imageUrl: raw.section3.imageUrl, items: raw.section3.services } });
  if (raw.contact) sections.push({ id: `legacy_${id++}`, type: "contact", enabled: true, data: raw.contact });

  return {
    businessName: raw.businessName || "Business",
    slug: raw.slug || "",
    templateId: "professional",
    theme: raw.theme || { primary: "#2563eb", accent: "#16a34a" },
    social: raw.social || {},
    sections,
  };
}

export default function PublishedSite({ slugOverride }: { slugOverride?: string } = {}) {
  const params = useParams();
  const slug = slugOverride || params.slug;
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSite() {
      try {
        const res = await fetch(`/api/websites/${slug}`);
        if (!res.ok) throw new Error("Site not found");
        const data = await res.json();
        setConfig(migrateLegacyConfig(data.content));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSite();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
          <p className="text-slate-400">Loading website...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h1 className="mb-2 text-6xl font-bold text-slate-200">404</h1>
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Website Not Found</h2>
        <p className="mb-8 max-w-md text-slate-500">
          The website you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Masakhe
          </Link>
        </Button>
      </div>
    );
  }

  return <SectionRenderer site={config} />;
}
