import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ShieldCheck, Receipt } from "lucide-react";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  totalCents: number;
  vatCents: number;
  vatEnabled: boolean;
  items: Array<{ name: string; qty: number; unitPrice: number }>;
  status: string;
  paymentTerms: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface BusinessData {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
}

type PageState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "ready"; invoice: InvoiceData; business: BusinessData }
  | { type: "already_paid"; invoice: InvoiceData; business: BusinessData }
  | { type: "paying" }
  | { type: "success" }
  | { type: "failed" };

function fmt(cents: number) {
  return `R\u00A0${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PayInvoice() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<PageState>({ type: "loading" });
  const formRef = useRef<HTMLFormElement>(null);
  const [formFields, setFormFields] = useState<Record<string, string> | null>(null);
  const [formAction, setFormAction] = useState("");

  useEffect(() => {
    const paid = searchParams.get("paid");
    const error = searchParams.get("error");

    if (paid === "true" || paid === "already") {
      setState({ type: "success" });
      return;
    }
    if (error) {
      setState({ type: "failed" });
      return;
    }

    if (!token) {
      setState({ type: "error", message: "Invalid payment link." });
      return;
    }

    fetch(`/api/invoices/pay/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setState({ type: "error", message: data.error });
          return;
        }
        const inv: InvoiceData = data.invoice;
        const biz: BusinessData = data.business;
        if (inv.status === "paid" || inv.paidAt) {
          setState({ type: "already_paid", invoice: inv, business: biz });
        } else {
          setState({ type: "ready", invoice: inv, business: biz });
        }
      })
      .catch(() => setState({ type: "error", message: "Failed to load invoice. Please try again." }));
  }, [token, searchParams]);

  useEffect(() => {
    if (formFields && formRef.current) {
      formRef.current.submit();
    }
  }, [formFields]);

  async function handlePay() {
    if (!token) return;
    setState({ type: "paying" });
    try {
      const r = await fetch(`/api/invoices/pay/${token}/session`, { method: "POST" });
      const data = await r.json();
      if (!r.ok || data.error) {
        setState({ type: "failed" });
        return;
      }
      setFormAction(data.formAction);
      setFormFields(data.fields);
    } catch {
      setState({ type: "failed" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      {formFields && (
        <form ref={formRef} method="POST" action={formAction} style={{ display: "none" }}>
          {Object.entries(formFields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      <div className="w-full max-w-lg">
        {state.type === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin text-green-700" />
            <p className="text-sm">Loading invoice…</p>
          </div>
        )}

        {state.type === "error" && (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <XCircle className="h-14 w-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Link unavailable</h2>
            <p className="text-gray-500 text-sm">{state.message}</p>
          </div>
        )}

        {state.type === "success" && (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Received!</h2>
            <p className="text-gray-500 text-sm">
              Thank you — your payment has been processed successfully. A confirmation will be sent to your email.
            </p>
          </div>
        )}

        {state.type === "failed" && (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <XCircle className="h-14 w-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Payment failed</h2>
            <p className="text-gray-500 text-sm mb-6">Your payment could not be processed. Please try again.</p>
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("error");
                window.history.replaceState({}, "", window.location.pathname);
                setState({ type: "loading" });
                fetch(`/api/invoices/pay/${token}`)
                  .then((r) => r.json())
                  .then((data) => {
                    if (data.error) { setState({ type: "error", message: data.error }); return; }
                    setState({ type: "ready", invoice: data.invoice, business: data.business });
                  })
                  .catch(() => setState({ type: "error", message: "Failed to reload. Please refresh the page." }));
              }}
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {(state.type === "ready" || state.type === "already_paid" || state.type === "paying") && (() => {
          const inv = (state as any).invoice as InvoiceData;
          const biz = (state as any).business as BusinessData;
          const isPaid = state.type === "already_paid";
          const isPaying = state.type === "paying";
          const subtotalCents = inv.vatEnabled ? inv.totalCents - inv.vatCents : inv.totalCents;

          return (
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-7">
                <div className="flex items-center gap-3">
                  <Receipt className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <div>
                    <h1 className="text-white font-bold text-xl leading-tight">{biz.name}</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Invoice #{inv.invoiceNumber}</p>
                  </div>
                </div>
              </div>

              {isPaid && (
                <div className="bg-green-50 border-b border-green-100 px-8 py-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-800 text-sm font-medium">
                    This invoice was paid on {fmtDate(inv.paidAt)}
                  </span>
                </div>
              )}

              <div className="px-8 py-6">
                <p className="text-gray-500 text-sm mb-1">Billed to</p>
                <p className="text-gray-900 font-semibold text-base">{inv.customerName}</p>
                {inv.customerEmail && <p className="text-gray-500 text-sm">{inv.customerEmail}</p>}
              </div>

              <div className="border-t border-gray-100 px-8 py-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                      <th className="pb-2 text-left font-semibold">Description</th>
                      <th className="pb-2 text-right font-semibold">Qty</th>
                      <th className="pb-2 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 text-gray-700">{item.name}</td>
                        <td className="py-2.5 text-right text-gray-500">{item.qty}</td>
                        <td className="py-2.5 text-right text-gray-700 font-medium">
                          {fmt((item.qty || 1) * (item.unitPrice || 0) * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 space-y-2">
                {inv.vatEnabled && (
                  <>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>{fmt(subtotalCents)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>VAT (15%)</span>
                      <span>{fmt(inv.vatCents)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Due</span>
                  <span className="text-green-700 text-lg">{fmt(inv.totalCents)}</span>
                </div>
              </div>

              {(inv.dueDate || inv.paymentTerms || inv.notes) && (
                <div className="px-8 py-4 border-t border-gray-100 space-y-1">
                  {inv.dueDate && (
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-600">Due: </span>
                      {fmtDate(inv.dueDate)}
                    </p>
                  )}
                  {inv.paymentTerms && (
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-600">Terms: </span>
                      {inv.paymentTerms}
                    </p>
                  )}
                  {inv.notes && (
                    <p className="text-xs text-gray-500 italic">{inv.notes}</p>
                  )}
                </div>
              )}

              {!isPaid && (
                <div className="px-8 py-6 border-t border-gray-100">
                  <button
                    onClick={handlePay}
                    disabled={isPaying}
                    className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Redirecting to payment…
                      </>
                    ) : (
                      <>
                        Pay {fmt(inv.totalCents)}
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <ShieldCheck className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-400">Secure payment via Adumo Online</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border-t border-gray-100 px-8 py-3 text-center">
                <p className="text-xs text-gray-400">Powered by Masakhe · South African SMME Platform</p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
