import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, RotateCcw, ChevronDown, ChevronUp, Eye } from "lucide-react";

export interface TemplateConfig {
  accentColor: string;
  documentTitle: string;
  currencySymbol: string;
  vatRate: number;
  headerLayout: "left" | "centered";
  tableStyle: "striped" | "bordered" | "minimal";
  footerText: string;
  showFields: {
    logo: boolean;
    vatNumber: boolean;
    customerPhone: boolean;
    customerAddress: boolean;
    reference: boolean;
    paymentTerms: boolean;
    vat: boolean;
    notes: boolean;
    bankDetails: boolean;
  };
  labels: {
    itemCol: string;
    qtyCol: string;
    unitPriceCol: string;
    amountCol: string;
    subtotalLabel: string;
    vatLabel: string;
    totalLabel: string;
    notesLabel: string;
    billToLabel: string;
  };
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  accentColor: "#156C41",
  documentTitle: "TAX INVOICE",
  currencySymbol: "R",
  vatRate: 15,
  headerLayout: "left",
  tableStyle: "striped",
  footerText: "Thank you for your business!",
  showFields: {
    logo: true,
    vatNumber: true,
    customerPhone: true,
    customerAddress: true,
    reference: true,
    paymentTerms: true,
    vat: true,
    notes: true,
    bankDetails: true,
  },
  labels: {
    itemCol: "Description",
    qtyCol: "Qty",
    unitPriceCol: "Unit Price",
    amountCol: "Amount",
    subtotalLabel: "Subtotal",
    vatLabel: "VAT (15%)",
    totalLabel: "TOTAL DUE",
    notesLabel: "Notes",
    billToLabel: "Bill To",
  },
};

const STORAGE_KEY = "masakhe_invoice_template_v1";

export function loadTemplateConfig(): TemplateConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_TEMPLATE_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_TEMPLATE_CONFIG };
}

function saveTemplateConfig(config: TemplateConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

interface SectionProps { title: string; children: React.ReactNode; defaultOpen?: boolean; }
function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-semibold"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 space-y-3 bg-background">{children}</div>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group py-1">
      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

interface InvoicePreviewProps { config: TemplateConfig; profile: any; }
function InvoicePreview({ config, profile }: InvoicePreviewProps) {
  const sym = config.currencySymbol;
  const accent = config.accentColor;
  const items = [
    { name: "Web Design & Development", qty: 1, unitPrice: 8500 },
    { name: "Monthly Hosting & Support", qty: 3, unitPrice: 950 },
    { name: "SEO Optimization Package", qty: 1, unitPrice: 3200 },
  ];
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const vatAmt = config.showFields.vat ? subtotal * (config.vatRate / 100) : 0;
  const total = subtotal + vatAmt;

  const bizName = profile?.business_name || "Your Business Name";
  const bizAddr = profile?.physical_address || "123 Business Street, City";
  const bizPhone = profile?.phone || "+27 11 123 4567";
  const bizVat = profile?.vat_number || "4123456789";
  const bankName = profile?.bank_name || "Standard Bank";
  const accountNum = profile?.account_number || "12345678";
  const branchCode = profile?.branch_code || "051001";
  const accountName = profile?.account_name || bizName;

  const today = new Date().toLocaleDateString("en-ZA");
  const due = new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-ZA");

  const rowBg = (i: number) => {
    if (config.tableStyle === "striped") return i % 2 === 0 ? "#f9fafb" : "#ffffff";
    return "#ffffff";
  };
  const cellBorder = config.tableStyle === "bordered" ? `1px solid #e5e7eb` : "none";

  return (
    <div style={{ width: "595px", background: "#fff", fontFamily: "Arial, sans-serif", fontSize: "9px", color: "#1a1a1a", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
      {/* Top accent bar */}
      <div style={{ height: "6px", background: accent }} />

      {/* Header */}
      <div style={{ padding: "20px 32px 16px", display: "flex", alignItems: config.headerLayout === "centered" ? "center" : "flex-start", justifyContent: "space-between", flexDirection: config.headerLayout === "centered" ? "column" : "row", gap: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {config.showFields.logo && (
            <div style={{ width: "52px", height: "52px", borderRadius: "8px", background: accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
              <span style={{ color: "#fff", fontWeight: "bold", fontSize: "20px" }}>{bizName[0]}</span>
            </div>
          )}
          <div style={{ fontWeight: "bold", fontSize: "13px", color: "#111" }}>{bizName}</div>
          <div style={{ color: "#555", lineHeight: "1.5" }}>{bizAddr}</div>
          <div style={{ color: "#555" }}>{bizPhone}</div>
          {config.showFields.vatNumber && <div style={{ color: "#555" }}>VAT No: {bizVat}</div>}
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "3px" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: accent, letterSpacing: "1px" }}>{config.documentTitle}</div>
          <div style={{ color: "#555" }}><span style={{ color: "#333", fontWeight: "600" }}>#</span> INV-2024-001</div>
          <div style={{ color: "#555" }}>Date: {today}</div>
          <div style={{ color: "#555" }}>Due: {due}</div>
        </div>
      </div>

      {/* Bill To + Details Row */}
      <div style={{ padding: "0 32px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: "#f8f9fa", borderRadius: "6px", padding: "10px 12px" }}>
          <div style={{ fontWeight: "bold", fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.8px", color: accent, marginBottom: "5px" }}>{config.labels.billToLabel}</div>
          <div style={{ fontWeight: "600", fontSize: "10px", color: "#111" }}>ABC Corporation (Pty) Ltd</div>
          {config.showFields.customerAddress && <div style={{ color: "#555", marginTop: "2px" }}>456 Client Ave, Johannesburg, 2001</div>}
          {config.showFields.customerPhone && <div style={{ color: "#555", marginTop: "2px" }}>+27 82 987 6543</div>}
          <div style={{ color: "#555", marginTop: "2px" }}>billing@abccorp.co.za</div>
        </div>
        <div style={{ background: "#f8f9fa", borderRadius: "6px", padding: "10px 12px" }}>
          {config.showFields.reference && (
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontWeight: "600", color: "#333" }}>Reference: </span>
              <span style={{ color: "#555" }}>PO-2024-123</span>
            </div>
          )}
          {config.showFields.paymentTerms && (
            <div>
              <span style={{ fontWeight: "600", color: "#333" }}>Terms: </span>
              <span style={{ color: "#555" }}>Due within 7 days</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div style={{ padding: "0 32px 12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5px" }}>
          <thead>
            <tr style={{ background: accent, color: "#fff" }}>
              <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: "700", letterSpacing: "0.4px" }}>{config.labels.itemCol}</th>
              <th style={{ padding: "7px 8px", textAlign: "center", width: "40px", fontWeight: "700" }}>{config.labels.qtyCol}</th>
              <th style={{ padding: "7px 8px", textAlign: "right", width: "75px", fontWeight: "700" }}>{config.labels.unitPriceCol}</th>
              <th style={{ padding: "7px 10px", textAlign: "right", width: "75px", fontWeight: "700" }}>{config.labels.amountCol}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ background: rowBg(i) }}>
                <td style={{ padding: "7px 10px", borderBottom: cellBorder, color: "#111" }}>{item.name}</td>
                <td style={{ padding: "7px 8px", textAlign: "center", borderBottom: cellBorder, color: "#555" }}>{item.qty}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", borderBottom: cellBorder, color: "#555" }}>{sym}{item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: cellBorder, color: "#111", fontWeight: "600" }}>{sym}{(item.qty * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
          <div style={{ width: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 10px", color: "#555" }}>
              <span>{config.labels.subtotalLabel}</span>
              <span>{sym}{subtotal.toFixed(2)}</span>
            </div>
            {config.showFields.vat && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 10px", color: "#555" }}>
                <span>{config.labels.vatLabel.replace("15%", `${config.vatRate}%`)}</span>
                <span>{sym}{vatAmt.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: accent, color: "#fff", borderRadius: "4px", marginTop: "4px", fontWeight: "bold", fontSize: "10px" }}>
              <span>{config.labels.totalLabel}</span>
              <span>{sym}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {config.showFields.notes && (
        <div style={{ padding: "0 32px 12px" }}>
          <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "10px" }}>
            <div style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.8px", color: accent, marginBottom: "4px" }}>{config.labels.notesLabel}</div>
            <div style={{ color: "#555", lineHeight: "1.6" }}>Please reference your invoice number when making payment. Direct EFT payments are preferred.</div>
          </div>
        </div>
      )}

      {/* Bank Details + Footer */}
      <div style={{ padding: "10px 32px 16px", borderTop: `1px solid #e5e7eb`, marginTop: "4px" }}>
        {config.showFields.bankDetails && (
          <div style={{ marginBottom: "8px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {[
              { label: "Bank", value: bankName },
              { label: "Account Name", value: accountName },
              { label: "Account No.", value: accountNum },
              { label: "Branch Code", value: branchCode },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "7px", textTransform: "uppercase", color: accent, fontWeight: "700", marginBottom: "1px" }}>{label}</div>
                <div style={{ color: "#333", fontSize: "8px" }}>{value}</div>
              </div>
            ))}
          </div>
        )}
        {config.footerText && (
          <div style={{ textAlign: "center", color: "#888", fontSize: "8px", fontStyle: "italic", paddingTop: "6px", borderTop: "1px dashed #e5e7eb" }}>
            {config.footerText}
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div style={{ height: "4px", background: accent }} />
    </div>
  );
}

interface Props { onSave?: (config: TemplateConfig) => void; }

export default function InvoiceTemplateDesigner({ onSave }: Props) {
  const [config, setConfig] = useState<TemplateConfig>(loadTemplateConfig);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then(r => r.json())
      .then(d => setProfile(d.profile || d))
      .catch(() => {});
  }, []);

  const update = (partial: Partial<TemplateConfig>) => setConfig(prev => ({ ...prev, ...partial }));
  const updateField = (field: keyof TemplateConfig["showFields"], val: boolean) =>
    setConfig(prev => ({ ...prev, showFields: { ...prev.showFields, [field]: val } }));
  const updateLabel = (key: keyof TemplateConfig["labels"], val: string) =>
    setConfig(prev => ({ ...prev, labels: { ...prev.labels, [key]: val } }));

  const handleSave = () => {
    saveTemplateConfig(config);
    onSave?.(config);
    toast.success("Template saved — your next invoices will use this design");
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_TEMPLATE_CONFIG });
    saveTemplateConfig({ ...DEFAULT_TEMPLATE_CONFIG });
    toast.info("Template reset to defaults");
  };

  const SCALE = 0.72;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Settings Panel */}
      <div className="xl:col-span-2 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-bold">Template Designer</h3>
            <p className="text-xs text-muted-foreground">Changes are reflected in the live preview instantly</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-7 px-2">
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} className="gradient-hero text-white text-xs h-7 px-3">
              <Save className="h-3 w-3 mr-1" /> Save Template
            </Button>
          </div>
        </div>

        <Section title="Appearance">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Accent Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={e => update({ accentColor: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-input p-0.5"
                />
                <Input
                  value={config.accentColor}
                  onChange={e => update({ accentColor: e.target.value })}
                  className="h-9 text-xs font-mono flex-1"
                  placeholder="#156C41"
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Currency Symbol</Label>
              <Input value={config.currencySymbol} onChange={e => update({ currencySymbol: e.target.value })} className="h-9 text-xs" maxLength={3} placeholder="R" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Header Layout</Label>
              <select
                value={config.headerLayout}
                onChange={e => update({ headerLayout: e.target.value as any })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="left">Logo Left, Title Right</option>
                <option value="centered">Centered</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Table Style</Label>
              <select
                value={config.tableStyle}
                onChange={e => update({ tableStyle: e.target.value as any })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="striped">Striped rows</option>
                <option value="bordered">All borders</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Document Settings">
          <div>
            <Label className="text-xs mb-1.5 block">Document Title</Label>
            <select
              value={["TAX INVOICE", "INVOICE", "QUOTE", "PROFORMA INVOICE", "CREDIT NOTE"].includes(config.documentTitle) ? config.documentTitle : "custom"}
              onChange={e => {
                if (e.target.value !== "custom") update({ documentTitle: e.target.value });
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm mb-2"
            >
              <option value="TAX INVOICE">TAX INVOICE</option>
              <option value="INVOICE">INVOICE</option>
              <option value="QUOTE">QUOTE</option>
              <option value="PROFORMA INVOICE">PROFORMA INVOICE</option>
              <option value="CREDIT NOTE">CREDIT NOTE</option>
            </select>
            <Input
              value={config.documentTitle}
              onChange={e => update({ documentTitle: e.target.value.toUpperCase() })}
              className="h-9 text-xs"
              placeholder="Custom title..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">VAT Rate (%)</Label>
              <Input
                type="number"
                value={config.vatRate}
                onChange={e => update({ vatRate: parseFloat(e.target.value) || 15 })}
                className="h-9 text-xs"
                min={0} max={100}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Footer Text</Label>
            <Input
              value={config.footerText}
              onChange={e => update({ footerText: e.target.value })}
              className="h-9 text-xs"
              placeholder="Thank you for your business!"
            />
          </div>
        </Section>

        <Section title="Visible Fields" defaultOpen={true}>
          <div className="space-y-0.5">
            <Toggle label="Logo" checked={config.showFields.logo} onChange={v => updateField("logo", v)} />
            <Toggle label="VAT Registration Number" checked={config.showFields.vatNumber} onChange={v => updateField("vatNumber", v)} />
            <Toggle label="Customer Address" checked={config.showFields.customerAddress} onChange={v => updateField("customerAddress", v)} />
            <Toggle label="Customer Phone" checked={config.showFields.customerPhone} onChange={v => updateField("customerPhone", v)} />
            <Toggle label="Reference / PO Number" checked={config.showFields.reference} onChange={v => updateField("reference", v)} />
            <Toggle label="Payment Terms" checked={config.showFields.paymentTerms} onChange={v => updateField("paymentTerms", v)} />
            <Toggle label="VAT (15%)" checked={config.showFields.vat} onChange={v => updateField("vat", v)} />
            <Toggle label="Notes Section" checked={config.showFields.notes} onChange={v => updateField("notes", v)} />
            <Toggle label="Bank Details" checked={config.showFields.bankDetails} onChange={v => updateField("bankDetails", v)} />
          </div>
        </Section>

        <Section title="Custom Labels" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2.5">
            {([
              { key: "billToLabel", placeholder: "Bill To" },
              { key: "itemCol", placeholder: "Description" },
              { key: "qtyCol", placeholder: "Qty" },
              { key: "unitPriceCol", placeholder: "Unit Price" },
              { key: "amountCol", placeholder: "Amount" },
              { key: "subtotalLabel", placeholder: "Subtotal" },
              { key: "vatLabel", placeholder: "VAT (15%)" },
              { key: "totalLabel", placeholder: "TOTAL DUE" },
              { key: "notesLabel", placeholder: "Notes" },
            ] as { key: keyof TemplateConfig["labels"]; placeholder: string }[]).map(({ key, placeholder }) => (
              <div key={key}>
                <Label className="text-[10px] mb-1 block text-muted-foreground capitalize">{placeholder}</Label>
                <Input
                  value={config.labels[key]}
                  onChange={e => updateLabel(key, e.target.value)}
                  className="h-7 text-xs"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </Section>

        <div className="pt-2 flex gap-2">
          <Button onClick={handleSave} className="gradient-hero text-white flex-1">
            <Save className="h-4 w-4 mr-2" /> Save & Apply Template
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="xl:col-span-3">
        <div className="sticky top-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Live Preview</span>
            <span className="text-xs text-muted-foreground ml-1">Updates instantly as you change settings</span>
          </div>
          <Card className="p-4 bg-slate-100 overflow-auto flex justify-center">
            <div
              style={{
                transform: `scale(${SCALE})`,
                transformOrigin: "top center",
                width: "595px",
                height: "auto",
                display: "block",
                marginBottom: `-${595 * (1 - SCALE) * 0.42}px`,
              }}
            >
              <InvoicePreview config={config} profile={profile} />
            </div>
          </Card>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Preview uses sample data — your actual invoice will include real customer & item details
          </p>
        </div>
      </div>
    </div>
  );
}
