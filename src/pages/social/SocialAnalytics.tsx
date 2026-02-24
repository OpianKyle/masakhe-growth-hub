import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  BarChart3, Send, TrendingUp, Download, FileText, Calendar, Shield
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  workspaceId: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  META_FACEBOOK: "#1877F2",
  META_INSTAGRAM: "#E4405F",
  LINKEDIN: "#0A66C2",
  X: "#000000",
};

export default function SocialAnalytics({ workspaceId }: Props) {
  const [data, setData] = useState<any>(null);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/analytics`, { credentials: "include" })
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
    fetch(`/api/social/ws/${workspaceId}/report/monthly`, { credentials: "include" })
      .then(r => r.json())
      .then(setReport)
      .catch(() => {});
  }, [workspaceId]);

  const handleExportAudit = () => {
    window.open(`/api/social/ws/${workspaceId}/audit/export`, "_blank");
    toast.success("Audit log download started");
  };

  if (!data) return <div className="p-6 text-center text-muted-foreground">Loading analytics...</div>;

  const { overview, postsByPlatform, postsByDay } = data;

  const pieData = (postsByPlatform || []).map((p: any) => ({
    name: p.platform.replace("META_", ""),
    value: p.post_count,
    color: PLATFORM_COLORS[p.platform] || "#888",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Analytics & Reports</h2>
          <p className="text-muted-foreground">Track your social media performance</p>
        </div>
        <Button variant="outline" onClick={handleExportAudit}>
          <Download className="h-4 w-4 mr-2" /> Export Audit Log
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: overview.totalPosts, icon: FileText },
          { label: "Published", value: overview.publishedPosts, icon: Send },
          { label: "Scheduled", value: overview.scheduledPosts, icon: Calendar },
          { label: "Accounts", value: overview.connectedAccounts, icon: TrendingUp },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <s.icon className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold font-heading mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Posts Published Per Day
          </h3>
          {postsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={postsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No published posts yet</div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold font-heading mb-4">Posts by Platform</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center justify-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }: any) => `${name}: ${value}`}>
                    {pieData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((p: any) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm">{p.name}: {p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">No platform data yet</div>
          )}
        </Card>
      </div>

      {report && (
        <Card className="p-6">
          <h3 className="font-bold font-heading mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Monthly Marketing Activity Report
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{report.postsPublished}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{report.postsScheduled}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{report.mediaUploaded}</p>
              <p className="text-xs text-muted-foreground">Media Uploaded</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{report.auditActions}</p>
              <p className="text-xs text-muted-foreground">Audit Actions</p>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Social Activity Consistency Score</span>
              <span className={`text-lg font-bold ${report.consistencyScore >= 50 ? "text-green-600" : "text-amber-600"}`}>
                {report.consistencyScore}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all ${report.consistencyScore >= 50 ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${report.consistencyScore}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{report.activeDays} active days out of {report.daysInMonth} this month</p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-3 w-3 mr-1" /> Print Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAudit}>
              <Download className="h-3 w-3 mr-1" /> Export Audit CSV
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
