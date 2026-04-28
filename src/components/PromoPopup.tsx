import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromoPopupProps {
  variant?: "smme" | "partner";
  delayMs?: number;
}

const STORAGE_KEY_BASE = "masakhe.promoPopup.dismissed";

export default function PromoPopup({ variant = "smme", delayMs = 2500 }: PromoPopupProps) {
  const [open, setOpen] = useState(false);
  const storageKey = `${STORAGE_KEY_BASE}.${variant}`;

  useEffect(() => {
    let dismissedAt = 0;
    try { dismissedAt = Number(localStorage.getItem(storageKey) || "0"); } catch {}
    const oneDay = 24 * 60 * 60 * 1000;
    if (dismissedAt && Date.now() - dismissedAt < oneDay) return;

    const t = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs, storageKey]);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(storageKey, String(Date.now())); } catch {}
  };

  const ctaHref =
    variant === "partner"
      ? "/partner/register?promo=WELCOME50"
      : "/register?promo=WELCOME50";

  const headline =
    variant === "partner"
      ? "Welcome, future partner!"
      : "First month, half price.";

  const subline =
    variant === "partner"
      ? "Use code WELCOME50 to skip the trial and get 50% off your first month on any partner package."
      : "Use code WELCOME50 to skip the trial and get 50% off your first month on any plan.";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <button
                onClick={dismiss}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 pt-7 pb-8 text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Limited-time offer
                </div>
                <h2 className="mt-3 text-2xl font-bold leading-tight">{headline}</h2>
                <p className="mt-1.5 text-emerald-50 text-sm leading-relaxed">{subline}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-white/40 bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <span className="text-xs uppercase tracking-wider text-emerald-100">Code</span>
                  <span className="font-mono text-lg font-bold tracking-wider">WELCOME50</span>
                </div>
              </div>

              <div className="px-6 py-5">
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>50% off your first month — pay half price today</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>Standard plan price kicks in from month two onwards</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>One-time use per account — only valid for new sign-ups</span>
                  </li>
                </ul>

                <div className="mt-5 flex flex-col gap-2">
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Link to={ctaHref} onClick={dismiss}>
                      Claim 50% off — Sign up now
                    </Link>
                  </Button>
                  <button
                    onClick={dismiss}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    No thanks, I'd rather start a free trial
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
