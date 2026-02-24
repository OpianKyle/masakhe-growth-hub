import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock, Send, AlertTriangle, FileText } from "lucide-react";

interface Post {
  id: string;
  content_text: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  targets: any[];
}

interface Props {
  workspaceId: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-200 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  PUBLISHING: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-200 text-gray-500",
};

const STATUS_ICONS: Record<string, any> = {
  DRAFT: FileText,
  SCHEDULED: Clock,
  PUBLISHED: Send,
  FAILED: AlertTriangle,
};

export default function SocialCalendar({ workspaceId }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/posts?month=${monthStr}`, { credentials: "include" })
      .then(r => r.json())
      .then(setPosts)
      .catch(() => {});
  }, [workspaceId, monthStr]);

  const navigate = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const postsByDay = useMemo(() => {
    const map: Record<number, Post[]> = {};
    for (const p of posts) {
      const dateStr = p.scheduled_at || p.created_at;
      const d = new Date(dateStr);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(p);
      }
    }
    return map;
  }, [posts, month, year]);

  const today = new Date();
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Content Calendar</h2>
          <p className="text-muted-foreground">Plan and visualize your posting schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setView("month")} className={`px-3 py-1.5 text-sm ${view === "month" ? "bg-primary text-white" : "hover:bg-muted"}`}>Month</button>
            <button onClick={() => setView("week")} className={`px-3 py-1.5 text-sm ${view === "week" ? "bg-primary text-white" : "hover:bg-muted"}`}>Week</button>
          </div>
          <Link to="/dashboard/social/create">
            <Button size="sm" className="gradient-hero text-white"><Plus className="h-4 w-4 mr-1" /> New Post</Button>
          </Link>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-5 w-5" /></Button>
          <h3 className="text-lg font-bold font-heading">{monthNames[month]} {year}</h3>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight className="h-5 w-5" /></Button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {weekDays.map(d => (
            <div key={d} className="bg-muted/50 p-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-card p-2 min-h-[80px]" />
          ))}
          {days.map(day => {
            const dayPosts = postsByDay[day] || [];
            return (
              <div key={day} className={`bg-card p-1.5 min-h-[80px] border-t ${isToday(day) ? "ring-2 ring-primary ring-inset" : ""}`}>
                <div className={`text-xs font-medium mb-1 ${isToday(day) ? "text-primary font-bold" : "text-muted-foreground"}`}>{day}</div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 3).map(p => {
                    const Icon = STATUS_ICONS[p.status] || FileText;
                    return (
                      <button key={p.id} onClick={() => setSelectedPost(p)} className={`w-full text-left rounded px-1 py-0.5 text-[10px] font-medium truncate flex items-center gap-0.5 ${STATUS_COLORS[p.status] || "bg-gray-100"}`}>
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                        {p.content_text?.slice(0, 20) || "Post"}
                      </button>
                    );
                  })}
                  {dayPosts.length > 3 && <p className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
          <Card className="max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-heading">Post Details</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selectedPost.status]}`}>{selectedPost.status}</span>
            </div>
            <p className="text-sm mb-3">{selectedPost.content_text || "(No text)"}</p>
            {selectedPost.scheduled_at && (
              <p className="text-xs text-muted-foreground mb-2">
                <Clock className="h-3 w-3 inline mr-1" />
                Scheduled: {new Date(selectedPost.scheduled_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}
              </p>
            )}
            {selectedPost.targets?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium mb-1">Targets:</p>
                {selectedPost.targets.map((t: any) => (
                  <span key={t.id} className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] mr-1 mb-1">
                    {t.account_name} ({t.platform.replace("META_", "")})
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Link to={`/dashboard/social/create?edit=${selectedPost.id}`}>
                <Button size="sm" variant="outline">Edit</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => setSelectedPost(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{status}</span>
        ))}
      </div>
    </div>
  );
}
