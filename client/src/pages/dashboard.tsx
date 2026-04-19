import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitBranch, GitFork, Star, Users, Activity, Clock, FolderPlus, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";

interface GHProfile {
  login: string; name: string; avatarUrl: string; publicRepos: number;
  followers: number; following: number; createdAt: string; htmlUrl: string;
}
interface GHRepo {
  id: number; name: string; description: string; language: string;
  stars: number; forks: number; updatedAt: string; htmlUrl: string;
  topics: string[]; isForked: boolean; size: number;
}
interface GHEvent {
  id: string; type: string; repo: string; createdAt: string;
  action: string; ref: string; refType: string; prTitle: string; commits: number;
}
interface LocalProject {
  id: number; name: string; description: string; language: string;
  status: string; priority: string; tags: string; createdAt: string;
}

function KPICard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: any; sub?: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
            <p className="text-xl font-semibold tabular-nums" data-testid={`kpi-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
            {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getLanguageStats(repos: GHRepo[]) {
  const counts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
}

function getActivityByDay(events: GHEvent[]) {
  const days: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "MMM dd");
    days[d] = 0;
  }
  events.forEach((e) => {
    const d = format(parseISO(e.createdAt), "MMM dd");
    if (days[d] !== undefined) days[d]++;
  });
  return Object.entries(days).map(([date, count]) => ({ date, count }));
}

const LANG_COLORS = ["hsl(152,60%,48%)", "hsl(200,65%,55%)", "hsl(262,50%,60%)", "hsl(38,80%,58%)", "hsl(340,60%,58%)", "hsl(180,40%,50%)"];

function formatEvent(e: GHEvent) {
  switch (e.type) {
    case "PushEvent": return e.commits > 0 ? `Pushed ${e.commits} commit${e.commits > 1 ? "s" : ""} to ${e.repo}` : `Pushed to ${e.repo}`;
    case "PullRequestEvent": return `${e.action === "opened" ? "Opened" : e.action === "closed" ? "Closed" : e.action} PR in ${e.repo}`;
    case "PullRequestReviewEvent": return `Reviewed PR in ${e.repo}`;
    case "ForkEvent": return `Forked ${e.repo}`;
    case "WatchEvent": return `Starred ${e.repo}`;
    case "CreateEvent": return `Created ${e.refType || "ref"} in ${e.repo}`;
    case "DeleteEvent": return `Deleted ${e.refType || "ref"} in ${e.repo}`;
    default: return `${e.type.replace("Event", "")} on ${e.repo}`;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const { data: profile, isLoading: loadingProfile, dataUpdatedAt: profileUpdated } = useQuery<GHProfile>({
    queryKey: ["/api/github/profile"],
    refetchInterval: 60_000, // every 60s
  });
  const { data: repos, isLoading: loadingRepos } = useQuery<GHRepo[]>({
    queryKey: ["/api/github/repos"],
    refetchInterval: 60_000,
  });
  const { data: events, isLoading: loadingEvents } = useQuery<GHEvent[]>({
    queryKey: ["/api/github/events"],
    refetchInterval: 30_000, // every 30s for activity
  });
  const { data: localProjects } = useQuery<LocalProject[]>({
    queryKey: ["/api/projects"],
    refetchInterval: 15_000,
  });

  // Live "updated X ago" ticker
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(t);
  }, []);
  const lastRefresh = profileUpdated ? Math.round((now - profileUpdated) / 1000) : null;
  const refreshLabel = lastRefresh === null ? "" : lastRefresh < 10 ? "Just now" : lastRefresh < 60 ? `${lastRefresh}s ago` : `${Math.floor(lastRefresh / 60)}m ago`;

  const loading = loadingProfile || loadingRepos || loadingEvents;
  const totalStars = repos?.reduce((s, r) => s + r.stars, 0) || 0;
  const totalForks = repos?.reduce((s, r) => s + r.forks, 0) || 0;
  const originalRepos = repos?.filter((r) => !r.isForked).length || 0;
  const forkedRepos = repos?.filter((r) => r.isForked).length || 0;
  const languageData = repos ? getLanguageStats(repos) : [];
  const activityData = events ? getActivityByDay(events) : [];
  const recentRepos = repos?.slice(0, 5) || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">
      {/* Live indicator */}
      {!loading && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span>Live</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="tabular-nums">{refreshLabel}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border/50"><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <KPICard label="Repos" value={profile?.publicRepos || 0} icon={GitBranch} sub={`${originalRepos} original · ${forkedRepos} forked`} />
            <KPICard label="Stars" value={totalStars} icon={Star} />
            <KPICard label="Forks" value={totalForks} icon={GitFork} />
            <KPICard label="Followers" value={profile?.followers || 0} icon={Users} sub={`Following ${profile?.following || 0}`} />
            <KPICard label="Local" value={localProjects?.length || 0} icon={FolderPlus} sub="Unpublished" />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Activity (14 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {loadingEvents ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152,60%,48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152,60%,48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(220,8%,55%)" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220,14%,11%)",
                      border: "1px solid hsl(220,10%,18%)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(210,15%,90%)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(152,60%,48%)"
                    strokeWidth={2}
                    fill="url(#actGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(152,60%,48%)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Languages pie */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Languages</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loadingRepos ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={languageData}
                      dataKey="value"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {languageData.map((_, i) => (
                        <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 flex-1 min-w-0">
                  {languageData.map((l, i) => (
                    <div key={l.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: LANG_COLORS[i % LANG_COLORS.length] }} />
                      <span className="truncate text-muted-foreground">{l.name}</span>
                      <span className="ml-auto tabular-nums font-medium">{l.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: recent repos + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent repos */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Recently Updated
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loadingRepos ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              <div className="space-y-1">
                {recentRepos.map((r) => (
                  <a
                    key={r.id}
                    href={r.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors group"
                    data-testid={`repo-card-${r.name}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{r.name}</span>
                        {r.isForked && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">fork</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{r.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {r.language && (
                        <span className="text-[10px] font-mono text-muted-foreground">{r.language}</span>
                      )}
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loadingEvents ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : (
              <div className="space-y-0.5">
                {events?.slice(0, 8).map((e) => (
                  <div key={e.id} className="flex items-start gap-2 py-1.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground/90 truncate">{formatEvent(e)}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{timeAgo(e.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
