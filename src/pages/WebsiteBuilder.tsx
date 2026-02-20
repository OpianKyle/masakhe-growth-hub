import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SMMEWebsiteTemplate, SiteConfig } from "@/components/website/SMMEWebsiteTemplate";
import { ImageUploadField } from "@/components/website/ImageUploadField";
import { toast } from "sonner";
import { Save, Rocket, Copy, Plus, Trash2, Wand2, Smartphone } from "lucide-react";

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
    ctaPrimaryAction: z.enum(["whatsapp", "contact", "link"]).optional(),
    ctaPrimaryLink: z.string().optional(),
    ctaSecondaryText: z.string().optional(),
    ctaSecondaryAction: z.enum(["contact", "link"]).optional(),
    ctaSecondaryLink: z.string().optional(),
  }),
  stats: z.array(z.object({ value: z.string(), label: z.string() })).length(4),
  section1: z.object({
    title: z.string(),
    subtitle: z.string(),
    imageUrl: z.string().optional(),
    imagePosition: z.enum(["left", "right"]),
    cards: z.array(z.object({ title: z.string(), desc: z.string() })).min(2).max(4),
  }),
  section2: z.object({
    title: z.string(),
    quote: z.string(),
    imageUrl: z.string().optional(),
    imagePosition: z.enum(["left", "right"]),
    bullets: z.array(z.object({ title: z.string(), desc: z.string() })).min(2).max(6),
  }),
  section3: z.object({
    title: z.string(),
    subtitle: z.string(),
    imageUrl: z.string().optional(),
    imagePosition: z.enum(["left", "right"]),
    services: z.array(z.object({ title: z.string(), desc: z.string() })).min(3).max(9),
  }),
  contact: z.object({
    title: z.string(),
    subtitle: z.string(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    whatsapp: z.string().optional(),
    enableWhatsApp: z.boolean().optional(),
  }),
  social: z.object({
    linkedIn: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    x: z.string().optional(),
  }),
});

const defaultValues: SiteConfig = {
  businessName: "Masakhe Solutions",
  slug: "masakhe-solutions",
  theme: { primary: "#16a34a", accent: "#2563eb" },
  hero: {
    title: "Empowering Local SMMEs to Grow Online",
    subtitle: "Professional digital presence for South African businesses. Fast, reliable, and compliant.",
    badgeText: "Masakhe Verified SMME",
    ctaPrimaryText: "Get a Quote",
    ctaPrimaryAction: "contact",
    ctaSecondaryText: "WhatsApp Us",
    ctaSecondaryAction: "whatsapp",
  },
  stats: [
    { value: "10+", label: "Years Operating" },
    { value: "500+", label: "Happy Clients" },
    { value: "24h", label: "Response Time" },
    { value: "Yes", label: "POPIA Ready" },
  ],
  section1: {
    title: "What We Offer",
    subtitle: "Our Expertise",
    imagePosition: "right",
    cards: [
      { title: "Strategic Planning", desc: "Helping you map out your business growth path." },
      { title: "Digital Marketing", desc: "Reaching more customers where they spend their time." },
      { title: "Compliance Support", desc: "Ensuring your business stays ahead of regulations." },
    ],
  },
  section2: {
    title: "Our Story",
    quote: "We believe in the power of South African small businesses to transform communities.",
    imagePosition: "left",
    bullets: [
      { title: "Locally Based", desc: "We understand the unique challenges of the SA market." },
      { title: "Expert Team", desc: "Decades of combined experience in business consulting." },
    ],
  },
  section3: {
    title: "Featured Services",
    subtitle: "Comprehensive Solutions",
    imagePosition: "right",
    services: [
      { title: "Business Registration", desc: "Fast tracking your CIPC registration process." },
      { title: "Tax Compliance", desc: "Keeping your SARS status green and worry-free." },
      { title: "Web Presence", desc: "Building sites that actually convert visitors to clients." },
    ],
  },
  contact: {
    title: "Get In Touch",
    subtitle: "We'd love to hear from you. Reach out today.",
    email: "contact@masakhe.co.za",
    phone: "012 345 6789",
    address: "123 Business Way, Sandton, 2196",
    whatsapp: "+27 12 345 6789",
    enableWhatsApp: true,
  },
  social: {},
};

export default function WebsiteBuilder() {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);

  const form = useForm<SiteConfig>({
    resolver: zodResolver(siteSchema),
    defaultValues,
  });

  const { fields: statFields } = useFieldArray({ control: form.control, name: "stats" });
  const { fields: cardFields, append: appendCard, remove: removeCard } = useFieldArray({ control: form.control, name: "section1.cards" });
  const { fields: bulletFields, append: appendBullet, remove: removeBullet } = useFieldArray({ control: form.control, name: "section2.bullets" });
  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({ control: form.control, name: "section3.services" });

  const watchedValues = form.watch();

  const autoGenerateSlug = () => {
    const name = form.getValues("businessName");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
  };

  const onSave = async (data: SiteConfig) => {
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id, slug: data.slug, content: data }),
      });
      const result = await res.json();
      if (res.ok) {
        if (!data.id) form.setValue("id", result.id);
        setLastSaved(new Date().toLocaleTimeString());
        toast.success("Draft saved successfully");
      } else {
        toast.error(result.error || "Failed to save draft");
      }
    } catch (err) {
      toast.error("Network error saving draft");
    }
  };

  const onPublish = async () => {
    const values = form.getValues();
    // First save
    await onSave(values);
    const updatedValues = form.getValues();
    if (!updatedValues.id) return;

    try {
      const res = await fetch(`/api/websites/${updatedValues.id}/publish`, { method: "POST" });
      if (res.ok) {
        setPublishedUrl(`${window.location.origin}/site/${updatedValues.slug}`);
        toast.success("Website published!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to publish");
      }
    } catch (err) {
      toast.error("Failed to publish");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* Left Panel: Form */}
      <div className="w-[450px] overflow-y-auto border-r bg-white p-6 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Edit Site</h2>
            <p className="text-xs text-slate-500">Changes update preview instantly</p>
          </div>
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
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <p className="text-xs font-bold text-green-800 mb-2 uppercase tracking-tight">Public URL</p>
              <div className="flex gap-2">
                <Input value={publishedUrl} readOnly className="bg-white text-xs" />
                <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => {
                  navigator.clipboard.writeText(publishedUrl);
                  toast.success("URL copied");
                }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form className="space-y-8">
            <Tabs defaultValue="general">
              <div className="sticky top-0 z-10 bg-white pb-2">
                <TabsList className="grid grid-cols-4 gap-1 h-auto p-1 bg-slate-100 flex-wrap">
                  <TabsTrigger value="general" className="text-xs px-2 py-1.5">General</TabsTrigger>
                  <TabsTrigger value="hero" className="text-xs px-2 py-1.5">Hero</TabsTrigger>
                  <TabsTrigger value="stats" className="text-xs px-2 py-1.5">Stats</TabsTrigger>
                  <TabsTrigger value="sec1" className="text-xs px-2 py-1.5">S1</TabsTrigger>
                  <TabsTrigger value="sec2" className="text-xs px-2 py-1.5">S2</TabsTrigger>
                  <TabsTrigger value="sec3" className="text-xs px-2 py-1.5">S3</TabsTrigger>
                  <TabsTrigger value="contact" className="text-xs px-2 py-1.5">Contact</TabsTrigger>
                  <TabsTrigger value="social" className="text-xs px-2 py-1.5">Social</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="general" className="mt-4 space-y-4">
                <FormField control={form.control} name="businessName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>URL Slug</FormLabel>
                      <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-blue-600" onClick={autoGenerateSlug}>
                        <Wand2 className="mr-1 h-3 w-3" /> Auto-gen
                      </Button>
                    </div>
                    <FormControl><Input {...field} placeholder="my-business-name" /></FormControl>
                    <FormDescription className="text-[10px]">Letters, numbers, and hyphens only.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="theme.primary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl><div className="flex gap-2"><Input type="color" {...field} className="h-10 w-10 p-1" /><Input {...field} className="flex-1" /></div></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="theme.accent" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <FormControl><div className="flex gap-2"><Input type="color" {...field} className="h-10 w-10 p-1" /><Input {...field} className="flex-1" /></div></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="photoUrl" render={({ field }) => (
                  <FormItem>
                    <ImageUploadField value={field.value} onChange={field.onChange} label="Business Main Photo" />
                  </FormItem>
                )} />
              </TabsContent>

              <TabsContent value="hero" className="mt-4 space-y-4">
                <FormField control={form.control} name="hero.badgeText" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Label</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="hero.title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Heading</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="hero.subtitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-heading</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-4">
                    <FormLabel className="text-xs font-bold uppercase">Primary CTA</FormLabel>
                    <FormField control={form.control} name="hero.ctaPrimaryText" render={({ field }) => (
                      <FormControl><Input {...field} placeholder="Button Text" /></FormControl>
                    )} />
                    <FormField control={form.control} name="hero.ctaPrimaryAction" render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="contact">Contact Section</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="link">External Link</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="space-y-4">
                    <FormLabel className="text-xs font-bold uppercase">Secondary CTA</FormLabel>
                    <FormField control={form.control} name="hero.ctaSecondaryText" render={({ field }) => (
                      <FormControl><Input {...field} placeholder="Button Text" /></FormControl>
                    )} />
                    <FormField control={form.control} name="hero.ctaSecondaryAction" render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="contact">Contact Section</SelectItem>
                          <SelectItem value="link">External Link</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-4 space-y-4">
                <p className="text-xs text-slate-500 mb-4">Display 4 key metrics about your business.</p>
                {statFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-slate-50">
                    <FormField control={form.control} name={`stats.${index}.value`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px]">Value (e.g. 10+)</FormLabel>
                        <FormControl><Input {...field} className="h-8 text-sm" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`stats.${index}.label`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px]">Label (e.g. Years)</FormLabel>
                        <FormControl><Input {...field} className="h-8 text-sm" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="sec1" className="mt-4 space-y-4">
                <FormField control={form.control} name="section1.title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="section1.subtitle" render={({ field }) => (
                  <FormItem><FormLabel>Badge</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="section1.imageUrl" render={({ field }) => (
                  <ImageUploadField value={field.value} onChange={field.onChange} label="Section Image" />
                )} />
                <FormField control={form.control} name="section1.imagePosition" render={({ field }) => (
                   <FormItem>
                    <FormLabel>Image Side</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-bold">Cards (2-4)</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendCard({ title: "New Card", desc: "Description" })} disabled={cardFields.length >= 4}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {cardFields.map((field, index) => (
                    <Card key={field.id} className="relative group">
                      <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeCard(index)} disabled={cardFields.length <= 2}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <CardContent className="p-3 space-y-2">
                        <Input {...form.register(`section1.cards.${index}.title`)} placeholder="Card Title" className="h-8 text-sm" />
                        <Textarea {...form.register(`section1.cards.${index}.desc`)} placeholder="Description" className="h-16 text-xs" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sec2" className="mt-4 space-y-4">
                 <FormField control={form.control} name="section2.title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="section2.quote" render={({ field }) => (
                  <FormItem><FormLabel>Featured Quote</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="section2.imageUrl" render={({ field }) => (
                  <ImageUploadField value={field.value} onChange={field.onChange} label="Section Image" />
                )} />
                 <FormField control={form.control} name="section2.imagePosition" render={({ field }) => (
                   <FormItem>
                    <FormLabel>Image Side</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-bold">Bullets (2-6)</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendBullet({ title: "New Bullet", desc: "Description" })} disabled={bulletFields.length >= 6}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {bulletFields.map((field, index) => (
                    <Card key={field.id} className="relative group">
                      <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeBullet(index)} disabled={bulletFields.length <= 2}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <CardContent className="p-3 space-y-2">
                        <Input {...form.register(`section2.bullets.${index}.title`)} placeholder="Title" className="h-8 text-sm" />
                        <Input {...form.register(`section2.bullets.${index}.desc`)} placeholder="Description" className="h-8 text-xs" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sec3" className="mt-4 space-y-4">
                <FormField control={form.control} name="section3.title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="section3.subtitle" render={({ field }) => (
                  <FormItem><FormLabel>Badge</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="section3.imageUrl" render={({ field }) => (
                  <ImageUploadField value={field.value} onChange={field.onChange} label="Section Image" />
                )} />
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-bold">Services (3-9)</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendService({ title: "New Service", desc: "Description" })} disabled={serviceFields.length >= 9}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {serviceFields.map((field, index) => (
                    <Card key={field.id} className="relative group">
                      <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeService(index)} disabled={serviceFields.length <= 3}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <CardContent className="p-3 space-y-2">
                        <Input {...form.register(`section3.services.${index}.title`)} placeholder="Service Title" className="h-8 text-sm" />
                        <Textarea {...form.register(`section3.services.${index}.desc`)} placeholder="Description" className="h-12 text-xs" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-4 space-y-4">
                <FormField control={form.control} name="contact.title" render={({ field }) => (
                  <FormItem><FormLabel>Contact Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="contact.subtitle" render={({ field }) => (
                  <FormItem><FormLabel>Contact Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="contact.email" render={({ field }) => (
                  <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contact.phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="contact.address" render={({ field }) => (
                  <FormItem><FormLabel>Physical Address</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
                )} />
                <div className="space-y-4 pt-4 border-t">
                  <FormField control={form.control} name="contact.enableWhatsApp" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Enable WhatsApp</FormLabel>
                        <FormDescription className="text-xs">Direct chat button for customers</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  {watchedValues.contact.enableWhatsApp && (
                    <FormField control={form.control} name="contact.whatsapp" render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl><Input {...field} placeholder="+27..." /></FormControl>
                      </FormItem>
                    )} />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="social" className="mt-4 space-y-4">
                <FormField control={form.control} name="social.facebook" render={({ field }) => (
                  <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="social.instagram" render={({ field }) => (
                  <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="social.linkedIn" render={({ field }) => (
                  <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="social.x" render={({ field }) => (
                  <FormItem><FormLabel>X (Twitter) URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>

      {/* Right Panel: Preview */}
      <div className="flex-1 overflow-y-auto bg-slate-200 p-8">
        <div className="sticky top-0 mb-4 flex justify-center gap-2">
          <Button variant={isPreviewMobile ? "ghost" : "secondary"} size="sm" onClick={() => setIsPreviewMobile(false)}>Desktop View</Button>
          <Button variant={isPreviewMobile ? "secondary" : "ghost"} size="sm" onClick={() => setIsPreviewMobile(true)}><Smartphone className="mr-2 h-4 w-4" />Mobile View</Button>
        </div>
        <div className={`mx-auto transition-all duration-300 overflow-hidden rounded-xl bg-white shadow-2xl ${isPreviewMobile ? 'max-w-[375px]' : 'max-w-[1200px]'}`}>
          <div className="bg-slate-100 px-4 py-2 text-xs text-slate-400 border-b flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="font-mono">preview: /site/{watchedValues.slug}</span>
            <div className="w-12" />
          </div>
          <SMMEWebsiteTemplate site={watchedValues} />
        </div>
      </div>
    </div>
  );
}
