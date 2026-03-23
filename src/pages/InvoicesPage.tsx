import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Download, Upload, FileText, X, Pencil } from "lucide-react";

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
  notes: string | null;
  total_cents: number;
  vat_enabled: boolean;
  vat_cents: number;
  items: InvoiceItem[];
  status: string;
  created_at: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [reference, setReference] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Due within 7 days");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ name: "", qty: 1, unitPrice: 0 }]);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const res = await fetch("/api/invoices/export", { credentials: "include" });
    if (!res.ok) { toast.error("Failed to export invoices"); return; }
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
    const res = await fetch("/api/invoices/import", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(`Imported ${data.count} invoice${data.count !== 1 ? "s" : ""}`);
      loadInvoices();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to import invoices");
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

  const handleCreate = async () => {
    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    if (items.some((i) => !i.name.trim())) { toast.error("All items need a name"); return; }
    if (items.some((i) => i.unitPrice <= 0)) { toast.error("All items need a price"); return; }

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        customerName,
        customerEmail: customerEmail || undefined,
        customerAddress: customerAddress || undefined,
        customerPhone: customerPhone || undefined,
        reference: reference || undefined,
        paymentTerms: paymentTerms || undefined,
        notes: notes || undefined,
        items,
        vatEnabled,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success(`Invoice ${data.invoiceNumber} created`);
      resetForm();
      setShowCreate(false);
      loadInvoices();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to create invoice");
    }
  };

  const handleEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setCustomerName(inv.customer_name);
    setCustomerEmail(inv.customer_email || "");
    setCustomerAddress(inv.customer_address || "");
    setCustomerPhone(inv.customer_phone || "");
    setReference(inv.reference || "");
    setPaymentTerms(inv.payment_terms || "Due within 7 days");
    setNotes(inv.notes || "");
    setItems(inv.items.length > 0 ? inv.items : [{ name: "", qty: 1, unitPrice: 0 }]);
    setVatEnabled(inv.vat_enabled);
    setShowCreate(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setShowCreate(false);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerAddress("");
    setCustomerPhone("");
    setReference("");
    setPaymentTerms("Due within 7 days");
    setNotes("");
    setItems([{ name: "", qty: 1, unitPrice: 0 }]);
    setVatEnabled(true);
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
        payment_terms: paymentTerms || undefined,
        notes: notes || undefined,
        items,
        vat_enabled: vatEnabled,
      }),
    });

    if (res.ok) {
      toast.success("Invoice updated");
      resetForm();
      loadInvoices();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update invoice");
    }
  };

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Quotes/Invoices</h2>
          <p className="text-muted-foreground">Create and manage your invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
          <Button onClick={() => setShowCreate(true)} className="gradient-hero text-white">
            <Plus className="h-4 w-4 mr-2" /> New Invoice
          </Button>
        </div>
        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
      </div>

      {/* Create / Edit Invoice Form */}
      {(showCreate || editingId !== null) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="p-6 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingId ? "Edit Invoice" : "Create Invoice"}</h3>
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
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
              <div>
                <Label className="text-xs">Reference / PO Number</Label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1" placeholder="e.g. PO-2024-001" />
              </div>
              <div>
                <Label className="text-xs">Payment Terms</Label>
                <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="mt-1" placeholder="e.g. Due within 7 days" />
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1">
                <div className="col-span-5">Item</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Unit Price (R)</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} className="h-9 text-sm" placeholder="Item description" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(i, "qty", parseInt(e.target.value) || 1)} className="h-9 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="0.01" min="0" value={item.unitPrice || ""} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="h-9 text-sm" placeholder="0.00" />
                  </div>
                  <div className="col-span-2 text-right font-semibold text-sm">
                    R{(item.qty * item.unitPrice).toFixed(2)}
                  </div>
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
                <input
                  type="checkbox"
                  checked={vatEnabled}
                  onChange={(e) => setVatEnabled(e.target.checked)}
                  className="rounded"
                />
                <span>Include VAT (15%)</span>
              </label>

              <div className="w-full max-w-xs space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                {vatEnabled && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT (15%)</span>
                    <span>R{vatAmount.toFixed(2)}</span>
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
                  <Button onClick={handleCreate} className="gradient-hero text-white">Create Invoice</Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Invoice List */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">Invoice #</th>
              <th className="text-left p-3 font-semibold">Customer</th>
              <th className="text-left p-3 font-semibold">Items</th>
              <th className="text-right p-3 font-semibold">Total (incl. VAT)</th>
              <th className="text-left p-3 font-semibold">Date</th>
              <th className="text-right p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
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
                <td className="p-3 text-muted-foreground">
                  {inv.items.length} item{inv.items.length !== 1 ? "s" : ""}
                  {inv.vat_enabled && <span className="ml-1 text-xs text-green-600 font-medium">+ VAT</span>}
                </td>
                <td className="p-3 text-right font-bold text-primary">R{(inv.total_cents / 100).toFixed(2)}</td>
                <td className="p-3 text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("en-ZA")}</td>
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(inv)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadPdf(inv.id, inv.invoice_number)}>
                      <Download className="h-3.5 w-3.5 mr-1" /> PDF
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No invoices yet. Create your first invoice above.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
