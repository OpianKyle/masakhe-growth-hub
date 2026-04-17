import React, { useRef, useState } from "react";
import { Check, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  onActivated: () => void;
}

const PACKAGES = [
  {
    tier: "affiliate",
    label: "Affiliate",
    price: "Free",
    priceNote: "No upfront cost",
    priceCents: 0,
    recommended: false,
    description: "Start earning referral commissions immediately with zero investment.",
    features: [
      "Unique referral link",
      "20% direct commissions",
      "Basic marketing materials",
      "Partner dashboard access",
    ],
    btnLabel: "Join Free",
    btnVariant: "outline" as const,
  },
  {
    tier: "reseller",
    label: "Reseller",
    price: "R999",
    priceNote: "Once-off setup",
    priceCents: 99900,
    recommended: true,
    description: "Connect your own domain and brand. Sell Masakhe under your own identity.",
    features: [
      "Everything in Affiliate",
      "Custom domain setup",
      "Branded client portal",
      "Level 2-3 commissions",
      "Dedicated support line",
      "Client management portal",
    ],
    btnLabel: "Become a Reseller",
    btnVariant: "default" as const,
  },
  {
    tier: "master",
    label: "Master Reseller",
    price: "R4,999",
    priceNote: "Once-off setup",
    priceCents: 499900,
    recommended: false,
    description: "Recruit your own resellers. Earn overrides on your entire sub-network.",
    features: [
      "Everything in Reseller",
      "Recruit & manage resellers",
      "All 5 commission levels",
      "Binary bonus unlocked",
      "Revenue share pool",
      "Co-branded marketing fund",
    ],
    btnLabel: "Go Master Reseller",
    btnVariant: "outline" as const,
  },
];

export default function PartnerPackage({ onActivated }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentData, setPaymentData] = useState<{ formAction: string; fields: Record<string, string> } | null>(null);

  React.useEffect(() => {
    if (paymentData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData]);

  async function handleSelect(tier: string) {
    if (loading) return;
    setLoading(tier);
    try {
      if (tier === "affiliate") {
        const res = await fetch("/api/reseller/billing/select-free", {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to activate");
        toast.success("Welcome to the Partner Programme!");
        onActivated();
      } else {
        const res = await fetch("/api/reseller/billing/checkout", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier,
            recipientName: user?.full_name,
            email: user?.email,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create payment session");
        setPaymentData({ formAction: data.formAction, fields: data.fields });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-full bg-[#0a1628] flex flex-col items-center justify-center px-4 py-16">
      {/* Hidden Adumo form */}
      {paymentData && (
        <form ref={formRef} action={paymentData.formAction} method="POST" className="hidden">
          {Object.entries(paymentData.fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-400 mb-3">Partner Package</h1>
        <p className="text-white/60 text-base max-w-md mx-auto leading-relaxed">
          Pick the package that matches your ambition. Upgrade anytime as your network grows.
        </p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.tier}
            className={`relative rounded-2xl p-7 flex flex-col ${
              pkg.recommended
                ? "bg-[#0f2a1a] border-2 border-green-500 shadow-2xl"
                : "bg-[#111827] border border-white/10"
            }`}
          >
            {pkg.recommended && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-white" /> Recommended
                </span>
              </div>
            )}

            <h2 className="text-white text-xl font-bold mb-1">{pkg.label}</h2>

            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-3xl font-extrabold ${pkg.priceCents === 0 ? "text-white/40" : "text-green-400"}`}>
                {pkg.price}
              </span>
              <span className="text-white/40 text-sm">{pkg.priceNote}</span>
            </div>

            <p className="text-white/50 text-sm mb-5 leading-relaxed">{pkg.description}</p>

            <ul className="space-y-2.5 mb-8 flex-1">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSelect(pkg.tier)}
              disabled={loading !== null}
              className={`w-full h-11 font-semibold text-sm ${
                pkg.recommended
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-transparent border border-white/20 text-white hover:bg-white/10"
              }`}
            >
              {loading === pkg.tier ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                pkg.btnLabel
              )}
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-10 text-white/25 text-xs text-center">
        Once-off fees are processed securely via Adumo Online. No recurring charges.
      </p>
    </div>
  );
}
