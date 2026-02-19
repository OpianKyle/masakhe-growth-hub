import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SMMEWebsiteTemplate, SiteConfig } from "@/components/website/SMMEWebsiteTemplate";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublishedSite() {
  const { slug } = useParams();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSite() {
      try {
        const res = await fetch(`/api/websites/${slug}`);
        if (!res.ok) throw new Error("Site not found");
        const data = await res.json();
        setConfig(data.content);
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

  return <SMMEWebsiteTemplate site={config} />;
}
