import { useEffect, useRef, useState } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpRight, BadgeCheck, BookOpen,
  BriefcaseBusiness, CalendarDays, Check, CheckCircle2, ChevronDown,
  CircleAlert, ClipboardList, Clock3, FileCheck2, FileSpreadsheet,
  Landmark, LoaderCircle, Plus, RefreshCw, Scale, Search, Sparkles, Upload,
  X,
} from "lucide-react";

type Account = {
  id: string; user_id: string; code: string; name: string; account_type: string;
  subtype: string; is_system: boolean; is_active: boolean;
};
type Journal = {
  id: string; entry_date: string; memo: string; reference: string;
  source_type: string; source_id: string; debit_cents: number; credit_cents: number;
};
type Period = {
  id: string; name: string; start_date: string; end_date: string;
  status: string; closed_at: string | null;
};
type SupplierBill = {
  id: string; supplier_name: string; supplier_reference: string; issue_date: string;
  due_date: string; description: string; subtotal_cents: number; tax_cents: number;
  total_cents: number; paid_cents: number; status: string;
};
type Approval = {
  id: string; record_type: string; record_id: string; requested_by: string;
  assigned_to: string; status: string; request_note: string; decision_note: string;
  requested_at: string; supplier_name: string; total_cents: number;
};
type BankTransaction = {
  id: string; transaction_date: string; description: string; reference: string;
  amount_cents: number; status: string; matched_journal_id: string | null; file_name: string;
};
type JournalLineDraft = { account_id: string; debit: string; credit: string };
type ReportKey =
  | "trial-balance" | "profit-loss" | "balance-sheet" | "cash-flow" | "vat"
  | "receivables-aging" | "forecast" | "inventory-valuation";

const money = (cents: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format((Number.isFinite(Number(cents)) ? Number(cents) : 0) / 100);
const dateLabel = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
};
const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => `${today().slice(0, 7)}-01`;
const centsFromInput = (value: string) => {
  if (!value.trim() || !/^-?\d+(\.\d{0,2})?$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
};
const listFrom = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["items", "data", "results", "accounts", "periods", "journals", "bills", "approvals", "transactions", "rows"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
};
const readable = (value: string) => value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const inputClass = "h-10 w-full rounded-xl border border-[#d8e1db] bg-white px-3 text-sm text-[#20342c] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/15";
const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#64756d]";
const buttonBase = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50";

async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(path, { ...init, headers, credentials: "include" });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text().catch(() => "");
  if (!response.ok) {
    const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    throw new Error(String(body.error || body.message || (typeof payload === "string" && payload) || `Request failed (${response.status})`));
  }
  return payload as T;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#dfe7e1] bg-white shadow-[0_8px_28px_-22px_rgba(27,67,49,.35)] ${className}`}>{children}</section>;
}
function SectionTitle({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>{eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#8a9b91]">{eyebrow}</p>}
      <h2 className="font-heading text-xl font-bold tracking-tight text-[#193b2d]">{title}</h2>
      {detail && <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6d7d74]">{detail}</p>}</div>
    {action}
  </div>;
}
function EmptyState({ icon: Icon, title, text }: { icon: typeof BookOpen; title: string; text: string }) {
  return <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#d7e2da] bg-[#f8faf8] px-6 py-8 text-center" data-testid="state-empty">
    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ed] text-[#287956]"><Icon className="h-5 w-5" /></span>
    <p className="text-sm font-semibold text-[#29483a]" data-testid="text-empty-title">{title}</p>
    <p className="mt-1 max-w-sm text-xs leading-5 text-[#76877d]">{text}</p>
  </div>;
}
function SkeletonRows({ count = 4 }: { count?: number }) {
  return <div className="space-y-3 p-5" aria-label="Loading records" data-testid="loading-skeleton">
    {Array.from({ length: count }, (_, index) => <div key={index} className="h-11 animate-pulse rounded-lg bg-[#edf2ee]" />)}
  </div>;
}
function Modal({ title, onClose, children, testId }: { title: string; onClose: () => void; children: React.ReactNode; testId: string }) {
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#11251d]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[#dce6df] bg-[#fbfcfa] shadow-2xl sm:max-w-xl sm:rounded-3xl" data-testid={testId}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6ece7] bg-[#fbfcfa]/95 px-5 py-4 backdrop-blur">
        <h3 className="font-heading text-lg font-bold text-[#193b2d]">{title}</h3>
        <button type="button" onClick={onClose} aria-label="Close dialog" data-testid="button-close-dialog" className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6c7b72] hover:bg-[#edf3ee]"><X className="h-4 w-4" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>;
}
function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-[#f0f3f1] text-[#5f7067]", green: "bg-[#e7f4eb] text-[#267047]",
    amber: "bg-[#fff4dc] text-[#8a6116]", red: "bg-[#fce9e6] text-[#9b463c]",
    blue: "bg-[#e9f0f4] text-[#46697c]",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${tones[tone]}`}>{children}</span>;
}
function ReportValue({ value, name = "" }: { value: unknown; name?: string }) {
  if (value === null || value === undefined) return <span className="text-[#9aa79f]">—</span>;
  if (typeof value === "number") {
    const normalized = name.toLowerCase();
    const isCents = /(_cents|cents|amount|balance|revenue|expense|profit|total|debit|credit|tax|value)/.test(normalized);
    return <span className={isCents ? "font-mono tabular-nums" : "font-mono tabular-nums"}>{isCents ? money(value) : value.toLocaleString("en-ZA")}</span>;
  }
  if (typeof value === "string") {
    if (/^\d{4}-\d\d-\d\d/.test(value)) return <span>{dateLabel(value)}</span>;
    return <span className="break-words">{value}</span>;
  }
  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-xs text-[#87968d]">No records</span>;
    const objectRows = value.filter((row) => row && typeof row === "object");
    if (objectRows.length === value.length) {
      const keys = Array.from(new Set(objectRows.flatMap((row) => Object.keys(row as object)))).slice(0, 8);
      return <div className="mobile-hscroll mt-2 overflow-x-auto rounded-xl border border-[#e4eae5]">
        <table className="w-full min-w-[560px] text-left text-xs"><thead className="bg-[#f2f6f2] text-[10px] uppercase tracking-wider text-[#708078]"><tr>{keys.map((key) => <th key={key} className="px-3 py-2.5 font-bold">{readable(key)}</th>)}</tr></thead>
          <tbody>{objectRows.map((row, index) => <tr key={index} className="border-t border-[#edf1ed]">{keys.map((key) => <td key={key} className="px-3 py-2.5 text-[#344a3e]"><ReportValue value={(row as Record<string, unknown>)[key]} name={key} /></td>)}</tr>)}</tbody>
        </table></div>;
    }
    return <ul className="mt-1 space-y-1">{value.map((item, index) => <li key={index} className="text-sm text-[#4c6054]"><ReportValue value={item} /></li>)}</ul>;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return <div className="grid gap-x-6 sm:grid-cols-2">{entries.map(([key, item]) => <div key={key} className="flex items-start justify-between gap-3 border-b border-[#edf1ed] py-2.5 text-xs">
      <span className="shrink-0 font-semibold text-[#718078]">{readable(key)}</span><span className="text-right font-medium text-[#2e493a]"><ReportValue value={item} name={key} /></span>
    </div>)}</div>;
  }
  return <span>{String(value)}</span>;
}

const reportOptions: { key: ReportKey; label: string; note: string }[] = [
  { key: "trial-balance", label: "Trial balance", note: "Debits and credits across the ledger" },
  { key: "profit-loss", label: "Profit & loss", note: "Income and expenses for a period" },
  { key: "balance-sheet", label: "Balance sheet", note: "Assets, liabilities and equity at a date" },
  { key: "cash-flow", label: "Cash flow", note: "Movement of cash over a period" },
  { key: "vat", label: "VAT summary", note: "Tax totals for a selected period" },
  { key: "receivables-aging", label: "Aged receivables", note: "Outstanding customer balances by age" },
  { key: "forecast", label: "Cash forecast", note: "Forward view by month" },
  { key: "inventory-valuation", label: "Inventory valuation", note: "Stock value by item" },
];

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [bills, setBills] = useState<SupplierBill[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [bankFilter, setBankFilter] = useState("unmatched");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [modal, setModal] = useState<"account" | "period" | "journal" | "bill" | "bill-payment" | null>(null);
  const [selectedBill, setSelectedBill] = useState<SupplierBill | null>(null);
  const [journalDetail, setJournalDetail] = useState<unknown>(null);
  const [journalDetailId, setJournalDetailId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportKey>("trial-balance");
  const [reportData, setReportData] = useState<unknown>(null);
  const [reportError, setReportError] = useState("");
  const [reportLoaded, setReportLoaded] = useState(false);
  const [dateFrom, setDateFrom] = useState(firstOfMonth());
  const [dateTo, setDateTo] = useState(today());
  const [asOf, setAsOf] = useState(today());
  const [forecastMonths, setForecastMonths] = useState("6");
  const [aiSummary, setAiSummary] = useState<unknown>(null);
  const [fileName, setFileName] = useState("");
  const bankFileRef = useRef<HTMLInputElement>(null);

  const [accountDraft, setAccountDraft] = useState({ code: "", name: "", account_type: "expense", subtype: "" });
  const [periodDraft, setPeriodDraft] = useState({ name: "", start_date: firstOfMonth(), end_date: today() });
  const [journalDraft, setJournalDraft] = useState({ entry_date: today(), memo: "", reference: "" });
  const [journalLines, setJournalLines] = useState<JournalLineDraft[]>([
    { account_id: "", debit: "", credit: "" }, { account_id: "", debit: "", credit: "" },
  ]);
  const [billDraft, setBillDraft] = useState({
    supplier_name: "", supplier_reference: "", issue_date: today(), due_date: today(),
    description: "", subtotal: "", tax: "",
  });
  const [paymentDraft, setPaymentDraft] = useState({ amount: "", payment_date: today(), reference: "" });
  const [matchJournalByTransaction, setMatchJournalByTransaction] = useState<Record<string, string>>({});
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});

  const markLoading = (key: string, value: boolean) => setLoading((current) => ({ ...current, [key]: value }));
  const clearError = (key: string) => setErrors((current) => ({ ...current, [key]: "" }));
  const showSuccess = (message: string) => { setFeedback({ tone: "success", message }); window.setTimeout(() => setFeedback(null), 4200); };
  const showError = (message: string) => setFeedback({ tone: "error", message });

  const loadAccounts = async () => {
    markLoading("accounts", true); clearError("accounts");
    try { setAccounts(listFrom<Account>(await api("/api/accounting/accounts"))); }
    catch (error) { setErrors((current) => ({ ...current, accounts: error instanceof Error ? error.message : "Could not load accounts." })); }
    finally { markLoading("accounts", false); }
  };
  const loadPeriods = async () => {
    markLoading("periods", true); clearError("periods");
    try { setPeriods(listFrom<Period>(await api("/api/accounting/periods"))); }
    catch (error) { setErrors((current) => ({ ...current, periods: error instanceof Error ? error.message : "Could not load periods." })); }
    finally { markLoading("periods", false); }
  };
  const loadJournals = async () => {
    markLoading("journals", true); clearError("journals");
    try { setJournals(listFrom<Journal>(await api("/api/accounting/journals"))); }
    catch (error) { setErrors((current) => ({ ...current, journals: error instanceof Error ? error.message : "Could not load journals." })); }
    finally { markLoading("journals", false); }
  };
  const loadBills = async () => {
    markLoading("bills", true); clearError("bills");
    try { setBills(listFrom<SupplierBill>(await api("/api/accounting/supplier-bills"))); }
    catch (error) { setErrors((current) => ({ ...current, bills: error instanceof Error ? error.message : "Could not load supplier bills." })); }
    finally { markLoading("bills", false); }
  };
  const loadApprovals = async () => {
    markLoading("approvals", true); clearError("approvals");
    try { setApprovals(listFrom<Approval>(await api("/api/accounting/approvals"))); }
    catch (error) { setErrors((current) => ({ ...current, approvals: error instanceof Error ? error.message : "Could not load approvals." })); }
    finally { markLoading("approvals", false); }
  };
  const loadTransactions = async (status = bankFilter) => {
    markLoading("bank", true); clearError("bank");
    try {
      const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
      setTransactions(listFrom<BankTransaction>(await api(`/api/accounting/bank/transactions${query}`)));
    } catch (error) { setErrors((current) => ({ ...current, bank: error instanceof Error ? error.message : "Could not load bank activity." })); }
    finally { markLoading("bank", false); }
  };
  useEffect(() => {
    void Promise.all([loadAccounts(), loadPeriods(), loadJournals(), loadBills(), loadApprovals(), loadTransactions("unmatched")]);
    // Initial workspace hydration only. Subsequent refreshes are action-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingApprovals = approvals.filter((item) => item.status === "pending" || item.status === "requested");
  const unpaidBills = bills.filter((bill) => Number(bill.total_cents) > Number(bill.paid_cents || 0));
  const visibleJournals = journals.filter((journal) => {
    const needle = searchTerm.trim().toLowerCase();
    return !needle || `${journal.memo} ${journal.reference} ${journal.source_type}`.toLowerCase().includes(needle);
  });
  const totalOutstanding = unpaidBills.reduce((sum, bill) => sum + Math.max(0, Number(bill.total_cents) - Number(bill.paid_cents || 0)), 0);
  const pendingBank = transactions.filter((transaction) => transaction.status === "unmatched" || transaction.status === "pending");
  const activePeriods = periods.filter((period) => period.status !== "closed");
  const trialBalance = journals.reduce((sums, journal) => ({ debit: sums.debit + Number(journal.debit_cents || 0), credit: sums.credit + Number(journal.credit_cents || 0) }), { debit: 0, credit: 0 });

  const submitAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accountDraft.code.trim() || !accountDraft.name.trim() || !accountDraft.account_type) return showError("Enter an account code, name and type.");
    markLoading("save-account", true);
    try {
      await api("/api/accounting/accounts", { method: "POST", body: JSON.stringify(accountDraft) });
      setModal(null); setAccountDraft({ code: "", name: "", account_type: "expense", subtype: "" });
      showSuccess("Account added to the chart."); await loadAccounts();
    } catch (error) { showError(error instanceof Error ? error.message : "Could not create account."); }
    finally { markLoading("save-account", false); }
  };
  const toggleAccount = async (account: Account) => {
    markLoading(`account-${account.id}`, true);
    try {
      await api(`/api/accounting/accounts/${encodeURIComponent(account.id)}`, { method: "PATCH", body: JSON.stringify({ is_active: !account.is_active }) });
      showSuccess(account.is_active ? "Account deactivated." : "Account reactivated."); await loadAccounts();
    } catch (error) { showError(error instanceof Error ? error.message : "Could not update account."); }
    finally { markLoading(`account-${account.id}`, false); }
  };
  const submitPeriod = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!periodDraft.name.trim() || !periodDraft.start_date || !periodDraft.end_date || periodDraft.start_date > periodDraft.end_date) return showError("Add a period name and a valid date range.");
    markLoading("save-period", true);
    try {
      await api("/api/accounting/periods", { method: "POST", body: JSON.stringify(periodDraft) });
      setModal(null); setPeriodDraft({ name: "", start_date: firstOfMonth(), end_date: today() }); showSuccess("Accounting period created."); await loadPeriods();
    } catch (error) { showError(error instanceof Error ? error.message : "Could not create period."); }
    finally { markLoading("save-period", false); }
  };
  const changePeriodStatus = async (period: Period) => {
    const action = period.status === "closed" ? "reopen" : "close";
    markLoading(`period-${period.id}`, true);
    try {
      await api(`/api/accounting/periods/${encodeURIComponent(period.id)}/${action}`, { method: "POST" });
      showSuccess(action === "close" ? "Period closed." : "Period reopened."); await loadPeriods();
    } catch (error) { showError(error instanceof Error ? error.message : `Could not ${action} the period.`); }
    finally { markLoading(`period-${period.id}`, false); }
  };
  const submitJournal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!journalDraft.entry_date || !journalDraft.memo.trim()) return showError("Add an entry date and a short memo.");
    const lines = journalLines.map((line) => {
      const debit = centsFromInput(line.debit || "0");
      const credit = centsFromInput(line.credit || "0");
      return { account_id: line.account_id, debit_cents: debit, credit_cents: credit };
    });
    if (lines.some((line) => !line.account_id || line.debit_cents === null || line.credit_cents === null)) return showError("Choose an account and enter valid amounts for every journal line.");
    if (lines.some((line) => (line.debit_cents || 0) < 0 || (line.credit_cents || 0) < 0 || ((line.debit_cents || 0) > 0 && (line.credit_cents || 0) > 0))) return showError("Each line must have a non-negative debit or credit, not both.");
    if (lines.some((line) => (line.debit_cents || 0) + (line.credit_cents || 0) === 0)) return showError("Every journal line needs a debit or credit amount.");
    const debitTotal = lines.reduce((sum, line) => sum + (line.debit_cents || 0), 0);
    const creditTotal = lines.reduce((sum, line) => sum + (line.credit_cents || 0), 0);
    if (debitTotal !== creditTotal) return showError(`Journal is out of balance by ${money(Math.abs(debitTotal - creditTotal))}.`);
    markLoading("save-journal", true);
    try {
      await api("/api/accounting/journals", { method: "POST", body: JSON.stringify({ ...journalDraft, reference: journalDraft.reference || undefined, lines }) });
      setModal(null); setJournalDraft({ entry_date: today(), memo: "", reference: "" });
      setJournalLines([{ account_id: "", debit: "", credit: "" }, { account_id: "", debit: "", credit: "" }]);
      showSuccess("Balanced journal posted."); await loadJournals();
    } catch (error) { showError(error instanceof Error ? error.message : "Could not post journal."); }
    finally { markLoading("save-journal", false); }
  };
  const openJournal = async (journal: Journal) => {
    setJournalDetailId(journal.id); setJournalDetail(null); markLoading("journal-detail", true); clearError("journal-detail");
    try { setJournalDetail(await api(`/api/accounting/journals/${encodeURIComponent(journal.id)}`)); }
    catch (error) { setErrors((current) => ({ ...current, "journal-detail": error instanceof Error ? error.message : "Could not load journal details." })); }
    finally { markLoading("journal-detail", false); }
  };
  const submitBill = async (event: React.FormEvent) => {
    event.preventDefault();
    const subtotal = centsFromInput(billDraft.subtotal);
    const tax = centsFromInput(billDraft.tax || "0");
    if (!billDraft.supplier_name.trim() || !billDraft.issue_date || !billDraft.due_date || subtotal === null || subtotal <= 0 || tax === null || tax < 0) return showError("Enter a supplier, valid dates and non-negative bill amounts.");
    if (billDraft.due_date < billDraft.issue_date) return showError("The due date cannot be earlier than the issue date.");
    markLoading("save-bill", true);
    try {
      await api("/api/accounting/supplier-bills", { method: "POST", body: JSON.stringify({
        supplier_name: billDraft.supplier_name.trim(), supplier_reference: billDraft.supplier_reference || undefined,
        issue_date: billDraft.issue_date, due_date: billDraft.due_date, description: billDraft.description || undefined,
        subtotal_cents: subtotal, tax_cents: tax, total_cents: subtotal + tax,
      }) });
      setModal(null); setBillDraft({ supplier_name: "", supplier_reference: "", issue_date: today(), due_date: today(), description: "", subtotal: "", tax: "" });
      showSuccess("Supplier bill recorded."); await loadBills();
    } catch (error) { showError(error instanceof Error ? error.message : "Could not record supplier bill."); }
    finally { markLoading("save-bill", false); }
  };
  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBill) return;
    const amount = centsFromInput(paymentDraft.amount);
    const due = Number(selectedBill.total_cents) - Number(selectedBill.paid_cents || 0);
    if (amount === null || amount <= 0 || amount > due) return showError(`Payment must be greater than zero and no more than ${money(due)}.`);
    markLoading("save-payment", true);
    try {
      await api(`/api/accounting/supplier-bills/${encodeURIComponent(selectedBill.id)}/payments`, { method: "POST", body: JSON.stringify({ amount_cents: amount, payment_date: paymentDraft.payment_date, reference: paymentDraft.reference || undefined }) });
      setModal(null); setSelectedBill(null); setPaymentDraft({ amount: "", payment_date: today(), reference: "" }); showSuccess("Supplier payment recorded."); await loadBills();
    } catch (error) { showError(error instanceof Error ? error.message : "Could not record payment."); }
    finally { markLoading("save-payment", false); }
  };
  const reviewApproval = async (approval: Approval, status: "approved" | "rejected") => {
    markLoading(`approval-${approval.id}`, true);
    try {
      await api(`/api/accounting/approvals/${encodeURIComponent(approval.id)}`, { method: "PATCH", body: JSON.stringify({ status, note: approvalNotes[approval.id] || "" }) });
      showSuccess(status === "approved" ? "Request approved." : "Request rejected."); await loadApprovals();
    } catch (error) { showError(error instanceof Error ? error.message : "Could not update approval."); }
    finally { markLoading(`approval-${approval.id}`, false); }
  };
  const importBankFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name); markLoading("bank-import", true);
    const formData = new FormData(); formData.append("file", file);
    try {
      const result = await api<unknown>("/api/accounting/bank/import", { method: "POST", body: formData });
      const record = result && typeof result === "object" ? result as Record<string, unknown> : {};
      showSuccess(typeof record.message === "string" ? record.message : "Statement imported. Review the transactions below.");
      await loadTransactions(bankFilter);
    } catch (error) { showError(error instanceof Error ? error.message : "Could not import the statement."); }
    finally { markLoading("bank-import", false); if (bankFileRef.current) bankFileRef.current.value = ""; }
  };
  const matchBankTransaction = async (transaction: BankTransaction) => {
    const journalId = matchJournalByTransaction[transaction.id];
    if (!journalId) return showError("Choose a journal entry to match this transaction.");
    markLoading(`bank-${transaction.id}`, true);
    try {
      await api(`/api/accounting/bank/transactions/${encodeURIComponent(transaction.id)}/match`, { method: "POST", body: JSON.stringify({ journal_id: journalId }) });
      showSuccess("Bank transaction matched."); await loadTransactions(bankFilter);
    } catch (error) { showError(error instanceof Error ? error.message : "Could not match transaction."); }
    finally { markLoading(`bank-${transaction.id}`, false); }
  };
  const ignoreBankTransaction = async (transaction: BankTransaction) => {
    markLoading(`bank-${transaction.id}`, true);
    try {
      await api(`/api/accounting/bank/transactions/${encodeURIComponent(transaction.id)}/ignore`, { method: "POST" });
      showSuccess("Transaction marked as ignored."); await loadTransactions(bankFilter);
    } catch (error) { showError(error instanceof Error ? error.message : "Could not ignore transaction."); }
    finally { markLoading(`bank-${transaction.id}`, false); }
  };
  const buildReportPath = () => {
    if (selectedReport === "balance-sheet") return `/api/accounting/reports/balance-sheet?as_of=${encodeURIComponent(asOf)}`;
    if (selectedReport === "receivables-aging" || selectedReport === "inventory-valuation") return `/api/accounting/reports/${selectedReport}`;
    if (selectedReport === "forecast") return `/api/accounting/reports/forecast?months=${encodeURIComponent(forecastMonths)}`;
    return `/api/accounting/reports/${selectedReport}?from=${encodeURIComponent(dateFrom)}&to=${encodeURIComponent(dateTo)}`;
  };
  const runReport = async () => {
    if (selectedReport !== "balance-sheet" && selectedReport !== "receivables-aging" && selectedReport !== "inventory-valuation" && selectedReport !== "forecast" && dateFrom > dateTo) {
      setReportError("The start date must be before or the same as the end date."); return;
    }
    setReportError(""); setReportLoaded(false); markLoading("report", true);
    try { setReportData(await api(buildReportPath())); setReportLoaded(true); }
    catch (error) { setReportError(error instanceof Error ? error.message : "Could not load this report."); }
    finally { markLoading("report", false); }
  };
  const generateAiSummary = async () => {
    if (dateFrom > dateTo) return showError("The start date must be before or the same as the end date.");
    markLoading("ai-summary", true);
    try {
      setAiSummary(await api("/api/accounting/ai-summary", { method: "POST", body: JSON.stringify({ from: dateFrom, to: dateTo }) }));
      showSuccess("Financial summary generated.");
    } catch (error) { showError(error instanceof Error ? error.message : "Could not generate a summary."); }
    finally { markLoading("ai-summary", false); }
  };

  const tabs = [
    { id: "overview", label: "Control room", icon: Activity },
    { id: "journals", label: "Journals", icon: BookOpen },
    { id: "accounts", label: "Chart of accounts", icon: Scale },
    { id: "bills", label: "Supplier bills", icon: FileCheck2, count: unpaidBills.length },
    { id: "approvals", label: "Approvals", icon: BadgeCheck, count: pendingApprovals.length },
    { id: "bank", label: "Bank match", icon: Landmark, count: pendingBank.length },
    { id: "reports", label: "Reports & insight", icon: FileSpreadsheet },
    { id: "periods", label: "Periods", icon: CalendarDays },
  ];
  const headerAction = activeTab === "journals"
    ? <button type="button" onClick={() => setModal("journal")} data-testid="button-new-journal" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}><Plus className="h-4 w-4" /> New journal</button>
    : activeTab === "accounts"
      ? <button type="button" onClick={() => setModal("account")} data-testid="button-new-account" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}><Plus className="h-4 w-4" /> Add account</button>
      : activeTab === "bills"
        ? <button type="button" onClick={() => setModal("bill")} data-testid="button-new-bill" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}><Plus className="h-4 w-4" /> Record bill</button>
        : activeTab === "periods"
          ? <button type="button" onClick={() => setModal("period")} data-testid="button-new-period" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}><Plus className="h-4 w-4" /> New period</button>
          : null;

  return <main className="min-h-[100dvh] bg-[#f3f6f2] text-[#20372c]" data-testid="accounting-page">
    <div className="border-b border-[#dce6df] bg-[#fafcf9]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#6d8c79]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f1e9] text-[#24704c]"><BriefcaseBusiness className="h-4 w-4" /></span>
              Masakhe / Finance desk
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-[-.04em] text-[#183a2b] sm:text-[38px]" data-testid="text-accounting-title">Accounting workspace</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64766b]">One traceable record for every rand: journals, bills, stock and bank movement, kept in balance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#dce6df] bg-white px-3 py-2 text-xs font-semibold text-[#52695c]" data-testid="status-ledger-integrity">
              <span className="h-2 w-2 rounded-full bg-[#278657]" /> Ledger workspace
            </div>
            {headerAction}
          </div>
        </div>
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#e0e8e2] pb-px" role="tablist" aria-label="Accounting sections">
          {tabs.map(({ id, label, icon: Icon, count }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} data-testid={`tab-accounting-${id}`}
            className={`relative flex shrink-0 items-center gap-2 px-3 py-3 text-xs font-semibold transition ${activeTab === id ? "text-[#176b4c]" : "text-[#74837a] hover:text-[#244a37]"}`}>
            <Icon className="h-4 w-4" />{label}
            {typeof count === "number" && count > 0 && <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${activeTab === id ? "bg-[#176b4c] text-white" : "bg-[#e7ede8] text-[#617268]"}`} data-testid={`badge-count-${id}`}>{count}</span>}
            {activeTab === id && <span className="absolute inset-x-3 bottom-[-1px] h-0.5 rounded-full bg-[#176b4c]" />}
          </button>)}
        </div>
      </div>
    </div>
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
      {feedback && <div className={`mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${feedback.tone === "success" ? "border-[#cde4d2] bg-[#ebf6ee] text-[#286b43]" : "border-[#efd0ca] bg-[#fff0ed] text-[#9b483d]"}`} role="status" data-testid={`alert-${feedback.tone}`}>
        {feedback.tone === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <CircleAlert className="h-4 w-4 shrink-0" />}{feedback.message}
        <button type="button" className="ml-auto rounded p-1 opacity-70 hover:opacity-100" onClick={() => setFeedback(null)} data-testid="button-dismiss-feedback" aria-label="Dismiss message"><X className="h-4 w-4" /></button>
      </div>}

      {activeTab === "overview" && <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-[#183d2d] p-5 text-white shadow-[0_18px_45px_-28px_rgba(18,62,40,.7)] sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative grid gap-7 lg:grid-cols-[1fr_300px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#d7e9dc]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8bd6b]" /> Daily financial control
              </div>
              <h2 className="mt-4 max-w-xl font-heading text-2xl font-bold leading-tight tracking-[-.03em] sm:text-3xl">Know what is owed, what moved, and what still needs a decision.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#d0dfd4]">Every entry can be followed back to its record. Start with the exceptions, then close the books with confidence.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setActiveTab("journals"); setModal("journal"); }} data-testid="button-overview-journal" className={`${buttonBase} bg-[#f2d78c] text-[#213d2c] hover:bg-[#f7e5ae]`}><Plus className="h-4 w-4" /> Post journal</button>
                <button type="button" onClick={() => setActiveTab("bank")} data-testid="button-review-bank" className={`${buttonBase} border border-white/20 bg-white/10 text-white hover:bg-white/15`}><Landmark className="h-4 w-4" /> Review bank lines</button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-[#102e21]/50 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between"><span className="text-xs text-[#b9cfc0]">Ledger activity loaded</span><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-[#e2eddf]">Current view</span></div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[.07] p-3"><p className="text-[10px] uppercase tracking-wider text-[#b9cfc0]">Journal debits</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums" data-testid="value-journal-debits">{money(trialBalance.debit)}</p></div>
                <div className="rounded-xl bg-white/[.07] p-3"><p className="text-[10px] uppercase tracking-wider text-[#b9cfc0]">Journal credits</p><p className="mt-1 font-mono text-lg font-semibold tabular-nums" data-testid="value-journal-credits">{money(trialBalance.credit)}</p></div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs">
                <Scale className="h-4 w-4 text-[#e0c773]" />
                {trialBalance.debit === trialBalance.credit
                  ? <span className="text-[#d8e8dc]" data-testid="status-trial-balance">Debits and credits agree across loaded journal totals.</span>
                  : <span className="text-[#f2d9a0]" data-testid="status-trial-balance">Loaded journals differ by {money(Math.abs(trialBalance.debit - trialBalance.credit))}; check the ledger report.</span>}
              </div>
            </div>
          </div>
        </section>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Unpaid supplier bills", value: money(totalOutstanding), detail: `${unpaidBills.length} bills with a remaining balance`, icon: ArrowUpRight, tint: "bg-[#fbf0df] text-[#94671e]" },
            { label: "Awaiting your decision", value: String(pendingApprovals.length), detail: pendingApprovals.length ? "Approval requests are ready for review" : "No pending approval requests", icon: ClipboardList, tint: "bg-[#e9eff1] text-[#4d7181]" },
            { label: "Bank lines to match", value: String(pendingBank.length), detail: pendingBank.length ? "Unmatched activity in the selected view" : "No unmatched lines in the selected view", icon: ArrowDownLeft, tint: "bg-[#e8f3eb] text-[#33734e]" },
            { label: "Open accounting periods", value: String(activePeriods.length), detail: `${periods.length} periods on record`, icon: CalendarDays, tint: "bg-[#f0ebf4] text-[#715b86]" },
          ].map((item, index) => <Panel key={item.label} className="p-4" >
            <div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.tint}`}><item.icon className="h-4 w-4" /></span><p className="text-xs font-semibold text-[#6c7b72]">{item.label}</p></div>
            <p className="mt-4 font-mono text-[25px] font-semibold tracking-tight text-[#213d2d] tabular-nums" data-testid={`value-overview-${index}`}>{item.value}</p>
            <p className="mt-1 text-[11px] text-[#87948c]" data-testid={`text-overview-detail-${index}`}>{item.detail}</p>
          </Panel>)}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <Panel className="p-5 sm:p-6">
            <SectionTitle eyebrow="Work queue" title="Needs attention" detail="Exceptions and decisions that can move the books forward." />
            <div className="divide-y divide-[#e9eeea]">
              <button type="button" onClick={() => setActiveTab("approvals")} data-testid="button-queue-approvals" className="flex w-full items-center gap-3 py-3 text-left hover:bg-[#f8faf8]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff3df] text-[#9a6c1d]"><BadgeCheck className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#294638]">Approval requests</span><span className="mt-0.5 block text-xs text-[#849188]">{pendingApprovals.length ? `${pendingApprovals.length} request${pendingApprovals.length === 1 ? "" : "s"} pending review` : "No open requests right now"}</span></span>
                <span className="font-mono text-sm text-[#50665a]">{pendingApprovals.length}</span><ChevronDown className="h-4 w-4 -rotate-90 text-[#9aa89f]" />
              </button>
              <button type="button" onClick={() => setActiveTab("bank")} data-testid="button-queue-bank" className="flex w-full items-center gap-3 py-3 text-left hover:bg-[#f8faf8]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf2f4] text-[#4d7382]"><Landmark className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#294638]">Bank reconciliation</span><span className="mt-0.5 block text-xs text-[#849188]">{pendingBank.length ? "Match imported statement lines to journals" : "Import a statement to begin matching"}</span></span>
                <span className="font-mono text-sm text-[#50665a]">{pendingBank.length}</span><ChevronDown className="h-4 w-4 -rotate-90 text-[#9aa89f]" />
              </button>
              <button type="button" onClick={() => setActiveTab("bills")} data-testid="button-queue-bills" className="flex w-full items-center gap-3 py-3 text-left hover:bg-[#f8faf8]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4ebdf] text-[#98724a]"><FileCheck2 className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#294638]">Supplier balances</span><span className="mt-0.5 block text-xs text-[#849188]">{unpaidBills.length ? "Record settlements as payments are made" : "All recorded bills are settled"}</span></span>
                <span className="font-mono text-sm text-[#50665a]">{money(totalOutstanding)}</span><ChevronDown className="h-4 w-4 -rotate-90 text-[#9aa89f]" />
              </button>
            </div>
          </Panel>
          <Panel className="p-5 sm:p-6">
            <SectionTitle eyebrow="Fast access" title="A clean close starts here" />
            <div className="grid gap-2">
              {[
                { tab: "reports", title: "Prepare a financial report", detail: "VAT, aged receivables, cash forecast and more", icon: FileSpreadsheet },
                { tab: "accounts", title: "Review your account map", detail: `${accounts.filter((account) => account.is_active).length} active accounts`, icon: Scale },
                { tab: "periods", title: "Check the reporting periods", detail: activePeriods.length ? `${activePeriods.length} periods remain open` : "No open periods currently loaded", icon: CalendarDays },
              ].map((item) => <button type="button" key={item.tab} onClick={() => setActiveTab(item.tab)} data-testid={`button-shortcut-${item.tab}`} className="flex items-center gap-3 rounded-xl border border-[#e6ece7] bg-[#fbfcfb] p-3 text-left transition hover:border-[#c8d9ce] hover:bg-[#f5f9f6]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f2ec] text-[#337a54]"><item.icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#345343]">{item.title}</span><span className="mt-0.5 block text-xs text-[#87958c]">{item.detail}</span></span><ChevronDown className="h-4 w-4 -rotate-90 text-[#9aa89f]" />
              </button>)}
            </div>
          </Panel>
        </div>
      </div>}

      {activeTab === "journals" && <div>
        <SectionTitle eyebrow="Double-entry ledger" title="Journal entries" detail="Post balanced entries and inspect the source lines behind each recorded movement." action={<div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a198]" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className={`${inputClass} w-56 pl-9`} placeholder="Search memo or reference" data-testid="input-search-journals" /></div>} />
        <Panel>
          {loading.journals ? <SkeletonRows /> : errors.journals ? <div className="p-6 text-sm text-[#9b483d]" data-testid="error-journals"><CircleAlert className="mr-2 inline h-4 w-4" />{errors.journals}<button type="button" onClick={() => void loadJournals()} data-testid="button-retry-journals" className="ml-3 font-semibold underline">Retry</button></div> : visibleJournals.length === 0 ? <div className="p-5"><EmptyState icon={BookOpen} title={searchTerm ? "No entries match that search" : "No journal entries yet"} text={searchTerm ? "Try a different memo or reference." : "Post your first balanced journal to begin building a traceable ledger."} /></div> :
            <div className="mobile-hscroll overflow-x-auto"><table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#f5f8f5] text-[10px] uppercase tracking-[.14em] text-[#7c8c82]"><tr><th className="px-5 py-3">Entry date</th><th className="px-5 py-3">Memo / reference</th><th className="px-5 py-3">Source</th><th className="px-5 py-3 text-right">Debit</th><th className="px-5 py-3 text-right">Credit</th><th className="px-5 py-3 text-right">Detail</th></tr></thead>
              <tbody>{visibleJournals.map((journal) => <tr key={journal.id} className="border-t border-[#edf1ed] hover:bg-[#fafcfb]" data-testid={`row-journal-${journal.id}`}>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-[#67796e]" data-testid={`text-journal-date-${journal.id}`}>{dateLabel(journal.entry_date)}</td>
                <td className="max-w-[260px] px-5 py-4"><p className="truncate text-sm font-semibold text-[#304c3b]" data-testid={`text-journal-memo-${journal.id}`}>{journal.memo || "Journal entry"}</p><p className="mt-1 text-[10px] text-[#8a978f]">{journal.reference || "No reference"}</p></td>
                <td className="px-5 py-4"><Badge tone="blue">{readable(journal.source_type || "manual")}</Badge></td>
                <td className="px-5 py-4 text-right font-mono text-xs tabular-nums text-[#425b4b]">{money(Number(journal.debit_cents || 0))}</td>
                <td className="px-5 py-4 text-right font-mono text-xs tabular-nums text-[#425b4b]">{money(Number(journal.credit_cents || 0))}</td>
                <td className="px-5 py-4 text-right"><button type="button" onClick={() => void openJournal(journal)} data-testid={`button-view-journal-${journal.id}`} className="rounded-lg border border-[#dfe8e1] px-3 py-1.5 text-xs font-semibold text-[#427052] hover:bg-[#edf5ef]">View lines</button></td>
              </tr>)}</tbody>
            </table></div>}
        </Panel>
      </div>}

      {activeTab === "accounts" && <div>
        <SectionTitle eyebrow="Ledger structure" title="Chart of accounts" detail="Keep account codes legible and classify each balance where it belongs." action={<span className="rounded-xl border border-[#dce6df] bg-white px-3 py-2 text-xs text-[#68786f]" data-testid="text-account-count">{accounts.length} accounts · {accounts.filter((account) => account.is_active).length} active</span>} />
        <Panel>
          {loading.accounts ? <SkeletonRows /> : errors.accounts ? <div className="p-6 text-sm text-[#9b483d]" data-testid="error-accounts"><CircleAlert className="mr-2 inline h-4 w-4" />{errors.accounts}<button type="button" onClick={() => void loadAccounts()} data-testid="button-retry-accounts" className="ml-3 font-semibold underline">Retry</button></div> : accounts.length === 0 ? <div className="p-5"><EmptyState icon={Scale} title="Your chart is ready for its first account" text="Create account codes that reflect how your business records assets, liabilities, equity, income and expenses." /></div> :
            <div className="mobile-hscroll overflow-x-auto"><table className="w-full min-w-[720px] text-left">
              <thead className="bg-[#f5f8f5] text-[10px] uppercase tracking-[.14em] text-[#7c8c82]"><tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Account name</th><th className="px-5 py-3">Type / subtype</th><th className="px-5 py-3">Origin</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
              <tbody>{accounts.map((account) => <tr key={account.id} className="border-t border-[#edf1ed]" data-testid={`row-account-${account.id}`}>
                <td className="px-5 py-4 font-mono text-xs font-semibold text-[#68796e]" data-testid={`text-account-code-${account.id}`}>{account.code}</td>
                <td className="px-5 py-4 text-sm font-semibold text-[#2e4939]" data-testid={`text-account-name-${account.id}`}>{account.name}</td>
                <td className="px-5 py-4"><span className="text-xs text-[#53695b]">{readable(account.account_type)}</span><span className="ml-2 text-[10px] text-[#93a097]">{account.subtype ? `· ${readable(account.subtype)}` : ""}</span></td>
                <td className="px-5 py-4">{account.is_system ? <Badge tone="blue">System</Badge> : <Badge>Business</Badge>}</td>
                <td className="px-5 py-4"><Badge tone={account.is_active ? "green" : "neutral"}>{account.is_active ? "Active" : "Inactive"}</Badge></td>
                <td className="px-5 py-4 text-right"><button type="button" disabled={account.is_system || loading[`account-${account.id}`]} onClick={() => void toggleAccount(account)} data-testid={`button-toggle-account-${account.id}`} className="rounded-lg border border-[#dfe8e1] px-3 py-1.5 text-xs font-semibold text-[#557061] hover:bg-[#f3f7f3] disabled:opacity-45">{loading[`account-${account.id}`] ? "Saving…" : account.is_active ? "Deactivate" : "Reactivate"}</button></td>
              </tr>)}</tbody>
            </table></div>}
        </Panel>
      </div>}

      {activeTab === "bills" && <div>
        <SectionTitle eyebrow="Accounts payable" title="Supplier bills" detail="Record the full obligation first; use payment entries to reduce the balance as cash leaves the business." />
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Panel className="p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7c8a81]">Open balance</p><p className="mt-2 font-mono text-xl font-semibold text-[#284633]" data-testid="value-bills-outstanding">{money(totalOutstanding)}</p></Panel>
          <Panel className="p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7c8a81]">Unsettled bills</p><p className="mt-2 font-mono text-xl font-semibold text-[#284633]" data-testid="value-bills-open-count">{unpaidBills.length}</p></Panel>
          <Panel className="p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7c8a81]">Recorded bills</p><p className="mt-2 font-mono text-xl font-semibold text-[#284633]" data-testid="value-bills-total-count">{bills.length}</p></Panel>
        </div>
        <Panel>
          {loading.bills ? <SkeletonRows /> : errors.bills ? <div className="p-6 text-sm text-[#9b483d]" data-testid="error-bills"><CircleAlert className="mr-2 inline h-4 w-4" />{errors.bills}<button type="button" onClick={() => void loadBills()} data-testid="button-retry-bills" className="ml-3 font-semibold underline">Retry</button></div> : bills.length === 0 ? <div className="p-5"><EmptyState icon={FileCheck2} title="No supplier bills on file" text="Record an invoice from a supplier to keep costs and payment commitments in one place." /></div> :
            <div className="mobile-hscroll overflow-x-auto"><table className="w-full min-w-[820px] text-left">
              <thead className="bg-[#f5f8f5] text-[10px] uppercase tracking-[.14em] text-[#7c8c82]"><tr><th className="px-5 py-3">Supplier / reference</th><th className="px-5 py-3">Issue date</th><th className="px-5 py-3">Due date</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3 text-right">Paid</th><th className="px-5 py-3 text-right">Balance</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
              <tbody>{bills.map((bill) => {
                const due = Math.max(0, Number(bill.total_cents || 0) - Number(bill.paid_cents || 0));
                const overdue = due > 0 && bill.due_date < today();
                return <tr key={bill.id} className="border-t border-[#edf1ed]" data-testid={`row-bill-${bill.id}`}>
                  <td className="px-5 py-4"><p className="text-sm font-semibold text-[#304c3b]" data-testid={`text-bill-supplier-${bill.id}`}>{bill.supplier_name}</p><p className="mt-1 text-[10px] text-[#8a978f]">{bill.supplier_reference || bill.description || "No supplier reference"}</p></td>
                  <td className="px-5 py-4 text-xs text-[#66786d]">{dateLabel(bill.issue_date)}</td><td className={`px-5 py-4 text-xs ${overdue ? "font-semibold text-[#a24e42]" : "text-[#66786d]"}`}>{dateLabel(bill.due_date)}{overdue && <span className="ml-1 text-[9px]">Overdue</span>}</td>
                  <td className="px-5 py-4 text-right font-mono text-xs tabular-nums text-[#40584a]">{money(Number(bill.total_cents || 0))}</td>
                  <td className="px-5 py-4 text-right font-mono text-xs tabular-nums text-[#74847a]">{money(Number(bill.paid_cents || 0))}</td>
                  <td className="px-5 py-4 text-right font-mono text-xs font-semibold tabular-nums text-[#365541]" data-testid={`value-bill-balance-${bill.id}`}>{money(due)}</td>
                  <td className="px-5 py-4"><Badge tone={due === 0 ? "green" : overdue ? "red" : "amber"}>{due === 0 ? "Paid" : overdue ? "Overdue" : readable(bill.status || "open")}</Badge></td>
                  <td className="px-5 py-4 text-right">{due > 0 && <button type="button" onClick={() => { setSelectedBill(bill); setPaymentDraft({ amount: (due / 100).toFixed(2), payment_date: today(), reference: "" }); setModal("bill-payment"); }} data-testid={`button-pay-bill-${bill.id}`} className="rounded-lg border border-[#cfe1d3] px-3 py-1.5 text-xs font-semibold text-[#31744c] hover:bg-[#edf6ef]">Record payment</button>}</td>
                </tr>;
              })}</tbody>
            </table></div>}
        </Panel>
      </div>}

      {activeTab === "approvals" && <div>
        <SectionTitle eyebrow="Decision log" title="Approval requests" detail="Review the request context, leave a decision note, and record an explicit outcome." />
        {loading.approvals ? <Panel><SkeletonRows /></Panel> : errors.approvals ? <Panel><div className="p-6 text-sm text-[#9b483d]" data-testid="error-approvals"><CircleAlert className="mr-2 inline h-4 w-4" />{errors.approvals}<button type="button" onClick={() => void loadApprovals()} data-testid="button-retry-approvals" className="ml-3 font-semibold underline">Retry</button></div></Panel> : approvals.length === 0 ? <Panel className="p-5"><EmptyState icon={BadgeCheck} title="No approval requests" text="Requests routed to this workspace will appear here with their linked record and decision history." /></Panel> :
          <div className="grid gap-3 lg:grid-cols-2">{approvals.map((approval) => {
            const isOpen = approval.status === "pending" || approval.status === "requested";
            return <Panel key={approval.id} className="p-5" >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ee] text-[#37724f]"><FileCheck2 className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#2d4939]" data-testid={`text-approval-type-${approval.id}`}>{readable(approval.record_type)}</h3><Badge tone={isOpen ? "amber" : approval.status === "approved" ? "green" : "red"}>{readable(approval.status)}</Badge></div>
                  <p className="mt-1 text-xs text-[#7e8d83]">{approval.supplier_name || `Record ${approval.record_id}`} · Requested {dateLabel(approval.requested_at?.slice(0, 10))}</p></div>
                {Number(approval.total_cents) > 0 && <span className="font-mono text-sm font-semibold tabular-nums text-[#395542]" data-testid={`value-approval-amount-${approval.id}`}>{money(Number(approval.total_cents))}</span>}
              </div>
              <div className="mt-4 rounded-xl bg-[#f6f8f6] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a978f]">Request note</p>
                <p className="mt-1 text-sm leading-5 text-[#53675a]" data-testid={`text-approval-note-${approval.id}`}>{approval.request_note || "No request note supplied."}</p>
                {approval.decision_note && <p className="mt-2 border-t border-[#e5ebe6] pt-2 text-xs text-[#67796d]" data-testid={`text-approval-decision-${approval.id}`}>Decision: {approval.decision_note}</p>}
              </div>
              {isOpen && <div className="mt-3">
                <label className={labelClass} htmlFor={`approval-note-${approval.id}`}>Decision note <span className="font-normal normal-case tracking-normal text-[#9aa59e]">optional</span></label>
                <textarea id={`approval-note-${approval.id}`} value={approvalNotes[approval.id] || ""} onChange={(event) => setApprovalNotes((current) => ({ ...current, [approval.id]: event.target.value }))} rows={2} className="w-full resize-y rounded-xl border border-[#d8e1db] bg-white px-3 py-2 text-sm outline-none focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/15" placeholder="Add context for the decision" data-testid={`input-approval-note-${approval.id}`} />
                <div className="mt-3 flex justify-end gap-2"><button type="button" disabled={loading[`approval-${approval.id}`]} onClick={() => void reviewApproval(approval, "rejected")} data-testid={`button-reject-approval-${approval.id}`} className="rounded-xl border border-[#e8d1cc] px-3 py-2 text-xs font-semibold text-[#9d5145] hover:bg-[#fff2ef]">Reject</button>
                  <button type="button" disabled={loading[`approval-${approval.id}`]} onClick={() => void reviewApproval(approval, "approved")} data-testid={`button-approve-approval-${approval.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#176b4c] px-3 py-2 text-xs font-semibold text-white hover:bg-[#10573d]"><Check className="h-3.5 w-3.5" /> Approve</button></div>
              </div>}
            </Panel>;
          })}</div>}
      </div>}

      {activeTab === "bank" && <div>
        <SectionTitle eyebrow="Statement controls" title="Bank reconciliation" detail="Import a statement, match each line to an existing journal, and keep unmatched activity visible." action={<button type="button" onClick={() => void loadTransactions(bankFilter)} data-testid="button-refresh-bank" className={`${buttonBase} border border-[#dce6df] bg-white text-[#526a5a] hover:bg-[#f5f8f5]`}><RefreshCw className="h-4 w-4" /> Refresh</button>} />
        <Panel className="mb-4 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9f1ee] text-[#337554]"><Upload className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-[#31503e]">Import a bank statement</p><p className="mt-1 text-xs leading-5 text-[#7e8d83]">Choose the statement file provided by your bank. Imported lines are not matched automatically.</p>{fileName && <p className="mt-1 text-[11px] text-[#4d765c]" data-testid="text-bank-file-name">Selected: {fileName}</p>}</div></div>
          <input ref={bankFileRef} type="file" onChange={(event) => void importBankFile(event)} className="hidden" data-testid="input-bank-file" />
          <button type="button" disabled={loading["bank-import"]} onClick={() => bankFileRef.current?.click()} data-testid="button-import-statement" className={`${buttonBase} shrink-0 bg-[#176b4c] text-white hover:bg-[#10573d]`}>
            {loading["bank-import"] ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {loading["bank-import"] ? "Importing…" : "Choose statement"}
          </button>
        </Panel>
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eee9] px-5 py-4">
            <div><h3 className="text-sm font-semibold text-[#345240]">Statement activity</h3><p className="mt-1 text-xs text-[#85938a]">{transactions.length} lines in this view</p></div>
            <div className="flex items-center gap-2"><label htmlFor="bank-status-filter" className="text-[10px] font-bold uppercase tracking-wider text-[#819087]">Show</label>
              <select id="bank-status-filter" value={bankFilter} onChange={(event) => { setBankFilter(event.target.value); void loadTransactions(event.target.value); }} className={`${inputClass} h-9 w-36 py-1 text-xs`} data-testid="select-bank-status">
                <option value="unmatched">Unmatched</option><option value="matched">Matched</option><option value="ignored">Ignored</option><option value="all">All activity</option>
              </select></div>
          </div>
          {loading.bank ? <SkeletonRows /> : errors.bank ? <div className="p-6 text-sm text-[#9b483d]" data-testid="error-bank"><CircleAlert className="mr-2 inline h-4 w-4" />{errors.bank}<button type="button" onClick={() => void loadTransactions(bankFilter)} data-testid="button-retry-bank" className="ml-3 font-semibold underline">Retry</button></div> : transactions.length === 0 ? <div className="p-5"><EmptyState icon={Landmark} title={bankFilter === "unmatched" ? "No unmatched bank lines" : "No bank activity in this view"} text="Import a statement to compare bank movements with your posted journal entries." /></div> :
            <div className="divide-y divide-[#edf1ed]">{transactions.map((transaction) => {
              const canReview = transaction.status === "unmatched" || transaction.status === "pending";
              return <div key={transaction.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5" data-testid={`row-bank-transaction-${transaction.id}`}>
                <div className="flex min-w-0 items-start gap-3"><span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${Number(transaction.amount_cents) < 0 ? "bg-[#f9ece8] text-[#a55a4d]" : "bg-[#eaf4ec] text-[#397750]"}`}>{Number(transaction.amount_cents) < 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}</span>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-[#2e4939]" data-testid={`text-bank-description-${transaction.id}`}>{transaction.description || "Bank transaction"}</p><Badge tone={transaction.status === "matched" ? "green" : transaction.status === "ignored" ? "neutral" : "amber"}>{readable(transaction.status)}</Badge></div>
                    <p className="mt-1 text-[11px] text-[#839087]">{dateLabel(transaction.transaction_date)}{transaction.reference ? ` · ${transaction.reference}` : ""}{transaction.file_name ? ` · ${transaction.file_name}` : ""}</p>
                    {transaction.matched_journal_id && <p className="mt-1 text-[10px] text-[#467151]">Matched to journal {transaction.matched_journal_id}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                  <span className={`font-mono text-sm font-semibold tabular-nums ${Number(transaction.amount_cents) < 0 ? "text-[#995348]" : "text-[#2b6a45]"}`} data-testid={`value-bank-amount-${transaction.id}`}>{money(Number(transaction.amount_cents || 0))}</span>
                  {canReview && <div className="flex items-center gap-2">
                    <select value={matchJournalByTransaction[transaction.id] || ""} onChange={(event) => setMatchJournalByTransaction((current) => ({ ...current, [transaction.id]: event.target.value }))} className="h-9 max-w-[190px] rounded-lg border border-[#d9e3dc] bg-white px-2 text-[11px] text-[#4b6254]" aria-label="Choose journal entry" data-testid={`select-match-journal-${transaction.id}`}>
                      <option value="">Select journal entry</option>{journals.map((journal) => <option key={journal.id} value={journal.id}>{dateLabel(journal.entry_date)} · {journal.memo || journal.reference || journal.id} · {money(Number(journal.debit_cents || journal.credit_cents || 0))}</option>)}
                    </select>
                    <button type="button" disabled={loading[`bank-${transaction.id}`]} onClick={() => void matchBankTransaction(transaction)} data-testid={`button-match-bank-${transaction.id}`} className="rounded-lg bg-[#e9f3ec] px-3 py-2 text-[11px] font-bold text-[#32734e] hover:bg-[#dcecdf]">Match</button>
                    <button type="button" disabled={loading[`bank-${transaction.id}`]} onClick={() => void ignoreBankTransaction(transaction)} data-testid={`button-ignore-bank-${transaction.id}`} className="rounded-lg border border-[#e4e9e5] px-3 py-2 text-[11px] font-semibold text-[#79877e] hover:bg-[#f6f8f6]">Ignore</button>
                  </div>}
                </div>
              </div>;
            })}</div>}
        </Panel>
      </div>}

      {activeTab === "reports" && <div>
        <SectionTitle eyebrow="Management reporting" title="Reports & financial insight" detail="Run the source report for the dates you need. Amounts are shown as South African rand from integer-cent values." />
        <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
          <Panel className="p-4 sm:p-5">
            <label htmlFor="report-type" className={labelClass}>Report type</label>
            <select id="report-type" value={selectedReport} onChange={(event) => { setSelectedReport(event.target.value as ReportKey); setReportData(null); setReportLoaded(false); setReportError(""); }} className={inputClass} data-testid="select-report-type">
              {reportOptions.map((report) => <option key={report.key} value={report.key}>{report.label}</option>)}
            </select>
            <p className="mt-2 text-xs leading-5 text-[#819087]" data-testid="text-report-description">{reportOptions.find((report) => report.key === selectedReport)?.note}</p>
            <div className="mt-5 space-y-3">
              {selectedReport === "balance-sheet" ? <div><label htmlFor="report-as-of" className={labelClass}>As at</label><input id="report-as-of" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} className={inputClass} data-testid="input-report-as-of" /></div>
                : selectedReport === "forecast" ? <div><label htmlFor="forecast-months" className={labelClass}>Forecast horizon</label><select id="forecast-months" value={forecastMonths} onChange={(event) => setForecastMonths(event.target.value)} className={inputClass} data-testid="select-forecast-months"><option value="3">3 months</option><option value="6">6 months</option><option value="9">9 months</option><option value="12">12 months</option></select></div>
                  : selectedReport !== "receivables-aging" && selectedReport !== "inventory-valuation" && <div className="grid grid-cols-2 gap-2">
                    <div><label htmlFor="report-from" className={labelClass}>From</label><input id="report-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className={inputClass} data-testid="input-report-from" /></div>
                    <div><label htmlFor="report-to" className={labelClass}>To</label><input id="report-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={inputClass} data-testid="input-report-to" /></div>
                  </div>}
            </div>
            <button type="button" disabled={loading.report} onClick={() => void runReport()} data-testid="button-run-report" className={`${buttonBase} mt-5 w-full bg-[#176b4c] text-white hover:bg-[#10573d]`}>
              {loading.report ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}{loading.report ? "Preparing…" : "Run report"}
            </button>
            <div className="mt-5 border-t border-[#e8eee9] pt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#45624f]"><Sparkles className="h-4 w-4 text-[#b38a38]" /> AI financial summary</div>
              <p className="mt-1.5 text-[11px] leading-5 text-[#849188]">Summarise the same period without changing the underlying records.</p>
              <button type="button" disabled={loading["ai-summary"]} onClick={() => void generateAiSummary()} data-testid="button-generate-ai-summary" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d5e2d8] bg-[#f7faf7] px-3 py-2.5 text-xs font-bold text-[#39734f] hover:bg-[#edf5ef] disabled:opacity-50">
                {loading["ai-summary"] ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading["ai-summary"] ? "Generating…" : "Generate summary"}
              </button>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel className="min-h-[320px] p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#e8eee9] pb-4">
                <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8a9b91]">Ledger report</p><h3 className="mt-1 font-heading text-lg font-bold text-[#2b4938]" data-testid="text-active-report">{reportOptions.find((report) => report.key === selectedReport)?.label}</h3></div>
                {reportLoaded && <Badge tone="green">Source data loaded</Badge>}
              </div>
              {loading.report ? <div className="space-y-3" data-testid="loading-report">{[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-10 animate-pulse rounded-lg bg-[#edf2ee]" />)}</div>
                : reportError ? <div className="rounded-xl border border-[#efd3cd] bg-[#fff3f0] p-4 text-sm text-[#9a4a3f]" role="alert" data-testid="error-report"><CircleAlert className="mr-2 inline h-4 w-4" />{reportError}<button type="button" onClick={() => void runReport()} data-testid="button-retry-report" className="ml-3 font-semibold underline">Retry</button></div>
                  : reportLoaded && reportData !== null ? <div data-testid="report-result"><ReportValue value={reportData} /></div>
                    : <EmptyState icon={FileSpreadsheet} title="Choose a report to begin" text="Select the reporting period or date, then run the report to view values returned from your ledger." />}
            </Panel>
            {aiSummary !== null && <Panel className="border-[#dfd8bd] bg-[#fffdf7] p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f4ecd1] text-[#9a7830]"><Sparkles className="h-4 w-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#988352]">AI commentary</p><h3 className="text-sm font-bold text-[#594d2d]" data-testid="text-ai-summary-title">Period summary</h3></div></div>
              <div className="text-sm leading-6 text-[#5e583f]" data-testid="content-ai-summary"><ReportValue value={aiSummary} /></div>
            </Panel>}
          </div>
        </div>
      </div>}

      {activeTab === "periods" && <div>
        <SectionTitle eyebrow="Close management" title="Accounting periods" detail="Close a period when its records have been reviewed. Reopen only when further corrections are required." />
        <Panel>
          {loading.periods ? <SkeletonRows /> : errors.periods ? <div className="p-6 text-sm text-[#9b483d]" data-testid="error-periods"><CircleAlert className="mr-2 inline h-4 w-4" />{errors.periods}<button type="button" onClick={() => void loadPeriods()} data-testid="button-retry-periods" className="ml-3 font-semibold underline">Retry</button></div> : periods.length === 0 ? <div className="p-5"><EmptyState icon={CalendarDays} title="No accounting periods created" text="Define a reporting period to make the financial close cycle explicit." /></div> :
            <div className="divide-y divide-[#edf1ed]">{periods.map((period) => <div key={period.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-5" data-testid={`row-period-${period.id}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${period.status === "closed" ? "bg-[#edf0ef] text-[#738179]" : "bg-[#e8f3eb] text-[#32754f]"}`}><CalendarDays className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-[#2f4b3b]" data-testid={`text-period-name-${period.id}`}>{period.name}</h3><Badge tone={period.status === "closed" ? "neutral" : "green"}>{readable(period.status)}</Badge></div>
                <p className="mt-1 text-xs text-[#7c8c82]">{dateLabel(period.start_date)} – {dateLabel(period.end_date)}{period.closed_at ? ` · Closed ${dateLabel(period.closed_at.slice(0, 10))}` : ""}</p></div>
              <button type="button" disabled={loading[`period-${period.id}`]} onClick={() => void changePeriodStatus(period)} data-testid={`button-${period.status === "closed" ? "reopen" : "close"}-period-${period.id}`} className={`rounded-xl px-4 py-2 text-xs font-semibold ${period.status === "closed" ? "border border-[#dce5de] text-[#526b5b] hover:bg-[#f4f7f4]" : "bg-[#edf4ed] text-[#32724c] hover:bg-[#e2efe4]"}`}>{loading[`period-${period.id}`] ? "Saving…" : period.status === "closed" ? "Reopen period" : "Close period"}</button>
            </div>)}</div>}
        </Panel>
      </div>}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#e1e9e2] pt-4 text-[10px] text-[#87968d]" data-testid="text-accounting-footnote">
        <span>Amounts are recorded as integer cents and presented in ZAR. Confirm source documents before posting.</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Traceable entries · clear status · controlled close</span>
      </div>
    </div>

    {modal === "account" && <Modal title="Add account" testId="dialog-create-account" onClose={() => setModal(null)}>
      <form onSubmit={submitAccount} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={labelClass} htmlFor="account-code">Account code</label><input id="account-code" value={accountDraft.code} onChange={(event) => setAccountDraft((current) => ({ ...current, code: event.target.value }))} className={inputClass} placeholder="e.g. 6100" data-testid="input-account-code" /></div>
          <div><label className={labelClass} htmlFor="account-type">Account type</label><select id="account-type" value={accountDraft.account_type} onChange={(event) => setAccountDraft((current) => ({ ...current, account_type: event.target.value }))} className={inputClass} data-testid="select-account-type">{["asset", "liability", "equity", "income", "expense"].map((type) => <option key={type} value={type}>{readable(type)}</option>)}</select></div>
        </div>
        <div><label className={labelClass} htmlFor="account-name">Account name</label><input id="account-name" value={accountDraft.name} onChange={(event) => setAccountDraft((current) => ({ ...current, name: event.target.value }))} className={inputClass} placeholder="e.g. Local transport" data-testid="input-account-name" /></div>
        <div><label className={labelClass} htmlFor="account-subtype">Subtype <span className="font-normal normal-case tracking-normal text-[#98a49c]">optional</span></label><input id="account-subtype" value={accountDraft.subtype} onChange={(event) => setAccountDraft((current) => ({ ...current, subtype: event.target.value }))} className={inputClass} placeholder="e.g. operating expense" data-testid="input-account-subtype" /></div>
        <div className="flex justify-end gap-2 border-t border-[#e7ece8] pt-4"><button type="button" onClick={() => setModal(null)} data-testid="button-cancel-account" className="rounded-xl px-4 py-2 text-sm font-semibold text-[#748078] hover:bg-[#f0f4f0]">Cancel</button><button type="submit" disabled={loading["save-account"]} data-testid="button-save-account" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}>{loading["save-account"] ? "Saving…" : "Create account"}</button></div>
      </form>
    </Modal>}

    {modal === "period" && <Modal title="Create accounting period" testId="dialog-create-period" onClose={() => setModal(null)}>
      <form onSubmit={submitPeriod} className="space-y-4">
        <div><label className={labelClass} htmlFor="period-name">Period name</label><input id="period-name" value={periodDraft.name} onChange={(event) => setPeriodDraft((current) => ({ ...current, name: event.target.value }))} className={inputClass} placeholder="e.g. March 2025" data-testid="input-period-name" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><label className={labelClass} htmlFor="period-start">Start date</label><input id="period-start" type="date" value={periodDraft.start_date} onChange={(event) => setPeriodDraft((current) => ({ ...current, start_date: event.target.value }))} className={inputClass} data-testid="input-period-start" /></div><div><label className={labelClass} htmlFor="period-end">End date</label><input id="period-end" type="date" value={periodDraft.end_date} onChange={(event) => setPeriodDraft((current) => ({ ...current, end_date: event.target.value }))} className={inputClass} data-testid="input-period-end" /></div></div>
        {periodDraft.start_date > periodDraft.end_date && <p className="text-xs text-[#a34e42]" data-testid="error-period-range">End date must be on or after the start date.</p>}
        <div className="flex justify-end gap-2 border-t border-[#e7ece8] pt-4"><button type="button" onClick={() => setModal(null)} data-testid="button-cancel-period" className="rounded-xl px-4 py-2 text-sm font-semibold text-[#748078] hover:bg-[#f0f4f0]">Cancel</button><button type="submit" disabled={loading["save-period"]} data-testid="button-save-period" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}>{loading["save-period"] ? "Saving…" : "Create period"}</button></div>
      </form>
    </Modal>}

    {modal === "journal" && <Modal title="Post a journal entry" testId="dialog-create-journal" onClose={() => setModal(null)}>
      <form onSubmit={submitJournal} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={labelClass} htmlFor="journal-date">Entry date</label><input id="journal-date" type="date" value={journalDraft.entry_date} onChange={(event) => setJournalDraft((current) => ({ ...current, entry_date: event.target.value }))} className={inputClass} data-testid="input-journal-date" /></div>
          <div><label className={labelClass} htmlFor="journal-reference">Reference <span className="font-normal normal-case tracking-normal text-[#98a49c]">optional</span></label><input id="journal-reference" value={journalDraft.reference} onChange={(event) => setJournalDraft((current) => ({ ...current, reference: event.target.value }))} className={inputClass} placeholder="Document or source reference" data-testid="input-journal-reference" /></div>
        </div>
        <div><label className={labelClass} htmlFor="journal-memo">Journal memo</label><input id="journal-memo" value={journalDraft.memo} onChange={(event) => setJournalDraft((current) => ({ ...current, memo: event.target.value }))} className={inputClass} placeholder="Why is this entry being posted?" data-testid="input-journal-memo" /></div>
        <div className="rounded-xl border border-[#e3eae4] bg-[#f7f9f7] p-3">
          <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#6f8176]">Entry lines</p><button type="button" onClick={() => setJournalLines((current) => [...current, { account_id: "", debit: "", credit: "" }])} data-testid="button-add-journal-line" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#33734e]"><Plus className="h-3.5 w-3.5" /> Add line</button></div>
          <div className="grid grid-cols-[minmax(120px,1fr)_78px_78px_32px] gap-2 px-1 pb-1 text-[9px] font-bold uppercase tracking-wider text-[#87958c]"><span>Account</span><span>Debit R</span><span>Credit R</span><span /></div>
          <div className="space-y-2">{journalLines.map((line, index) => <div key={index} className="grid grid-cols-[minmax(120px,1fr)_78px_78px_32px] gap-2" data-testid={`journal-line-${index}`}>
            <select value={line.account_id} onChange={(event) => setJournalLines((current) => current.map((item, position) => position === index ? { ...item, account_id: event.target.value } : item))} className="h-9 min-w-0 rounded-lg border border-[#d8e1db] bg-white px-2 text-[11px] text-[#40584a]" aria-label={`Account for journal line ${index + 1}`} data-testid={`select-journal-account-${index}`}><option value="">Choose account</option>{accounts.filter((account) => account.is_active).map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}</select>
            <input type="number" min="0" step="0.01" value={line.debit} onChange={(event) => setJournalLines((current) => current.map((item, position) => position === index ? { ...item, debit: event.target.value } : item))} className="h-9 min-w-0 rounded-lg border border-[#d8e1db] bg-white px-2 text-right text-xs tabular-nums" aria-label={`Debit amount line ${index + 1}`} data-testid={`input-journal-debit-${index}`} />
            <input type="number" min="0" step="0.01" value={line.credit} onChange={(event) => setJournalLines((current) => current.map((item, position) => position === index ? { ...item, credit: event.target.value } : item))} className="h-9 min-w-0 rounded-lg border border-[#d8e1db] bg-white px-2 text-right text-xs tabular-nums" aria-label={`Credit amount line ${index + 1}`} data-testid={`input-journal-credit-${index}`} />
            <button type="button" disabled={journalLines.length <= 2} onClick={() => setJournalLines((current) => current.filter((_, position) => position !== index))} aria-label={`Remove journal line ${index + 1}`} data-testid={`button-remove-journal-line-${index}`} className="flex h-9 items-center justify-center rounded-lg text-[#9b817b] hover:bg-[#f9eae7] disabled:opacity-25"><X className="h-4 w-4" /></button>
          </div>)}</div>
          <div className="mt-3 rounded-lg border border-[#dfe8e1] bg-white px-3 py-2 text-[10px] text-[#78877e]">The total debits must equal total credits. Values are submitted as integer cents.</div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#e7ece8] pt-4"><button type="button" onClick={() => setModal(null)} data-testid="button-cancel-journal" className="rounded-xl px-4 py-2 text-sm font-semibold text-[#748078] hover:bg-[#f0f4f0]">Cancel</button><button type="submit" disabled={loading["save-journal"]} data-testid="button-save-journal" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}>{loading["save-journal"] ? "Posting…" : "Post balanced journal"}</button></div>
      </form>
    </Modal>}

    {modal === "bill" && <Modal title="Record supplier bill" testId="dialog-create-bill" onClose={() => setModal(null)}>
      <form onSubmit={submitBill} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2"><div><label className={labelClass} htmlFor="bill-supplier">Supplier name</label><input id="bill-supplier" value={billDraft.supplier_name} onChange={(event) => setBillDraft((current) => ({ ...current, supplier_name: event.target.value }))} className={inputClass} placeholder="Registered supplier" data-testid="input-bill-supplier" /></div><div><label className={labelClass} htmlFor="bill-reference">Supplier reference</label><input id="bill-reference" value={billDraft.supplier_reference} onChange={(event) => setBillDraft((current) => ({ ...current, supplier_reference: event.target.value }))} className={inputClass} placeholder="Invoice number" data-testid="input-bill-reference" /></div></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><label className={labelClass} htmlFor="bill-issue-date">Issue date</label><input id="bill-issue-date" type="date" value={billDraft.issue_date} onChange={(event) => setBillDraft((current) => ({ ...current, issue_date: event.target.value }))} className={inputClass} data-testid="input-bill-issue-date" /></div><div><label className={labelClass} htmlFor="bill-due-date">Due date</label><input id="bill-due-date" type="date" value={billDraft.due_date} onChange={(event) => setBillDraft((current) => ({ ...current, due_date: event.target.value }))} className={inputClass} data-testid="input-bill-due-date" /></div></div>
        <div><label className={labelClass} htmlFor="bill-description">Description</label><input id="bill-description" value={billDraft.description} onChange={(event) => setBillDraft((current) => ({ ...current, description: event.target.value }))} className={inputClass} placeholder="What was purchased?" data-testid="input-bill-description" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><label className={labelClass} htmlFor="bill-subtotal">Subtotal (ZAR)</label><input id="bill-subtotal" type="number" min="0.01" step="0.01" value={billDraft.subtotal} onChange={(event) => setBillDraft((current) => ({ ...current, subtotal: event.target.value }))} className={inputClass} placeholder="0.00" data-testid="input-bill-subtotal" /></div><div><label className={labelClass} htmlFor="bill-tax">Tax (ZAR)</label><input id="bill-tax" type="number" min="0" step="0.01" value={billDraft.tax} onChange={(event) => setBillDraft((current) => ({ ...current, tax: event.target.value }))} className={inputClass} placeholder="0.00" data-testid="input-bill-tax" /></div></div>
        <p className="rounded-xl bg-[#f0f5f0] px-3 py-2 text-xs text-[#526d5b]" data-testid="text-bill-total">Bill total: <strong className="font-mono">{money((centsFromInput(billDraft.subtotal) || 0) + (centsFromInput(billDraft.tax) || 0))}</strong></p>
        <div className="flex justify-end gap-2 border-t border-[#e7ece8] pt-4"><button type="button" onClick={() => setModal(null)} data-testid="button-cancel-bill" className="rounded-xl px-4 py-2 text-sm font-semibold text-[#748078] hover:bg-[#f0f4f0]">Cancel</button><button type="submit" disabled={loading["save-bill"]} data-testid="button-save-bill" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}>{loading["save-bill"] ? "Saving…" : "Record bill"}</button></div>
      </form>
    </Modal>}

    {modal === "bill-payment" && selectedBill && <Modal title="Record supplier payment" testId="dialog-bill-payment" onClose={() => { setModal(null); setSelectedBill(null); }}>
      <form onSubmit={submitPayment} className="space-y-4">
        <div className="rounded-xl border border-[#e1e9e2] bg-[#f5f8f5] p-3"><p className="text-sm font-semibold text-[#34503e]">{selectedBill.supplier_name}</p><p className="mt-1 text-xs text-[#78877f]">{selectedBill.supplier_reference || selectedBill.description || "Supplier bill"}</p><p className="mt-3 text-xs text-[#738178]">Outstanding <strong className="ml-1 font-mono text-[#294936]" data-testid="value-payment-outstanding">{money(Number(selectedBill.total_cents) - Number(selectedBill.paid_cents || 0))}</strong></p></div>
        <div><label className={labelClass} htmlFor="payment-amount">Payment amount (ZAR)</label><input id="payment-amount" type="number" min="0.01" max={(Number(selectedBill.total_cents) - Number(selectedBill.paid_cents || 0)) / 100} step="0.01" value={paymentDraft.amount} onChange={(event) => setPaymentDraft((current) => ({ ...current, amount: event.target.value }))} className={inputClass} data-testid="input-payment-amount" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><label className={labelClass} htmlFor="payment-date">Payment date</label><input id="payment-date" type="date" value={paymentDraft.payment_date} onChange={(event) => setPaymentDraft((current) => ({ ...current, payment_date: event.target.value }))} className={inputClass} data-testid="input-payment-date" /></div><div><label className={labelClass} htmlFor="payment-reference">Payment reference</label><input id="payment-reference" value={paymentDraft.reference} onChange={(event) => setPaymentDraft((current) => ({ ...current, reference: event.target.value }))} className={inputClass} placeholder="Bank or proof reference" data-testid="input-payment-reference" /></div></div>
        <div className="flex justify-end gap-2 border-t border-[#e7ece8] pt-4"><button type="button" onClick={() => { setModal(null); setSelectedBill(null); }} data-testid="button-cancel-payment" className="rounded-xl px-4 py-2 text-sm font-semibold text-[#748078] hover:bg-[#f0f4f0]">Cancel</button><button type="submit" disabled={loading["save-payment"]} data-testid="button-save-payment" className={`${buttonBase} bg-[#176b4c] text-white hover:bg-[#10573d]`}>{loading["save-payment"] ? "Saving…" : "Record payment"}</button></div>
      </form>
    </Modal>}

    {journalDetailId && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#11251d]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setJournalDetailId(null); }}>
      <div role="dialog" aria-modal="true" aria-label="Journal detail" className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-[#dce6df] bg-[#fbfcfa] shadow-2xl sm:max-w-2xl sm:rounded-3xl" data-testid="dialog-journal-detail">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6ece7] bg-[#fbfcfa]/95 px-5 py-4 backdrop-blur"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8a9b91]">Ledger detail</p><h3 className="font-heading text-lg font-bold text-[#193b2d]">Journal entry</h3></div><button type="button" onClick={() => setJournalDetailId(null)} data-testid="button-close-journal-detail" aria-label="Close journal detail" className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6c7b72] hover:bg-[#edf3ee]"><X className="h-4 w-4" /></button></div>
        <div className="p-5">{loading["journal-detail"] ? <SkeletonRows count={3} /> : errors["journal-detail"] ? <div className="text-sm text-[#a24e42]" data-testid="error-journal-detail">{errors["journal-detail"]}<button type="button" onClick={() => { const entry = journals.find((item) => item.id === journalDetailId); if (entry) void openJournal(entry); }} data-testid="button-retry-journal-detail" className="ml-3 underline">Retry</button></div> : <div data-testid="content-journal-detail"><ReportValue value={journalDetail} /></div>}</div>
      </div>
    </div>}
  </main>;
}
