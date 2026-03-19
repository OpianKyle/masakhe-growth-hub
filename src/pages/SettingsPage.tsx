import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Camera, Trash2, Save, Building2, User, CreditCard, MapPin, Phone, Mail, Briefcase, Upload, ServerCog, Send, CheckCircle2, AlertCircle, Shield, FileText, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const initialTab = searchParams.get("tab") === "docs" ? "docs" : "profile";
  const [activeTab, setActiveTab] = useState<"profile" | "business" | "banking" | "email" | "docs">(initialTab as any);

  interface ComplianceDoc { id: string; docType: string; fileName: string; fileSize: number; uploadedAt: string; }
  interface ComplianceStatus { ficaUploaded: boolean; businessRegUploaded: boolean; allUploaded: boolean; daysLeft: number; gracePeriodExpired: boolean; isBlocked: boolean; docs: ComplianceDoc[]; }
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const fetchCompliance = useCallback(async () => {
    try {
      const res = await fetch("/api/fica-docs/status", { credentials: "include" });
      if (res.ok) setComplianceStatus(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchCompliance(); }, [fetchCompliance]);

  const buildForm = (u: typeof user) => ({
    fullName: u?.full_name || "",
    businessName: u?.business_name || "",
    tradingName: u?.trading_name || "",
    businessStatus: u?.business_status || "",
    businessType: u?.business_type || "",
    industrySector: u?.industry_sector || "",
    yearsOperating: u?.years_operating?.toString() || "",
    employeeCount: u?.employee_count?.toString() || "",
    phone: u?.phone || "",
    whatsapp: u?.whatsapp || "",
    email: u?.bp_email || u?.email || "",
    physicalAddress: u?.physical_address || "",
    bankName: u?.bank_name || "",
    accountType: u?.account_type || "",
    accountNumber: u?.account_number || "",
    branchCode: u?.branch_code || "",
    saId: u?.sa_id || "",
    cipcNumber: u?.cipc_number || "",
  });

  const [form, setForm] = useState(buildForm(user));

  useEffect(() => {
    if (user) {
      setForm(buildForm(user));
    }
  }, [user?.id, user?.business_name, user?.logo_url, user?.full_name]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          yearsOperating: form.yearsOperating ? parseInt(form.yearsOperating) : null,
          employeeCount: form.employeeCount ? parseInt(form.employeeCount) : null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        await refreshUser();
        toast({ title: "Profile updated", description: "Your changes have been saved." });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch("/api/profile/logo", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.ok) {
        await refreshUser();
        toast({ title: "Logo uploaded", description: "Your business logo has been updated." });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to upload logo.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const res = await fetch("/api/profile/logo", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok) {
        await refreshUser();
        toast({ title: "Logo removed", description: "Your business logo has been removed." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to remove logo.", variant: "destructive" });
    }
  };

  const [emailSettings, setEmailSettings] = useState({
    provider: "smtp",
    smtp_host: "",
    smtp_port: "587",
    smtp_secure: false,
    smtp_user: "",
    smtp_pass: "",
    from_name: "",
    from_email: "",
    reply_to: "",
  });
  const [emailLoaded, setEmailLoaded] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailConnected, setEmailConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (activeTab === "email" && !emailLoaded) {
      fetch("/api/email-settings", { credentials: "include" })
        .then(r => r.json())
        .then(data => {
          if (data.settings) {
            setEmailSettings(prev => ({
              ...prev,
              provider: data.settings.provider || "smtp",
              smtp_host: data.settings.smtp_host || "",
              smtp_port: String(data.settings.smtp_port || "587"),
              smtp_secure: !!data.settings.smtp_secure,
              smtp_user: data.settings.smtp_user || "",
              from_name: data.settings.from_name || "",
              from_email: data.settings.from_email || "",
              reply_to: data.settings.reply_to || "",
            }));
            setEmailConnected(true);
          }
          setEmailLoaded(true);
        })
        .catch(() => setEmailLoaded(true));
    }
  }, [activeTab, emailLoaded]);

  const PROVIDERS = [
    { value: "gmail",   label: "Gmail",          host: "smtp.gmail.com",       port: "587", secure: false },
    { value: "outlook", label: "Outlook / Microsoft 365", host: "smtp.office365.com", port: "587", secure: false },
    { value: "smtp",    label: "Custom SMTP",     host: "",                     port: "587", secure: false },
  ];

  const handleProviderChange = (value: string) => {
    const preset = PROVIDERS.find(p => p.value === value);
    setEmailSettings(prev => ({
      ...prev,
      provider: value,
      smtp_host: preset?.host ?? prev.smtp_host,
      smtp_port: preset?.port ?? prev.smtp_port,
      smtp_secure: preset?.secure ?? prev.smtp_secure,
    }));
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    try {
      const res = await fetch("/api/email-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...emailSettings,
          smtp_port: parseInt(emailSettings.smtp_port) || 587,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setEmailConnected(true);
        setEmailSettings(prev => ({ ...prev, smtp_pass: "" }));
        toast({ title: "Email settings saved", description: "Your SMTP settings have been saved." });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch("/api/email-settings/test", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Test email sent!", description: data.message });
      } else {
        toast({ title: "Connection failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send test email.", variant: "destructive" });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleDocUpload = async (docType: "FICA" | "BUSINESS_REG", file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum 10MB allowed.", variant: "destructive" });
      return;
    }
    setUploadingDoc(docType);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        const res = await fetch("/api/fica-docs/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ docType, fileData, fileName: file.name, mimeType: file.type, fileSize: file.size }),
        });
        const data = await res.json();
        if (res.ok) {
          toast({ title: "Document uploaded", description: `${file.name} saved successfully.` });
          fetchCompliance();
        } else {
          toast({ title: "Upload failed", description: data.error, variant: "destructive" });
        }
        setUploadingDoc(null);
      };
      reader.onerror = () => { toast({ title: "Error reading file", variant: "destructive" }); setUploadingDoc(null); };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
      setUploadingDoc(null);
    }
  };

  const handleDocDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/fica-docs/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { toast({ title: "Document removed" }); fetchCompliance(); }
      else { const d = await res.json(); toast({ title: "Error", description: d.error, variant: "destructive" }); }
    } catch { toast({ title: "Error removing document", variant: "destructive" }); }
  };

  const tabs = [
    { key: "profile" as const, label: "Personal & Business", icon: User },
    { key: "business" as const, label: "Business Details", icon: Building2 },
    { key: "banking" as const, label: "Banking", icon: CreditCard },
    { key: "email" as const, label: "Email Sending", icon: ServerCog },
    { key: "docs" as const, label: "Compliance Docs", icon: Shield },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold font-heading text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your profile, business details, and branding.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Business Logo
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload your business logo. It will appear in the dashboard sidebar, replacing the default Masakhe branding.
        </p>

        <div className="flex items-center gap-6">
          <div className="relative group">
            {user?.logo_url ? (
              <img
                src={user.logo_url}
                alt="Business Logo"
                className="h-24 w-24 rounded-xl object-cover border-2 border-border shadow-sm"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl gradient-hero flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground font-heading">
                  {user?.business_name?.[0] || user?.full_name?.[0] || "M"}
                </span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Upload className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Logo"}
            </Button>
            {user?.logo_url && (
              <Button variant="ghost" size="sm" onClick={handleRemoveLogo} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP or SVG. Max 5MB.</p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5"
      >
        {activeTab === "profile" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup icon={User} label="Full Name">
                <Input value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} placeholder="Your full name" />
              </FieldGroup>
              <FieldGroup icon={Mail} label="Account Email">
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </FieldGroup>
              <FieldGroup icon={Building2} label="Business Name">
                <Input value={form.businessName} onChange={e => handleChange("businessName", e.target.value)} placeholder="Registered business name" />
              </FieldGroup>
              <FieldGroup icon={Building2} label="Trading Name">
                <Input value={form.tradingName} onChange={e => handleChange("tradingName", e.target.value)} placeholder="Trading as..." />
              </FieldGroup>
              <FieldGroup icon={Phone} label="Phone">
                <Input value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+27..." />
              </FieldGroup>
              <FieldGroup icon={Phone} label="WhatsApp">
                <Input value={form.whatsapp} onChange={e => handleChange("whatsapp", e.target.value)} placeholder="+27..." />
              </FieldGroup>
              <FieldGroup icon={Mail} label="Business Email">
                <Input value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="business@example.com" />
              </FieldGroup>
              <FieldGroup icon={MapPin} label="Physical Address">
                <Input value={form.physicalAddress} onChange={e => handleChange("physicalAddress", e.target.value)} placeholder="Street address" />
              </FieldGroup>
            </div>
          </>
        )}

        {activeTab === "business" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup icon={Briefcase} label="Business Status">
                <select
                  value={form.businessStatus}
                  onChange={e => handleChange("businessStatus", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select...</option>
                  <option value="registered">Registered</option>
                  <option value="registering">Registering</option>
                  <option value="informal">Informal</option>
                </select>
              </FieldGroup>
              <FieldGroup icon={Briefcase} label="Business Type">
                <select
                  value={form.businessType}
                  onChange={e => handleChange("businessType", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select...</option>
                  <option value="pty">Pty Ltd</option>
                  <option value="cc">CC</option>
                  <option value="sole">Sole Proprietor</option>
                  <option value="npo">Non-Profit</option>
                  <option value="informal">Informal</option>
                </select>
              </FieldGroup>
              <FieldGroup icon={Briefcase} label="Industry Sector">
                <select
                  value={form.industrySector}
                  onChange={e => handleChange("industrySector", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select...</option>
                  <option value="retail">Retail</option>
                  <option value="services">Services</option>
                  <option value="construction">Construction</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="technology">Technology</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="transport">Transport</option>
                </select>
              </FieldGroup>
              <FieldGroup icon={Briefcase} label="Years Operating">
                <Input type="number" value={form.yearsOperating} onChange={e => handleChange("yearsOperating", e.target.value)} placeholder="0" min="0" />
              </FieldGroup>
              <FieldGroup icon={Briefcase} label="Employee Count">
                <Input type="number" value={form.employeeCount} onChange={e => handleChange("employeeCount", e.target.value)} placeholder="0" min="0" />
              </FieldGroup>
              <FieldGroup icon={Briefcase} label="SA ID Number">
                <Input value={form.saId} onChange={e => handleChange("saId", e.target.value)} placeholder="e.g. 9001015009087" />
              </FieldGroup>
              <FieldGroup icon={Briefcase} label="CIPC Registration Number">
                <Input value={form.cipcNumber} onChange={e => handleChange("cipcNumber", e.target.value)} placeholder="YYYY/NNNNNN/07" />
              </FieldGroup>
            </div>
          </>
        )}

        {activeTab === "banking" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup icon={CreditCard} label="Bank Name">
                <select
                  value={form.bankName}
                  onChange={e => handleChange("bankName", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select bank...</option>
                  <option value="ABSA">ABSA</option>
                  <option value="FNB">FNB</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="Capitec">Capitec</option>
                  <option value="TymeBank">TymeBank</option>
                  <option value="African Bank">African Bank</option>
                  <option value="Discovery Bank">Discovery Bank</option>
                </select>
              </FieldGroup>
              <FieldGroup icon={CreditCard} label="Account Type">
                <select
                  value={form.accountType}
                  onChange={e => handleChange("accountType", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select type...</option>
                  <option value="cheque">Cheque</option>
                  <option value="savings">Savings</option>
                  <option value="business">Business</option>
                </select>
              </FieldGroup>
              <FieldGroup icon={CreditCard} label="Account Number">
                <Input value={form.accountNumber} onChange={e => handleChange("accountNumber", e.target.value)} placeholder="Account number" />
              </FieldGroup>
              <FieldGroup icon={CreditCard} label="Branch Code">
                <Input value={form.branchCode} onChange={e => handleChange("branchCode", e.target.value)} placeholder="Branch code" />
              </FieldGroup>
            </div>
          </>
        )}

        {activeTab === "email" && (
          <>
            <div className="mb-6">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-1">
                <ServerCog className="h-4 w-4 text-primary" />
                Email Sending Configuration
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect your own email account so campaigns are sent from your address. Supports Gmail, Outlook, and any custom SMTP server.
              </p>
              {emailConnected === true && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Email account connected
                </div>
              )}
              {emailConnected === false && (
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  No email account configured yet
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <ServerCog className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Provider
                </label>
                <select
                  value={emailSettings.provider}
                  onChange={e => handleProviderChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook / Microsoft 365</option>
                  <option value="smtp">Custom SMTP</option>
                </select>
              </div>

              {emailSettings.provider === "gmail" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 text-sm text-blue-800 dark:text-blue-300 space-y-2">
                  <p className="font-semibold">Gmail setup requires an App Password:</p>
                  <ol className="list-decimal ml-4 space-y-1 text-xs">
                    <li>Enable 2-Step Verification on your Google account</li>
                    <li>Go to <strong>Google Account → Security → App Passwords</strong></li>
                    <li>Create a new App Password (select "Mail" and "Other")</li>
                    <li>Use the generated 16-character code as your password below</li>
                  </ol>
                </div>
              )}

              {emailSettings.provider === "outlook" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <p className="font-semibold">Outlook / Microsoft 365 setup:</p>
                  <p className="text-xs">Use your full Microsoft email address and account password. If your organisation uses MFA, you may need to create an App Password.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-foreground">SMTP Host</label>
                  <Input
                    value={emailSettings.smtp_host}
                    onChange={e => setEmailSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                    placeholder="e.g. smtp.gmail.com"
                    disabled={emailSettings.provider !== "smtp"}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Port</label>
                  <Input
                    value={emailSettings.smtp_port}
                    onChange={e => setEmailSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                    placeholder="587"
                    disabled={emailSettings.provider !== "smtp"}
                  />
                </div>
              </div>

              {emailSettings.provider === "smtp" && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="smtp_secure"
                    checked={emailSettings.smtp_secure}
                    onChange={e => setEmailSettings(prev => ({ ...prev, smtp_secure: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="smtp_secure" className="text-sm font-medium text-foreground cursor-pointer">
                    Use SSL/TLS (port 465)
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email Address / Username
                  </label>
                  <Input
                    type="email"
                    value={emailSettings.smtp_user}
                    onChange={e => setEmailSettings(prev => ({ ...prev, smtp_user: e.target.value }))}
                    placeholder="you@gmail.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Password {emailConnected && <span className="text-xs text-muted-foreground font-normal">(leave blank to keep existing)</span>}
                  </label>
                  <Input
                    type="password"
                    value={emailSettings.smtp_pass}
                    onChange={e => setEmailSettings(prev => ({ ...prev, smtp_pass: e.target.value }))}
                    placeholder={emailConnected ? "••••••••••••" : "App password or account password"}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Sender Identity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup icon={User} label="From Name">
                    <Input
                      value={emailSettings.from_name}
                      onChange={e => setEmailSettings(prev => ({ ...prev, from_name: e.target.value }))}
                      placeholder="Your Business Name"
                    />
                  </FieldGroup>
                  <FieldGroup icon={Mail} label="From Email">
                    <Input
                      type="email"
                      value={emailSettings.from_email}
                      onChange={e => setEmailSettings(prev => ({ ...prev, from_email: e.target.value }))}
                      placeholder="you@yourdomain.com"
                    />
                  </FieldGroup>
                </div>
                <FieldGroup icon={Mail} label="Reply-To (optional)">
                  <Input
                    type="email"
                    value={emailSettings.reply_to}
                    onChange={e => setEmailSettings(prev => ({ ...prev, reply_to: e.target.value }))}
                    placeholder="replies@yourdomain.com (optional)"
                  />
                </FieldGroup>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button onClick={handleSaveEmail} disabled={savingEmail} className="px-6">
                  <Save className="h-4 w-4 mr-2" />
                  {savingEmail ? "Saving..." : "Save Settings"}
                </Button>
                {emailConnected && (
                  <Button variant="outline" onClick={handleTestEmail} disabled={testingEmail}>
                    <Send className="h-4 w-4 mr-2" />
                    {testingEmail ? "Sending..." : "Send Test Email"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "docs" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-primary" /> Compliance Documents
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload your FICA document and business registration certificate to verify your account.
                These documents are required within 2 days of signing up.
              </p>
            </div>

            {complianceStatus && !complianceStatus.allUploaded && (
              <div className={`rounded-lg border p-4 flex items-start gap-3 ${complianceStatus.isBlocked ? "bg-destructive/5 border-destructive/30" : "bg-amber-50 border-amber-200"}`}>
                <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${complianceStatus.isBlocked ? "text-destructive" : "text-amber-600"}`} />
                <div>
                  <p className={`text-sm font-semibold ${complianceStatus.isBlocked ? "text-destructive" : "text-amber-800"}`}>
                    {complianceStatus.isBlocked
                      ? "Account Blocked — Documents Overdue"
                      : `${Math.ceil(complianceStatus.daysLeft)} day${Math.ceil(complianceStatus.daysLeft) !== 1 ? "s" : ""} remaining to upload documents`}
                  </p>
                  <p className={`text-xs mt-0.5 ${complianceStatus.isBlocked ? "text-destructive/80" : "text-amber-700"}`}>
                    {complianceStatus.isBlocked
                      ? "Upload both documents below to restore full access."
                      : "Your account will be restricted if documents are not submitted in time."}
                  </p>
                </div>
              </div>
            )}

            {complianceStatus?.allUploaded && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <p className="text-sm font-semibold text-green-800">All compliance documents submitted — thank you!</p>
              </div>
            )}

            {(["FICA", "BUSINESS_REG"] as const).map((docType) => {
              const existing = complianceStatus?.docs.find(d => d.docType === docType);
              const isUploading = uploadingDoc === docType;
              const inputId = `doc-upload-${docType}`;
              return (
                <div key={docType} className="rounded-xl border bg-slate-50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${existing ? "bg-green-100" : "bg-slate-200"}`}>
                        {existing ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <FileText className="h-5 w-5 text-slate-500" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {docType === "FICA" ? "FICA Document" : "Business Registration Certificate"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {docType === "FICA"
                            ? "SA ID, passport or proof of address — PDF, JPG, PNG"
                            : "CIPC registration certificate or business license — PDF, JPG, PNG"}
                        </p>
                      </div>
                    </div>
                    {existing && (
                      <span className="text-[10px] bg-green-100 text-green-700 rounded-full px-2.5 py-1 font-semibold">Uploaded</span>
                    )}
                  </div>

                  {existing && (
                    <div className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{existing.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(existing.fileSize / 1024).toFixed(1)} KB · Uploaded {new Date(existing.uploadedAt).toLocaleDateString("en-ZA")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDocDelete(existing.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                        title="Remove document"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div>
                    <input
                      id={inputId}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocUpload(docType, f); e.target.value = ""; }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(inputId)?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : existing ? "Replace Document" : "Upload Document"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1.5 text-center">PDF, JPG or PNG · Max 10MB</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {activeTab !== "email" && activeTab !== "docs" && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="px-8">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}

function FieldGroup({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </label>
      {children}
    </div>
  );
}
