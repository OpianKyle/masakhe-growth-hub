import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Globe, CheckCircle2, XCircle, AlertCircle,
  ExternalLink, Copy, Clock, Loader2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface DomainResult {
  domain: string;
  tld: string;
  label: string;
  available: boolean | null;
  expiry?: string;
  registerUrl: string;
}

const TLD_PRIORITY = ["co.za", "com", "org.za", "net.za", "net", "org", "africa"];

const tldColor: Record<string, string> = {
  "co.za":  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "org.za": "bg-sky-100 text-sky-700 border-sky-200",
  "net.za": "bg-violet-100 text-violet-700 border-violet-200",
  "com":    "bg-blue-100 text-blue-700 border-blue-200",
  "net":    "bg-indigo-100 text-indigo-700 border-indigo-200",
  "org":    "bg-teal-100 text-teal-700 border-teal-200",
  "africa": "bg-amber-100 text-amber-700 border-amber-200",
};

function StatusIcon({ available }: { available: boolean | null }) {
  if (available === true)  return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
  if (available === false) return <XCircle className="h-5 w-5 text-rose-400 shrink-0" />;
  return <AlertCircle className="h-5 w-5 text-gray-300 shrink-0" />;
}

function copyToClipboard(text: string, toast: any) {
  navigator.clipboard.writeText(text).then(() => {
    toast({ title: "Copied!", description: text });
  }).catch(() => {
    toast({ title: "Copy failed", variant: "destructive" });
  });
}

function formatExpiry(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
  } catch { return null; }
}

export default function DomainSearchPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchedName, setSearchedName] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(`/api/domains/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error || "Search failed", variant: "destructive" }); return; }
      setSearchedName(data.name);
      const sorted = [...data.results].sort((a: DomainResult, b: DomainResult) => {
        const ai = TLD_PRIORITY.indexOf(a.tld);
        const bi = TLD_PRIORITY.indexOf(b.tld);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      setResults(sorted);
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const available = results.filter(r => r.available === true);
  const taken     = results.filter(r => r.available === false);
  const unknown   = results.filter(r => r.available === null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-gray-950 dark:to-gray-900">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-emerald-600 text-white px-6 py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Globe className="h-6 w-6 opacity-80" />
            <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Domain Search</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">Find your perfect domain</h1>
          <p className="text-sky-100 text-sm mb-8 max-w-md mx-auto">
            Check availability across .co.za, .com, .africa and more — then register instantly via Xneelo.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="mybusiness"
                className="pl-9 pr-4 h-12 text-base rounded-xl bg-white text-gray-900 border-0 shadow-lg focus-visible:ring-2 focus-visible:ring-sky-400"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg gap-2 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </form>

          <p className="text-sky-200 text-xs mt-3">
            Powered by RDAP • Registration via{" "}
            <a href="https://www.xneelo.co.za/domain-names/" target="_blank" rel="noopener noreferrer"
              className="underline hover:text-white">xneelo.co.za</a>
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="h-16 rounded-2xl bg-white/60 animate-pulse shadow-sm" />
            ))}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {!loading && results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">Results for <strong className="text-gray-900 dark:text-white">{searchedName}</strong></span>
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {available.length} available
                </span>
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-rose-100 text-rose-600">
                  <XCircle className="h-3.5 w-3.5" /> {taken.length} taken
                </span>
                {unknown.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    <AlertCircle className="h-3.5 w-3.5" /> {unknown.length} unknown
                  </span>
                )}
              </div>

              {/* Available */}
              {available.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Available</p>
                  {available.map((r, i) => (
                    <motion.div key={r.domain} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3.5 shadow-sm border border-emerald-100 dark:border-emerald-900">
                      <StatusIcon available={r.available} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-white">{r.domain}</span>
                          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${tldColor[r.tld] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {r.label}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">Available to register</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700"
                          title="Copy domain" onClick={() => copyToClipboard(r.domain, toast)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <a href={r.registerUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-8 px-3">
                            Register <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Taken */}
              {taken.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Already Registered</p>
                  {taken.map((r, i) => (
                    <motion.div key={r.domain} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 dark:border-gray-800 opacity-70">
                      <StatusIcon available={r.available} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{r.domain}</span>
                          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${tldColor[r.tld] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {r.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-rose-500 font-medium">Taken</p>
                          {r.expiry && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> Expires {formatExpiry(r.expiry)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 shrink-0"
                        title="Copy domain" onClick={() => copyToClipboard(r.domain, toast)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Unknown / timeout */}
              {unknown.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Could Not Check</p>
                  {unknown.map((r) => (
                    <div key={r.domain}
                      className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800 opacity-50">
                      <StatusIcon available={null} />
                      <span className="text-sm text-gray-500">{r.domain}</span>
                      <span className={`ml-1 text-[11px] font-medium px-1.5 py-0.5 rounded border ${tldColor[r.tld] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA banner */}
              {available.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 text-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">Ready to register your domain?</p>
                    <p className="text-sky-100 text-sm mt-0.5">
                      Register with Xneelo — South Africa's trusted hosting provider. Once registered, connect your domain to your Masakhe website.
                    </p>
                  </div>
                  <a href="https://www.xneelo.co.za/domain-names/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Button className="bg-white text-sky-700 hover:bg-sky-50 font-semibold gap-2 rounded-xl shadow">
                      Go to Xneelo <ChevronRight className="h-4 w-4" />
                    </Button>
                  </a>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 space-y-4 text-muted-foreground">
            <Globe className="h-14 w-14 mx-auto opacity-20" />
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Search for a domain name above</p>
              <p className="text-sm mt-1">We'll check availability across 7 TLDs in seconds</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[".co.za", ".com", ".org.za", ".net.za", ".net", ".org", ".africa"].map(tld => (
                <span key={tld} className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm">{tld}</span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
