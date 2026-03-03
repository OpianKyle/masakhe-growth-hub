import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Camera, Trash2, Save, Building2, User, CreditCard, MapPin, Phone, Mail, Briefcase, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "business" | "banking">("profile");

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

  const tabs = [
    { key: "profile" as const, label: "Personal & Business", icon: User },
    { key: "business" as const, label: "Business Details", icon: Building2 },
    { key: "banking" as const, label: "Banking", icon: CreditCard },
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
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="px-8">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
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
