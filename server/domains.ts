import { Router } from "express";
import { requireAuth } from "./auth";

export const domainsRouter = Router();

const TLD_CONFIG: { tld: string; rdapBase: string; label: string }[] = [
  { tld: "co.za",   rdapBase: "https://rdap.registry.net.za/domain/",                          label: ".co.za" },
  { tld: "org.za",  rdapBase: "https://rdap.registry.net.za/domain/",                          label: ".org.za" },
  { tld: "net.za",  rdapBase: "https://rdap.registry.net.za/domain/",                          label: ".net.za" },
  { tld: "com",     rdapBase: "https://rdap.verisign.com/com/v1/domain/",                       label: ".com" },
  { tld: "net",     rdapBase: "https://rdap.verisign.com/net/v1/domain/",                       label: ".net" },
  { tld: "org",     rdapBase: "https://rdap.publicinterestregistry.org/rdap/domain/",           label: ".org" },
  { tld: "africa",  rdapBase: "https://rdap.dot.africa/domain/",                                label: ".africa" },
];

const XNEELO_SEARCH_BASE = "https://www.xneelo.co.za/domain-names/";

async function checkDomain(name: string, tld: string, rdapBase: string): Promise<{
  domain: string; tld: string; available: boolean | null; expiry?: string; registerUrl: string;
}> {
  const domain = `${name}.${tld}`;
  const registerUrl = `${XNEELO_SEARCH_BASE}?domain=${encodeURIComponent(domain)}`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${rdapBase}${domain}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/rdap+json" },
    });
    clearTimeout(timer);
    if (res.status === 404) return { domain, tld, available: true, registerUrl };
    if (res.status === 200) {
      let expiry: string | undefined;
      try {
        const data = await res.json() as any;
        const events: any[] = data.events || [];
        const exp = events.find((e: any) => e.eventAction === "expiration");
        if (exp?.eventDate) expiry = exp.eventDate;
      } catch { /* ignore */ }
      return { domain, tld, available: false, expiry, registerUrl };
    }
    return { domain, tld, available: null, registerUrl };
  } catch {
    return { domain, tld, available: null, registerUrl };
  }
}

domainsRouter.get("/search", requireAuth, async (req: any, res) => {
  const raw = String(req.query.q || "").trim().toLowerCase();
  if (!raw) return res.status(400).json({ error: "Query required" });

  const name = raw
    .replace(/\.(co\.za|org\.za|net\.za|com|net|org|africa)$/i, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");

  if (!name || name.length < 2) return res.status(400).json({ error: "Domain name too short" });
  if (name.length > 63) return res.status(400).json({ error: "Domain name too long" });

  const results = await Promise.all(
    TLD_CONFIG.map(({ tld, rdapBase, label }) =>
      checkDomain(name, tld, rdapBase).then(r => ({ ...r, label }))
    )
  );

  res.json({ name, results });
});
