import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, User, FileText, MapPin, Phone, Check, Lock, CreditCard, Shield, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const steps = [
  { title: "Account", icon: Lock },
  { title: "Business Status", icon: Building2 },
  { title: "Identity", icon: User },
  { title: "Business Details", icon: FileText },
  { title: "Contact & Location", icon: MapPin },
  { title: "Choose Plan", icon: Wallet },
  { title: "Confirmation", icon: Check },
];

const planOptions = [
  {
    code: "starter",
    name: "Starter",
    price: "R899",
    period: "/month",
    description: "Website Builder, Financial Tracking, Invoices, Compliance Score, Grant Readiness",
  },
  {
    code: "pro",
    name: "Pro",
    price: "R2,500",
    period: "/month",
    description: "Everything in Starter + Social Media Hub, Content Calendar, Analytics, Media Library",
    popular: true,
  },
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "checkout" | "card" | "processing" | "done">("idle");
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessStatus: "",
    saId: "",
    cipcNumber: "",
    businessName: "",
    tradingName: "",
    businessType: "Pty Ltd",
    industrySector: "Retail",
    yearsOperating: "",
    employeeCount: "",
    phone: "",
    whatsapp: "",
    contactEmail: "",
    physicalAddress: "",
    selectedPlan: searchParams.get("plan") || "starter",
  });

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => {
    if (currentStep === 0) {
      if (!formData.fullName || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    const result = await register({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      businessData: {
        businessName: formData.businessName,
        tradingName: formData.tradingName,
        businessStatus: formData.businessStatus,
        businessType: formData.businessType,
        industrySector: formData.industrySector,
        yearsOperating: formData.yearsOperating ? parseInt(formData.yearsOperating) : null,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : null,
        saId: formData.saId,
        cipcNumber: formData.cipcNumber,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.contactEmail || formData.email,
        physicalAddress: formData.physicalAddress,
        popiaConsent: true,
      },
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Registration successful! Setting up your subscription...");
      setPaymentStep("checkout");
      startCheckout();
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  const startCheckout = async () => {
    try {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planCode: formData.selectedPlan }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error === "You already have an active subscription") {
          toast.success("Welcome to Masakhe!");
          navigate("/dashboard");
          return;
        }
        toast.error(json.error || "Checkout failed");
        navigate("/dashboard");
        return;
      }

      setCheckoutData(json);

      if (json.mock) {
        setPaymentStep("card");
      } else if (json.formAction && json.formData) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = json.formAction;
        Object.entries(json.formData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch {
      toast.error("Failed to start checkout");
      navigate("/dashboard");
    }
  };

  const handleMockCardSubmit = async () => {
    setPaymentStep("processing");
    try {
      const res = await fetch("/api/billing/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          merchantRef: checkoutData.merchantRef,
          status: "success",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPaymentStep("done");
        toast.success("Your 14-day free trial is now active!");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(json.error || "Payment failed");
        setPaymentStep("card");
      }
    } catch {
      toast.error("Payment processing failed");
      setPaymentStep("card");
    }
  };

  if (paymentStep === "done") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-sa-green/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-sa-green" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-foreground">You're All Set!</h2>
          <p className="text-muted-foreground">
            Your account has been created and your <strong>14-day free trial</strong> of the{" "}
            <strong>{planOptions.find(p => p.code === formData.selectedPlan)?.name}</strong> plan is active.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
        </motion.div>
      </div>
    );
  }

  if (paymentStep === "processing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-bold font-heading text-foreground">Processing Payment...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we verify your card.</p>
        </motion.div>
      </div>
    );
  }

  if (paymentStep === "card" && checkoutData?.mock) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
                <span className="text-lg font-bold text-primary-foreground font-heading">M</span>
              </div>
              <span className="text-xl font-bold font-heading text-foreground">Masakhe</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Secure Checkout
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-[hsl(225,100%,29%)]/20 bg-[hsl(225,100%,29%)]/5 p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-[hsl(225,100%,29%)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[hsl(225,100%,29%)]">Demo Mode</p>
                <p className="text-sm text-muted-foreground">No real charges — this is a simulated card capture for your free trial.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-card space-y-6">
              <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Card Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Card Number</label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 1111 1111 1111"
                    className="font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Expiry</label>
                    <Input value="12/28" readOnly className="font-mono" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">CVV</label>
                    <Input value="123" readOnly className="font-mono" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground">{planOptions.find(p => p.code === formData.selectedPlan)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trial Period</span>
                  <span className="text-foreground">14 days free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Then</span>
                  <span className="font-semibold text-foreground">{planOptions.find(p => p.code === formData.selectedPlan)?.price}/month</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleMockCardSubmit}>
                <Lock className="h-4 w-4 mr-2" />
                Activate Free Trial
              </Button>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-muted-foreground hover:text-foreground text-center block mx-auto"
            >
              Skip for now — I'll subscribe later
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (paymentStep === "checkout") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-bold font-heading text-foreground">Setting Up Your Plan...</h2>
          <p className="text-sm text-muted-foreground">Preparing your {planOptions.find(p => p.code === formData.selectedPlan)?.name} trial.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <span className="text-lg font-bold text-primary-foreground font-heading">M</span>
            </div>
            <span className="text-xl font-bold font-heading text-foreground">Masakhe</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">&larr; Back to Home</Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex items-center justify-between mb-12 overflow-x-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${i <= currentStep ? "gradient-hero border-transparent" : "border-border bg-muted"}`}>
                  <step.icon className={`h-5 w-5 ${i <= currentStep ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-xs mt-2 hidden md:block ${i <= currentStep ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-6 md:w-10 mx-1 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="rounded-xl border border-border bg-card p-8 shadow-card">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Create Your Account</h2>
                  <p className="text-muted-foreground mt-2">Start with your login credentials.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input placeholder="Your full name" className="mt-1.5" value={formData.fullName} onChange={(e) => update("fullName", e.target.value)} />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input type="email" placeholder="you@business.co.za" className="mt-1.5" value={formData.email} onChange={(e) => update("email", e.target.value)} />
                  </div>
                  <div>
                    <Label>Password *</Label>
                    <Input type="password" placeholder="Min 6 characters" className="mt-1.5" value={formData.password} onChange={(e) => update("password", e.target.value)} />
                  </div>
                  <div>
                    <Label>Confirm Password *</Label>
                    <Input type="password" placeholder="Repeat your password" className="mt-1.5" value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Business Status</h2>
                  <p className="text-muted-foreground mt-2">How would you describe your business?</p>
                </div>
                <RadioGroup value={formData.businessStatus} onValueChange={(v) => update("businessStatus", v)} className="space-y-3">
                  {[
                    { value: "registered", label: "I have my business registration number", desc: "Registered with CIPC" },
                    { value: "registering", label: "I'm still registering my business", desc: "In the process of CIPC registration" },
                    { value: "informal", label: "I'm an informal trader / spaza shop", desc: "Operating without formal registration" },
                  ].map((option) => (
                    <label key={option.value} className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all ${formData.businessStatus === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <RadioGroupItem value={option.value} className="mt-1" />
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Identity Verification</h2>
                  <p className="text-muted-foreground mt-2">Verify your identity with your South African ID number.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>South African ID Number</Label>
                    <Input placeholder="e.g. 8501015800087" className="mt-1.5" value={formData.saId} onChange={(e) => update("saId", e.target.value)} />
                  </div>
                  {formData.businessStatus === "registered" && (
                    <div>
                      <Label>CIPC Registration Number</Label>
                      <Input placeholder="e.g. 2024/123456/07" className="mt-1.5" value={formData.cipcNumber} onChange={(e) => update("cipcNumber", e.target.value)} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Business Details</h2>
                  <p className="text-muted-foreground mt-2">Tell us about your business.</p>
                </div>
                <div className="grid gap-4">
                  <div>
                    <Label>Business Name</Label>
                    <Input placeholder="Your registered business name" className="mt-1.5" value={formData.businessName} onChange={(e) => update("businessName", e.target.value)} />
                  </div>
                  <div>
                    <Label>Trading Name (if different)</Label>
                    <Input placeholder="The name customers know you by" className="mt-1.5" value={formData.tradingName} onChange={(e) => update("tradingName", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Business Type</Label>
                      <select className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.businessType} onChange={(e) => update("businessType", e.target.value)}>
                        <option>Pty Ltd</option><option>CC</option><option>Sole Proprietor</option><option>Non-Profit</option><option>Informal</option>
                      </select>
                    </div>
                    <div>
                      <Label>Industry Sector</Label>
                      <select className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.industrySector} onChange={(e) => update("industrySector", e.target.value)}>
                        <option>Retail</option><option>Manufacturing</option><option>Services</option><option>Agriculture</option><option>Food & Beverage</option><option>Technology</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Years Operating</Label>
                      <Input type="number" placeholder="0" className="mt-1.5" value={formData.yearsOperating} onChange={(e) => update("yearsOperating", e.target.value)} />
                    </div>
                    <div>
                      <Label>Number of Employees</Label>
                      <Input type="number" placeholder="1" className="mt-1.5" value={formData.employeeCount} onChange={(e) => update("employeeCount", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Contact & Location</h2>
                  <p className="text-muted-foreground mt-2">How can customers find and reach you?</p>
                </div>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input placeholder="+27 " className="mt-1.5" value={formData.phone} onChange={(e) => update("phone", e.target.value)} />
                    </div>
                    <div>
                      <Label>WhatsApp Number</Label>
                      <Input placeholder="+27 " className="mt-1.5" value={formData.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Business Email</Label>
                    <Input type="email" placeholder="info@business.co.za" className="mt-1.5" value={formData.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
                  </div>
                  <div>
                    <Label>Physical Address</Label>
                    <Input placeholder="Street address, suburb, city" className="mt-1.5" value={formData.physicalAddress} onChange={(e) => update("physicalAddress", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Choose Your Plan</h2>
                  <p className="text-muted-foreground mt-2">Start with a 14-day free trial. Cancel anytime.</p>
                </div>
                <RadioGroup value={formData.selectedPlan} onValueChange={(v) => update("selectedPlan", v)} className="space-y-4">
                  {planOptions.map((plan) => (
                    <label
                      key={plan.code}
                      className={`relative flex items-start gap-4 rounded-xl border p-5 cursor-pointer transition-all ${
                        formData.selectedPlan === plan.code
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <RadioGroupItem value={plan.code} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg font-heading text-foreground">{plan.name}</p>
                          {plan.popular && (
                            <span className="gradient-gold text-sa-black text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>
                          )}
                        </div>
                        <p className="text-2xl font-bold font-heading text-foreground mt-1">
                          {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 inline mr-1 text-primary" />
                  Your 14-day trial is completely free. Card details are captured for verification only — you won't be charged until the trial ends.
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-hero">
                  <Check className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Ready to Go!</h2>
                  <p className="text-muted-foreground mt-2">Review your details and complete your registration.</p>
                </div>
                <div className="text-left rounded-lg border border-border p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{formData.fullName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{formData.email}</span></div>
                  {formData.businessName && <div className="flex justify-between"><span className="text-muted-foreground">Business</span><span className="font-medium">{formData.businessName}</span></div>}
                  {formData.industrySector && <div className="flex justify-between"><span className="text-muted-foreground">Industry</span><span className="font-medium">{formData.industrySector}</span></div>}
                  {formData.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{formData.phone}</span></div>}
                  <div className="border-t border-border my-2 pt-2" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium text-primary">{planOptions.find(p => p.code === formData.selectedPlan)?.name} — {planOptions.find(p => p.code === formData.selectedPlan)?.price}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trial</span>
                    <span className="font-medium text-sa-green">14 days free</span>
                  </div>
                </div>
                <Button variant="hero" size="lg" className="mt-4 w-full" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Complete Registration <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentStep < 6 && (
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={prev} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="hero" onClick={next}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
