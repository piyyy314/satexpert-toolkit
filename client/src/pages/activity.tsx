import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitPullRequest, GitBranch, Star, GitFork, Eye, Trash2, GitCommit,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface GHEvent {
  id: string; type: string; repo: string; createdAt: string;
  action: string; ref: string; refType: string; prTitle: string; commits: number;
}

function eventIcon(type: string) {
  switch (type) {
    case "PushEvent": return <GitCommit className="w-3.5 h-3.5" />;
    case "PullRequestEvent":
    case "PullRequestReviewEvent": return <GitPullRequest className="w-3.5 h-3.5" />;
    case "ForkEvent": return <GitFork className="w-3.5 h-3.5" />;
    case "WatchEvent": return <Star className="w-3.5 h-3.5" />;
    case "CreateEvent": return <GitBranch className="w-3.5 h-3.5" />;
    case "DeleteEvent": return <Trash2 className="w-3.5 h-3.5" />;
    default: return <Eye className="w-3.5 h-3.5" />;
  }
}

function eventLabel(e: GHEvent) {
  switch (e.type) {
    case "PushEvent": return e.commits > 0 ? `Pushed ${e.commits} commit${e.commits > 1 ? "s" : ""}` : "Pushed to master";
    case "PullRequestEvent": return `${e.action === "opened" ? "Opened" : e.action === "closed" ? "Closed" : "Merged"} pull request`;
    case "PullRequestReviewEvent": return "Reviewed pull request";
    case "ForkEvent": return "Forked repository";
    case "WatchEvent": return "Starred repository";
    case "CreateEvent": return `Created ${e.refType || "ref"}`;
    case "DeleteEvent": return `Deleted ${e.refType || "ref"}`;
    default: return e.type.replace("Event", "");
  }
}

function eventColor(type: string) {
  switch (type) {
    case "PushEvent": return "bg-green-500";
    case "PullRequestEvent":
    case "PullRequestReviewEvent": return "bg-blue-500";
    case "ForkEvent": return "bg-purple-500";
    case "WatchEvent": return "bg-yellow-500";
    case "CreateEvent": return "bg-teal-500";
    case "DeleteEvent": return "bg-red-500";
    default: return "bg-muted-foreground";
  }
}

export default function ActivityPage() {
  const { data: events, isLoading } = useQuery<GHEvent[]>({
    queryKey: ["/api/github/events"],
    refetchInterval: 30_000,
  });

  // Group events by date
  const grouped = events?.reduce((acc, e) => {
    const date = format(parseISO(e.createdAt), "MMMM d, yyyy");
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {} as Record<string, GHEvent[]>) || {};

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[900px]">
      <div>
        <h2 className="text-base font-semibold">Activity Feed</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Recent public events from your GitHub account
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date}>
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">{date}</h3>
              <Card className="border-border/50">
                <CardContent className="p-0 divide-y divide-border/50">
                  {dayEvents.map((e) => (
                    <div key={e.id} className="flex items-start gap-3 p-3" data-testid={`event-${e.id}`}>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 mt-0.5 ${eventColor(e.type)}`}>
                        {eventIcon(e.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{eventLabel(e)}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                            {e.repo}
                          </Badge>
                          {e.prTitle && (
                            <span className="text-[10px] text-muted-foreground truncate">{e.prTitle}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                        {format(parseISO(e.createdAt), "h:mm a")}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
