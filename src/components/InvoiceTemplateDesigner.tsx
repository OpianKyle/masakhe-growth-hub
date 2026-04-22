import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, RotateCcw, ChevronDown, ChevronUp, Eye } from "lucide-react";

export interface TemplateConfig {
  templateName: string;
  accentColor: string;
  documentTitle: string;
  currencySymbol: string;
  vatRate: number;
  /* layout */
  headerLayout: "left" | "centered";
  tableStyle: "striped" | "bordered" | "minimal";
  /* header styling */
  headerBg: "white" | "accent" | "dark" | "gradient" | "custom";
  headerCustomBg: string;
  headerTitleStyle: "large" | "badge" | "outline" | "minimal";
  headerDivider: "bar" | "line" | "double" | "shadow" | "none";
  headerLogoSize: "sm" | "md" | "lg";
  headerLogoShape: "square" | "rounded" | "circle";
  headerPadding: "compact" | "normal" | "spacious";
  headerTagline: string;
  headerShowAddress: boolean;
  headerShowPhone: boolean;
  /* layout positions */
  billToPosition: "left" | "right";
  totalsAlign: "right" | "left";
  notesPosition: "after-items" | "before-totals" | "after-bank";
  bankPosition: "footer" | "after-totals";
  /* font colours */
  headingColor: string;
  bodyTextColor: string;
  mutedTextColor: string;
  tableHeaderTextColor: string;
  totalsTextColor: string;
  /* document settings */
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
  templateName: "My Custom Template",
  accentColor: "#156C41",
  documentTitle: "TAX INVOICE",
  currencySymbol: "R",
  vatRate: 15,
  headerLayout: "left",
  tableStyle: "striped",
  headerBg: "white",
  headerCustomBg: "#2d3748",
  headerTitleStyle: "large",
  headerDivider: "bar",
  headerLogoSize: "md",
  headerLogoShape: "rounded",
  headerPadding: "normal",
  headerTagline: "",
  headerShowAddress: true,
  headerShowPhone: true,
  billToPosition: "left",
  totalsAlign: "right",
  notesPosition: "after-items",
  bankPosition: "footer",
  headingColor: "#111111",
  bodyTextColor: "#333333",
  mutedTextColor: "#666666",
  tableHeaderTextColor: "#ffffff",
  totalsTextColor: "#ffffff",
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
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_TEMPLATE_CONFIG, ...parsed, showFields: { ...DEFAULT_TEMPLATE_CONFIG.showFields, ...parsed.showFields }, labels: { ...DEFAULT_TEMPLATE_CONFIG.labels, ...parsed.labels } };
    }
  } catch {}
  return { ...DEFAULT_TEMPLATE_CONFIG };
}

function saveTemplateConfig(config: TemplateConfig) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
}

export function hasSavedTemplateConfig(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== null; } catch { return false; }
}

export function getSavedTemplateName(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed.templateName as string) || null;
  } catch { return null; }
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 1;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function darkenHex(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function resolveHeaderBg(config: TemplateConfig): string {
  switch (config.headerBg) {
    case "accent": return config.accentColor;
    case "dark": return "#1a2240";
    case "gradient": return config.accentColor;
    case "custom": return config.headerCustomBg || "#2d3748";
    default: return "#ffffff";
  }
}

function resolveHeaderTextColor(config: TemplateConfig): { main: string; sub: string; inv: string } {
  const bg = resolveHeaderBg(config);
  const lum = hexLuminance(bg);
  if (lum > 0.55) return { main: "#111111", sub: "#555555", inv: "#ffffff" };
  return { main: "#ffffff", sub: "rgba(255,255,255,0.75)", inv: "#111111" };
}

/* ── UI Building Blocks ────────────────────────────────────────────── */

interface SectionProps { title: string; children: React.ReactNode; defaultOpen?: boolean; }
function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-semibold">
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
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

interface ChipProps<T extends string> { options: { value: T; label: string; preview?: React.ReactNode }[]; value: T; onChange: (v: T) => void; }
function ChipGroup<T extends string>({ options, value, onChange }: ChipProps<T>) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-md border text-xs font-medium transition-all ${value === o.value ? "border-primary bg-primary/8 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
          {o.preview && <div className="w-10 h-6 rounded overflow-hidden mb-0.5">{o.preview}</div>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Invoice Preview ──────────────────────────────────────────────── */

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
  const bizAddr = profile?.physical_address || "123 Business Street, Cape Town";
  const bizPhone = profile?.phone || "+27 21 123 4567";
  const bizVat = profile?.vat_number || "4123456789";
  const bankName = profile?.bank_name || "Standard Bank";
  const accountNum = profile?.account_number || "12345678";
  const branchCode = profile?.branch_code || "051001";
  const accountName = profile?.account_name || bizName;

  const today = new Date().toLocaleDateString("en-ZA");
  const due = new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-ZA");

  const rowBg = (i: number) => config.tableStyle === "striped" ? (i % 2 === 0 ? "#f9fafb" : "#fff") : "#fff";
  const cellBorder = config.tableStyle === "bordered" ? "1px solid #e5e7eb" : "none";

  const headerBg = resolveHeaderBg(config);
  const { main: hText, sub: hSub } = resolveHeaderTextColor(config);
  const isColoredHeader = config.headerBg !== "white";

  const paddingMap = { compact: "12px 32px 10px", normal: "20px 32px 16px", spacious: "32px 40px 28px" };
  const hPad = paddingMap[config.headerLogoSize === "lg" ? "spacious" : config.headerPadding] || paddingMap.normal;

  const logoSizeMap = { sm: "36px", md: "52px", lg: "72px" };
  const logoSz = logoSizeMap[config.headerLogoSize];
  const logoRadius = config.headerLogoShape === "circle" ? "50%" : config.headerLogoShape === "rounded" ? "10px" : "4px";
  const logoFontSize = config.headerLogoSize === "lg" ? "28px" : config.headerLogoSize === "sm" ? "14px" : "20px";

  const logoColor = isColoredHeader ? "rgba(255,255,255,0.2)" : accent;
  const logoTextColor = isColoredHeader ? "#fff" : "#fff";

  const gradientStyle = config.headerBg === "gradient"
    ? { background: `linear-gradient(135deg, ${accent} 0%, ${darkenHex(accent, 60)} 100%)` }
    : { background: headerBg };

  const titleColor = isColoredHeader ? "#fff" : accent;

  const renderTitle = () => {
    switch (config.headerTitleStyle) {
      case "badge":
        return <div style={{ display: "inline-block", background: isColoredHeader ? "rgba(255,255,255,0.2)" : accent, color: "#fff", padding: "4px 12px", borderRadius: "4px", fontWeight: "800", fontSize: "14px", letterSpacing: "1.5px" }}>{config.documentTitle}</div>;
      case "outline":
        return <div style={{ display: "inline-block", border: `2px solid ${isColoredHeader ? "rgba(255,255,255,0.7)" : accent}`, color: titleColor, padding: "4px 12px", borderRadius: "4px", fontWeight: "800", fontSize: "14px", letterSpacing: "1px" }}>{config.documentTitle}</div>;
      case "minimal":
        return <div style={{ color: hSub, fontSize: "10px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase" }}>{config.documentTitle}</div>;
      default:
        return <div style={{ fontSize: "18px", fontWeight: "800", color: titleColor, letterSpacing: "1px" }}>{config.documentTitle}</div>;
    }
  };

  const renderDivider = () => {
    switch (config.headerDivider) {
      case "line":
        return <div style={{ height: "1px", background: "#e5e7eb", margin: "0" }} />;
      case "double":
        return <div style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", height: "3px", margin: "0" }} />;
      case "shadow":
        return <div style={{ height: "4px", background: "linear-gradient(to bottom, rgba(0,0,0,0.08), transparent)" }} />;
      case "none":
        return null;
      default:
        return <div style={{ height: "5px", background: accent }} />;
    }
  };

  return (
    <div style={{ width: "595px", background: "#fff", fontFamily: "Arial, sans-serif", fontSize: "9px", color: config.bodyTextColor, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
      {/* Top accent bar (only for "bar" divider and non-white headers) */}
      {config.headerBg === "white" && config.headerDivider === "bar" && (
        <div style={{ height: "5px", background: accent }} />
      )}

      {/* Header */}
      <div style={{ ...gradientStyle, padding: hPad }}>
        {config.headerLayout === "centered" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" }}>
            {config.showFields.logo && (
              <div style={{ width: logoSz, height: logoSz, borderRadius: logoRadius, background: logoColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: logoTextColor, fontWeight: "bold", fontSize: logoFontSize }}>{bizName[0]}</span>
              </div>
            )}
            <div>
              <div style={{ fontWeight: "800", fontSize: "15px", color: hText }}>{bizName}</div>
              {config.headerTagline && <div style={{ color: hSub, fontSize: "8.5px", fontStyle: "italic", marginTop: "2px" }}>{config.headerTagline}</div>}
              {config.headerShowAddress && <div style={{ color: hSub, marginTop: "3px", fontSize: "8px" }}>{bizAddr}</div>}
              {config.headerShowPhone && <div style={{ color: hSub, fontSize: "8px" }}>{bizPhone}</div>}
              {config.showFields.vatNumber && <div style={{ color: hSub, fontSize: "8px" }}>VAT: {bizVat}</div>}
            </div>
            <div style={{ marginTop: "6px" }}>
              {renderTitle()}
              <div style={{ color: hSub, marginTop: "3px", fontSize: "8px" }}># INV-2024-001 · Date: {today} · Due: {due}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              {config.showFields.logo && (
                <div style={{ width: logoSz, height: logoSz, borderRadius: logoRadius, background: logoColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: logoTextColor, fontWeight: "bold", fontSize: logoFontSize }}>{bizName[0]}</span>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{ fontWeight: "800", fontSize: "13px", color: hText }}>{bizName}</div>
                {config.headerTagline && <div style={{ color: hSub, fontSize: "8px", fontStyle: "italic" }}>{config.headerTagline}</div>}
                {config.headerShowAddress && <div style={{ color: hSub, lineHeight: "1.5", fontSize: "8px" }}>{bizAddr}</div>}
                {config.headerShowPhone && <div style={{ color: hSub, fontSize: "8px" }}>{bizPhone}</div>}
                {config.showFields.vatNumber && <div style={{ color: hSub, fontSize: "8px" }}>VAT No: {bizVat}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
              {renderTitle()}
              <div style={{ color: hSub, fontSize: "8px" }}># INV-2024-001</div>
              <div style={{ color: hSub, fontSize: "8px" }}>Date: {today}</div>
              <div style={{ color: hSub, fontSize: "8px" }}>Due: {due}</div>
            </div>
          </div>
        )}
      </div>

      {/* Header bottom divider (for colored headers, use a contrasting bar) */}
      {isColoredHeader ? (
        config.headerDivider !== "none" && <div style={{ height: "4px", background: darkenHex(accent, 40) }} />
      ) : (
        renderDivider()
      )}

      {/* Bill To + Details Row */}
      {(() => {
        const billToBox = (
          <div style={{ background: "#f8f9fa", borderRadius: "6px", padding: "10px 12px" }}>
            <div style={{ fontWeight: "bold", fontSize: "7.5px", textTransform: "uppercase", letterSpacing: "0.8px", color: accent, marginBottom: "5px" }}>{config.labels.billToLabel}</div>
            <div style={{ fontWeight: "600", fontSize: "10px", color: config.headingColor }}>ABC Corporation (Pty) Ltd</div>
            {config.showFields.customerAddress && <div style={{ color: config.mutedTextColor, marginTop: "2px", fontSize: "8px" }}>456 Client Ave, Johannesburg, 2001</div>}
            {config.showFields.customerPhone && <div style={{ color: config.mutedTextColor, marginTop: "2px", fontSize: "8px" }}>+27 82 987 6543</div>}
            <div style={{ color: config.mutedTextColor, marginTop: "2px", fontSize: "8px" }}>billing@abccorp.co.za</div>
          </div>
        );
        const detailsBox = (
          <div style={{ background: "#f8f9fa", borderRadius: "6px", padding: "10px 12px" }}>
            {config.showFields.reference && (
              <div style={{ marginBottom: "4px", fontSize: "8px" }}>
                <span style={{ fontWeight: "600", color: config.bodyTextColor }}>Reference: </span>
                <span style={{ color: config.mutedTextColor }}>PO-2024-123</span>
              </div>
            )}
            {config.showFields.paymentTerms && (
              <div style={{ fontSize: "8px" }}>
                <span style={{ fontWeight: "600", color: config.bodyTextColor }}>Terms: </span>
                <span style={{ color: config.mutedTextColor }}>Due within 7 days</span>
              </div>
            )}
          </div>
        );
        return (
          <div style={{ padding: "12px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {config.billToPosition === "right" ? <>{detailsBox}{billToBox}</> : <>{billToBox}{detailsBox}</>}
          </div>
        );
      })()}

      {/* Items Table */}
      <div style={{ padding: "0 32px 12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5px" }}>
          <thead>
            <tr style={{ background: accent, color: config.tableHeaderTextColor }}>
              <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: "700", letterSpacing: "0.4px" }}>{config.labels.itemCol}</th>
              <th style={{ padding: "7px 8px", textAlign: "center", width: "40px", fontWeight: "700" }}>{config.labels.qtyCol}</th>
              <th style={{ padding: "7px 8px", textAlign: "right", width: "75px", fontWeight: "700" }}>{config.labels.unitPriceCol}</th>
              <th style={{ padding: "7px 10px", textAlign: "right", width: "75px", fontWeight: "700" }}>{config.labels.amountCol}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ background: rowBg(i) }}>
                <td style={{ padding: "7px 10px", borderBottom: cellBorder, color: config.bodyTextColor }}>{item.name}</td>
                <td style={{ padding: "7px 8px", textAlign: "center", borderBottom: cellBorder, color: config.mutedTextColor }}>{item.qty}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", borderBottom: cellBorder, color: config.mutedTextColor }}>{sym}{item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: "7px 10px", textAlign: "right", borderBottom: cellBorder, fontWeight: "600", color: config.headingColor }}>{sym}{(item.qty * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: config.totalsAlign === "left" ? "flex-start" : "flex-end", marginTop: "8px" }}>
          <div style={{ width: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 10px", color: config.mutedTextColor }}>
              <span>{config.labels.subtotalLabel}</span><span>{sym}{subtotal.toFixed(2)}</span>
            </div>
            {config.showFields.vat && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 10px", color: config.mutedTextColor }}>
                <span>{config.labels.vatLabel.replace("15%", `${config.vatRate}%`)}</span><span>{sym}{vatAmt.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: accent, color: config.totalsTextColor, borderRadius: "4px", marginTop: "4px", fontWeight: "bold", fontSize: "10px" }}>
              <span>{config.labels.totalLabel}</span><span>{sym}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const notesBlock = config.showFields.notes ? (
          <div key="notes" style={{ padding: "0 32px 12px" }}>
            <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "10px" }}>
              <div style={{ fontWeight: "700", fontSize: "7.5px", textTransform: "uppercase", letterSpacing: "0.8px", color: accent, marginBottom: "4px" }}>{config.labels.notesLabel}</div>
              <div style={{ color: config.mutedTextColor, lineHeight: "1.6" }}>Please reference your invoice number when making payment. Direct EFT payments are preferred.</div>
            </div>
          </div>
        ) : null;
        const bankBlock = config.showFields.bankDetails ? (
          <div key="bank" style={{ padding: "10px 32px 0", borderTop: "1px solid #e5e7eb", marginTop: "4px" }}>
            <div style={{ marginBottom: "8px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {[{ label: "Bank", value: bankName }, { label: "Account Name", value: accountName }, { label: "Account No.", value: accountNum }, { label: "Branch Code", value: branchCode }].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "7px", textTransform: "uppercase", color: accent, fontWeight: "700", marginBottom: "1px" }}>{label}</div>
                  <div style={{ color: config.bodyTextColor, fontSize: "8px" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
        const footerBlock = config.footerText ? (
          <div key="footer" style={{ padding: "8px 32px 16px" }}>
            <div style={{ textAlign: "center", color: "#888", fontSize: "8px", fontStyle: "italic", paddingTop: "6px", borderTop: "1px dashed #e5e7eb" }}>
              {config.footerText}
            </div>
          </div>
        ) : null;

        const order: React.ReactNode[] = [];
        if (config.notesPosition === "before-totals") {
          // already drawn before totals — would require restructure; treat as after-items here
        }
        if (config.notesPosition === "after-items") order.push(notesBlock);
        if (config.bankPosition === "after-totals") order.push(bankBlock);
        if (config.notesPosition === "after-bank") order.push(notesBlock);
        if (config.bankPosition === "footer") order.push(bankBlock);
        order.push(footerBlock);
        return <>{order.filter(Boolean)}</>;
      })()}

      {/* Bottom bar */}
      <div style={{ height: "4px", background: accent }} />
    </div>
  );
}

/* ── Main Designer Component ──────────────────────────────────────── */

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

  /* mini swatches for header bg chips */
  const accentC = config.accentColor;
  const headerBgChips: { value: TemplateConfig["headerBg"]; label: string; preview: React.ReactNode }[] = [
    {
      value: "white", label: "White",
      preview: <div style={{ width: "100%", height: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "3px" }}>
        <div style={{ height: "3px", background: accentC, borderRadius: "3px 3px 0 0" }} />
      </div>,
    },
    {
      value: "accent", label: "Accent",
      preview: <div style={{ width: "100%", height: "100%", background: accentC, borderRadius: "3px" }}>
        <div style={{ padding: "3px 4px" }}><div style={{ height: "2px", background: "rgba(255,255,255,0.4)", borderRadius: "1px", width: "70%" }} /></div>
      </div>,
    },
    {
      value: "dark", label: "Dark",
      preview: <div style={{ width: "100%", height: "100%", background: "#1a2240", borderRadius: "3px" }}>
        <div style={{ padding: "3px 4px" }}><div style={{ height: "2px", background: "rgba(255,255,255,0.4)", borderRadius: "1px", width: "70%" }} /></div>
      </div>,
    },
    {
      value: "gradient", label: "Gradient",
      preview: <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${accentC}, ${darkenHex(accentC, 60)})`, borderRadius: "3px" }}>
        <div style={{ padding: "3px 4px" }}><div style={{ height: "2px", background: "rgba(255,255,255,0.4)", borderRadius: "1px", width: "70%" }} /></div>
      </div>,
    },
    {
      value: "custom", label: "Custom",
      preview: <div style={{ width: "100%", height: "100%", background: config.headerCustomBg || "#2d3748", borderRadius: "3px" }}>
        <div style={{ padding: "3px 4px" }}><div style={{ height: "2px", background: "rgba(255,255,255,0.4)", borderRadius: "1px", width: "70%" }} /></div>
      </div>,
    },
  ];

  const titleStyleChips: { value: TemplateConfig["headerTitleStyle"]; label: string; preview: React.ReactNode }[] = [
    {
      value: "large", label: "Large",
      preview: <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <span style={{ fontSize: "9px", fontWeight: "800", color: accentC }}>INVOICE</span>
      </div>,
    },
    {
      value: "badge", label: "Badge",
      preview: <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <span style={{ fontSize: "7px", fontWeight: "700", background: accentC, color: "#fff", padding: "1px 4px", borderRadius: "2px" }}>INVOICE</span>
      </div>,
    },
    {
      value: "outline", label: "Outline",
      preview: <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <span style={{ fontSize: "7px", fontWeight: "700", border: `1px solid ${accentC}`, color: accentC, padding: "1px 4px", borderRadius: "2px" }}>INVOICE</span>
      </div>,
    },
    {
      value: "minimal", label: "Minimal",
      preview: <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <span style={{ fontSize: "7px", color: "#888", letterSpacing: "1.5px" }}>INVOICE</span>
      </div>,
    },
  ];

  const dividerChips: { value: TemplateConfig["headerDivider"]; label: string; preview: React.ReactNode }[] = [
    { value: "bar", label: "Color Bar", preview: <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f9fafb" }}><div style={{ flex: 1 }} /><div style={{ height: "4px", background: accentC }} /></div> },
    { value: "line", label: "Thin Line", preview: <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f9fafb" }}><div style={{ flex: 1 }} /><div style={{ height: "1px", background: "#ccc" }} /></div> },
    { value: "double", label: "Double", preview: <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f9fafb" }}><div style={{ flex: 1 }} /><div style={{ height: "1px", background: "#ccc" }} /><div style={{ height: "2px" }} /><div style={{ height: "1px", background: "#ccc" }} /></div> },
    { value: "shadow", label: "Shadow", preview: <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f9fafb" }}><div style={{ flex: 1 }} /><div style={{ height: "5px", background: "linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)" }} /></div> },
    { value: "none", label: "None", preview: <div style={{ width: "100%", height: "100%", background: "#f9fafb" }} /> },
  ];

  const logoSizeChips: { value: TemplateConfig["headerLogoSize"]; label: string }[] = [
    { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" },
  ];

  const logoShapeChips: { value: TemplateConfig["headerLogoShape"]; label: string; preview: React.ReactNode }[] = [
    { value: "square", label: "Square", preview: <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}><div style={{ width: "20px", height: "20px", background: accentC, borderRadius: "2px" }} /></div> },
    { value: "rounded", label: "Rounded", preview: <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}><div style={{ width: "20px", height: "20px", background: accentC, borderRadius: "6px" }} /></div> },
    { value: "circle", label: "Circle", preview: <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}><div style={{ width: "20px", height: "20px", background: accentC, borderRadius: "50%" }} /></div> },
  ];

  const paddingChips: { value: TemplateConfig["headerPadding"]; label: string }[] = [
    { value: "compact", label: "Compact" }, { value: "normal", label: "Normal" }, { value: "spacious", label: "Spacious" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Settings Panel */}
      <div className="xl:col-span-2 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-base font-bold">Template Designer</h3>
            <p className="text-xs text-muted-foreground">Changes reflect in the live preview instantly</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-7 px-2">
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} className="gradient-hero text-white text-xs h-7 px-3">
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-3 bg-primary/5 border-primary/20">
          <Label className="text-xs mb-1.5 block font-semibold">Template Name</Label>
          <Input
            value={config.templateName}
            onChange={e => update({ templateName: e.target.value })}
            className="h-9 text-sm"
            placeholder="e.g. My Brand Invoice"
            maxLength={40}
          />
          <p className="text-[10px] text-muted-foreground mt-1">This name shows on the template picker so you can tell it apart from the rest.</p>
        </div>

        {/* ── Appearance ─────────────────────────────────────── */}
        <Section title="Appearance">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Accent Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.accentColor} onChange={e => update({ accentColor: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-input p-0.5" />
                <Input value={config.accentColor} onChange={e => update({ accentColor: e.target.value })}
                  className="h-9 text-xs font-mono flex-1" placeholder="#156C41" maxLength={7} />
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
              <select value={config.headerLayout} onChange={e => update({ headerLayout: e.target.value as any })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="left">Logo Left, Title Right</option>
                <option value="centered">Centered</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Table Style</Label>
              <select value={config.tableStyle} onChange={e => update({ tableStyle: e.target.value as any })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="striped">Striped rows</option>
                <option value="bordered">All borders</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        </Section>

        {/* ── Header Style ───────────────────────────────────── */}
        <Section title="Header Style" defaultOpen={true}>

          {/* Background */}
          <div>
            <Label className="text-xs mb-2 block">Header Background</Label>
            <ChipGroup options={headerBgChips} value={config.headerBg} onChange={v => update({ headerBg: v })} />
          </div>

          {/* Custom bg color picker */}
          {config.headerBg === "custom" && (
            <div>
              <Label className="text-xs mb-1.5 block">Custom Background Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={config.headerCustomBg} onChange={e => update({ headerCustomBg: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-input p-0.5" />
                <Input value={config.headerCustomBg} onChange={e => update({ headerCustomBg: e.target.value })}
                  className="h-9 text-xs font-mono flex-1" placeholder="#2d3748" maxLength={7} />
              </div>
            </div>
          )}

          {/* Document title style */}
          <div>
            <Label className="text-xs mb-2 block">Document Title Style</Label>
            <ChipGroup options={titleStyleChips} value={config.headerTitleStyle} onChange={v => update({ headerTitleStyle: v })} />
          </div>

          {/* Divider */}
          <div>
            <Label className="text-xs mb-2 block">Header Separator</Label>
            <ChipGroup options={dividerChips} value={config.headerDivider} onChange={v => update({ headerDivider: v })} />
          </div>

          {/* Logo Size + Shape */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-2 block">Logo Size</Label>
              <ChipGroup options={logoSizeChips} value={config.headerLogoSize} onChange={v => update({ headerLogoSize: v })} />
            </div>
            <div>
              <Label className="text-xs mb-2 block">Logo Shape</Label>
              <ChipGroup options={logoShapeChips} value={config.headerLogoShape} onChange={v => update({ headerLogoShape: v })} />
            </div>
          </div>

          {/* Header Padding */}
          <div>
            <Label className="text-xs mb-2 block">Header Padding</Label>
            <ChipGroup options={paddingChips} value={config.headerPadding} onChange={v => update({ headerPadding: v })} />
          </div>

          {/* Business info toggles */}
          <div className="border-t pt-3 space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Business Info in Header</p>
            <Toggle label="Show Business Address" checked={config.headerShowAddress} onChange={v => update({ headerShowAddress: v })} />
            <Toggle label="Show Business Phone" checked={config.headerShowPhone} onChange={v => update({ headerShowPhone: v })} />
          </div>

          {/* Tagline */}
          <div>
            <Label className="text-xs mb-1.5 block">Business Tagline / Subtitle</Label>
            <Input value={config.headerTagline} onChange={e => update({ headerTagline: e.target.value })}
              className="h-9 text-xs" placeholder="e.g. Professional services since 2010" />
            <p className="text-[10px] text-muted-foreground mt-1">Appears below your business name in the header</p>
          </div>
        </Section>

        {/* ── Font Colours ───────────────────────────────────── */}
        <Section title="Font Colours" defaultOpen={false}>
          <p className="text-[11px] text-muted-foreground mb-2">Choose colours for headings, body text, and key elements.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "headingColor", label: "Headings", hint: "Customer name, item totals" },
              { key: "bodyTextColor", label: "Body text", hint: "Standard content & item descriptions" },
              { key: "mutedTextColor", label: "Muted / secondary", hint: "Addresses, subtotal, notes" },
              { key: "tableHeaderTextColor", label: "Table header text", hint: "Text on the coloured table row" },
              { key: "totalsTextColor", label: "Total bar text", hint: "Text inside the total amount bar" },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <Label className="text-xs mb-1.5 block">{label}</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={(config as any)[key]}
                    onChange={e => update({ [key]: e.target.value } as any)}
                    className="h-9 w-12 rounded cursor-pointer border"
                  />
                  <Input
                    value={(config as any)[key]}
                    onChange={e => update({ [key]: e.target.value } as any)}
                    className="h-9 text-xs flex-1 font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Layout & Positioning ───────────────────────────── */}
        <Section title="Layout & Positioning" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Bill To Position</Label>
              <select value={config.billToPosition} onChange={e => update({ billToPosition: e.target.value as any })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="left">Left side</option>
                <option value="right">Right side</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Totals Alignment</Label>
              <select value={config.totalsAlign} onChange={e => update({ totalsAlign: e.target.value as any })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="right">Right aligned</option>
                <option value="left">Left aligned</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Notes Position</Label>
              <select value={config.notesPosition} onChange={e => update({ notesPosition: e.target.value as any })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="after-items">After totals</option>
                <option value="after-bank">After bank details</option>
                <option value="before-totals">Above totals</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Bank Details Position</Label>
              <select value={config.bankPosition} onChange={e => update({ bankPosition: e.target.value as any })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="footer">In footer (bottom)</option>
                <option value="after-totals">Right after totals</option>
              </select>
            </div>
          </div>
        </Section>

        {/* ── Document Settings ──────────────────────────────── */}
        <Section title="Document Settings" defaultOpen={false}>
          <div>
            <Label className="text-xs mb-1.5 block">Document Title</Label>
            <select
              value={["TAX INVOICE", "INVOICE", "QUOTE", "PROFORMA INVOICE", "CREDIT NOTE"].includes(config.documentTitle) ? config.documentTitle : "custom"}
              onChange={e => { if (e.target.value !== "custom") update({ documentTitle: e.target.value }); }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm mb-2"
            >
              <option value="TAX INVOICE">TAX INVOICE</option>
              <option value="INVOICE">INVOICE</option>
              <option value="QUOTE">QUOTE</option>
              <option value="PROFORMA INVOICE">PROFORMA INVOICE</option>
              <option value="CREDIT NOTE">CREDIT NOTE</option>
            </select>
            <Input value={config.documentTitle} onChange={e => update({ documentTitle: e.target.value.toUpperCase() })}
              className="h-9 text-xs" placeholder="Custom title..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">VAT Rate (%)</Label>
              <Input type="number" value={config.vatRate} onChange={e => update({ vatRate: parseFloat(e.target.value) || 15 })}
                className="h-9 text-xs" min={0} max={100} />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Footer Text</Label>
            <Input value={config.footerText} onChange={e => update({ footerText: e.target.value })}
              className="h-9 text-xs" placeholder="Thank you for your business!" />
          </div>
        </Section>

        {/* ── Visible Fields ─────────────────────────────────── */}
        <Section title="Visible Fields" defaultOpen={false}>
          <div className="space-y-0.5">
            <Toggle label="Logo" checked={config.showFields.logo} onChange={v => updateField("logo", v)} />
            <Toggle label="VAT Registration Number" checked={config.showFields.vatNumber} onChange={v => updateField("vatNumber", v)} />
            <Toggle label="Customer Address" checked={config.showFields.customerAddress} onChange={v => updateField("customerAddress", v)} />
            <Toggle label="Customer Phone" checked={config.showFields.customerPhone} onChange={v => updateField("customerPhone", v)} />
            <Toggle label="Reference / PO Number" checked={config.showFields.reference} onChange={v => updateField("reference", v)} />
            <Toggle label="Payment Terms" checked={config.showFields.paymentTerms} onChange={v => updateField("paymentTerms", v)} />
            <Toggle label="VAT Line" checked={config.showFields.vat} onChange={v => updateField("vat", v)} />
            <Toggle label="Notes Section" checked={config.showFields.notes} onChange={v => updateField("notes", v)} />
            <Toggle label="Bank Details" checked={config.showFields.bankDetails} onChange={v => updateField("bankDetails", v)} />
          </div>
        </Section>

        {/* ── Custom Labels ──────────────────────────────────── */}
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
                <Input value={config.labels[key]} onChange={e => updateLabel(key, e.target.value)}
                  className="h-7 text-xs" placeholder={placeholder} />
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
            <div style={{ transform: `scale(${SCALE})`, transformOrigin: "top center", width: "595px", display: "block", marginBottom: `-${595 * (1 - SCALE) * 0.42}px` }}>
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
