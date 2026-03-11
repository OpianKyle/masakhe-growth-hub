import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Circle, ShieldCheck, AlertTriangle, ArrowUpRight, Download } from "lucide-react";

interface ReadinessItem {
  key: string; label: string; points: number; completed: boolean; link: string;
}

interface GRData {
  score: number; items: ReadinessItem[]; nextSteps: { label: string; points: number; link: string }[];
  earnedPoints: number; totalPoints: number;
}

export default function GrantReadinessPage() {
  const [data, setData] = useState<GRData | null>(null);
  const [taxNumber, setTaxNumber] = useState("");
  const [businessRegistered, setBusinessRegistered] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/documents/grant-readiness", { credentials: "include" });
    if (res.ok) {
      const d = await res.json();
      setData(d);
    }
    const gr = await fetch("/api/funding/readiness", { credentials: "include" });
    if (gr.ok) {
      const gd = await gr.json();
      if (gd.savedData?.tax_number) setTaxNumber(gd.savedData.tax_number);
      const reg = gd.items?.find((i: any) => i.key === "business_registered");
      if (reg) setBusinessRegistered(reg.checked);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/funding/readiness", {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ tax_number: taxNumber || undefined, business_registered: businessRegistered }),
    });
    setSaving(false);
    if (res.ok) { toast.success("Saved"); load(); } else toast.error("Failed to save");
  };

  const getStatusLabel = (score: number) => {
    if (score >= 70) return { label: "Funding Ready", color: "text-green-700", bg: "bg-green-100", ring: "#16a34a" };
    if (score >= 40) return { label: "Moderate Score", color: "text-amber-700", bg: "bg-amber-100", ring: "#d97706" };
    return { label: "Not Yet Ready", color: "text-red-700", bg: "bg-red-100", ring: "#dc2626" };
  };

  if (!data) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded w-64 mb-2" />
      <div className="h-48 bg-muted rounded-xl" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  );

  const status = getStatusLabel(data.score);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Funding Scoring</h2>
          <p className="text-muted-foreground text-sm mt-1">Track your score to apply for South African funding programmes</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="gap-2"><Download className="h-4 w-4" /> Download</Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-8">
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={status.ring}
                strokeWidth="10"
                strokeDasharray={`${data.score * 2.51} 251`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{data.score}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.bg} ${status.color}`}>{status.label}</span>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              You have earned <strong>{data.earnedPoints}</strong> out of <strong>{data.totalPoints}</strong> possible points.
            </p>
            {data.nextSteps.length > 0 && (
              <p className="text-sm mt-2 text-muted-foreground">
                Complete these steps to improve your score and increase funding approval chances.
              </p>
            )}
          </div>
        </div>

        {data.score < 100 && data.nextSteps.length > 0 && (
          <div className="mt-6 pt-5 border-t">
            <p className="text-sm font-semibold mb-3">Next steps to improve your score:</p>
            <div className="space-y-2">
              {data.nextSteps.map((step, i) => (
                <Link key={i} to={step.link}
                  className="flex items-center justify-between rounded-lg bg-muted/50 hover:bg-muted px-4 py-2.5 transition-colors group">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary">+{step.points} pts</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Scoring Criteria</h3>
        <div className="space-y-2">
          {data.items.map(item => (
            <div key={item.key}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${item.completed ? "bg-green-50 border-green-200" : "bg-muted/30 border-transparent"}`}>
              {item.completed
                ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
              <div className="flex-1">
                <span className={`text-sm font-medium ${item.completed ? "text-green-800" : ""}`}>{item.label}</span>
              </div>
              <span className={`text-xs font-bold ${item.completed ? "text-green-600" : "text-muted-foreground"}`}>
                {item.completed ? `+${item.points} pts` : `${item.points} pts`}
              </span>
              {!item.completed && (
                <Link to={item.link} className="text-xs text-primary underline hover:no-underline shrink-0">Go</Link>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Manual Checks</h3>
        <p className="text-sm text-muted-foreground">These items can't be verified automatically — check the boxes once completed.</p>
        <div className="space-y-4">
          <div>
            <Label>SARS Tax Reference Number</Label>
            <Input value={taxNumber} onChange={e => setTaxNumber(e.target.value)} placeholder="e.g. 9876543210" className="mt-1 max-w-xs" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setBusinessRegistered(b => !b)} className="shrink-0">
              {businessRegistered
                ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                : <Circle className="h-5 w-5 text-muted-foreground" />}
            </button>
            <Label className="cursor-pointer" onClick={() => setBusinessRegistered(b => !b)}>
              Business is registered with CIPC
            </Label>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gradient-hero text-white">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Card>
    </div>
  );
}
