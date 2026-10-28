import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, FileCheck2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Quote = {
  number: string;
  customer_name: string;
  total_cents: number;
  vat_enabled: boolean;
  vat_cents: number;
  tax_rate: number;
  tax_label: string;
  items: { name: string; qty: number; unitPrice: number }[];
  status: string;
  created_at: string;
  valid_until?: string | null;
  payment_terms?: string | null;
  notes?: string | null;
  accepted_at?: string | null;
  business_name: string;
};

export default function QuoteAcceptancePage() {
  const { token = "" } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetch(`/api/quotes/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "This quote could not be loaded.");
        setQuote(data);
        setAccepted(data.status === "accepted" || !!data.accepted_at);
      })
      .catch((err) => setError(err.message || "This quote could not be loaded."))
      .finally(() => setLoading(false));
  }, [token]);

  const acceptQuote = async () => {
    setAccepting(true);
    try {
      const response = await fetch(`/api/quotes/${encodeURIComponent(token)}/accept`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not accept this quote.");
      setAccepted(true);
      setQuote((current) => current ? { ...current, status: "accepted", accepted_at: new Date().toISOString() } : current);
    } catch (err: any) {
      setError(err.message || "Could not accept this quote.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main>;
  }

  if (error || !quote) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <section className="w-full max-w-md rounded-2xl bg-white border p-8 text-center shadow-sm">
          <XCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
          <h1 className="text-xl font-bold">Quote unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error || "This quote could not be found."}</p>
        </section>
      </main>
    );
  }

  const subtotal = quote.items.reduce((sum, item) => sum + Number(item.qty) * Number(item.unitPrice), 0);
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="bg-slate-950 px-6 py-7 text-white">
          <p className="text-sm text-white/70">{quote.business_name}</p>
          <h1 className="mt-1 text-2xl font-bold">Quote {quote.number}</h1>
          <p className="mt-1 text-sm text-white/70">Prepared for {quote.customer_name}</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="space-y-3">
            {quote.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-4 border-b pb-3 text-sm">
                <div><p className="font-medium">{item.name}</p><p className="text-muted-foreground">{item.qty} × R{Number(item.unitPrice).toFixed(2)}</p></div>
                <span className="font-semibold">R{(Number(item.qty) * Number(item.unitPrice)).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
            {quote.vat_enabled && <div className="flex justify-between text-muted-foreground"><span>{quote.tax_label || "VAT"} ({quote.tax_rate ?? 15}%)</span><span>R{(quote.vat_cents / 100).toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>R{(quote.total_cents / 100).toFixed(2)}</span></div>
          </div>
          {quote.payment_terms && <p className="mt-5 text-sm text-muted-foreground">Validity / terms: {quote.payment_terms}</p>}
          {quote.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{quote.notes}</p>}
          {accepted ? (
            <div className="mt-7 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">Your acceptance has been recorded. Thank you.</p>
            </div>
          ) : quote.status === "converted" ? (
            <div className="mt-7 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">This quote has already been converted into an invoice.</div>
          ) : (
            <div className="mt-7">
              <Button className="w-full gap-2" onClick={acceptQuote} disabled={accepting}>
                {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                Accept Quote
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">By accepting, you confirm the quoted items and total.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
