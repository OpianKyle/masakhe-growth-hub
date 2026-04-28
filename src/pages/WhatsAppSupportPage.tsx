import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Phone, Send, Clock, ShieldCheck, CheckCircle2,
  ArrowRight, Headphones, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

const SUPPORT_NUMBER = "+27 11 026 5544";
const SUPPORT_NUMBER_DIGITS = SUPPORT_NUMBER.replace(/\D/g, "");

function buildWaLink(message: string) {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${SUPPORT_NUMBER_DIGITS}?text=${text}`;
}

const quickTopics = [
  { label: "I need help getting started",      msg: "Hi Masakhe Support, I just signed up and need help getting started with my dashboard." },
  { label: "Billing or subscription question", msg: "Hi Masakhe Support, I have a question about my subscription / billing." },
  { label: "Website Builder issue",            msg: "Hi Masakhe Support, I'm having trouble with the Website Builder." },
  { label: "Social Media / Biz Connect issue", msg: "Hi Masakhe Support, I need help with the Social Media Hub / Biz Connect." },
  { label: "Report a bug",                     msg: "Hi Masakhe Support, I'd like to report a bug on the Masakhe Portal." },
  { label: "Request a feature",                msg: "Hi Masakhe Support, I'd like to suggest a new feature for the platform." },
];

export default function WhatsAppSupportPage() {
  const { user } = useAuth();
  const [planName, setPlanName] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/billing/status", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, string> = {
          starter: "Enterprize",
          pro: "Enterprize Plus",
          premium: "Enterprize Premium",
        };
        setPlanName(d?.plan ? (map[d.plan] || d.plan) : "");
      })
      .catch(() => {});
  }, []);

  const greeting = `Hi Masakhe Support — this is ${user?.full_name || ""} (${user?.email || ""})${planName ? ` on the ${planName} plan` : ""}.`;
  const customMessageFull = `${greeting}\n\n${message}`;
  const directLink = buildWaLink(message ? customMessageFull : greeting);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 md:p-8 shadow-card"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <MessageCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
              WhatsApp Support Portal
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Chat directly with the Masakhe support team on WhatsApp — fast answers, no queues.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {planName && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold px-2.5 py-1 border border-emerald-500/20">
                  <Sparkles className="h-3 w-3" /> Included on your {planName} plan
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1">
                <Phone className="h-3 w-3" /> {SUPPORT_NUMBER}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1">
                <Clock className="h-3 w-3" /> Mon–Fri 08:00–17:00 SAST
              </span>
            </div>
          </div>
          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat on WhatsApp
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4"
        >
          <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
            Quick-Start Topics
          </h2>
          <p className="text-sm text-muted-foreground">
            Tap a topic below to open WhatsApp with a pre-filled message.
          </p>
          <div className="grid gap-2">
            {quickTopics.map((t) => (
              <a
                key={t.label}
                href={buildWaLink(`${greeting}\n\n${t.msg}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
              >
                <span className="font-medium text-foreground">{t.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4"
        >
          <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            Send a Custom Message
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">From</label>
              <Input value={user?.full_name || ""} disabled className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Your message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you need help with…"
                rows={5}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Your name, email and plan will be added automatically so the team can help you faster.
              </p>
            </div>
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Open WhatsApp with this message
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2 mb-4">
          <Headphones className="h-5 w-5 text-primary" />
          What you get with WhatsApp Support
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { icon: ShieldCheck, label: "Verified account-aware support — no need to repeat your details." },
            { icon: Clock,       label: "Fast response during business hours (Mon–Fri 08:00–17:00 SAST)." },
            { icon: CheckCircle2,label: "Send screenshots, voice notes and documents directly in chat." },
            { icon: MessageCircle,label:"Conversation history stays in your phone, like any normal WhatsApp chat." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
              <item.icon className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-foreground/85">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
