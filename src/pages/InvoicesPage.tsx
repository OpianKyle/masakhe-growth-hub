import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Download, Upload, FileText, X, Pencil, ArrowRight, RefreshCw, Mail, Loader2, Palette, CheckCircle2 } from "lucide-react";
import InvoiceTemplateDesigner, { loadTemplateConfig, hasSavedTemplateConfig, getSavedTemplateName } from "@/components/InvoiceTemplateDesigner";

interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  reference: string | null;
  payment_terms: string | null;
  due_date: string | null;
  notes: string | null;
  total_cents: number;
  vat_enabled: boolean;
  vat_cents: number;
  items: InvoiceItem[];
  status: string;
  type: string;
  template: number;
  created_at: string;
  paid_at?: string | null;
  late_fee_cents?: number;
}

const TEMPLATES = [
  {
    id: 1, name: "Classic",
    preview: (
      <svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="40" fill="#fff"/>
        <rect width="5" height="40" fill="#156C41"/>
        <rect x="8" y="4" width="30" height="4" rx="1" fill="#156C41" opacity="0.9"/>
        <rect x="8" y="10" width="20" height="2" rx="0.5" fill="#aaa"/>
        <rect x="8" y="13" width="15" height="2" rx="0.5" fill="#aaa"/>
        <rect x="8" y="18" width="54" height="1" fill="#156C41"/>
        <rect x="8" y="22" width="54" height="5" rx="0.5" fill="#156C41"/>
        <rect x="8" y="29" width="36" height="2" rx="0.5" fill="#e5e5e5"/>
        <rect x="8" y="33" width="36" height="2" rx="0.5" fill="#e5e5e5"/>
        <rect x="46" y="29" width="16" height="8" rx="1" fill="#156C41"/>
      </svg>
    ),
    badgeBg: "bg-emerald-700",
  },
  {
    id: 2, name: "Modern",
    preview: (
      <svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="40" fill="#fff"/>
        <rect x="4" y="4" width="32" height="4" rx="1" fill="#173872" opacity="0.85"/>
        <rect x="4" y="10" width="22" height="2" rx="0.5" fill="#aaa"/>
        <rect x="4" y="13" width="16" height="2" rx="0.5" fill="#aaa"/>
        <rect x="40" y="3" width="20" height="16" rx="1" fill="#173872"/>
        <rect x="43" y="6" width="14" height="3" rx="0.5" fill="#fff" opacity="0.9"/>
        <rect x="43" y="11" width="10" height="2" rx="0.5" fill="#fff" opacity="0.6"/>
        <rect x="43" y="14" width="12" height="2" rx="0.5" fill="#fff" opacity="0.5"/>
        <rect x="4" y="21" width="60" height="1.5" fill="#173872"/>
        <rect x="4" y="25" width="24" height="8" rx="1" fill="#eef0f7"/>
        <rect x="31" y="25" width="33" height="2" rx="0.5" fill="#e5e5e5"/>
        <rect x="31" y="29" width="33" height="2" rx="0.5" fill="#e5e5e5"/>
        <rect x="31" y="33" width="33" height="2" rx="0.5" fill="#e5e5e5"/>
      </svg>
    ),
    badgeBg: "bg-blue-900",
  },
  {
    id: 3, name: "Bold",
    preview: (
      <svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="40" fill="#fff"/>
        <rect width="64" height="16" fill="#1e1e1e"/>
        <rect y="16" width="64" height="3" fill="#D96508"/>
        <rect x="4" y="4" width="22" height="4" rx="1" fill="#fff" opacity="0.9"/>
        <rect x="4" y="9" width="14" height="2" rx="0.5" fill="#888"/>
        <rect x="36" y="3" width="24" height="10" rx="0.5" fill="none"/>
        <text x="36" y="13" fontSize="11" fontWeight="bold" fill="#D96508" fontFamily="sans-serif">BOLD</text>
        <rect x="4" y="22" width="56" height="5" rx="0.5" fill="#1e1e1e"/>
        <rect x="4" y="29" width="40" height="2" rx="0.5" fill="#e5e5e5"/>
        <rect x="4" y="33" width="40" height="2" rx="0.5" fill="#e5e5e5"/>
        <rect x="46" y="28" width="14" height="9" rx="1" fill="#D96508"/>
      </svg>
    ),
    badgeBg: "bg-neutral-800",
  },
  {
    id: 4, name: "Corporate",
    preview: (
      <svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="40" fill="#fff"/>
        <rect width="64" height="14" fill="#1E59B8"/>
        <rect x="4" y="3" width="24" height="4" rx="1" fill="#fff" opacity="0.9"/>
        <rect x="4" y="9" width="16" height="2" rx="0.5" fill="#8baee0"/>
        <rect x="44" y="4" width="16" height="6" rx="0.5" fill="#fff" opacity="0.2"/>
        <rect x="4" y="17" width="27" height="11" rx="1" fill="#EBF1FB"/>
        <rect x="4" y="17" width="27" height="3" fill="#1E59B8"/>
        <rect x="6" y="22" width="18" height="2" rx="0.5" fill="#999"/>
        <rect x="6" y="25" width="14" height="2" rx="0.5" fill="#bbb"/>
        <rect x="34" y="17" width="26" height="11" rx="1" fill="#EBF1FB"/>
        <rect x="34" y="17" width="26" height="3" fill="#1E59B8"/>
        <rect x="36" y="22" width="18" height="2" rx="0.5" fill="#999"/>
        <rect x="36" y="25" width="12" height="2" rx="0.5" fill="#bbb"/>
        <rect x="4" y="31" width="56" height="4" rx="0.5" fill="#1E59B8"/>
      </svg>
    ),
    badgeBg: "bg-blue-600",
  },
  {
    id: 5, name: "Elegant",
    preview: (
      <svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="40" fill="#fff"/>
        <rect width="64" height="3" fill="#841212"/>
        <rect y="3.5" width="64" height="0.7" fill="#841212"/>
        <rect x="10" y="7" width="44" height="4" rx="1" fill="#841212" opacity="0.85"/>
        <rect x="18" y="12" width="28" height="1" fill="#841212"/>
        <rect x="18" y="13.5" width="28" height="1" fill="#841212"/>
        <rect x="16" y="17" width="32" height="3" rx="0.5" fill="#841212" opacity="0.7"/>
        <rect x="4" y="22" width="20" height="2" rx="0.5" fill="#ddd"/>
        <rect x="4" y="26" width="56" height="0.7" fill="#841212"/>
        <rect x="4" y="28" width="40" height="2" rx="0.5" fill="#f5e8e8"/>
        <rect x="4" y="32" width="40" height="2" rx="0.5" fill="#eee"/>
        <rect x="46" y="28" width="14" height="8" rx="1" fill="none" stroke="#841212" strokeWidth="0.8"/>
      </svg>
    ),
    badgeBg: "bg-red-800",
  },
  {
    id: 6, name: "Vibrant",
    preview: (
      <svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="40" fill="#fff"/>
        <rect width="64" height="18" fill="#6B21B0"/>
        <rect x="24" y="0" width="40" height="18" fill="#7c2fc0"/>
        <rect x="40" y="0" width="24" height="18" fill="#7a29bd"/>
        <rect x="3" y="18" width="4" height="22" fill="#6B21B0"/>
        <rect x="9" y="4" width="24" height="4" rx="1" fill="#fff" opacity="0.9"/>
        <rect x="9" y="10" width="16" height="2" rx="0.5" fill="#c084fc"/>
        <rect x="36" y="2" width="16" height="8" rx="0.5" fill="none"/>
        <text x="36" y="10" fontSize="9" fontWeight="bold" fill="#fff" fontFamily="sans-serif">VIBRANT</text>
        <rect x="36" y="11" width="22" height="4" rx="1" fill="#200038"/>
        <rect x="9" y="21" width="52" height="5" rx="0.5" fill="#6B21B0"/>
        <rect x="9" y="29" width="36" height="2" rx="0.5" fill="#ead5ff"/>
        <rect x="9" y="33" width="36" height="2" rx="0.5" fill="#ead5ff"/>
        <rect x="47" y="29" width="14" height="8" rx="1" fill="#6B21B0"/>
      </svg>
    ),
    badgeBg: "bg-purple-700",
  },
  {
    id: 7, name: "Plain",
    preview: (
      <svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="40" fill="#fff"/>
        <rect x="4" y="4" width="28" height="4" rx="0.5" fill="#262626" opacity="0.85"/>
        <rect x="4" y="9" width="20" height="1.5" rx="0.5" fill="#aaa"/>
        <rect x="4" y="11.5" width="14" height="1.5" rx="0.5" fill="#aaa"/>
        <rect x="4" y="16" width="60" height="1.5" fill="#262626"/>
        <rect x="4" y="19" width="28" height="9" rx="0.5" fill="#f0f0f0"/>
        <rect x="4" y="19" width="28" height="2.5" fill="#262626"/>
        <rect x="34" y="19" width="26" height="9" rx="0.5" fill="#f0f0f0"/>
        <rect x="34" y="19" width="26" height="2.5" fill="#262626"/>
        <rect x="4" y="30" width="56" height="4" rx="0.5" fill="#262626"/>
        <rect x="4" y="36" width="36" height="1.5" rx="0.5" fill="#ddd"/>
      </svg>
    ),
    badgeBg: "bg-neutral-700",
  },
  {
    id: 8, name: "Custom",
    preview: (
      <svg viewBox="0 0 64 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="40" fill="#fff"/>
        <rect width="64" height="3" fill="url(#cg)"/>
        <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#156C41"/><stop offset="50%" stopColor="#1a7fd4"/><stop offset="100%" stopColor="#9333ea"/></linearGradient></defs>
        <rect x="4" y="7" width="20" height="3" rx="0.5" fill="#333" opacity="0.85"/>
        <rect x="4" y="12" width="14" height="1.5" rx="0.5" fill="#aaa"/>
        <circle cx="52" cy="9" r="6" fill="#f0f9ff" stroke="#1a7fd4" strokeWidth="0.8"/>
        <text x="49.5" y="11.2" fontSize="6" fontWeight="bold" fill="#1a7fd4" fontFamily="sans-serif">✦</text>
        <rect x="4" y="18" width="60" height="1" fill="#156C41" opacity="0.3"/>
        <rect x="4" y="21" width="28" height="7" rx="1" fill="#f0fdf4"/>
        <rect x="4" y="21" width="28" height="2" rx="0.5" fill="#156C41" opacity="0.7"/>
        <rect x="34" y="21" width="26" height="7" rx="1" fill="#f0fdf4"/>
        <rect x="34" y="21" width="26" height="2" fill="#156C41" opacity="0.7"/>
        <rect x="4" y="30" width="56" height="3" rx="0.5" fill="#156C41" opacity="0.8"/>
        <rect x="4" y="35" width="36" height="1.5" rx="0.5" fill="#ddd"/>
        <rect x="0" y="38" width="64" height="2" fill="#156C41" opacity="0.5"/>
      </svg>
    ),
    badgeBg: "bg-gradient-to-r from-emerald-600 to-blue-600",
  },
];

export default function InvoicesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "admin";
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<"invoice" | "quote" | "designer">("invoice");
  const [showCreate, setShowCreate] = useState(false);
  const [docType, setDocType] = useState<"invoice" | "quote">("invoice");
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [customTemplateName, setCustomTemplateName] = useState<string>(() => getSavedTemplateName() || "Custom");
  const [hasCustomTemplate, setHasCustomTemplate] = useState<boolean>(() => hasSavedTemplateConfig());

  const refreshCustomTemplateMeta = () => {
    setCustomTemplateName(getSavedTemplateName() || "Custom");
    setHasCustomTemplate(hasSavedTemplateConfig());
  };

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [reference, setReference] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 days");
  const [dueDate, setDueDate] = useState("");
  const [startingInvoiceNum, setStartingInvoiceNum] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ name: "", qty: 1, unitPrice: 0 }]);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  };

  const handleExport = async () => {
    const res = await fetch("/api/invoices/export", { credentials: "include" });
    if (!res.ok) { toast.error("Failed to export"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/invoices/import", { method: "POST", credentials: "include", body: formData });
    if (res.ok) {
      const data = await res.json();
      toast.success(`Imported ${data.count} invoice${data.count !== 1 ? "s" : ""}`);
      loadInvoices();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to import");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadInvoices = async () => {
    const res = await fetch("/api/invoices", { credentials: "include" });
    if (res.ok) setInvoices(await res.json());
  };

  useEffect(() => { loadInvoices(); }, []);

  const addItem = () => setItems([...items, { name: "", qty: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    (updated[i] as any)[key] = val;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const vatAmount = vatEnabled ? subtotal * 0.15 : 0;
  const total = subtotal + vatAmount;

  const openCreate = (type: "invoice" | "quote") => {
    setDocType(type);
    setActiveTab(type);
    setSelectedTemplate(1);
    setPaymentTerms("30 days");
    setDueDate(type === "invoice" ? defaultDueDate() : "");
    setStartingInvoiceNum("");
    setShowCreate(true);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    if (items.some((i) => !i.name.trim())) { toast.error("All items need a name"); return; }
    if (items.some((i) => i.unitPrice <= 0)) { toast.error("All items need a price"); return; }

    const isFirstInvoice = invoices.filter((i) => i.type === "invoice").length === 0;
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        customerName, customerEmail: customerEmail || undefined,
        customerAddress: customerAddress || undefined,
        customerPhone: customerPhone || undefined,
        reference: reference || undefined,
        paymentTerms: docType === "quote" ? (paymentTerms || undefined) : undefined,
        dueDate: docType === "invoice" ? (dueDate || undefined) : undefined,
        notes: notes || undefined,
        items, vatEnabled,
        type: docType,
        template: selectedTemplate,
        templateConfig: selectedTemplate === 8 ? loadTemplateConfig() : undefined,
        customStartSeq: (docType === "invoice" && isFirstInvoice && startingInvoiceNum)
          ? parseInt(startingInvoiceNum) : undefined,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success(`${docType === "quote" ? "Quote" : "Invoice"} ${data.invoiceNumber} created`);
      resetForm();
      setShowCreate(false);
      loadInvoices();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to create");
    }
  };

  const handleEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setDocType(inv.type as "invoice" | "quote");
    setSelectedTemplate(inv.template || 1);
    setCustomerName(inv.customer_name);
    setCustomerEmail(inv.customer_email || "");
    setCustomerAddress(inv.customer_address || "");
    setCustomerPhone(inv.customer_phone || "");
    setReference(inv.reference || "");
    setPaymentTerms(inv.payment_terms || "30 days");
    setDueDate(inv.due_date ? inv.due_date.slice(0, 10) : (inv.type === "invoice" ? defaultDueDate() : ""));
    setNotes(inv.notes || "");
    setItems(inv.items.length > 0 ? inv.items : [{ name: "", qty: 1, unitPrice: 0 }]);
    setVatEnabled(inv.vat_enabled);
    setStartingInvoiceNum("");
    setShowCreate(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setShowCreate(false);
    setCustomerName(""); setCustomerEmail(""); setCustomerAddress("");
    setCustomerPhone(""); setReference(""); setNotes("");
    setPaymentTerms("30 days");
    setDueDate("");
    setStartingInvoiceNum("");
    setItems([{ name: "", qty: 1, unitPrice: 0 }]);
    setVatEnabled(true);
    setSelectedTemplate(1);
  };

  const handleUpdate = async () => {
    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    if (items.some((i) => !i.name.trim())) { toast.error("All items need a name"); return; }
    if (items.some((i) => i.unitPrice <= 0)) { toast.error("All items need a price"); return; }

    const res = await fetch(`/api/invoices/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        customer_name: customerName,
        customer_email: customerEmail || undefined,
        customer_address: customerAddress || undefined,
        customer_phone: customerPhone || undefined,
        reference: reference || undefined,
        payment_terms: docType === "quote" ? (paymentTerms || undefined) : undefined,
        due_date: docType === "invoice" ? (dueDate || undefined) : undefined,
        notes: notes || undefined,
        items, vat_enabled: vatEnabled,
        template: selectedTemplate,
        templateConfig: selectedTemplate === 8 ? loadTemplateConfig() : undefined,
      }),
    });

    if (res.ok) {
      toast.success(`${docType === "quote" ? "Quote" : "Invoice"} updated`);
      resetForm();
      loadInvoices();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update");
    }
  };

  const handleConvert = async (inv: Invoice) => {
    const res = await fetch(`/api/invoices/${inv.id}/convert`, { method: "POST", credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      toast.success(`Quote converted to Invoice ${data.invoiceNumber}`);
      setActiveTab("invoice");
      loadInvoices();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to convert");
    }
  };

  const [emailingId, setEmailingId] = useState<string | null>(null);

  const downloadPdf = async (id: string, num: string) => {
    const res = await fetch(`/api/invoices/${id}/pdf`, { credentials: "include" });
    if (!res.ok) { toast.error("Failed to download PDF"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${num}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const markPaid = async (inv: Invoice) => {
    if (inv.paid_at) return;
    if (!confirm(`Mark invoice ${inv.invoice_number} as paid? A thank-you receipt will be emailed to the customer.`)) return;
    setMarkingPaidId(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}/mark-paid`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success(`Invoice ${inv.invoice_number} marked paid${inv.customer_email ? " — receipt emailed" : ""}`);
        loadInvoices();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to mark paid");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to mark paid");
    } finally {
      setMarkingPaidId(null);
    }
  };

  const emailInvoice = async (id: string, customerEmail: string) => {
    setEmailingId(id);
    try {
      const res = await fetch(`/api/invoices/${id}/email`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Invoice emailed to ${data.sentTo}`);
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch {
      toast.error("Network error sending email");
    } finally {
      setEmailingId(null);
    }
  };

  const filtered = invoices.filter(inv => (inv.type || "invoice") === (activeTab === "designer" ? "invoice" : activeTab));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Quotes & Invoices</h2>
          <p className="text-muted-foreground">Create and manage your quotes and invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
          <Button variant="outline" onClick={() => openCreate("quote")} className="border-primary text-primary">
            <Plus className="h-4 w-4 mr-2" /> New Quote
          </Button>
          <Button onClick={() => openCreate("invoice")} className="gradient-hero text-white">
            <Plus className="h-4 w-4 mr-2" /> New Invoice
          </Button>
        </div>
        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["invoice", "quote"] as const).map((tab) => {
          const count = invoices.filter(i => (i.type || "invoice") === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "invoice" ? "Invoices" : "Quotes"} <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab("designer")}
          className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "designer"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Palette className="h-3.5 w-3.5" /> Template Designer
        </button>
      </div>

      {/* Template Designer Tab */}
      {activeTab === "designer" && (
        <Card className="p-6">
          <InvoiceTemplateDesigner onSave={refreshCustomTemplateMeta} />
        </Card>
      )}

      {/* Create / Edit Form */}
      {(showCreate || editingId !== null) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="p-6 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingId
                  ? `Edit ${docType === "quote" ? "Quote" : "Invoice"}`
                  : `Create ${docType === "quote" ? "Quote" : "Invoice"}`}
              </h3>
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </div>

            {/* Template Selector */}
            <div className="mb-6">
              <Label className="text-xs mb-2 block">Choose Template</Label>
              <div className="flex gap-3 flex-wrap">
                {TEMPLATES.map((tpl) => {
                  const isCustom = tpl.id === 8;
                  const displayName = isCustom ? customTemplateName : tpl.name;
                  const handleClick = () => {
                    if (isCustom && !hasCustomTemplate) {
                      toast.info("Design your custom template first");
                      setActiveTab("designer");
                      setShowCreate(false);
                      return;
                    }
                    setSelectedTemplate(tpl.id);
                  };
                  return (
                    <button
                      key={tpl.id}
                      onClick={handleClick}
                      title={isCustom && !hasCustomTemplate ? "Click to design your custom template" : displayName}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                        selectedTemplate === tpl.id ? "border-primary shadow-md scale-105" : "border-transparent hover:border-muted-foreground/30"
                      } ${isCustom && !hasCustomTemplate ? "opacity-60" : ""}`}
                    >
                      <div className="w-16 h-10 rounded overflow-hidden border border-gray-100 shadow-sm relative">
                        {tpl.preview}
                        {isCustom && !hasCustomTemplate && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                            <Palette className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium max-w-[80px] truncate">{displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-xs">Customer Name *</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1" placeholder="Company or person name" />
              </div>
              <div>
                <Label className="text-xs">Customer Email</Label>
                <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1" placeholder="Optional" />
              </div>
              <div>
                <Label className="text-xs">Customer Phone</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1" placeholder="Optional" />
              </div>
              <div>
                <Label className="text-xs">Customer Address</Label>
                <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="mt-1" placeholder="Optional" />
              </div>

              {/* Reference / PO Number — full width */}
              <div className="md:col-span-2">
                <Label className="text-xs">Reference / PO Number</Label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1" placeholder="e.g. PO-2024-001" />
              </div>

              {/* Due Date / Valid For + Invoice Number — below PO Reference */}
              {docType === "quote" ? (
                <div className="md:col-span-2">
                  <Label className="text-xs">Quote Valid For</Label>
                  <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="mt-1 max-w-xs" placeholder="e.g. 30 days" />
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-xs">Due Date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Invoice Number</Label>
                    {!editingId && invoices.filter((i) => i.type === "invoice").length === 0 ? (
                      <>
                        <Input
                          type="number"
                          min="1"
                          value={startingInvoiceNum}
                          onChange={(e) => setStartingInvoiceNum(e.target.value)}
                          className="mt-1"
                          placeholder="Starting number e.g. 1001"
                        />
                        <p className="text-xs text-muted-foreground mt-1">First invoice — set your starting number or leave blank for default.</p>
                      </>
                    ) : (
                      <Input
                        value={editingId ? (invoices.find(i => i.id === editingId)?.invoice_number ?? "Auto-assigned") : "Auto-assigned on save"}
                        readOnly
                        className="mt-1 bg-muted/50 text-muted-foreground cursor-default"
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1 pb-1 border-b">
                <div className="col-span-5">Item</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Unit Price (R)</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center py-2 border-b border-dashed border-muted last:border-0">
                  <div className="col-span-5">
                    <Input value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} className="h-9 text-sm" placeholder="Item description" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(i, "qty", parseInt(e.target.value) || 1)} className="h-9 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="0.01" min="0" value={item.unitPrice || ""} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="h-9 text-sm" placeholder="0.00" />
                  </div>
                  <div className="col-span-2 text-right font-semibold text-sm">R{(item.qty * item.unitPrice).toFixed(2)}</div>
                  <div className="col-span-1 text-right">
                    {items.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeItem(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={addItem} className="mb-4">
              <Plus className="h-3 w-3 mr-1" /> Add Item
            </Button>

            <div className="mb-4">
              <Label className="text-xs">Notes / Additional Information</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. delivery instructions, payment reference, thank-you message..."
              />
            </div>

            <div className="border-t pt-4 flex flex-col items-end gap-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer mb-2 self-start">
                <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} className="rounded" />
                <span>Include VAT (15%)</span>
              </label>
              <div className="w-full max-w-xs space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>R{subtotal.toFixed(2)}</span>
                </div>
                {vatEnabled && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT (15%)</span><span>R{vatAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-1">
                  <span>{vatEnabled ? "Total (incl. VAT)" : "Total"}</span>
                  <span className="text-primary">R{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                {editingId ? (
                  <Button onClick={handleUpdate} className="gradient-hero text-white">Save Changes</Button>
                ) : (
                  <Button onClick={handleCreate} className="gradient-hero text-white">
                    Create {docType === "quote" ? "Quote" : "Invoice"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* List — hidden in designer tab */}
      {activeTab !== "designer" && <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">{activeTab === "quote" ? "Quote #" : "Invoice #"}</th>
              <th className="text-left p-3 font-semibold">Customer</th>
              <th className="text-left p-3 font-semibold">Template</th>
              <th className="text-left p-3 font-semibold">Items</th>
              <th className="text-right p-3 font-semibold">Total</th>
              <th className="text-left p-3 font-semibold">Date</th>
              <th className="text-right p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const tpl = TEMPLATES.find(t => t.id === (inv.template || 1)) || TEMPLATES[0];
              return (
                <tr key={inv.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-mono font-medium">{inv.invoice_number}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{inv.customer_name}</div>
                    {inv.customer_email && <div className="text-xs text-muted-foreground">{inv.customer_email}</div>}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-sm ${tpl.badgeBg}`} />
                      <span className="text-xs text-muted-foreground">{tpl.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {inv.items.length} item{inv.items.length !== 1 ? "s" : ""}
                    {inv.vat_enabled && <span className="ml-1 text-xs text-green-600 font-medium">+ VAT</span>}
                  </td>
                  <td className="p-3 text-right font-bold text-primary">
                    R{(inv.total_cents / 100).toFixed(2)}
                    {inv.late_fee_cents && inv.late_fee_cents > 0 ? (
                      <div className="text-[10px] font-normal text-red-600 mt-0.5">
                        incl. R{(inv.late_fee_cents / 100).toFixed(2)} late fee
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    <div>{new Date(inv.created_at).toLocaleDateString("en-ZA")}</div>
                    {inv.type === "invoice" && (
                      inv.paid_at ? (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          Outstanding
                        </span>
                      )
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end flex-wrap">
                      {inv.type === "quote" && (
                        <Button variant="outline" size="sm" onClick={() => handleConvert(inv)} title="Convert to Invoice">
                          <RefreshCw className="h-3.5 w-3.5 mr-1" /> To Invoice
                        </Button>
                      )}
                      {isSuperAdmin && inv.type === "invoice" && !inv.paid_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={markingPaidId === inv.id}
                          onClick={() => markPaid(inv)}
                          className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          title="Mark as paid (sends thank-you receipt)"
                        >
                          {markingPaidId === inv.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                          Mark Paid
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEdit(inv)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadPdf(inv.id, inv.invoice_number)}>
                        <Download className="h-3.5 w-3.5 mr-1" /> PDF
                      </Button>
                      {inv.customer_email && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={emailingId === inv.id}
                          onClick={() => emailInvoice(inv.id, inv.customer_email!)}
                          title={`Email to ${inv.customer_email}`}
                        >
                          {emailingId === inv.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            : <Mail className="h-3.5 w-3.5 mr-1" />}
                          Email
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No {activeTab === "quote" ? "quotes" : "invoices"} yet.
                  <button onClick={() => openCreate(activeTab as "invoice" | "quote")} className="ml-2 text-primary underline underline-offset-2">
                    Create your first {activeTab === "quote" ? "quote" : "invoice"}.
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>}
    </div>
  );
}
