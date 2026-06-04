import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Download, Upload, FileText, X, Pencil, ArrowRight, RefreshCw, Mail, Loader2, Palette, CheckCircle2, Users, Search, Building2, Package, Link2, Eye } from "lucide-react";
import InvoiceTemplateDesigner, { loadTemplateConfig, hasSavedTemplateConfig, getSavedTemplateName } from "@/components/InvoiceTemplateDesigner";

interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
}

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
  created_at: string;
  paid_at?: string | null;
  late_fee_cents?: number;
  payment_token?: string | null;
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

const TEMPLATE_STYLES: Record<number, { primary: string; headerBg: string; headerText: string; rowAlt: string }> = {
  1: { primary: "#156C41", headerBg: "#156C41", headerText: "#fff", rowAlt: "#f0fdf4" },
  2: { primary: "#173872", headerBg: "#173872", headerText: "#fff", rowAlt: "#eff6ff" },
  3: { primary: "#D96508", headerBg: "#1e1e1e", headerText: "#fff", rowAlt: "#fff7ed" },
  4: { primary: "#1E59B8", headerBg: "#1E59B8", headerText: "#fff", rowAlt: "#eff6ff" },
  5: { primary: "#841212", headerBg: "#841212", headerText: "#fff", rowAlt: "#fff1f2" },
  6: { primary: "#6B21B0", headerBg: "#6B21B0", headerText: "#fff", rowAlt: "#faf5ff" },
  7: { primary: "#262626", headerBg: "#262626", headerText: "#fff", rowAlt: "#f9fafb" },
  8: { primary: "#156C41", headerBg: "#156C41", headerText: "#fff", rowAlt: "#f0fdf4" },
};

interface InvoicePreviewProps {
  docType: "invoice" | "quote";
  selectedTemplate: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerVat: string;
  paymentTerms: string;
  dueDate: string;
  notes: string;
  items: InvoiceItem[];
  vatEnabled: boolean;
  subtotal: number;
  vatAmount: number;
  total: number;
}

function InvoicePreview({ docType, selectedTemplate, customerName, customerEmail, customerPhone, customerAddress, customerVat, paymentTerms, dueDate, notes, items, vatEnabled, subtotal, vatAmount, total }: InvoicePreviewProps) {
  const s = TEMPLATE_STYLES[selectedTemplate] || TEMPLATE_STYLES[1];
  const today = new Date().toLocaleDateString("en-ZA");
  const dueDateFormatted = dueDate ? new Date(dueDate + "T00:00:00").toLocaleDateString("en-ZA") : "";
  const hasItems = items.some(i => i.name.trim());

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden text-[10.5px] font-sans border border-gray-200 select-none">
      {/* Header */}
      <div style={{ background: s.headerBg, color: s.headerText, padding: "18px 22px" }}>
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="text-[15px] font-bold tracking-tight opacity-95">Your Business</div>
            <div className="opacity-60 mt-0.5 text-[10px]">your@email.com · +27 00 000 0000</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[18px] font-black tracking-widest opacity-90">{docType === "quote" ? "QUOTE" : "INVOICE"}</div>
            <div className="opacity-70 text-[10px] mt-0.5">Auto-assigned on save</div>
          </div>
        </div>
      </div>

      {/* Bill To + Dates */}
      <div className="flex justify-between gap-4 px-5 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <div style={{ color: s.primary }} className="text-[9px] font-bold uppercase tracking-widest mb-1">Bill To</div>
          <div className="font-semibold text-gray-800 truncate">{customerName || <span className="text-gray-400 italic">Customer Name</span>}</div>
          {customerEmail && <div className="text-gray-500 truncate">{customerEmail}</div>}
          {customerPhone && <div className="text-gray-500">{customerPhone}</div>}
          {customerAddress && <div className="text-gray-500">{customerAddress}</div>}
          {customerVat && <div className="text-gray-400">VAT: {customerVat}</div>}
        </div>
        <div className="text-right flex-shrink-0 space-y-0.5">
          <div className="text-gray-500">Date: <span className="text-gray-700 font-medium">{today}</span></div>
          {docType === "invoice" && dueDateFormatted && (
            <div className="text-gray-500">Due: <span className="text-gray-700 font-medium">{dueDateFormatted}</span></div>
          )}
          {docType === "quote" && paymentTerms && (
            <div className="text-gray-500">Valid: <span className="text-gray-700 font-medium">{paymentTerms}</span></div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="px-5 pb-3">
        <table className="w-full">
          <thead>
            <tr style={{ background: s.primary, color: "#fff" }}>
              <th className="text-left py-1.5 px-2.5 rounded-tl font-semibold">Description</th>
              <th className="text-center py-1.5 px-2 font-semibold w-10">Qty</th>
              <th className="text-right py-1.5 px-2 font-semibold w-20">Unit Price</th>
              <th className="text-right py-1.5 px-2.5 rounded-tr font-semibold w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {hasItems ? items.filter(i => i.name.trim()).map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? s.rowAlt : "#fff" }}>
                <td className="py-1.5 px-2.5 text-gray-700">{item.name}</td>
                <td className="py-1.5 px-2 text-center text-gray-600">{item.qty}</td>
                <td className="py-1.5 px-2 text-right text-gray-600">R{item.unitPrice.toFixed(2)}</td>
                <td className="py-1.5 px-2.5 text-right font-medium text-gray-800">R{(item.qty * item.unitPrice).toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-300 italic">Add line items to see them here…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end px-5 pb-3">
        <div className="w-44 space-y-0.5">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>R{subtotal.toFixed(2)}</span>
          </div>
          {vatEnabled && (
            <div className="flex justify-between text-gray-500">
              <span>VAT (15%)</span><span>R{vatAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t pt-1" style={{ color: s.primary }}>
            <span>{vatEnabled ? "Total incl. VAT" : "Total"}</span>
            <span>R{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="px-5 pb-4 border-t pt-2.5 mx-5 border-gray-100">
          <div style={{ color: s.primary }} className="text-[9px] font-bold uppercase tracking-widest mb-1">Notes</div>
          <div className="text-gray-600 whitespace-pre-wrap">{notes}</div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: s.headerBg, opacity: 0.08, height: 4 }} />
      <div className="px-5 py-2.5 text-[9px] text-gray-400 text-center">
        Generated by Masakhe SMME Growth Hub · masakheportal.co.za
      </div>
    </div>
  );
}

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
  const [customerVat, setCustomerVat] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 days");
  const [dueDate, setDueDate] = useState("");
  const [startingInvoiceNum, setStartingInvoiceNum] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ name: "", qty: 1, unitPrice: 0 }]);
  const [vatEnabled, setVatEnabled] = useState(true);
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

  useEffect(() => { loadInvoices(); }, []);

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
      items, vatEnabled,
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
        await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(buildPayload(name, email, phone, address, isFirst && created === 0, clientId, vat)),
        });
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
    if (!window.confirm(`Delete ${inv.type === "quote" ? "quote" : "invoice"} ${inv.invoice_number}? This cannot be undone.`)) return;
    setDeletingId(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        toast.success(`${inv.type === "quote" ? "Quote" : "Invoice"} deleted`);
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

  const handleEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setDocType(inv.type as "invoice" | "quote");
    setSelectedTemplate(inv.template || 1);
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

  const filtered = invoices.filter(inv => (inv.type || "invoice") === (activeTab === "designer" ? "invoice" : activeTab));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Quotes & Invoices</h2>
          <p className="text-muted-foreground">Create and manage your quotes and invoices</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>CSV (.csv)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>Excel (.xlsx)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>PDF (.pdf)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Invoice Form Slide-out Drawer */}
      {(showCreate || editingId !== null) && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={resetForm} />

          {/* Drawer panel */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-7xl shadow-2xl">

            {/* ── LEFT: Form ── */}
            <div className="flex flex-col w-full md:w-[55%] bg-background border-l overflow-hidden">

              {/* Sticky header */}
              <div className="flex items-center justify-between px-5 py-4 border-b bg-background/95 backdrop-blur shrink-0">
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
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

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
                            {inventoryProducts.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                title="Pick from inventory"
                                onClick={() => setOpenItemDropdownIndex(openItemDropdownIndex === i ? null : i)}
                              >
                                <Package className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          {openItemDropdownIndex === i && (
                            <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-background border border-border rounded-md shadow-lg max-h-44 overflow-y-auto">
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

              {/* Sticky footer — VAT toggle + totals + actions */}
              <div className="border-t px-5 py-3 bg-background shrink-0">
                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} className="rounded" />
                    <span>Include VAT (15%)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm leading-tight">
                      {vatEnabled && (
                        <div className="text-muted-foreground text-xs">Subtotal R{subtotal.toFixed(2)} + VAT R{vatAmount.toFixed(2)}</div>
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
              <div className="px-5 py-3.5 border-b bg-background/80 backdrop-blur shrink-0 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold leading-tight">Live Preview</p>
                  <p className="text-xs text-muted-foreground">Updates as you type</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
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
                  subtotal={subtotal}
                  vatAmount={vatAmount}
                  total={total}
                />
              </div>
            </div>{/* end right preview panel */}

          </div>{/* end drawer panel */}
        </>
      )}{/* end slide-out drawer */}

      {/* List — hidden in designer tab */}
      {activeTab !== "designer" && <Card className="overflow-hidden">
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
                  <td className="p-3 text-muted-foreground hidden md:table-cell">
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
                      {inv.type === "invoice" && !inv.paid_at && (
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
                      {inv.type !== "quote" && !inv.paid_at && (
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
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingId === inv.id}
                        onClick={() => handleDelete(inv)}
                        className="text-destructive border-destructive/30 hover:bg-destructive/5"
                        title="Delete"
                      >
                        {deletingId === inv.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
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
        </div>
      </Card>}

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
  );
}
