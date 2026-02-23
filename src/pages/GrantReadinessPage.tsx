import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ShieldCheck, AlertTriangle, Info, Download } from "lucide-react";

interface ReadinessItem {
  key: string;
  label: string;
  section: string;
  manual: boolean;
  checked: boolean;
}

interface ReadinessData {
  items: ReadinessItem[];
  readinessPercent: number;
  completedCount: number;
  totalCount: number;
}

export default function GrantReadinessPage() {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});
  const [taxNumber, setTaxNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/funding/readiness", { credentials: "include" });
    if (res.ok) {
      const d = await res.json();
      setData(d);
      const mc: Record<string, boolean> = {};
      for (const item of d.items) {
        if (item.manual) mc[item.key] = item.checked;
      }
      setManualChecks(mc);
      if (d.savedData?.tax_number) setTaxNumber(d.savedData.tax_number);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/funding/readiness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id_verified: manualChecks.id_verified || false,
        business_registered: manualChecks.business_registered || false,
        tax_number: taxNumber || undefined,
        vat_registered: manualChecks.vat_registered || false,
        bank_account_provided: manualChecks.bank_account_provided || false,
        six_months_records: manualChecks.six_months_records || false,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Readiness updated");
      load();
    } else {
      toast.error("Failed to save");
    }
  };

  const toggleCheck = (key: string) => {
    setManualChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!data) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  const sections = ["Identity & Registration", "Tax & Compliance", "Banking", "Records"];

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Funding Readiness</h2>
          <p className="text-muted-foreground">Check your readiness for grants and funding applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" /> Download Summary
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gradient-hero text-white">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={data.readinessPercent >= 80 ? "#16a34a" : data.readinessPercent >= 50 ? "#eab308" : "#dc2626"}
                strokeWidth="8"
                strokeDasharray={`${data.readinessPercent * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{data.readinessPercent}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {data.readinessPercent >= 80 ? "Great Progress!" : data.readinessPercent >= 50 ? "Getting There" : "Getting Started"}
            </h3>
            <p className="text-muted-foreground">
              {data.completedCount} of {data.totalCount} items completed
            </p>
            {data.readinessPercent < 100 && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Complete all items to maximise your chances of funding approval
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Checklist Sections */}
      {sections.map((section) => {
        const sectionItems = data.items.filter((i) => i.section === section);
        if (sectionItems.length === 0) return null;
        return (
          <Card key={section} className="p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {section}
            </h3>
            <div className="space-y-3">
              {sectionItems.map((item) => {
                const isChecked = item.manual ? (manualChecks[item.key] ?? item.checked) : item.checked;
                return (
                  <motion.div
                    key={item.key}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                      isChecked ? "bg-green-50 border border-green-200" : "bg-muted/30 border border-transparent"
                    }`}
                  >
                    {item.manual ? (
                      <button onClick={() => toggleCheck(item.key)} className="shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      <div className="shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${isChecked ? "text-green-800" : ""}`}>{item.label}</span>
                      {!item.manual && !isChecked && (
                        <p className="text-xs text-muted-foreground">Auto-checked when data is available</p>
                      )}
                    </div>
                    {item.key === "tax_number" && item.manual && (
                      <Input
                        value={taxNumber}
                        onChange={(e) => { setTaxNumber(e.target.value); if (e.target.value) setManualChecks((p) => ({ ...p, tax_number: true })); }}
                        placeholder="Tax number"
                        className="h-8 w-40 text-sm"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
