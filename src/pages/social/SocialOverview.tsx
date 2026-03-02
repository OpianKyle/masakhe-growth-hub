import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Send, Clock, AlertTriangle, Globe, Image, Plus, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

interface Overview {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  failedPosts: number;
  draftPosts: number;
  connectedAccounts: number;
  mediaCount: number;
}

interface Props {
  workspaceId: string;
}

export default function SocialOverview({ workspaceId }: Props) {
  const [data, setData] = useState<{
    overview: Overview;
    postsByPlatform: any[];
    recentPosts: any[];
  } | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/social/ws/${workspaceId}/analytics`, { credentials: "include" })
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, [workspaceId]);

  if (!data) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-8 bg-muted rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-48 bg-muted rounded" />
      </div>
    </div>
  );

  const { overview } = data;

  const stats = [
    { label: "Published", value: overview.publishedPosts, icon: Send, color: "bg-green-500/10 text-green-600" },
    { label: "Scheduled", value: overview.scheduledPosts, icon: Clock, color: "bg-blue-500/10 text-blue-600" },
    { label: "Drafts", value: overview.draftPosts, icon: BarChart3, color: "bg-gray-500/10 text-gray-600" },
    { label: "Failed", value: overview.failedPosts, icon: AlertTriangle, color: "bg-red-500/10 text-red-600" },
    { label: "Accounts", value: overview.connectedAccounts, icon: Globe, color: "bg-purple-500/10 text-purple-600" },
    { label: "Media Files", value: overview.mediaCount, icon: Image, color: "bg-orange-500/10 text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Social Media Hub</h2>
          <p className="text-muted-foreground">Manage your social presence across platforms</p>
        </div>
        <Link to="/dashboard/social/create">
          <Button className="gradient-hero text-white">
            <Plus className="h-4 w-4 mr-2" /> Create Post
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center">
              <div className={`flex h-10 w-10 mx-auto items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {overview.connectedAccounts === 0 && (
        <Card className="p-8 text-center border-dashed">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="font-bold text-lg mb-1">Connect Your Accounts First</h3>
          <p className="text-muted-foreground text-sm mb-4">Link your Facebook, Instagram, or LinkedIn accounts to start posting.</p>
          <Link to="/dashboard/social/accounts">
            <Button className="gradient-hero text-white">Connect Accounts</Button>
          </Link>
        </Card>
      )}

      {data.postsByPlatform.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold font-heading mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Posts by Platform
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.postsByPlatform.map((p: any) => (
              <div key={p.platform} className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-xs text-muted-foreground font-medium">{p.platform.replace("META_", "").replace("_", " ")}</p>
                <p className="text-xl font-bold mt-1">{p.post_count}</p>
                <p className="text-xs text-green-600">{p.published_count} published</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.recentPosts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold font-heading mb-4">Recent Published Posts</h3>
          <div className="space-y-3">
            {data.recentPosts.map((post: any) => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Send className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.content_text || "(No text)"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {post.creator} &middot; {new Date(post.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
