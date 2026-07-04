import { useAuth } from "@/contexts/AuthContext";

export interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export const TEMPLATES = [
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

export const TEMPLATE_STYLES: Record<number, { primary: string; headerBg: string; headerText: string; rowAlt: string }> = {
  1: { primary: "#156C41", headerBg: "#156C41", headerText: "#fff", rowAlt: "#f0fdf4" },
  2: { primary: "#173872", headerBg: "#173872", headerText: "#fff", rowAlt: "#eff6ff" },
  3: { primary: "#D96508", headerBg: "#1e1e1e", headerText: "#fff", rowAlt: "#fff7ed" },
  4: { primary: "#1E59B8", headerBg: "#1E59B8", headerText: "#fff", rowAlt: "#eff6ff" },
  5: { primary: "#841212", headerBg: "#841212", headerText: "#fff", rowAlt: "#fff1f2" },
  6: { primary: "#6B21B0", headerBg: "#6B21B0", headerText: "#fff", rowAlt: "#faf5ff" },
  7: { primary: "#262626", headerBg: "#262626", headerText: "#fff", rowAlt: "#f9fafb" },
  8: { primary: "#156C41", headerBg: "#156C41", headerText: "#fff", rowAlt: "#f0fdf4" },
};

export interface InvoicePreviewProps {
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

export function InvoicePreview({ docType, selectedTemplate, customerName, customerEmail, customerPhone, customerAddress, customerVat, paymentTerms, dueDate, notes, items, vatEnabled, subtotal, vatAmount, total }: InvoicePreviewProps) {
  const { user } = useAuth();
  const s = TEMPLATE_STYLES[selectedTemplate] || TEMPLATE_STYLES[1];
  const today = new Date().toLocaleDateString("en-ZA");
  const dueDateFormatted = dueDate ? new Date(dueDate + "T00:00:00").toLocaleDateString("en-ZA") : "";
  const validItems = items.filter(i => i.name.trim());
  const t = selectedTemplate;

  const bizName = user?.business_name || user?.full_name || "Your Business";
  const bizEmail = user?.email || "";
  const bizPhone = (user as any)?.phone || "";
  const bizAddress = (user as any)?.physical_address || "";
  const bizVat = (user as any)?.vat_number || "";
  const bizReg = (user as any)?.registration_number || "";

  const docTitle = docType === "quote" ? "QUOTE" : "TAX INVOICE";

  const P = s.primary; // accent hex

  // ─── Shared sub-renderers ─────────────────────────────────────────────────

  const BizBlock = ({ nameColor, subColor }: { nameColor: string; subColor: string }) => (
    <div>
      <div style={{ color: nameColor, fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>{bizName}</div>
      {bizAddress && <div style={{ color: subColor, fontSize: 8, marginTop: 1 }}>{bizAddress}</div>}
      {bizPhone && <div style={{ color: subColor, fontSize: 8 }}>Tel: {bizPhone}</div>}
      {bizEmail && <div style={{ color: subColor, fontSize: 8 }}>{bizEmail}</div>}
      {bizVat && <div style={{ color: subColor, fontSize: 8 }}>VAT: {bizVat}</div>}
      {bizReg && <div style={{ color: subColor, fontSize: 8 }}>Reg: {bizReg}</div>}
    </div>
  );

  const CustBlock = ({ accentColor }: { accentColor: string }) => (
    <div>
      <div style={{ color: accentColor, fontSize: 7.5, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 2 }}>
        {docType === "quote" ? "Quote For:" : "Bill To:"}
      </div>
      <div style={{ fontWeight: 700, fontSize: 10, color: "#111" }}>
        {customerName || <span style={{ color: "#bbb", fontStyle: "italic" }}>Customer Name</span>}
      </div>
      {customerEmail && <div style={{ color: "#666", fontSize: 8 }}>{customerEmail}</div>}
      {customerPhone && <div style={{ color: "#666", fontSize: 8 }}>Tel: {customerPhone}</div>}
      {customerAddress && <div style={{ color: "#666", fontSize: 8 }}>{customerAddress}</div>}
      {customerVat && <div style={{ color: "#888", fontSize: 8 }}>VAT: {customerVat}</div>}
    </div>
  );

  const MetaRow = ({ accent }: { accent: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8.5, color: "#444", flexWrap: "wrap" as const, gap: 4 }}>
      <div><span style={{ color: "#999" }}>{docType === "quote" ? "Quote No:" : "Invoice No:"}</span>{" "}<span style={{ fontWeight: 700 }}>Auto-assigned</span></div>
      {docType === "invoice" && dueDateFormatted && <div><span style={{ color: "#999" }}>Due Date:</span>{" "}<span style={{ fontWeight: 700 }}>{dueDateFormatted}</span></div>}
      {docType === "quote" && paymentTerms && <div><span style={{ color: "#999" }}>Valid For:</span>{" "}<span style={{ fontWeight: 700 }}>{paymentTerms}</span></div>}
      <div><span style={{ color: "#999" }}>Date:</span>{" "}<span style={{ fontWeight: 600 }}>{today}</span></div>
    </div>
  );

  const ItemsTable = ({ headerBg, headerText, altBg, noBgHeader }: { headerBg: string; headerText: string; altBg: string | null; noBgHeader?: boolean }) => (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.5 }}>
      <thead>
        <tr style={noBgHeader ? { borderBottom: `1.5px solid ${headerBg}` } : { background: headerBg }}>
          <th style={{ textAlign: "left", padding: noBgHeader ? "4px 0" : "5px 6px", color: headerText, fontWeight: 700 }}>Description</th>
          <th style={{ textAlign: "center", padding: noBgHeader ? "4px 0" : "5px 4px", color: headerText, fontWeight: 700, width: 30 }}>Qty</th>
          <th style={{ textAlign: "right", padding: noBgHeader ? "4px 0" : "5px 4px", color: headerText, fontWeight: 700, width: 64 }}>Unit Price</th>
          <th style={{ textAlign: "right", padding: noBgHeader ? "4px 0" : "5px 6px", color: headerText, fontWeight: 700, width: 64 }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {validItems.length > 0 ? validItems.map((item, idx) => (
          <tr key={idx} style={{ background: altBg && idx % 2 === 1 ? altBg : "#fff", borderBottom: "0.5px solid #eee" }}>
            <td style={{ padding: noBgHeader ? "4px 0" : "4px 6px", color: "#222" }}>{item.name}</td>
            <td style={{ padding: noBgHeader ? "4px 0" : "4px 4px", textAlign: "center", color: "#555" }}>{item.qty}</td>
            <td style={{ padding: noBgHeader ? "4px 0" : "4px 4px", textAlign: "right", color: "#555" }}>R{item.unitPrice.toFixed(2)}</td>
            <td style={{ padding: noBgHeader ? "4px 0" : "4px 6px", textAlign: "right", fontWeight: 600, color: "#111" }}>R{(item.qty * item.unitPrice).toFixed(2)}</td>
          </tr>
        )) : (
          <tr><td colSpan={4} style={{ padding: "12px 6px", textAlign: "center", color: "#ccc", fontStyle: "italic", fontSize: 8 }}>Add line items to see them here…</td></tr>
        )}
      </tbody>
    </table>
  );

  const TotalsBlock = ({ accent, boxBg }: { accent: string; boxBg: string | null }) => (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
      <div style={{ minWidth: 160, fontSize: 8.5 }}>
        {vatEnabled && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#777", marginBottom: 2 }}>
              <span>Subtotal</span><span>R{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#777", marginBottom: 0 }}>
              <span>VAT (15%)</span><span>R{vatAmount.toFixed(2)}</span>
            </div>
          </>
        )}
        {boxBg ? (
          <div style={{ background: boxBg, padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: vatEnabled ? 6 : 0 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 8 }}>{vatEnabled ? "TOTAL DUE (incl. VAT)" : "TOTAL DUE"}</span>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>R{total.toFixed(2)}</span>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: vatEnabled ? "1px solid #ddd" : "none", paddingTop: vatEnabled ? 5 : 0, marginTop: vatEnabled ? 4 : 0 }}>
            <span style={{ color: "#333", fontWeight: 700, fontSize: 8.5 }}>{vatEnabled ? "TOTAL DUE (incl. VAT)" : "TOTAL DUE"}</span>
            <span style={{ color: accent, fontWeight: 800, fontSize: 14 }}>R{total.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );

  const bankName = (user as any)?.bank_name || "";
  const bankAccountName = (user as any)?.account_name || "";
  const bankAccountType = (user as any)?.account_type || "";
  const bankAccountNumber = (user as any)?.account_number || "";
  const bankBranchCode = (user as any)?.branch_code || "";
  const hasBankDetails = !!(bankName || bankAccountNumber);

  const FooterBlock = ({ accent }: { accent: string }) => (
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #e5e7eb", fontSize: 8 }}>
      {hasBankDetails && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ background: accent, padding: "4px 8px", display: "inline-block", marginBottom: 0 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 7.5, letterSpacing: 0.5 }}>BANKING DETAILS</span>
          </div>
          <div style={{ background: "#f6f6f8", padding: "5px 8px" }}>
            {bankName && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#888", fontWeight: 700, minWidth: 90 }}>Bank:</span><span style={{ color: "#222" }}>{bankName}</span></div>}
            {bankAccountName && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#888", fontWeight: 700, minWidth: 90 }}>Account Name:</span><span style={{ color: "#222" }}>{bankAccountName}</span></div>}
            {bankAccountType && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#888", fontWeight: 700, minWidth: 90 }}>Account Type:</span><span style={{ color: "#222" }}>{bankAccountType}</span></div>}
            {bankAccountNumber && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#888", fontWeight: 700, minWidth: 90 }}>Acc Number:</span><span style={{ color: "#222" }}>{bankAccountNumber}</span></div>}
            {bankBranchCode && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#888", fontWeight: 700, minWidth: 90 }}>Branch Code:</span><span style={{ color: "#222" }}>{bankBranchCode}</span></div>}
          </div>
        </div>
      )}
      {notes && (
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 700, color: "#888" }}>Notes: </span>
          <span style={{ color: "#555" }}>{notes}</span>
        </div>
      )}
      <div style={{ color: "#bbb", fontSize: 7, marginTop: 4 }}>
        {docType === "quote" ? "Thank you for the opportunity!" : "Thank you for your business!"}{" · "}
        <span>Generated by Masakhe SMME Growth Hub</span>
      </div>
    </div>
  );

  const base: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden", fontFamily: "Arial, Helvetica, sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", userSelect: "none", minHeight: 842 };

  // ─── Template 1 — Classic (Green left stripe) ────────────────────────────
  if (t === 1 || t === 8) {
    return (
      <div style={{ ...base, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 5, background: P }} />
        <div style={{ paddingLeft: 14, paddingRight: 12, paddingTop: 12, paddingBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <BizBlock nameColor={P} subColor="#888" />
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: P, fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>{docTitle}</div>
              <div style={{ color: "#aaa", fontSize: 7.5 }}>{today}</div>
            </div>
          </div>
          <div style={{ height: 1.5, background: P, marginBottom: 8 }} />
          <div style={{ marginBottom: 8 }}><MetaRow accent={P} /></div>
          <div style={{ marginBottom: 8 }}><CustBlock accentColor={P} /></div>
          <ItemsTable headerBg={P} headerText="#fff" altBg={s.rowAlt} />
          <TotalsBlock accent={P} boxBg={P} />
          <FooterBlock accent={P} />
        </div>
      </div>
    );
  }

  // ─── Template 2 — Modern (Navy box top-right) ────────────────────────────
  if (t === 2) {
    return (
      <div style={base}>
        <div style={{ padding: "12px 14px", position: "relative", minHeight: 88 }}>
          <div style={{ position: "absolute", top: 0, right: 0, background: P, padding: "10px 12px", minWidth: 130, minHeight: 80 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 12, marginBottom: 3 }}>{docTitle}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 8 }}>Auto-assigned</div>
            {docType === "invoice" && dueDateFormatted && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, marginTop: 2 }}>Due: <span style={{ color: "#fff", fontWeight: 600 }}>{dueDateFormatted}</span></div>}
            {docType === "quote" && paymentTerms && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, marginTop: 2 }}>Valid: <span style={{ color: "#fff", fontWeight: 600 }}>{paymentTerms}</span></div>}
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 7.5, marginTop: 3 }}>{today}</div>
          </div>
          <div style={{ maxWidth: "57%", paddingRight: 8 }}>
            <div style={{ color: P, fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{bizName}</div>
            {bizAddress && <div style={{ color: "#888", fontSize: 8 }}>{bizAddress}</div>}
            {bizPhone && <div style={{ color: "#888", fontSize: 8 }}>Tel: {bizPhone}</div>}
            {bizEmail && <div style={{ color: "#888", fontSize: 8 }}>{bizEmail}</div>}
            {bizVat && <div style={{ color: "#999", fontSize: 8 }}>VAT: {bizVat}</div>}
          </div>
        </div>
        <div style={{ height: 2.5, background: P, margin: "0 14px" }} />
        <div style={{ padding: "10px 14px 12px" }}>
          <div style={{ background: s.rowAlt, padding: "8px 10px", maxWidth: "55%", marginBottom: 10, borderRadius: 2 }}>
            <div style={{ color: P, fontWeight: 700, fontSize: 7.5, textTransform: "uppercase" as const, marginBottom: 3 }}>{docType === "quote" ? "Quote For" : "Bill To"}</div>
            <div style={{ fontWeight: 700, fontSize: 10, color: "#111" }}>{customerName || <span style={{ color: "#bbb", fontStyle: "italic" }}>Customer Name</span>}</div>
            {customerEmail && <div style={{ color: "#666", fontSize: 8 }}>{customerEmail}</div>}
            {customerPhone && <div style={{ color: "#666", fontSize: 8 }}>Tel: {customerPhone}</div>}
            {customerAddress && <div style={{ color: "#666", fontSize: 8 }}>{customerAddress}</div>}
          </div>
          <ItemsTable headerBg={P} headerText="#fff" altBg={s.rowAlt} />
          <TotalsBlock accent={P} boxBg={null} />
          <FooterBlock accent={P} />
        </div>
      </div>
    );
  }

  // ─── Template 3 — Bold (Dark header + orange stripe) ─────────────────────
  if (t === 3) {
    const dark = "#1e1e1e";
    return (
      <div style={base}>
        <div style={{ background: dark, padding: "12px 14px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <BizBlock nameColor="#fff" subColor="rgba(255,255,255,0.5)" />
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: P, fontWeight: 900, fontSize: 22, letterSpacing: 1, lineHeight: 1 }}>{docType === "quote" ? "QUOTE" : "INVOICE"}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 7.5, marginTop: 3 }}>Auto-assigned</div>
              {docType === "invoice" && dueDateFormatted && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 7.5 }}>Due: {dueDateFormatted}</div>}
              {docType === "quote" && paymentTerms && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 7.5 }}>Valid: {paymentTerms}</div>}
            </div>
          </div>
        </div>
        <div style={{ height: 5, background: P }} />
        <div style={{ padding: "10px 14px 12px" }}>
          <div style={{ marginBottom: 8 }}><CustBlock accentColor={P} /></div>
          <ItemsTable headerBg={dark} headerText="#fff" altBg="#fff7ed" />
          <TotalsBlock accent={P} boxBg={P} />
          <FooterBlock accent={P} />
        </div>
      </div>
    );
  }

  // ─── Template 4 — Corporate (Blue header, two side-by-side boxes) ─────────
  if (t === 4) {
    return (
      <div style={base}>
        <div style={{ background: P, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <BizBlock nameColor="#fff" subColor="rgba(255,255,255,0.6)" />
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{docTitle}</div>
        </div>
        <div style={{ display: "flex", gap: 5, padding: "10px 14px 6px" }}>
          <div style={{ flex: 1, background: s.rowAlt, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ background: P, padding: "4px 8px" }}><span style={{ color: "#fff", fontWeight: 700, fontSize: 7.5 }}>{docType === "quote" ? "QUOTE FOR" : "BILL TO"}</span></div>
            <div style={{ padding: "6px 8px" }}>
              <div style={{ fontWeight: 700, fontSize: 10, color: "#111" }}>{customerName || <span style={{ color: "#bbb", fontStyle: "italic" }}>Customer Name</span>}</div>
              {customerEmail && <div style={{ color: "#666", fontSize: 8 }}>{customerEmail}</div>}
              {customerPhone && <div style={{ color: "#666", fontSize: 8 }}>Tel: {customerPhone}</div>}
              {customerAddress && <div style={{ color: "#666", fontSize: 8 }}>{customerAddress}</div>}
            </div>
          </div>
          <div style={{ flex: 1, background: s.rowAlt, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ background: P, padding: "4px 8px" }}><span style={{ color: "#fff", fontWeight: 700, fontSize: 7.5 }}>{docType === "quote" ? "QUOTE DETAILS" : "INVOICE DETAILS"}</span></div>
            <div style={{ padding: "6px 8px", fontSize: 8 }}>
              <div><span style={{ color: "#666" }}>{docType === "quote" ? "Quote No:" : "Invoice No:"}</span>{" "}<span style={{ fontWeight: 700 }}>Auto-assigned</span></div>
              <div style={{ marginTop: 2 }}><span style={{ color: "#666" }}>Date:</span>{" "}<span style={{ fontWeight: 600 }}>{today}</span></div>
              {docType === "invoice" && dueDateFormatted && <div style={{ marginTop: 2 }}><span style={{ color: "#666" }}>Due Date:</span>{" "}<span style={{ fontWeight: 600 }}>{dueDateFormatted}</span></div>}
              {docType === "quote" && paymentTerms && <div style={{ marginTop: 2 }}><span style={{ color: "#666" }}>Valid For:</span>{" "}<span style={{ fontWeight: 600 }}>{paymentTerms}</span></div>}
            </div>
          </div>
        </div>
        <div style={{ padding: "4px 14px 12px" }}>
          <ItemsTable headerBg={P} headerText="#fff" altBg={s.rowAlt} />
          <TotalsBlock accent={P} boxBg={P} />
          <FooterBlock accent={P} />
        </div>
      </div>
    );
  }

  // ─── Template 5 — Elegant (Burgundy, centered header, no-fill table) ──────
  if (t === 5) {
    return (
      <div style={base}>
        <div style={{ height: 4, background: P }} />
        <div style={{ height: 1.5, background: P, marginBottom: 10 }} />
        <div style={{ padding: "6px 14px 12px" }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ color: P, fontWeight: 800, fontSize: 16 }}>{bizName}</div>
            {(bizPhone || bizEmail || bizAddress) && (
              <div style={{ color: "#888", fontSize: 8, marginTop: 3 }}>
                {[bizPhone && `Tel: ${bizPhone}`, bizEmail, bizAddress].filter(Boolean).join("  |  ")}
              </div>
            )}
            {bizVat && <div style={{ color: "#999", fontSize: 8 }}>VAT No: {bizVat}</div>}
          </div>
          <div style={{ height: 1, background: P, marginBottom: 1.5 }} />
          <div style={{ height: 1, background: P, marginBottom: 8 }} />
          <div style={{ textAlign: "center", color: P, fontWeight: 800, fontSize: 11, letterSpacing: 4, marginBottom: 8 }}>
            {docType === "quote" ? "Q U O T E" : "T A X   I N V O I C E"}
          </div>
          <div style={{ marginBottom: 8 }}><MetaRow accent={P} /></div>
          <div style={{ borderTop: "1px dashed #ddd", marginBottom: 8 }} />
          <div style={{ marginBottom: 8 }}><CustBlock accentColor={P} /></div>
          <ItemsTable headerBg={P} headerText={P} altBg={s.rowAlt} noBgHeader />
          <TotalsBlock accent={P} boxBg={null} />
          <FooterBlock accent={P} />
        </div>
      </div>
    );
  }

  // ─── Template 6 — Vibrant (Purple layered header, left sidebar) ───────────
  if (t === 6) {
    return (
      <div style={{ ...base, position: "relative" }}>
        <div style={{ background: P, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "55%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
            <BizBlock nameColor="#fff" subColor="rgba(255,255,255,0.55)" />
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>{docType === "quote" ? "QUOTE" : "INVOICE"}</div>
              <div style={{ display: "inline-block", background: "rgba(0,0,0,0.3)", padding: "2px 8px", marginTop: 2 }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 8 }}>Auto-assigned</span>
              </div>
              {docType === "invoice" && dueDateFormatted && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 7.5, marginTop: 2 }}>Due: {dueDateFormatted}</div>}
              {docType === "quote" && paymentTerms && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 7.5, marginTop: 2 }}>Valid: {paymentTerms}</div>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ width: 5, background: P, flexShrink: 0 }} />
          <div style={{ flex: 1, padding: "10px 12px 12px" }}>
            <div style={{ marginBottom: 8 }}><CustBlock accentColor={P} /></div>
            <ItemsTable headerBg={P} headerText="#fff" altBg={s.rowAlt} />
            <TotalsBlock accent={P} boxBg={P} />
            <FooterBlock accent={P} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Template 7 — Plain (Black & white, professional) ────────────────────
  const darkGrey = "#1a1a1a";
  return (
    <div style={base}>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <BizBlock nameColor={darkGrey} subColor="#888" />
          <div style={{ color: darkGrey, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{docTitle}</div>
        </div>
        <div style={{ height: 2, background: darkGrey, marginBottom: 8 }} />
        <div style={{ marginBottom: 8 }}><MetaRow accent={darkGrey} /></div>
        <div style={{ marginBottom: 8 }}><CustBlock accentColor={darkGrey} /></div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.5 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${darkGrey}` }}>
              <th style={{ textAlign: "left", padding: "4px 4px", color: darkGrey, fontWeight: 700 }}>Description</th>
              <th style={{ textAlign: "center", padding: "4px 4px", color: darkGrey, fontWeight: 700, width: 30 }}>Qty</th>
              <th style={{ textAlign: "right", padding: "4px 4px", color: darkGrey, fontWeight: 700, width: 64 }}>Unit Price</th>
              <th style={{ textAlign: "right", padding: "4px 4px", color: darkGrey, fontWeight: 700, width: 64 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {validItems.length > 0 ? validItems.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 1 ? "#f4f4f5" : "#fff", borderBottom: "0.5px solid #e5e7eb" }}>
                <td style={{ padding: "4px", color: "#222" }}>{item.name}</td>
                <td style={{ padding: "4px", textAlign: "center", color: "#555" }}>{item.qty}</td>
                <td style={{ padding: "4px", textAlign: "right", color: "#555" }}>R{item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: "4px", textAlign: "right", fontWeight: 600, color: "#111" }}>R{(item.qty * item.unitPrice).toFixed(2)}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ padding: "12px 4px", textAlign: "center", color: "#ccc", fontStyle: "italic", fontSize: 8 }}>Add line items to see them here…</td></tr>
            )}
          </tbody>
        </table>
        <TotalsBlock accent={darkGrey} boxBg={null} />
        <FooterBlock accent={darkGrey} />
      </div>
    </div>
  );
}
