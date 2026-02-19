import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SMMEWebsiteTemplate, SiteConfig } from "@/components/website/SMMEWebsiteTemplate";
import { toast } from "sonner";
import { Save, Rocket, Copy, Check } from "lucide-react";

const siteSchema = z.object({
  id: z.string().optional(),
  businessName: z.string().min(2, "Business name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase, numbers and hyphens"),
  photoUrl: z.string().optional(),
  theme: z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
  }),
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    badgeText: z.string().optional(),
    ctaPrimaryText: z.string().optional(),
    ctaSecondaryText: z.string().optional(),
  }),
  stats: z.array(z.object({ value: z.string(), label: z.string() })).length(4),
  section1: z.object({
    title: z.string(),
    subtitle: z.string(),
    imageUrl: z.string().optional(),
    imagePosition: z.enum(["left", "right"]),
    cards: z.array(z.object({ title: z.string(), desc: z.string() })).min(2).max(4),
  }),
  contact: z.object({
    title: z.string(),
    subtitle: z.string(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

const defaultValues: SiteConfig = {
  businessName: "Masakhe Solutions",
  slug: "masakhe-solutions",
  theme: { primary: "#16a34a" },
  hero: {
    title: "Empowering Local SMMEs to Grow Online",
    subtitle: "Professional digital presence for South African businesses. Fast, reliable, and compliant.",
    badgeText: "Masakhe Verified SMME",
    ctaPrimaryText: "Get a Quote",
    ctaSecondaryText: "Learn More",
  },
  stats: [
    { value: "10+", label: "Years Operating" },
    { value: "500+", label: "Happy Clients" },
    { value: "24h", label: "Response Time" },
    { value: "Yes", label: "POPIA Ready" },
  ],
  section1: {
    title: "What We Offer",
    subtitle: "Our Services",
    imagePosition: "right",
    cards: [
      { title: "Strategic Planning", desc: "Helping you map out your business growth path." },
      { title: "Digital Marketing", desc: "Reaching more customers where they spend their time." },
      { title: "Compliance Support", desc: "Ensuring your business stays ahead of regulations." },
    ],
  },
  section2: { title: "", quote: "", imagePosition: "left", bullets: [] }, // Placeholders for now
  section3: { title: "", subtitle: "", imagePosition: "right", services: [] },
  contact: {
    title: "Get In Touch",
    subtitle: "We'd love to hear from you. Reach out today.",
    email: "contact@masakhe.co.za",
    phone: "012 345 6789",
    address: "123 Business Way, Sandton, 2196",
  },
  social: {},
};

export default function WebsiteBuilder() {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const form = useForm<SiteConfig>({
    resolver: zodResolver(siteSchema),
    defaultValues,
  });

  const watchedValues = form.watch();

  const onSave = async (data: SiteConfig) => {
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id, slug: data.slug, content: data }),
      });
      const result = await res.json();
      if (result.ok) {
        if (!data.id) form.setValue("id", result.id);
        setLastSaved(new Date().toLocaleTimeString());
        toast.success("Draft saved successfully");
      }
    } catch (err) {
      toast.error("Failed to save draft");
    }
  };

  const onPublish = async () => {
    const values = form.getValues();
    if (!values.id) {
      toast.error("Save draft first before publishing");
      return;
    }
    try {
      const res = await fetch(`/api/websites/${values.id}/publish`, { method: "POST" });
      if (res.ok) {
        setPublishedUrl(`${window.location.origin}/site/${values.slug}`);
        toast.success("Website published!");
      }
    } catch (err) {
      toast.error("Failed to publish");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Left Panel: Form */}
      <div className="w-1/3 overflow-y-auto border-r bg-white p-6 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Website Builder</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={form.handleSubmit(onSave)}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button size="sm" onClick={onPublish} className="bg-green-600 hover:bg-green-700">
              <Rocket className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

        {lastSaved && <p className="mb-4 text-xs text-slate-500 text-right italic">Last saved: {lastSaved}</p>}

        {publishedUrl && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-100">
            <p className="text-sm font-medium text-green-800 mb-2">Your site is live!</p>
            <div className="flex gap-2">
              <Input value={publishedUrl} readOnly className="bg-white" />
              <Button size="icon" variant="outline" onClick={() => {
                navigator.clipboard.writeText(publishedUrl);
                toast.success("URL copied");
              }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Form {...form}>
          <form className="space-y-8">
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="mt-6 space-y-4">
                <FormField control={form.control} name="businessName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl><Input {...field} placeholder="my-business" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </TabsContent>

              <TabsContent value="hero" className="mt-6 space-y-4">
                <FormField control={form.control} name="hero.title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="hero.subtitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Subtitle</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                  </FormItem>
                )} />
              </TabsContent>

              <TabsContent value="sections" className="mt-6 space-y-4">
                <FormField control={form.control} name="section1.title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section 1 Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="section1.subtitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section 1 Badge</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="section1.imagePosition" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Side</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full rounded-md border border-input p-2 bg-white text-sm">
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>

      {/* Right Panel: Preview */}
      <div className="flex-1 overflow-y-auto bg-slate-200 p-8">
        <div className="mx-auto max-w-[1200px] overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="bg-slate-100 px-4 py-2 text-xs text-slate-400 border-b flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            Live Preview
          </div>
          <SMMEWebsiteTemplate site={watchedValues} />
        </div>
      </div>
    </div>
  );
}
