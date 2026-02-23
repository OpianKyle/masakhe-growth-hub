import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Download, FileText, X } from "lucide-react";

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
  total_cents: number;
  items: InvoiceItem[];
  status: string;
  created_at: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ name: "", qty: 1, unitPrice: 0 }]);

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

  const total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  const handleCreate = async () => {
    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    if (items.some((i) => !i.name.trim())) { toast.error("All items need a name"); return; }
    if (items.some((i) => i.unitPrice <= 0)) { toast.error("All items need a price"); return; }

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ customerName, customerEmail: customerEmail || undefined, items }),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success(`Invoice ${data.invoiceNumber} created`);
      setShowCreate(false);
      setCustomerName(""); setCustomerEmail("");
      setItems([{ name: "", qty: 1, unitPrice: 0 }]);
      loadInvoices();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to create invoice");
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
          <h2 className="text-2xl font-bold font-heading">Invoices</h2>
          <p className="text-muted-foreground">Create and manage your invoices</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gradient-hero text-white">
          <Plus className="h-4 w-4 mr-2" /> New Invoice
        </Button>
      </div>

      {/* Create Invoice Form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="p-6 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Create Invoice</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-xs">Customer Name *</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1" placeholder="Company or person name" />
              </div>
              <div>
                <Label className="text-xs">Customer Email</Label>
                <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1" placeholder="Optional" />
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

            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-lg font-bold">Total: <span className="text-primary">R{total.toFixed(2)}</span></div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button onClick={handleCreate} className="gradient-hero text-white">Create Invoice</Button>
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
              <th className="text-right p-3 font-semibold">Total</th>
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
                <td className="p-3 text-muted-foreground">{inv.items.length} item{inv.items.length !== 1 ? "s" : ""}</td>
                <td className="p-3 text-right font-bold text-primary">R{(inv.total_cents / 100).toFixed(2)}</td>
                <td className="p-3 text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("en-ZA")}</td>
                <td className="p-3 text-right">
                  <Button variant="outline" size="sm" onClick={() => downloadPdf(inv.id, inv.invoice_number)}>
                    <Download className="h-3.5 w-3.5 mr-1" /> PDF
                  </Button>
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
