import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface ComplianceItem {
  key: string;
  label: string;
  points: number;
  completed: boolean;
  link: string;
}

interface ComplianceData {
  score: number;
  items: ComplianceItem[];
  nextSteps: Array<{ label: string; points: number; link: string }>;
}

export default function ComplianceScoreCard() {
  const [data, setData] = useState<ComplianceData | null>(null);

  useEffect(() => {
    fetch("/api/compliance/score", { credentials: "include" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const getColor = (score: number) => {
    if (score >= 80) return { text: "text-green-600", stroke: "#16a34a", label: "Excellent" };
    if (score >= 60) return { text: "text-blue-600", stroke: "#2563eb", label: "Good" };
    if (score >= 40) return { text: "text-yellow-600", stroke: "#ca8a04", label: "Fair" };
    return { text: "text-red-600", stroke: "#dc2626", label: "Needs Work" };
  };

  const color = getColor(data.score);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold font-heading mb-4">Compliance Score</h3>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 100 100" className="h-20 w-20 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={color.stroke}
              strokeWidth="8"
              strokeDasharray={`${data.score * 2.64} 264`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${color.text}`}>{data.score}</span>
          </div>
        </div>
        <div>
          <p className={`font-bold ${color.text}`}>{color.label}</p>
          <p className="text-sm text-muted-foreground">{data.score}/100 points</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-4">
        {data.items && data.items.map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-sm">
            {item.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={item.completed ? "text-muted-foreground line-through" : ""}>{item.label}</span>
            <span className="ml-auto text-xs text-muted-foreground">+{item.points}pts</span>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      {data.nextSteps && data.nextSteps.length > 0 && (
        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Next Best Actions</p>
          <div className="space-y-2">
            {data.nextSteps.slice(0, 3).map((step) => (
              <Link
                key={step.label}
                to={step.link}
                className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="flex-1">{step.label}</span>
                <span className="text-xs text-primary font-bold">+{step.points}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
