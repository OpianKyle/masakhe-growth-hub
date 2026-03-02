import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2, Landmark, FileCheck, Loader2, ArrowRight, ArrowLeft, CheckCircle2,
  ImagePlus, X,
} from "lucide-react";

interface BusinessProfile {
  business_name: string | null;
  trading_name: string | null;
  business_status: string | null;
  business_type: string | null;
  industry_sector: string | null;
  years_operating: string | null;
  employee_count: string | null;
  sa_id: string | null;
  cipc_number: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  physical_address: string | null;
  bank_name: string | null;
  account_type: string | null;
  account_number: string | null;
  branch_code: string | null;
  popia_consent: number | null;
  tax_number: string | null;
  vat_number: string | null;
  logo_url: string | null;
}

const bankOptions = [
  { label: "ABSA", value: "absa" },
  { label: "Capitec", value: "capitec" },
  { label: "FNB", value: "fnb" },
  { label: "Nedbank", value: "nedbank" },
  { label: "Standard Bank", value: "standard_bank" },
  { label: "TymeBank", value: "tymebank" },
  { label: "African Bank", value: "african_bank" },
  { label: "Investec", value: "investec" },
  { label: "Other", value: "other" },
];

const accountTypeOptions = [
  { label: "Cheque / Current", value: "cheque" },
  { label: "Savings", value: "savings" },
  { label: "Business", value: "business" },
  { label: "Transmission", value: "transmission" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          navigate("/login");
          return;
        }
        const profileRes = await fetch("/api/profile", { credentials: "include" });
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.profile) {
            setProfile(data.profile);
            if (data.profile.bank_name) setBankName(data.profile.bank_name);
            if (data.profile.account_type) setAccountType(data.profile.account_type);
            if (data.profile.account_number) setAccountNumber(data.profile.account_number);
            if (data.profile.branch_code) setBranchCode(data.profile.branch_code);
            if (data.profile.tax_number) setTaxNumber(data.profile.tax_number);
            if (data.profile.vat_number) setVatNumber(data.profile.vat_number);
            if (data.profile.popia_consent) setPopiaConsent(true);
            if (data.profile.logo_url) setLogoPreview(data.profile.logo_url);
          }
        }
      } catch {
        toast({ title: "Error", description: "Failed to load your profile.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasBanking = !!(profile?.bank_name && profile?.account_number);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 5MB.", variant: "destructive" });
      return;
    }

    if (!/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)) {
      toast({ title: "Invalid file type", description: "Use JPG, PNG, GIF, WebP, or SVG.", variant: "destructive" });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(profile?.logo_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadLogo = async (): Promise<boolean> => {
    if (!logoFile) return true;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const res = await fetch("/api/profile/logo", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return true;
    } catch {
      toast({ title: "Logo Upload Failed", description: "Could not upload your logo. You can add it later from Settings.", variant: "destructive" });
      return false;
    } finally {
      setUploadingLogo(false);
    }
  };

  const steps = [
    { key: "welcome", title: "Welcome to Masakhe", icon: Building2 },
    { key: "banking", title: "Banking & Tax", icon: Landmark },
    { key: "confirm", title: "Confirm & Get Started", icon: FileCheck },
  ];

  const currentStep = steps[step];

  const handleSubmit = async () => {
    if (step === 2) {
      if (!popiaConsent) {
        toast({ title: "Consent Required", description: "You must accept the POPIA terms to continue.", variant: "destructive" });
        return;
      }
      setSubmitting(true);
      try {
        if (logoFile) {
          await uploadLogo();
        }

        const res = await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            bankName: bankName || null,
            accountType: accountType || null,
            accountNumber: accountNumber || null,
            branchCode: branchCode || null,
            taxNumber: taxNumber || null,
            vatNumber: vatNumber || null,
            popiaConsent: true,
          }),
        });

        if (!res.ok) throw new Error("Submission failed");

        await refreshUser();

        toast({ title: "You're all set!", description: "Your onboarding is complete. Welcome to Masakhe." });
        navigate("/dashboard");
      } catch {
        toast({ title: "Error", description: "Failed to complete onboarding.", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between px-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              {currentStep && <currentStep.icon className="h-6 w-6 text-primary" />}
              <div>
                <CardTitle className="text-2xl font-bold font-heading">{currentStep?.title}</CardTitle>
                <CardDescription>
                  {step === 0 && "Let's finish setting up your account with a few more details."}
                  {step === 1 && "Add your banking and tax details for invoicing and payments (optional)."}
                  {step === 2 && "Review and confirm to get started."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 0 && (
              <div className="space-y-6">
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-5">
                  <h4 className="font-semibold text-foreground mb-3">Your Registration Details</h4>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Full Name</span>
                      <span className="font-medium text-foreground">{user?.full_name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium text-foreground">{user?.email || "—"}</span>
                    </div>
                    {profile?.business_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Business Name</span>
                        <span className="font-medium text-foreground">{profile.business_name}</span>
                      </div>
                    )}
                    {profile?.trading_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trading Name</span>
                        <span className="font-medium text-foreground">{profile.trading_name}</span>
                      </div>
                    )}
                    {profile?.business_type && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Business Type</span>
                        <span className="font-medium text-foreground capitalize">{profile.business_type}</span>
                      </div>
                    )}
                    {profile?.industry_sector && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="font-medium text-foreground capitalize">{profile.industry_sector}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium text-foreground">{profile.phone}</span>
                      </div>
                    )}
                    {profile?.physical_address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-medium text-foreground">{profile.physical_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="font-bold text-sm flex items-center gap-2 mb-3">
                    <ImagePlus className="h-4 w-4 text-primary" />
                    Business Logo <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex items-center justify-center cursor-pointer transition-colors overflow-hidden group"
                    >
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <ImagePlus className="h-6 w-6 mx-auto text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1 block">Upload</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Upload your business logo. It will appear on your invoices, published website, and dashboard.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, GIF, WebP, or SVG. Max 5MB.
                      </p>
                      {logoFile && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-foreground font-medium truncate max-w-[150px]">{logoFile.name}</span>
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  We've got your basic details from registration. Now let's add a few more things to get you fully set up.
                  You can update any of this later from your Settings page.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                {hasBanking && (
                  <div className="rounded-lg bg-sa-green/5 border border-sa-green/20 p-3 text-sm text-muted-foreground">
                    Your banking details were provided during registration. You can update them below if needed.
                  </div>
                )}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bankName" className="font-bold">Bank</Label>
                    <Select value={bankName} onValueChange={setBankName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankOptions.map(b => (
                          <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="accountType" className="font-bold">Account Type</Label>
                    <Select value={accountType} onValueChange={setAccountType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypeOptions.map(a => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="accountNumber" className="font-bold">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        placeholder="e.g. 1234567890"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="branchCode" className="font-bold">Branch Code</Label>
                      <Input
                        id="branchCode"
                        value={branchCode}
                        onChange={e => setBranchCode(e.target.value)}
                        placeholder="e.g. 250655"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-2 space-y-4">
                  <h4 className="font-semibold text-foreground text-sm">Tax Details (Optional)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="taxNumber" className="font-bold">SARS Tax Number</Label>
                      <Input
                        id="taxNumber"
                        value={taxNumber}
                        onChange={e => setTaxNumber(e.target.value)}
                        placeholder="e.g. 1234567890"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="vatNumber" className="font-bold">VAT Number</Label>
                      <Input
                        id="vatNumber"
                        value={vatNumber}
                        onChange={e => setVatNumber(e.target.value)}
                        placeholder="e.g. 4123456789"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Banking and tax details are optional but recommended for invoicing and compliance features.
                  You can always add them later from Settings.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-5 space-y-3 text-sm">
                  <h4 className="font-semibold text-foreground">Summary</h4>
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{user?.full_name || "—"}</span>
                    </div>
                    {profile?.business_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Business</span>
                        <span className="font-medium">{profile.business_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Logo</span>
                      <span className="font-medium">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-8 w-8 rounded object-contain border border-border" />
                        ) : "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Banking</span>
                      <span className="font-medium">
                        {bankName && accountNumber ? `${bankOptions.find(b => b.value === bankName)?.label || bankName} ****${accountNumber.slice(-4)}` : "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tax Number</span>
                      <span className="font-medium">{taxNumber || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <Checkbox
                    id="popiaConsent"
                    checked={popiaConsent}
                    onCheckedChange={(checked) => setPopiaConsent(checked === true)}
                  />
                  <Label htmlFor="popiaConsent" className="font-normal text-sm leading-relaxed cursor-pointer">
                    I consent to the collection, processing, and storage of my personal and business information
                    in accordance with the Protection of Personal Information Act (POPIA). I understand that my
                    data will be used to provide Masakhe platform services.
                  </Label>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep(s => Math.max(0, s - 1))}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                variant="hero"
                className="flex-1"
                disabled={submitting || uploadingLogo}
                onClick={handleSubmit}
              >
                {submitting || uploadingLogo ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Completing...</>
                ) : step < steps.length - 1 ? (
                  <><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 mr-2" />Get Started</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
