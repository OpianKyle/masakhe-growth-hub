import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Car,
  Fuel,
  Gauge,
  Calendar,
  Palette,
  Settings2,
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle,
} from "lucide-react";

interface Vehicle {
  id: string;
  website_id: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  body_type?: string;
  description?: string;
  features: string[];
  images: string[];
  status: string;
  featured: number;
}

export default function VehicleDetailPage() {
  const { slug, vehicleId } = useParams();
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await fetch(`/api/vehicles/public/detail/${vehicleId}`);
        if (!res.ok) throw new Error("Vehicle not found");
        const data = await res.json();
        setVehicle(data);
        setFormData((prev) => ({
          ...prev,
          message: `Hi, I'm interested in the ${data.year} ${data.make} ${data.model}${data.variant ? " " + data.variant : ""}. Please provide more information.`,
        }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicle();
  }, [vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !formData.name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteId: vehicle.website_id,
          vehicleId: vehicle.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          source: "vehicle_detail",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit enquiry");
      setSubmitted(true);
      toast({ title: "Enquiry sent!", description: "The dealer will be in touch shortly." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const nextImage = () => {
    if (vehicle && vehicle.images.length > 0) {
      setActiveImage((prev) => (prev + 1) % vehicle.images.length);
    }
  };

  const prevImage = () => {
    if (vehicle && vehicle.images.length > 0) {
      setActiveImage((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
          <p className="text-slate-400">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h1 className="mb-2 text-6xl font-bold text-slate-200">404</h1>
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Vehicle Not Found</h2>
        <p className="mb-8 max-w-md text-slate-500">
          This vehicle listing may have been removed or is no longer available.
        </p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to={`/site/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Showroom
          </Link>
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 0 }).format(price / 100);

  const formatMileage = (km: number) =>
    new Intl.NumberFormat("en-ZA").format(km) + " km";

  const specs = [
    { icon: Calendar, label: "Year", value: vehicle.year?.toString() },
    { icon: Gauge, label: "Mileage", value: vehicle.mileage ? formatMileage(vehicle.mileage) : null },
    { icon: Fuel, label: "Fuel Type", value: vehicle.fuel_type },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { icon: Car, label: "Body Type", value: vehicle.body_type },
    { icon: Palette, label: "Color", value: vehicle.color },
  ].filter((s) => s.value);

  const hasImages = vehicle.images && vehicle.images.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to={`/site/${slug}`}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Showroom</span>
          </Link>
          {vehicle.featured === 1 && (
            <Badge className="bg-amber-500 text-white">Featured</Badge>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-slate-200 aspect-[16/10]">
              {hasImages ? (
                <>
                  <img
                    src={vehicle.images[activeImage]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                  {vehicle.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-3 py-1 text-white text-sm">
                        {activeImage + 1} / {vehicle.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Car className="h-24 w-24" />
                </div>
              )}
            </div>

            {hasImages && vehicle.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {vehicle.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? "border-green-500" : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.variant && <span className="text-slate-500 font-normal ml-2">{vehicle.variant}</span>}
              </h1>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatPrice(vehicle.price)}</p>
            </div>

            {specs.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Specifications</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {specs.map((spec) => (
                      <div key={spec.label} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <spec.icon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">{spec.label}</p>
                          <p className="text-sm font-medium text-slate-900">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {vehicle.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">{vehicle.description}</p>
                </CardContent>
              </Card>
            )}

            {vehicle.features && vehicle.features.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Features</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {vehicle.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="shadow-lg border-green-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Interested in this vehicle?</h2>
                  <p className="text-sm text-slate-500 mb-4">Send an enquiry and we'll get back to you shortly.</p>

                  {submitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Enquiry Sent!</h3>
                      <p className="text-sm text-slate-500">
                        Thank you for your interest. The dealer will contact you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <Input
                          placeholder="Your Name *"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Your Message"
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting || !formData.name}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {submitting ? "Sending..." : "Send Enquiry"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
