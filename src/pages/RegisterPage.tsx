import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Building2, User, FileText, MapPin, Check,
  Lock, Loader2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const BG_IMAGE = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1400";

const steps = [
  { title: "Account", icon: Lock, desc: "Create your login" },
  { title: "Business Status", icon: Building2, desc: "Tell us about your business" },
  { title: "Identity", icon: User, desc: "Verify your identity" },
  { title: "Business Details", icon: FileText, desc: "Business information" },
  { title: "Contact & Location", icon: MapPin, desc: "How to reach you" },
  { title: "Confirmation", icon: Check, desc: "Review & submit" },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
  });

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

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
        popiaConsent: false,
      },
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Account created! Please log in with your new credentials.");
      navigate("/login");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  const LAST = steps.length - 1;
  const progress = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-[38%] xl:w-[42%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ backgroundImage: `url(${BG_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/88 to-blue-950/92" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <img src="/masakhe-logo.png" alt="Masakhe" className="h-9 w-9 object-contain" />
            <span className="text-2xl font-bold font-heading text-white">Masakhe</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-3">Get started today</p>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Everything your<br />business needs
            </h2>
            <p className="text-white/55 text-base leading-relaxed">
              Join thousands of South African SMMEs using Masakhe to grow, manage, and fund their businesses.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Subscribe after sign-up to unlock all features",
              "Business funding toolkit worth R50,000+",
              "Professional website builder included",
              "Full payroll & HR management",
              "Dedicated South African support team",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/25 flex-shrink-0">
                  <Check className="h-3 w-3 text-blue-300" />
                </div>
                <p className="text-white/70 text-sm">{feature}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-sm italic leading-relaxed mb-3">
              "Masakhe helped us secure R800,000 in government funding and launch our online store in one week. It's transformed our business."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">TN</div>
              <div>
                <p className="text-white text-xs font-semibold">Thandi Nkosi</p>
                <p className="text-white/40 text-xs">Owner, TN Fashion & Design, Soweto</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} Masakhe. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img src="/masakhe-logo.png" alt="Masakhe" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold font-heading text-slate-900">Masakhe</span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span className="mx-1 text-slate-300">·</span>
            <span className="font-medium text-slate-700">{steps[currentStep].title}</span>
          </div>
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium flex items-center gap-1">
            Already have an account? <span className="text-blue-600">Sign in</span>
          </Link>
        </div>

        <div className="w-full h-1 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex items-start justify-center px-8 py-10">
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
              {steps.map((step, i) => (
                <div key={step.title} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    i === currentStep
                      ? "bg-blue-600 text-white"
                      : i < currentStep
                      ? "bg-blue-50 text-blue-700"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {i < currentStep ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <step.icon className="h-3 w-3" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">Create your account</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">Create your account and subscribe to unlock all features.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
                        <Input placeholder="Your full name" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.fullName} onChange={(e) => update("fullName", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Email Address *</Label>
                        <Input type="email" placeholder="you@business.co.za" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.email} onChange={(e) => update("email", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Password *</Label>
                          <Input type="password" placeholder="Min 6 characters" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.password} onChange={(e) => update("password", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Confirm Password *</Label>
                          <Input type="password" placeholder="Repeat password" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      By continuing you agree to our{" "}
                      <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                    </p>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">Business Status</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">How would you describe your current business?</p>
                    </div>
                    <RadioGroup value={formData.businessStatus} onValueChange={(v) => update("businessStatus", v)} className="space-y-3">
                      {[
                        { value: "registered", label: "Formally registered business", desc: "I have a CIPC registration number" },
                        { value: "registering", label: "Currently registering", desc: "In the process of CIPC registration" },
                        { value: "informal", label: "Informal trader / spaza shop", desc: "Operating without formal registration" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                            formData.businessStatus === option.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <RadioGroupItem value={option.value} className="mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{option.label}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">Identity Verification</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">We need your South African ID to verify your identity and keep the platform secure.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">South African ID Number</Label>
                        <Input placeholder="e.g. 8501015800087" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white font-mono" value={formData.saId} onChange={(e) => update("saId", e.target.value)} />
                      </div>
                      {formData.businessStatus === "registered" && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">CIPC Registration Number</Label>
                          <Input placeholder="e.g. 2024/123456/07" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white font-mono" value={formData.cipcNumber} onChange={(e) => update("cipcNumber", e.target.value)} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lock className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-700">Your ID number is encrypted and stored securely. It is never shared with third parties and is used only for identity verification in compliance with POPIA.</p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">Business Details</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">Tell us about your business so we can personalise your experience.</p>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Business Name</Label>
                        <Input placeholder="Your registered business name" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.businessName} onChange={(e) => update("businessName", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Trading Name <span className="text-slate-400 font-normal">(if different)</span></Label>
                        <Input placeholder="The name customers know you by" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.tradingName} onChange={(e) => update("tradingName", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Business Type</Label>
                          <select className="mt-1.5 flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={formData.businessType} onChange={(e) => update("businessType", e.target.value)}>
                            <option>Pty Ltd</option><option>CC</option><option>Sole Proprietor</option><option>Non-Profit</option><option>Informal</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Industry Sector</Label>
                          <select className="mt-1.5 flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" value={formData.industrySector} onChange={(e) => update("industrySector", e.target.value)}>
                            <option>Retail</option><option>Manufacturing</option><option>Services</option><option>Agriculture</option><option>Food & Beverage</option><option>Technology</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Years Operating</Label>
                          <Input type="number" placeholder="0" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.yearsOperating} onChange={(e) => update("yearsOperating", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">No. of Employees</Label>
                          <Input type="number" placeholder="1" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.employeeCount} onChange={(e) => update("employeeCount", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">Contact & Location</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">How can customers and our team reach you?</p>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Phone Number</Label>
                          <Input placeholder="+27 " className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.phone} onChange={(e) => update("phone", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">WhatsApp Number</Label>
                          <Input placeholder="+27 " className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Business Email</Label>
                        <Input type="email" placeholder="info@business.co.za" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Physical Address</Label>
                        <Input placeholder="Street address, suburb, city" className="mt-1.5 h-11 bg-slate-50 border-slate-200 focus:bg-white" value={formData.physicalAddress} onChange={(e) => update("physicalAddress", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 font-heading">Almost there!</h2>
                      <p className="text-slate-500 mt-1.5 text-sm">Review your details and submit to create your account.</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Account Summary</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {[
                          { label: "Full Name", value: formData.fullName },
                          { label: "Email", value: formData.email },
                          formData.businessName && { label: "Business", value: formData.businessName },
                          formData.industrySector && { label: "Industry", value: formData.industrySector },
                          formData.phone && { label: "Phone", value: formData.phone },
                          formData.physicalAddress && { label: "Address", value: formData.physicalAddress },
                        ].filter(Boolean).map((row: any) => (
                          <div key={row.label} className="flex items-center justify-between px-4 py-3">
                            <span className="text-sm text-slate-500">{row.label}</span>
                            <span className="text-sm font-medium text-slate-900 text-right max-w-xs truncate">{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-green-50 border-t border-green-100 px-4 py-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-800">Subscription</span>
                        <span className="text-sm font-bold text-green-700">Activate after sign-up to unlock all features</span>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm text-sm"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Complete Registration <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {currentStep < LAST && (
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={prev}
                  disabled={currentStep === 0}
                  className="text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={next}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-semibold"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentStep > 0 && currentStep < LAST && (
              <p className="text-center text-xs text-slate-400 mt-4">
                You can skip optional steps and update them later from your profile.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
