import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, User, FileText, MapPin, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "react-router-dom";

const steps = [
  { title: "Business Status", icon: Building2 },
  { title: "Identity Verification", icon: User },
  { title: "Business Details", icon: FileText },
  { title: "Contact & Location", icon: MapPin },
  { title: "Confirmation", icon: Check },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [businessStatus, setBusinessStatus] = useState("");

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <span className="text-lg font-bold text-primary-foreground font-heading">M</span>
            </div>
            <span className="text-xl font-bold font-heading text-foreground">Masakhe</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Home</Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    i <= currentStep
                      ? "gradient-hero border-transparent"
                      : "border-border bg-muted"
                  }`}
                >
                  <step.icon className={`h-5 w-5 ${i <= currentStep ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-xs mt-2 hidden md:block ${i <= currentStep ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 md:w-16 mx-2 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border bg-card p-8 shadow-card"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Welcome to Masakhe</h2>
                  <p className="text-muted-foreground mt-2">Let&apos;s get your business digitally enabled. How would you describe your business status?</p>
                </div>
                <RadioGroup value={businessStatus} onValueChange={setBusinessStatus} className="space-y-3">
                  {[
                    { value: "registered", label: "I have my business registration number", desc: "Registered with CIPC" },
                    { value: "registering", label: "I'm still registering my business", desc: "In the process of CIPC registration" },
                    { value: "informal", label: "I'm an informal trader / spaza shop", desc: "Operating without formal registration" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
                        businessStatus === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
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

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Identity Verification</h2>
                  <p className="text-muted-foreground mt-2">Verify your identity with your South African ID number.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>South African ID Number</Label>
                    <Input placeholder="e.g. 8501015800087" className="mt-1.5" />
                  </div>
                  <Button variant="outline" className="w-full">
                    <User className="mr-2 h-4 w-4" /> Verify with Home Affairs
                  </Button>
                  {businessStatus === "registered" && (
                    <div>
                      <Label>CIPC Registration Number</Label>
                      <Input placeholder="e.g. 2024/123456/07" className="mt-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">We&apos;ll auto-fill your business details from CIPC</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Business Details</h2>
                  <p className="text-muted-foreground mt-2">Tell us about your business so we can set everything up.</p>
                </div>
                <div className="grid gap-4">
                  <div>
                    <Label>Business Name</Label>
                    <Input placeholder="Your registered business name" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Trading Name (if different)</Label>
                    <Input placeholder="The name customers know you by" className="mt-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Business Type</Label>
                      <select className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>Pty Ltd</option>
                        <option>CC</option>
                        <option>Sole Proprietor</option>
                        <option>Non-Profit</option>
                        <option>Informal</option>
                      </select>
                    </div>
                    <div>
                      <Label>Industry Sector</Label>
                      <select className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>Retail</option>
                        <option>Manufacturing</option>
                        <option>Services</option>
                        <option>Agriculture</option>
                        <option>Food & Beverage</option>
                        <option>Technology</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Years Operating</Label>
                      <Input type="number" placeholder="0" className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Number of Employees</Label>
                      <Input type="number" placeholder="1" className="mt-1.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Contact & Location</h2>
                  <p className="text-muted-foreground mt-2">How can customers find and reach you?</p>
                </div>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input placeholder="+27 " className="mt-1.5" />
                    </div>
                    <div>
                      <Label>WhatsApp Number</Label>
                      <Input placeholder="+27 " className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="you@business.co.za" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Physical Address</Label>
                    <Input placeholder="Street address, suburb, city" className="mt-1.5" />
                  </div>
                  <Button variant="outline" className="w-full">
                    <MapPin className="mr-2 h-4 w-4" /> Use My Current Location
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-hero">
                  <Check className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-foreground">You&apos;re All Set!</h2>
                  <p className="text-muted-foreground mt-2">
                    Your Masakhe profile is ready. Let&apos;s build your digital presence.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left">
                  {[
                    { label: "AI Website Builder", desc: "Create your website in 60 seconds" },
                    { label: "Social Media Launch", desc: "Set up your social presence" },
                    { label: "Tax Compliance", desc: "Connect to SARS eFiling" },
                    { label: "Campaign Builder", desc: "Start advertising your business" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border p-4 hover:shadow-card transition-shadow cursor-pointer">
                      <p className="font-semibold text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <Link to="/dashboard">
                  <Button variant="hero" size="lg" className="mt-4">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
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
