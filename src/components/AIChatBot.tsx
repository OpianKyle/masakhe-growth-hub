import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, ChevronDown, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const QUICK_QUESTIONS = [
  "How do I get started?",
  "How do I create an invoice?",
  "How do I publish my website?",
  "How do I add employees to payroll?",
  "What is my billing / subscription?",
  "How do I track income & expenses?",
];

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/website": "Website Builder",
  "/dashboard/social": "Social Media Hub",
  "/dashboard/finance": "Income & Expenses",
  "/dashboard/invoices": "Quotes & Invoices",
  "/dashboard/billing": "Billing & Subscription",
  "/dashboard/payroll": "Payroll",
  "/dashboard/leave": "Leave & HR",
  "/dashboard/clients": "Clients CRM",
  "/dashboard/campaigns": "Campaigns",
  "/dashboard/automations": "Automations",
  "/dashboard/leads": "Leads",
  "/dashboard/business-plan": "Business Plan",
  "/dashboard/funding": "Funding Readiness",
  "/dashboard/funding-proposal": "Funding Proposal",
  "/dashboard/funding-applications": "Funding Applications",
  "/dashboard/company-verify": "Company Verification",
  "/dashboard/settings": "Settings",
};

function getPageLabel(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  for (const [key, label] of Object.entries(PAGE_LABELS)) {
    if (pathname.startsWith(key + "/") || pathname.startsWith(key + "?")) return label;
  }
  return "Dashboard";
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <p key={i} className="font-semibold text-sm mt-2">{line.slice(4)}</p>;
        if (line.startsWith("## ")) return <p key={i} className="font-bold text-sm mt-2">{line.slice(3)}</p>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-sm">{line.slice(2, -2)}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} className="text-sm flex gap-1.5"><span className="text-primary shrink-0 mt-0.5">•</span><span>{formatInline(line.slice(2))}</span></p>;
        if (/^\d+\./.test(line)) {
          const match = line.match(/^(\d+)\.\s*(.*)/);
          if (match) return <p key={i} className="text-sm flex gap-1.5"><span className="text-primary font-semibold shrink-0">{match[1]}.</span><span>{formatInline(match[2])}</span></p>;
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>;
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const location = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentPage = getPageLabel(location.pathname);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hi! I'm **Nkosi**, your Masakhe business assistant. 👋\n\nI'm here to help you get the most out of the platform — whether you're just getting started or need help with a specific feature.\n\nWhat can I help you with today?`,
      }]);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || streaming) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(updatedMessages);
    setInput("");
    setStreaming(true);

    const assistantIdx = updatedMessages.length;
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          currentPage,
        }),
      });

      if (!res.ok) {
        setMessages(prev => {
          const next = [...prev];
          next[assistantIdx] = { role: "assistant", content: "Sorry, I couldn't reach the AI service. Please try again." };
          return next;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullText += data.content;
              setMessages(prev => {
                const next = [...prev];
                next[assistantIdx] = { role: "assistant", content: fullText, streaming: true };
                return next;
              });
            }
            if (data.done) {
              setMessages(prev => {
                const next = [...prev];
                next[assistantIdx] = { role: "assistant", content: fullText, streaming: false };
                return next;
              });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages(prev => {
          const next = [...prev];
          next[assistantIdx] = { role: "assistant", content: "Something went wrong. Please try again." };
          return next;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming, currentPage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    if (streaming) abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
    setTimeout(() => {
      setMessages([{
        role: "assistant",
        content: `Hi! I'm **Nkosi**, your Masakhe business assistant. 👋\n\nI'm here to help you get the most out of the platform — whether you're just getting started or need help with a specific feature.\n\nWhat can I help you with today?`,
      }]);
    }, 50);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-20 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/60 bg-background shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "min(580px, calc(100dvh - 120px))" }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-primary text-primary-foreground shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-none">Nkosi — AI Assistant</p>
                <p className="text-xs text-primary-foreground/70 mt-0.5 truncate">{currentPage}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="New conversation"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setMinimized(m => !m)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  title={minimized ? "Expand" : "Minimise"}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${minimized ? "rotate-180" : ""}`} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!minimized && (
                <motion.div
                  key="body"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="flex flex-col overflow-hidden flex-1"
                  style={{ minHeight: 0 }}
                >
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ minHeight: 0 }}>
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div className={`rounded-2xl px-3.5 py-2.5 max-w-[82%] ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted rounded-tl-sm"
                        }`}>
                          {msg.role === "assistant" ? (
                            <MarkdownText text={msg.content} />
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                          {msg.streaming && (
                            <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 rounded-sm align-text-bottom" />
                          )}
                        </div>
                      </div>
                    ))}

                    {messages.length === 1 && !streaming && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground text-center">Quick questions:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_QUESTIONS.map(q => (
                            <button
                              key={q}
                              onClick={() => sendMessage(q)}
                              className="text-xs px-2.5 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-left"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {streaming && messages[messages.length - 1]?.role !== "assistant" && (
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <div className="px-3 pb-3 pt-2 border-t border-border/60 shrink-0">
                    <div className="flex gap-2 items-end">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything…"
                        rows={1}
                        disabled={streaming}
                        className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-50"
                        style={{ maxHeight: 100, minHeight: 38 }}
                        onInput={e => {
                          const t = e.currentTarget;
                          t.style.height = "auto";
                          t.style.height = Math.min(t.scrollHeight, 100) + "px";
                        }}
                      />
                      <Button
                        size="icon"
                        className="shrink-0 rounded-xl h-9 w-9"
                        onClick={() => sendMessage(input)}
                        disabled={streaming || !input.trim()}
                      >
                        {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground mt-1.5">Powered by Masakhe AI · May make mistakes</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-4 right-4 z-50 w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          open ? "bg-muted border border-border text-foreground" : "bg-primary text-primary-foreground"
        }`}
        style={{ width: 52, height: 52 }}
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {!open && (
        <AnimatePresence>
          <motion.div
            key="pulse"
            className="fixed bottom-4 right-4 z-40 w-13 h-13 rounded-full bg-primary/30 pointer-events-none"
            style={{ width: 52, height: 52 }}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </AnimatePresence>
      )}
    </>
  );
}
