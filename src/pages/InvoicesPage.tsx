import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import NeroSectionHeader from "@/components/NeroSectionHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Download, Upload, FileText, X, Pencil, ArrowRight, RefreshCw, Mail, Loader2, Palette, CheckCircle2, Users, Search, Building2, Package, Link2, Eye, ReceiptText, Clock3, AlertCircle, WalletCards, ArrowUpRight, Settings2, ClipboardList, Wallet, History, CreditCard, Ban, Copy } from "lucide-react";
import InvoiceTemplateDesigner, { loadTemplateConfig, hasSavedTemplateConfig, getSavedTemplateName } from "@/components/InvoiceTemplateDesigner";
import { TEMPLATES, TEMPLATE_STYLES, InvoicePreview, type InvoiceItem } from "@/components/InvoiceTemplates";
import heroImage from "@/assets/hero-image.jpg";
import smmeOwnerImage from "@/assets/smme-owner.jpg";

interface InventoryProduct {
  id: string;
  name: string;
  sku?: string;
  price_cents: number;
  unit?: string;
}

interface ClientForInvoice {
  id: string;
  full_name: string;
  business_name?: string;
  email?: string;
  business_email?: string;
  phone?: string;
  business_phone?: string;
  physical_address?: string;
  business_address?: string;
  owner_name?: string;
  vat_number?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  customer_vat: string | null;
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
  tax_rate?: number;
  created_at: string;
  paid_at?: string | null;
  late_fee_cents?: number;
  payment_token?: string | null;
  acceptance_token?: string | null;
  accepted_at?: string | null;
  converted_to_invoice_id?: string | null;
  revision_number?: number;
  payments_total_cents?: number;
  credits_total_cents?: number;
}

interface CatalogItem {
  id: string;
  item_type: "product" | "service";
  code?: string | null;
  name: string;
  description?: string | null;
  unit: string;
  unit_price_cents: number;
}

interface DocumentSettings {
  default_tax_enabled: boolean | number;
  tax_rate: number;
  tax_label: string;
  invoice_prefix: string;
  quote_prefix: string;
  receipt_prefix: string;
  default_payment_terms: string;
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "admin";
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<"invoice" | "quote" | "designer" | "catalog" | "settings">("invoice");
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
  const [customerVat, setCustomerVat] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 days");
  const [dueDate, setDueDate] = useState("");
  const [startingInvoiceNum, setStartingInvoiceNum] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ name: "", qty: 1, unitPrice: 0 }]);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(15);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [platformUserId, setPlatformUserId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [invoiceClients, setInvoiceClients] = useState<ClientForInvoice[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [openItemDropdownIndex, setOpenItemDropdownIndex] = useState<number | null>(null);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>({
    default_tax_enabled: true, tax_rate: 15, tax_label: "VAT",
    invoice_prefix: "INV", quote_prefix: "QUO", receipt_prefix: "REC", default_payment_terms: "30 days",
  });
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [editingCatalogItem, setEditingCatalogItem] = useState<CatalogItem | null>(null);
  const [catalogForm, setCatalogForm] = useState({ item_type: "service", code: "", name: "", description: "", unit: "unit", unit_price: "" });
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [savingDocumentSettings, setSavingDocumentSettings] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", payment_method: "eft", reference: "", notes: "" });
  const [savingPayment, setSavingPayment] = useState(false);
  const [creditTarget, setCreditTarget] = useState<Invoice | null>(null);
  const [creditForm, setCreditForm] = useState({ amount: "", reason: "" });
  const [savingCredit, setSavingCredit] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<Invoice | null>(null);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [revisionEvents, setRevisionEvents] = useState<any[]>([]);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [invoicePayments, setInvoicePayments] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    const endpoint = format === "csv" ? "/api/invoices/export"
      : format === "xlsx" ? "/api/invoices/export/xlsx"
      : "/api/invoices/export/pdf";
    const ext = format === "csv" ? "csv" : format === "xlsx" ? "xlsx" : "pdf";
    const res = await fetch(endpoint, { credentials: "include" });
    if (!res.ok) { toast.error("Failed to export"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.${ext}`;
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

  const loadDocumentSettings = async () => {
    const res = await fetch("/api/commercial-documents/settings", { credentials: "include" });
    if (res.ok) {
      const settings = await res.json();
      setDocumentSettings({
        ...settings,
        default_tax_enabled: !!settings.default_tax_enabled,
        tax_rate: Number(settings.tax_rate ?? 15),
      });
    }
  };

  const loadCatalogItems = async () => {
    const res = await fetch("/api/commercial-documents/catalog", { credentials: "include" });
    if (res.ok) setCatalogItems(await res.json());
  };

  useEffect(() => {
    loadInvoices();
    loadDocumentSettings();
    loadCatalogItems();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillName = params.get("prefill_name");
    const prefillEmail = params.get("prefill_email");
    const prefillBusiness = params.get("prefill_business");
    const pUserId = params.get("platform_user_id");
    if (prefillName || prefillBusiness) {
      setCustomerName(prefillBusiness || prefillName || "");
      setCustomerEmail(prefillEmail || "");
      if (pUserId) setPlatformUserId(pUserId);
      setDocType("invoice");
      setActiveTab("invoice");
      setSelectedTemplate(1);
      setPaymentTerms("30 days");
      setDueDate(defaultDueDate());
      setStartingInvoiceNum("");
      setShowCreate(true);
      setEditingId(null);
      setSelectedClientIds([]);
      setClientSearch("");
      window.history.replaceState({}, "", "/dashboard/invoices");
    }
  }, []);

  useEffect(() => {
    fetch("/api/clients/for-invoice", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => setInvoiceClients(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/inventory/products", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => setInventoryProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filteredInvoiceClients = invoiceClients.filter(c => {
    if (!clientSearch) return true;
    const q = clientSearch.toLowerCase();
    return `${c.full_name} ${c.business_name || ""} ${c.email || ""} ${c.business_email || ""}`.toLowerCase().includes(q);
  });

  const applyClientToForm = (c: ClientForInvoice) => {
    setCustomerName(c.business_name || c.full_name);
    setCustomerEmail(c.business_email || c.email || "");
    setCustomerPhone(c.business_phone || c.phone || "");
    setCustomerAddress(c.business_address || c.physical_address || "");
    setCustomerVat(c.vat_number || "");
  };

  const toggleClientSelection = (id: string) => {
    setSelectedClientIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(x => x !== id);
        if (next.length === 1) {
          const c = invoiceClients.find(cl => cl.id === next[0]);
          if (c) applyClientToForm(c);
        }
        return next;
      } else {
        const next = [...prev, id];
        if (next.length === 1) {
          const c = invoiceClients.find(cl => cl.id === id);
          if (c) applyClientToForm(c);
        }
        return next;
      }
    });
  };

  const addItem = () => setItems([...items, { name: "", qty: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    (updated[i] as any)[key] = val;
    setItems(updated);
  };
  const selectInventoryProduct = (itemIndex: number, prod: InventoryProduct) => {
    const updated = [...items];
    updated[itemIndex] = { ...updated[itemIndex], name: prod.name, unitPrice: prod.price_cents / 100 };
    setItems(updated);
    setOpenItemDropdownIndex(null);
  };

  const selectCatalogItem = (itemIndex: number, item: CatalogItem) => {
    const updated = [...items];
    updated[itemIndex] = { ...updated[itemIndex], name: item.name, unitPrice: item.unit_price_cents / 100 };
    setItems(updated);
    setOpenItemDropdownIndex(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const vatAmount = vatEnabled ? subtotal * taxRate / 100 : 0;
  const total = subtotal + vatAmount;

  const openCreate = (type: "invoice" | "quote") => {
    setDocType(type);
    setActiveTab(type);
    setSelectedTemplate(1);
    setTaxRate(Number(documentSettings.tax_rate || 0));
    setVatEnabled(!!documentSettings.default_tax_enabled);
    setPaymentTerms(documentSettings.default_payment_terms || "30 days");
    setDueDate(type === "invoice" ? defaultDueDate() : "");
    setStartingInvoiceNum("");
    setShowCreate(true);
    setEditingId(null);
    setSelectedClientIds([]);
    setClientSearch("");
    setShowClientPicker(false);
  };

  const handleCreate = async () => {
    if (items.some((i) => !i.name.trim())) { toast.error("All items need a name"); return; }
    if (items.some((i) => i.unitPrice <= 0)) { toast.error("All items need a price"); return; }

    const buildPayload = (name: string, email: string, phone: string, address: string, isFirst: boolean, cId?: string, vat?: string) => ({
      customerName: name,
      customerEmail: email || undefined,
      customerAddress: address || undefined,
      customerPhone: phone || undefined,
      customerVat: vat || undefined,
      paymentTerms: docType === "quote" ? (paymentTerms || undefined) : undefined,
      dueDate: docType === "invoice" ? (dueDate || undefined) : undefined,
      notes: notes || undefined,
      items, vatEnabled, taxRate, taxLabel: documentSettings.tax_label,
      type: docType,
      template: selectedTemplate,
      templateConfig: selectedTemplate === 8 ? loadTemplateConfig() : undefined,
      customStartSeq: (docType === "invoice" && isFirst && startingInvoiceNum) ? parseInt(startingInvoiceNum) : undefined,
      clientId: cId || undefined,
      platformUserId: platformUserId || undefined,
    });

    if (selectedClientIds.length > 1) {
      if (items.some((i) => !i.name.trim()) || items.some((i) => i.unitPrice <= 0)) return;
      let created = 0;
      const isFirst = invoices.filter((i) => i.type === "invoice").length === 0;
      for (const clientId of selectedClientIds) {
        const c = invoiceClients.find(cl => cl.id === clientId);
        if (!c) continue;
        const name = c.business_name || c.full_name;
        const email = c.business_email || c.email || "";
        const phone = c.business_phone || c.phone || "";
        const address = c.business_address || c.physical_address || "";
        const vat = c.vat_number || "";
        const response = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(buildPayload(name, email, phone, address, isFirst && created === 0, clientId, vat)),
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          toast.error(error.error || `Could not create a ${docType} for ${name}`);
          return;
        }
        created++;
      }
      toast.success(`${created} ${docType === "quote" ? "quotes" : "invoices"} created`);
      resetForm();
      setShowCreate(false);
      loadInvoices();
      return;
    }

    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    const isFirstInvoice = invoices.filter((i) => i.type === "invoice").length === 0;
    const singleClientId = selectedClientIds.length === 1 ? selectedClientIds[0] : undefined;
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(buildPayload(customerName, customerEmail, customerPhone, customerAddress, isFirstInvoice, singleClientId, customerVat)),
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

  const handleDelete = async (inv: Invoice) => {
    if (!window.confirm(`Void ${inv.type === "quote" ? "quote" : "invoice"} ${inv.invoice_number}? The record will be retained in your history.`)) return;
    setDeletingId(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        toast.success(`${inv.type === "quote" ? "Quote" : "Invoice"} voided`);
        loadInvoices();
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const [makingRecurringId, setMakingRecurringId] = useState<string | null>(null);
  const [recurringSourceIds, setRecurringSourceIds] = useState<Set<string>>(new Set());

  const refreshRecurringSourceIds = () => {
    fetch("/api/automations/recurring", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: any[]) => {
        const ids = (Array.isArray(data) ? data : [])
          .map((r) => r.source_invoice_id)
          .filter(Boolean);
        setRecurringSourceIds(new Set(ids));
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshRecurringSourceIds();
  }, []);

  const handleMakeRecurring = async (inv: Invoice) => {
    setMakingRecurringId(inv.id);
    try {
      const res = await fetch("/api/automations/recurring", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${inv.customer_name} — Invoice #${inv.invoice_number}`,
          customer_name: inv.customer_name,
          customer_email: inv.customer_email || null,
          customer_address: inv.customer_address || null,
          customer_phone: inv.customer_phone || null,
          reference: inv.reference || null,
          payment_terms: inv.payment_terms || null,
          notes: inv.notes || null,
          items: inv.items,
          vat_enabled: inv.vat_enabled,
          vat_cents: inv.vat_cents,
          total_cents: inv.total_cents,
          template: inv.template || 1,
          template_config: inv.template === 8 ? loadTemplateConfig() : null,
          frequency: "monthly",
          start_date: new Date().toISOString().slice(0, 10),
          auto_send: false,
          source_invoice_id: inv.id,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create recurring invoice");
      }
      toast.success("Recurring invoice created — review it under Automations → Recurring invoices");
      setRecurringSourceIds((prev) => new Set(prev).add(inv.id));
    } catch (e: any) {
      toast.error(e.message || "Failed to create recurring invoice");
    } finally {
      setMakingRecurringId(null);
    }
  };

  const handleEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setDocType(inv.type as "invoice" | "quote");
    setSelectedTemplate(inv.template || 1);
    setTaxRate(Number(inv.tax_rate ?? documentSettings.tax_rate ?? 15));
    setCustomerName(inv.customer_name);
    setCustomerEmail(inv.customer_email || "");
    setCustomerAddress(inv.customer_address || "");
    setCustomerPhone(inv.customer_phone || "");
    setCustomerVat(inv.customer_vat || "");
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
    setCustomerPhone(""); setCustomerVat(""); setNotes("");
    setPaymentTerms("30 days");
    setDueDate("");
    setStartingInvoiceNum("");
    setItems([{ name: "", qty: 1, unitPrice: 0 }]);
    setVatEnabled(true);
    setTaxRate(Number(documentSettings.tax_rate || 0));
    setSelectedTemplate(1);
    setSelectedClientIds([]);
    setClientSearch("");
    setPlatformUserId("");
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
        customer_vat: customerVat || undefined,
        payment_terms: docType === "quote" ? (paymentTerms || undefined) : undefined,
        due_date: docType === "invoice" ? (dueDate || undefined) : undefined,
        notes: notes || undefined,
        items, vat_enabled: vatEnabled, tax_rate: taxRate, tax_label: documentSettings.tax_label,
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

  const [copyingPayLinkId, setCopyingPayLinkId] = useState<string | null>(null);
  const [payLinkModal, setPayLinkModal] = useState<{ url: string; invoiceNumber: string } | null>(null);

  const copyPayLink = async (inv: Invoice) => {
    setCopyingPayLinkId(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}/pay-link`, { credentials: "include" });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Pay-link non-JSON response", res.status, text.slice(0, 300));
        toast.error(`Server error (${res.status}) — could not get pay link`);
        return;
      }
      if (!res.ok) { toast.error(data.error || "Failed to get pay link"); return; }
      try {
        await navigator.clipboard.writeText(data.url);
        toast.success("Payment link copied to clipboard!");
      } catch {
        setPayLinkModal({ url: data.url, invoiceNumber: inv.invoice_number });
      }
    } catch (err) {
      console.error("Pay-link fetch error:", err);
      toast.error("Network error — could not get pay link");
    } finally {
      setCopyingPayLinkId(null);
    }
  };

  const saveDocumentSettings = async () => {
    setSavingDocumentSettings(true);
    try {
      const res = await fetch("/api/commercial-documents/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentSettings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save settings");
      setDocumentSettings({ ...data, default_tax_enabled: !!data.default_tax_enabled, tax_rate: Number(data.tax_rate) });
      toast.success("Document settings saved");
    } catch (err: any) {
      toast.error(err.message || "Could not save settings");
    } finally {
      setSavingDocumentSettings(false);
    }
  };

  const openNewCatalogItem = () => {
    setEditingCatalogItem(null);
    setCatalogForm({ item_type: "service", code: "", name: "", description: "", unit: "unit", unit_price: "" });
    setCatalogModalOpen(true);
  };

  const openEditCatalogItem = (item: CatalogItem) => {
    setEditingCatalogItem(item);
    setCatalogForm({
      item_type: item.item_type, code: item.code || "", name: item.name,
      description: item.description || "", unit: item.unit || "unit",
      unit_price: (Number(item.unit_price_cents) / 100).toFixed(2),
    });
    setCatalogModalOpen(true);
  };

  const saveCatalogItem = async () => {
    if (!catalogForm.name.trim()) { toast.error("Enter a product or service name"); return; }
    const price = Number(catalogForm.unit_price);
    if (!Number.isFinite(price) || price < 0) { toast.error("Enter a valid price"); return; }
    setSavingCatalog(true);
    try {
      const res = await fetch(editingCatalogItem
        ? `/api/commercial-documents/catalog/${editingCatalogItem.id}`
        : "/api/commercial-documents/catalog", {
        method: editingCatalogItem ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...catalogForm, unit_price: price }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save catalogue item");
      toast.success(editingCatalogItem ? "Catalogue item updated" : "Catalogue item added");
      setCatalogModalOpen(false);
      await loadCatalogItems();
    } catch (err: any) {
      toast.error(err.message || "Could not save catalogue item");
    } finally {
      setSavingCatalog(false);
    }
  };

  const archiveCatalogItem = async (item: CatalogItem) => {
    if (!confirm(`Archive ${item.name}? It will remain on existing documents.`)) return;
    const res = await fetch(`/api/commercial-documents/catalog/${item.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast.success("Catalogue item archived"); loadCatalogItems(); }
    else toast.error("Could not archive catalogue item");
  };

  const balanceFor = (inv: Invoice) => {
    const paid = Number(inv.payments_total_cents || 0);
    if (inv.paid_at && paid === 0) return 0;
    return Math.max(0, Number(inv.total_cents || 0) - paid - Number(inv.credits_total_cents || 0));
  };

  const downloadReceipt = async (paymentId: string, receiptNumber: string) => {
    const res = await fetch(`/api/invoices/payments/${paymentId}/receipt.pdf`, { credentials: "include" });
    if (!res.ok) { toast.error("Could not download receipt"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${receiptNumber}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadCreditNote = async (creditId: string, creditNumber: string) => {
    const res = await fetch(`/api/invoices/credit-notes/${creditId}/pdf`, { credentials: "include" });
    if (!res.ok) { toast.error("Could not download credit note"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${creditNumber}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const submitPayment = async () => {
    if (!paymentTarget) return;
    const amountCents = Math.round(Number(paymentForm.amount) * 100);
    if (!Number.isInteger(amountCents) || amountCents <= 0) { toast.error("Enter a valid payment amount"); return; }
    setSavingPayment(true);
    try {
      const res = await fetch(`/api/invoices/${paymentTarget.id}/payments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_cents: amountCents, payment_method: paymentForm.payment_method,
          reference: paymentForm.reference, notes: paymentForm.notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not record payment");
      toast.success(`Payment recorded · receipt ${data.receiptNumber}`);
      setPaymentTarget(null);
      await loadInvoices();
      await downloadReceipt(data.paymentId, data.receiptNumber);
    } catch (err: any) {
      toast.error(err.message || "Could not record payment");
    } finally {
      setSavingPayment(false);
    }
  };

  const submitCreditNote = async () => {
    if (!creditTarget) return;
    const amountCents = Math.round(Number(creditForm.amount) * 100);
    if (!Number.isInteger(amountCents) || amountCents <= 0 || !creditForm.reason.trim()) {
      toast.error("Enter a valid amount and reason"); return;
    }
    setSavingCredit(true);
    try {
      const res = await fetch(`/api/invoices/${creditTarget.id}/credit-notes`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_cents: amountCents, reason: creditForm.reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not issue credit note");
      toast.success(`Credit note ${data.creditNumber} issued`);
      setCreditTarget(null);
      await loadInvoices();
    } catch (err: any) {
      toast.error(err.message || "Could not issue credit note");
    } finally {
      setSavingCredit(false);
    }
  };

  const openHistory = async (inv: Invoice) => {
    setHistoryTarget(inv);
    setHistoryLoading(true);
    try {
      const [auditRes, revisionRes, creditRes, paymentRes] = await Promise.all([
        fetch(`/api/invoices/${inv.id}/audit`, { credentials: "include" }),
        fetch(`/api/invoices/${inv.id}/revisions`, { credentials: "include" }),
        fetch(`/api/invoices/${inv.id}/credit-notes`, { credentials: "include" }),
        fetch(`/api/invoices/${inv.id}/payments`, { credentials: "include" }),
      ]);
      setAuditEvents(auditRes.ok ? await auditRes.json() : []);
      setRevisionEvents(revisionRes.ok ? await revisionRes.json() : []);
      setCreditNotes(creditRes.ok ? await creditRes.json() : []);
      const payments = paymentRes.ok ? await paymentRes.json() : [];
      setInvoicePayments(payments);
      setAuditEvents((current) => [...current, ...payments.map((payment: any) => ({
        id: `payment-${payment.id}`, action: "payment_recorded", created_at: payment.paid_at,
        details: { receipt_number: payment.receipt_number, amount_cents: payment.amount_cents, payment_method: payment.payment_method },
      }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } finally {
      setHistoryLoading(false);
    }
  };

  const copyQuoteAcceptanceLink = async (inv: Invoice) => {
    if (!inv.acceptance_token) { toast.error("This quote needs to be emailed once to create an acceptance link"); return; }
    const link = `${window.location.origin}/quote/respond/${inv.acceptance_token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Quote acceptance link copied");
    } catch {
      window.prompt("Copy this quote acceptance link", link);
    }
  };

  const filtered = activeTab === "invoice" || activeTab === "quote"
    ? invoices.filter(inv => (inv.type || "invoice") === activeTab)
    : [];
  const invoiceDocs = invoices.filter((inv) => (inv.type || "invoice") === "invoice");
  const invoicedCents = invoiceDocs.reduce((sum, inv) => sum + Number(inv.total_cents || 0), 0);
  const paidDocs = invoiceDocs.filter((inv) => inv.paid_at || inv.status === "paid");
  const paidCents = invoiceDocs.reduce((sum, inv) => {
    const recorded = Number(inv.payments_total_cents || 0);
    return sum + (recorded || (inv.paid_at ? Number(inv.total_cents || 0) : 0));
  }, 0);
  const outstandingCents = invoiceDocs.reduce((sum, inv) => sum + balanceFor(inv), 0);
  const today = new Date().toISOString().slice(0, 10);
  const overdueDocs = invoiceDocs.filter((inv) =>
    balanceFor(inv) > 0 && inv.due_date && inv.due_date.slice(0, 10) < today
  );
  const overdueCents = overdueDocs.reduce((sum, inv) => sum + Number(inv.total_cents || 0), 0);
  const collectionRate = invoicedCents > 0 ? Math.min(100, Math.round((paidCents / invoicedCents) * 100)) : 0;

  return (
    <div className="nero-page min-h-full bg-slate-50/70 dark:bg-gray-950">

      <NeroSectionHeader
        section="Transactions"
        title="Quotes & Invoices"
        description="Create, send and track professional invoices and quotes for your clients"
        backgroundImage={heroImage}
        backgroundPosition="center 43%"
        backgroundOverlay="90deg, rgba(7, 44, 35, 0.93) 0%, rgba(9, 68, 72, 0.78) 52%, rgba(10, 40, 61, 0.62) 100%"
        actions={
          <>
            <Button
              onClick={() => openCreate("quote")}
              variant="outline"
              className="gap-2 rounded-lg border-white/30 bg-white/10 text-white shadow-sm backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Plus className="h-4 w-4" /> New quote
            </Button>
            <Button onClick={() => openCreate("invoice")} className="gap-2 rounded-lg bg-white text-emerald-900 shadow-lg shadow-black/10 hover:bg-emerald-50">
              <Plus className="h-4 w-4" /> New invoice
            </Button>
          </>
        }
      />

      {/* ── Quick action bar ─────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white px-4 py-2 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <p className="whitespace-nowrap text-xs font-medium text-slate-400">Manage documents</p>
          {[
            { label: "Export CSV",   icon: Download, action: () => handleExport("csv") },
            { label: "Export Excel", icon: Download, action: () => handleExport("xlsx") },
            { label: "Import CSV",   icon: Upload,   action: () => fileInputRef.current?.click() },
          ].map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={a.action}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-800">
              <a.icon className="h-3.5 w-3.5 text-slate-400" />
              <span className="whitespace-nowrap">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      <section
        className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-xl shadow-emerald-950/10 sm:px-7"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 44, 35, 0.94) 0%, rgba(9, 68, 72, 0.78) 52%, rgba(10, 40, 61, 0.65) 100%), url(${smmeOwnerImage})`, backgroundPosition: "center 32%", backgroundSize: "cover" }}
      >
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-50">Collection pulse</span>
            <h2 className="mt-3 max-w-lg text-2xl font-bold leading-tight tracking-tight sm:text-3xl">Turn outstanding invoices into momentum.</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-emerald-50/80">A clear view of what is owed helps you follow up confidently and keep your cash moving.</p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur-sm">
            <div>
              <p className="text-xs font-medium text-emerald-50/70">Still to collect</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">R{(outstandingCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-emerald-50/70">
                <span>{paidDocs.length} paid of {invoiceDocs.length} invoices</span><span>{collectionRate}% collected</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 transition-all" style={{ width: `${collectionRate}%` }} /></div>
            </div>
            <button onClick={() => setActiveTab("invoice")} className="mt-1 inline-flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-left text-xs font-bold text-emerald-900 transition hover:bg-emerald-50">
              {overdueDocs.length ? `Review ${overdueDocs.length} overdue invoice${overdueDocs.length === 1 ? "" : "s"}` : "Review outstanding invoices"}<ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Invoiced", value: invoicedCents, detail: `${invoiceDocs.length} invoices`, icon: ReceiptText, tone: "text-blue-700 bg-blue-50" },
          { label: "Awaiting payment", value: outstandingCents, detail: `${invoiceDocs.length - paidDocs.length} outstanding`, icon: Clock3, tone: "text-amber-700 bg-amber-50" },
          { label: "Overdue", value: overdueCents, detail: `${overdueDocs.length} overdue`, icon: AlertCircle, tone: "text-red-700 bg-red-50" },
          { label: "Paid", value: paidCents, detail: `${paidDocs.length} paid`, icon: WalletCards, tone: "text-emerald-700 bg-emerald-50" },
        ].map((metric) => (
          <Card key={metric.label} className="rounded-2xl border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-medium text-muted-foreground">{metric.label}</p><p className="mt-1 text-xl font-bold tracking-tight">R{(metric.value / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p><p className="mt-1 text-[11px] text-muted-foreground">{metric.detail}</p></div><div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5 ${metric.tone}`}><metric.icon className="h-4 w-4" /></div></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Win the next job", detail: "Send a polished quote in under a minute.", icon: Plus, style: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900", action: () => openCreate("quote") },
          { label: "Get paid faster", detail: "Keep your collection streak going.", icon: ReceiptText, style: "border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-900", action: () => openCreate("invoice") },
          { label: "Make it unmistakably yours", detail: "Create a branded template customers remember.", icon: Palette, style: "border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 text-purple-900", action: () => setActiveTab("designer") },
        ].map((action) => (
          <button key={action.label} onClick={action.action} className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${action.style}`}>
            <action.icon className="mb-3 h-8 w-8 rounded-xl bg-white/80 p-1.5" /><p className="text-sm font-bold">{action.label}</p><p className="mt-1 text-xs opacity-75">{action.detail}</p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {(["invoice", "quote"] as const).map((tab) => {
          const count = invoices.filter(i => (i.type || "invoice") === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              {tab === "invoice" ? "Invoices" : "Quotes"} <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab("designer")}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "designer"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
          }`}
        >
          <Palette className="h-3.5 w-3.5" /> Template Designer
        </button>
        {[
          { id: "catalog" as const, label: "Products & Services", icon: ClipboardList },
          { id: "settings" as const, label: "Document Settings", icon: Settings2 },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === id ? "bg-slate-900 text-white shadow-sm" : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
            }`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Template Designer Tab */}
      {activeTab === "designer" && (
        <Card className="p-6">
          <InvoiceTemplateDesigner onSave={refreshCustomTemplateMeta} />
        </Card>
      )}

      {activeTab === "catalog" && (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div>
              <h3 className="font-semibold">Products & Services</h3>
              <p className="text-sm text-muted-foreground">Save frequently billed items and add them to quotes or invoices in one click.</p>
            </div>
            <Button onClick={openNewCatalogItem} className="gap-2"><Plus className="h-4 w-4" /> Add item</Button>
          </div>
          {catalogItems.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No catalogue items yet. Add a product or service to reuse it on documents.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Code</th><th className="p-3">Unit</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Actions</th>
                </tr></thead>
                <tbody>{catalogItems.map(item => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.name}{item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}</td>
                    <td className="p-3 capitalize">{item.item_type}</td><td className="p-3 text-muted-foreground">{item.code || "—"}</td>
                    <td className="p-3">{item.unit}</td><td className="p-3 text-right font-semibold">R{(item.unit_price_cents / 100).toFixed(2)}</td>
                    <td className="p-3"><div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditCatalogItem(item)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => archiveCatalogItem(item)} className="text-destructive"><Ban className="h-3.5 w-3.5 mr-1" /> Archive</Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === "settings" && (
        <Card className="mx-auto max-w-3xl p-5 sm:p-7">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Document settings</h3>
            <p className="text-sm text-muted-foreground">Set defaults for tax, payment terms and document numbering. Each document saves its own tax rate.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border p-4 sm:col-span-2">
              <input type="checkbox" checked={!!documentSettings.default_tax_enabled}
                onChange={e => setDocumentSettings(current => ({ ...current, default_tax_enabled: e.target.checked }))} />
              <span><span className="block text-sm font-medium">Include tax by default</span><span className="text-xs text-muted-foreground">You can still change this on each quote or invoice.</span></span>
            </label>
            <div><Label>Default tax rate (%)</Label><Input type="number" min="0" max="100" step="0.01" className="mt-1" value={documentSettings.tax_rate}
              onChange={e => setDocumentSettings(current => ({ ...current, tax_rate: Number(e.target.value) }))} /></div>
            <div><Label>Tax label</Label><Input className="mt-1" maxLength={40} value={documentSettings.tax_label}
              onChange={e => setDocumentSettings(current => ({ ...current, tax_label: e.target.value }))} placeholder="VAT" /></div>
            <div><Label>Invoice number prefix</Label><Input className="mt-1 uppercase" maxLength={10} value={documentSettings.invoice_prefix}
              onChange={e => setDocumentSettings(current => ({ ...current, invoice_prefix: e.target.value.toUpperCase() }))} /></div>
            <div><Label>Quote number prefix</Label><Input className="mt-1 uppercase" maxLength={10} value={documentSettings.quote_prefix}
              onChange={e => setDocumentSettings(current => ({ ...current, quote_prefix: e.target.value.toUpperCase() }))} /></div>
            <div><Label>Receipt number prefix</Label><Input className="mt-1 uppercase" maxLength={10} value={documentSettings.receipt_prefix}
              onChange={e => setDocumentSettings(current => ({ ...current, receipt_prefix: e.target.value.toUpperCase() }))} /></div>
            <div><Label>Default payment terms</Label><Input className="mt-1" maxLength={100} value={documentSettings.default_payment_terms}
              onChange={e => setDocumentSettings(current => ({ ...current, default_payment_terms: e.target.value }))} placeholder="30 days" /></div>
          </div>
          <div className="mt-6 flex justify-end"><Button onClick={saveDocumentSettings} disabled={savingDocumentSettings} className="gap-2">
            {savingDocumentSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save settings
          </Button></div>
        </Card>
      )}

      {/* Invoice Form Slide-out Drawer */}
      {(showCreate || editingId !== null) && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={resetForm} />

          {/* Drawer panel */}
          <div className="fixed top-4 bottom-4 right-4 z-50 flex w-full max-w-[96vw] shadow-2xl rounded-2xl overflow-hidden">

            {/* ── LEFT: Form ── */}
            <div className="flex flex-col w-full md:w-[55%] bg-background border-l overflow-hidden">

              {/* Sticky header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b bg-background/95 backdrop-blur shrink-0">
                <div>
                  <h3 className="text-base font-bold leading-tight">
                    {editingId
                      ? `Edit ${docType === "quote" ? "Quote" : "Invoice"}`
                      : `New ${docType === "quote" ? "Quote" : "Invoice"}`}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Preview updates live →</p>
                </div>
                <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Template Selector */}
                <div>
                  <Label className="text-xs mb-2 block font-semibold">Choose Template</Label>
                  <div className="flex gap-2 flex-wrap">
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

                {/* Client Picker */}
                {invoiceClients.length > 0 && (
                  <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                    <Label className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                      <Users className="h-4 w-4 text-primary" />
                      Select Client
                    </Label>
                    {selectedClientIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {selectedClientIds.map(id => {
                          const c = invoiceClients.find(cl => cl.id === id);
                          if (!c) return null;
                          return (
                            <span key={id} className="inline-flex items-center gap-1 bg-primary/15 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                              <Building2 className="h-3 w-3" />
                              {c.business_name || c.full_name}
                              <button type="button" onClick={() => toggleClientSelection(id)} className="ml-0.5 hover:text-red-500 transition-colors">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                        {selectedClientIds.length > 1 && (
                          <p className="w-full text-xs text-amber-600 font-medium mt-1">
                            {selectedClientIds.length} clients selected — a separate {docType} will be created for each.
                          </p>
                        )}
                      </div>
                    )}
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, business or email..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5 rounded-md border border-border bg-background p-1">
                      {filteredInvoiceClients.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No clients found</p>
                      ) : filteredInvoiceClients.map(c => {
                        const selected = selectedClientIds.includes(c.id);
                        const displayName = c.business_name || c.full_name;
                        const initial = displayName.charAt(0).toUpperCase();
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleClientSelection(c.id)}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-md text-left transition-colors ${
                              selected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/60"
                            }`}
                          >
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              selected ? "bg-primary" : "bg-gradient-to-br from-gray-400 to-gray-500"
                            }`}>
                              {initial}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{c.full_name}</div>
                              {c.business_name && c.business_name !== c.full_name && (
                                <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                  <Building2 className="h-2.5 w-2.5" />{c.business_name}
                                </div>
                              )}
                              {(c.business_email || c.email) && (
                                <div className="text-xs text-muted-foreground truncate">{c.business_email || c.email}</div>
                              )}
                            </div>
                            {selected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {selectedClientIds.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">Or fill in customer details manually below.</p>
                    )}
                  </div>
                )}

                {/* Customer Fields */}
                <div>
                  <Label className="text-xs mb-2 block font-semibold">Customer Details</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name *{selectedClientIds.length > 1 ? " (auto-filled per client)" : ""}</Label>
                      <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1" placeholder="Company or person name" disabled={selectedClientIds.length > 1} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1" placeholder="Optional" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1" placeholder="Optional" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="mt-1" placeholder="Optional" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">VAT Number</Label>
                        <Input value={customerVat} onChange={(e) => setCustomerVat(e.target.value)} className="mt-1" placeholder="Optional" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date / Terms */}
                <div className="grid grid-cols-2 gap-3">
                  {docType === "quote" ? (
                    <div>
                      <Label className="text-xs text-muted-foreground">Quote Valid For</Label>
                      <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="mt-1" placeholder="e.g. 30 days" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">Due Date</Label>
                        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Invoice Number</Label>
                        {!editingId && invoices.filter((i) => i.type === "invoice").length === 0 ? (
                          <>
                            <Input
                              type="number"
                              min="1"
                              value={startingInvoiceNum}
                              onChange={(e) => setStartingInvoiceNum(e.target.value)}
                              className="mt-1"
                              placeholder="e.g. 1001"
                            />
                            <p className="text-xs text-muted-foreground mt-1">First invoice — set your starting number.</p>
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

                {/* Line Items */}
                <div>
                  <Label className="text-xs mb-2 block font-semibold">Line Items</Label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1 pb-1 border-b">
                      <div className="col-span-5">Item</div>
                      <div className="col-span-2">Qty</div>
                      <div className="col-span-2">Unit Price</div>
                      <div className="col-span-2 text-right">Amount</div>
                      <div className="col-span-1" />
                    </div>
                    {items.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center py-1.5 border-b border-dashed border-muted last:border-0">
                        <div className="col-span-5 relative">
                          <div className="flex gap-1">
                            <Input value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} className="h-8 text-sm flex-1" placeholder="Description" />
                            {(inventoryProducts.length > 0 || catalogItems.length > 0) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                title="Pick from catalogue or inventory"
                                onClick={() => setOpenItemDropdownIndex(openItemDropdownIndex === i ? null : i)}
                              >
                                <Package className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          {openItemDropdownIndex === i && (
                            <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-background border border-border rounded-md shadow-lg max-h-44 overflow-y-auto">
                              {catalogItems.map(item => (
                                <button
                                  key={`catalog-${item.id}`}
                                  type="button"
                                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/60 text-left gap-2"
                                  onClick={() => selectCatalogItem(i, item)}
                                >
                                  <span className="truncate">{item.name}<span className="text-muted-foreground ml-1 text-xs">({item.item_type})</span></span>
                                  <span className="text-primary font-medium flex-shrink-0">R{(item.unit_price_cents / 100).toFixed(2)}</span>
                                </button>
                              ))}
                              {inventoryProducts.map(prod => (
                                <button
                                  key={prod.id}
                                  type="button"
                                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/60 text-left gap-2"
                                  onClick={() => selectInventoryProduct(i, prod)}
                                >
                                  <span className="truncate">{prod.name}{prod.sku ? <span className="text-muted-foreground ml-1 text-xs">({prod.sku})</span> : null}</span>
                                  <span className="text-primary font-medium flex-shrink-0">R{(prod.price_cents / 100).toFixed(2)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(i, "qty", parseInt(e.target.value) || 1)} className="h-8 text-sm" />
                        </div>
                        <div className="col-span-2">
                          <Input type="number" step="0.01" min="0" value={item.unitPrice || ""} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="h-8 text-sm" placeholder="0.00" />
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
                  <Button variant="outline" size="sm" onClick={addItem} className="mt-3">
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-xs text-muted-foreground">Notes / Additional Information</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Delivery instructions, payment reference, thank-you message…"
                  />
                </div>

              </div>{/* end scrollable body */}

              {/* Sticky footer — tax toggle + totals + actions */}
              <div className="border-t px-6 py-4 pb-5 bg-background shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} className="rounded" />
                  <span>Include {documentSettings.tax_label || "tax"} ({taxRate}%)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Rate
                    <Input type="number" min="0" max="100" step="0.01" value={taxRate}
                      onChange={e => setTaxRate(Number(e.target.value) || 0)} className="h-8 w-24" />
                    %
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm leading-tight">
                      {vatEnabled && (
                        <div className="text-muted-foreground text-xs">Subtotal R{subtotal.toFixed(2)} + {documentSettings.tax_label || "Tax"} R{vatAmount.toFixed(2)}</div>
                      )}
                      <div className="font-bold text-primary">Total R{total.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
                      {editingId ? (
                        <Button size="sm" onClick={handleUpdate} className="gradient-hero text-white">Save Changes</Button>
                      ) : (
                        <Button size="sm" onClick={handleCreate} className="gradient-hero text-white">
                          Create {docType === "quote" ? "Quote" : "Invoice"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>{/* end left form panel */}

            {/* ── RIGHT: Live Preview ── */}
            <div className="hidden md:flex flex-col w-[45%] bg-muted/10 border-l overflow-hidden">
              <div className="px-6 py-4 border-b bg-background/80 backdrop-blur shrink-0 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold leading-tight">Live Preview</p>
                  <p className="text-xs text-muted-foreground">Updates as you type</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 pb-8">
                <InvoicePreview
                  docType={docType}
                  selectedTemplate={selectedTemplate}
                  customerName={customerName}
                  customerEmail={customerEmail}
                  customerPhone={customerPhone}
                  customerAddress={customerAddress}
                  customerVat={customerVat}
                  paymentTerms={paymentTerms}
                  dueDate={dueDate}
                  notes={notes}
                  items={items}
                  vatEnabled={vatEnabled}
                  taxLabel={documentSettings.tax_label}
                  taxRate={taxRate}
                  subtotal={subtotal}
                  vatAmount={vatAmount}
                  total={total}
                />
              </div>
            </div>{/* end right preview panel */}

          </div>{/* end drawer panel */}
        </>
      )}{/* end slide-out drawer */}

      {/* Document list */}
      {(activeTab === "invoice" || activeTab === "quote") && <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">{activeTab === "quote" ? "Quote #" : "Invoice #"}</th>
              <th className="text-left p-3 font-semibold">Customer</th>
              <th className="text-left p-3 font-semibold hidden sm:table-cell">Template</th>
              <th className="text-left p-3 font-semibold hidden sm:table-cell">Items</th>
              <th className="text-right p-3 font-semibold">Total</th>
              <th className="text-left p-3 font-semibold hidden md:table-cell">Date</th>
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
                  <td className="p-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-sm ${tpl.badgeBg}`} />
                      <span className="text-xs text-muted-foreground">{tpl.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">
                    {inv.items.length} item{inv.items.length !== 1 ? "s" : ""}
                    {inv.vat_enabled && <span className="ml-1 text-xs text-green-600 font-medium">+ {inv.tax_label || "VAT"}</span>}
                  </td>
                  <td className="p-3 text-right font-bold text-primary">
                    R{(inv.total_cents / 100).toFixed(2)}
                    {inv.type === "invoice" && Number(inv.credits_total_cents || 0) > 0 && (
                      <div className="text-[10px] font-normal text-emerald-700 mt-0.5">
                        R{(Number(inv.credits_total_cents) / 100).toFixed(2)} credited · R{(balanceFor(inv) / 100).toFixed(2)} due
                      </div>
                    )}
                    {inv.late_fee_cents && inv.late_fee_cents > 0 ? (
                      <div className="text-[10px] font-normal text-red-600 mt-0.5">
                        incl. R{(inv.late_fee_cents / 100).toFixed(2)} late fee
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">
                    <div>{new Date(inv.created_at).toLocaleDateString("en-ZA")}</div>
                    {inv.type === "invoice" && (
                      balanceFor(inv) === 0 ? (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" /> {inv.status === "credited" ? "Credited" : inv.status === "settled" ? "Settled" : "Paid"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          {Number(inv.payments_total_cents || 0) > 0 ? "Part paid" : "Outstanding"}
                        </span>
                      )
                    )}
                    {inv.type === "quote" && (
                      <span className={`inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                        inv.status === "accepted" || inv.status === "converted" ? "text-emerald-700 bg-emerald-50" : inv.status === "void" ? "text-slate-600 bg-slate-100" : "text-amber-700 bg-amber-50"
                      }`}>
                        {inv.status === "converted" ? "Converted" : inv.status === "accepted" ? "Accepted" : inv.status === "void" ? "Voided" : inv.status === "sent" ? "Sent · awaiting response" : "Draft"}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end flex-wrap">
              {inv.type === "quote" && inv.status !== "converted" && inv.status !== "void" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => copyQuoteAcceptanceLink(inv)} title="Copy customer acceptance link">
                            <Copy className="h-3.5 w-3.5 mr-1" /> Accept link
                          </Button>
                          {inv.status === "accepted" && (
                            <Button variant="outline" size="sm" onClick={() => handleConvert(inv)} title="Create an invoice and keep the accepted quote">
                              <RefreshCw className="h-3.5 w-3.5 mr-1" /> To Invoice
                            </Button>
                          )}
                        </>
                      )}
                      {inv.type === "invoice" && balanceFor(inv) > 0 && inv.status !== "void" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setPaymentTarget(inv); setPaymentForm({ amount: (balanceFor(inv) / 100).toFixed(2), payment_method: "eft", reference: "", notes: "" }); }}
                          className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          title="Record a full or partial payment and create a receipt"
                        >
                          <CreditCard className="h-3.5 w-3.5 mr-1" /> Record payment
                        </Button>
                      )}
                      {inv.type === "invoice" && inv.status !== "void" && balanceFor(inv) > 0 && (
                        <Button variant="outline" size="sm" onClick={() => { setCreditTarget(inv); setCreditForm({ amount: "", reason: "" }); }}>
                          <FileText className="h-3.5 w-3.5 mr-1" /> Credit note
                        </Button>
                      )}
                      {inv.status !== "paid" && inv.status !== "void" && inv.status !== "converted" && (
                        <Button variant="outline" size="sm" onClick={() => handleEdit(inv)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openHistory(inv)} title="View audit trail, revisions, payments and credits">
                        <History className="h-3.5 w-3.5 mr-1" /> History
                      </Button>
                      {inv.type === "invoice" && (
                        recurringSourceIds.has(inv.id) ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md"
                            title="A recurring template was created from this invoice"
                          >
                            <RefreshCw className="h-3 w-3" /> Recurring
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={makingRecurringId === inv.id}
                            onClick={() => handleMakeRecurring(inv)}
                            title="Turn this invoice into a recurring template"
                          >
                            {makingRecurringId === inv.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
                            Make Recurring
                          </Button>
                        )
                      )}
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
                      {inv.type !== "quote" && balanceFor(inv) > 0 && inv.status !== "void" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={copyingPayLinkId === inv.id}
                          onClick={() => copyPayLink(inv)}
                          title="Copy payment link to share with client"
                        >
                          {copyingPayLinkId === inv.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            : <Link2 className="h-3.5 w-3.5 mr-1" />}
                          Pay Link
                        </Button>
                      )}
                      {inv.status !== "void" && inv.status !== "paid" && inv.status !== "converted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deletingId === inv.id}
                          onClick={() => handleDelete(inv)}
                          className="text-destructive border-destructive/30 hover:bg-destructive/5"
                          title="Void document and preserve its history"
                        >
                          {deletingId === inv.id ? <Loader2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
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
                  <button onClick={() => openCreate(activeTab)} className="ml-2 text-primary underline underline-offset-2">
                    Create your first {activeTab === "quote" ? "quote" : "invoice"}.
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>}

      {catalogModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setCatalogModalOpen(false)}>
          <Card className="w-full max-w-lg p-5 sm:p-6" onClick={(e: any) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div><h3 className="font-semibold">{editingCatalogItem ? "Edit catalogue item" : "Add a product or service"}</h3><p className="text-xs text-muted-foreground mt-1">This saved item can be reused on future documents.</p></div>
              <Button variant="ghost" size="icon" onClick={() => setCatalogModalOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Type</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={catalogForm.item_type} onChange={e => setCatalogForm(f => ({ ...f, item_type: e.target.value }))}>
                <option value="service">Service</option><option value="product">Product</option>
              </select></div>
              <div><Label>Item code (optional)</Label><Input className="mt-1" value={catalogForm.code} onChange={e => setCatalogForm(f => ({ ...f, code: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Label>Name</Label><Input className="mt-1" value={catalogForm.name} onChange={e => setCatalogForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Website maintenance" /></div>
              <div><Label>Unit</Label><Input className="mt-1" value={catalogForm.unit} onChange={e => setCatalogForm(f => ({ ...f, unit: e.target.value }))} placeholder="hour, item, project" /></div>
              <div><Label>Unit price (R)</Label><Input className="mt-1" type="number" min="0" step="0.01" value={catalogForm.unit_price} onChange={e => setCatalogForm(f => ({ ...f, unit_price: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Label>Description (optional)</Label><textarea className="mt-1 min-h-20 w-full rounded-md border bg-background p-3 text-sm" value={catalogForm.description} onChange={e => setCatalogForm(f => ({ ...f, description: e.target.value }))} /></div>
            </div>
            <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setCatalogModalOpen(false)}>Cancel</Button>
              <Button onClick={saveCatalogItem} disabled={savingCatalog}>{savingCatalog ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{editingCatalogItem ? "Save changes" : "Add item"}</Button>
            </div>
          </Card>
        </div>
      )}

      {paymentTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setPaymentTarget(null)}>
          <Card className="w-full max-w-md p-5 sm:p-6" onClick={(e: any) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div><h3 className="font-semibold">Record payment</h3><p className="text-sm text-muted-foreground">{paymentTarget.invoice_number} · balance R{(balanceFor(paymentTarget) / 100).toFixed(2)}</p></div>
              <Button variant="ghost" size="icon" onClick={() => setPaymentTarget(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div><Label>Amount received (R)</Label><Input className="mt-1" type="number" min="0.01" max={(balanceFor(paymentTarget) / 100).toFixed(2)} step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><Label>Payment method</Label><select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={paymentForm.payment_method} onChange={e => setPaymentForm(f => ({ ...f, payment_method: e.target.value }))}>
                <option value="eft">EFT / bank transfer</option><option value="cash">Cash</option><option value="card">Card</option><option value="online">Online payment</option><option value="other">Other</option>
              </select></div>
              <div><Label>Reference (optional)</Label><Input className="mt-1" value={paymentForm.reference} onChange={e => setPaymentForm(f => ({ ...f, reference: e.target.value }))} /></div>
              <div><Label>Notes (optional)</Label><Input className="mt-1" value={paymentForm.notes} onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setPaymentTarget(null)}>Cancel</Button>
              <Button onClick={submitPayment} disabled={savingPayment}>{savingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}Record payment & issue receipt</Button>
            </div>
          </Card>
        </div>
      )}

      {creditTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setCreditTarget(null)}>
          <Card className="w-full max-w-md p-5 sm:p-6" onClick={(e: any) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div><h3 className="font-semibold">Issue credit note</h3><p className="text-sm text-muted-foreground">{creditTarget.invoice_number} · balance R{(balanceFor(creditTarget) / 100).toFixed(2)}</p></div>
              <Button variant="ghost" size="icon" onClick={() => setCreditTarget(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div><Label>Credit amount (R)</Label><Input className="mt-1" type="number" min="0.01" max={(balanceFor(creditTarget) / 100).toFixed(2)} step="0.01" value={creditForm.amount} onChange={e => setCreditForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><Label>Reason</Label><textarea className="mt-1 min-h-24 w-full rounded-md border bg-background p-3 text-sm" value={creditForm.reason} onChange={e => setCreditForm(f => ({ ...f, reason: e.target.value }))} placeholder="Describe the adjustment or returned goods" /></div>
            </div>
            <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setCreditTarget(null)}>Cancel</Button>
              <Button onClick={submitCreditNote} disabled={savingCredit}>{savingCredit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Issue credit note</Button>
            </div>
          </Card>
        </div>
      )}

      {historyTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setHistoryTarget(null)}>
          <Card className="max-h-[88vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6" onClick={(e: any) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div><h3 className="font-semibold">Document history</h3><p className="text-sm text-muted-foreground">{historyTarget.invoice_number} · {historyTarget.customer_name}</p></div>
              <Button variant="ghost" size="icon" onClick={() => setHistoryTarget(null)}><X className="h-4 w-4" /></Button>
            </div>
            {historyLoading ? <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div> : (
              <div className="space-y-6">
                <section>
                  <h4 className="mb-3 text-sm font-semibold">Audit trail</h4>
                  {auditEvents.length === 0 ? <p className="text-sm text-muted-foreground">No audit events yet.</p> : <div className="space-y-2">
                    {auditEvents.map(event => <div key={event.id} className="rounded-lg border p-3">
                      <div className="flex flex-wrap justify-between gap-2"><span className="text-sm font-medium capitalize">{String(event.action).replaceAll("_", " ")}</span><time className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString("en-ZA")}</time></div>
                      {event.details && <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">{JSON.stringify(event.details, null, 2)}</pre>}
                    </div>)}
                  </div>}
                </section>
                <section>
                  <h4 className="mb-3 text-sm font-semibold">Previous revisions</h4>
                  {revisionEvents.length === 0 ? <p className="text-sm text-muted-foreground">No revisions; the current version is the original.</p> : <div className="space-y-2">
                    {revisionEvents.map(revision => <details key={revision.id} className="rounded-lg border p-3">
                      <summary className="cursor-pointer text-sm font-medium">Before revision {revision.revision_number} · {new Date(revision.created_at).toLocaleString("en-ZA")}</summary>
                      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">{JSON.stringify(revision.snapshot, null, 2)}</pre>
                    </details>)}
                  </div>}
                </section>
                <section>
                  <h4 className="mb-3 text-sm font-semibold">Payment receipts</h4>
                  {invoicePayments.length === 0 ? <p className="text-sm text-muted-foreground">No payment receipts recorded.</p> : <div className="space-y-2">
                    {invoicePayments.map(payment => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                      <div><p className="text-sm font-medium">{payment.receipt_number} · R{(payment.amount_cents / 100).toFixed(2)}</p><p className="text-xs text-muted-foreground">{payment.payment_method} · {new Date(payment.paid_at).toLocaleString("en-ZA")}{payment.reference ? ` · ${payment.reference}` : ""}</p></div>
                      <Button variant="outline" size="sm" onClick={() => downloadReceipt(payment.id, payment.receipt_number)}><Download className="mr-1 h-3.5 w-3.5" /> Receipt</Button>
                    </div>)}
                  </div>}
                </section>
                <section>
                  <h4 className="mb-3 text-sm font-semibold">Credit notes</h4>
                  {creditNotes.length === 0 ? <p className="text-sm text-muted-foreground">No credit notes issued.</p> : <div className="space-y-2">
                    {creditNotes.map(note => <div key={note.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                      <div><div className="flex justify-between gap-2"><span className="text-sm font-medium">{note.credit_number}</span><span className="text-sm font-semibold">R{(note.amount_cents / 100).toFixed(2)}</span></div>
                        <p className="mt-1 text-xs text-muted-foreground">{note.reason} · {new Date(note.created_at).toLocaleString("en-ZA")}</p></div>
                      <Button variant="outline" size="sm" onClick={() => downloadCreditNote(note.id, note.credit_number)}><Download className="mr-1 h-3.5 w-3.5" /> Credit PDF</Button>
                    </div>)}
                  </div>}
                </section>
              </div>
            )}
          </Card>
        </div>
      )}

      {payLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPayLinkModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Payment Link</h3>
            <p className="text-sm text-gray-500 mb-4">
              Invoice #{payLinkModal.invoiceNumber} — share this link with your client so they can pay online.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={payLinkModal.url}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 font-mono truncate"
                onFocus={e => e.target.select()}
              />
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(payLinkModal.url).catch(() => {});
                  toast.success("Copied!");
                }}
              >
                Copy
              </Button>
            </div>
            <a
              href={payLinkModal.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-center text-sm text-green-700 underline underline-offset-2 hover:text-green-800"
            >
              Open in new tab →
            </a>
            <button
              onClick={() => setPayLinkModal(null)}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
