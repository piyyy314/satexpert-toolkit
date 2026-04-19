import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Star, GitFork, ArrowUpRight, Search } from "lucide-react";

interface GHRepo {
  id: number; name: string; description: string; language: string;
  stars: number; forks: number; updatedAt: string; htmlUrl: string;
  topics: string[]; isForked: boolean; size: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const LANG_COLOR_MAP: Record<string, string> = {
  Python: "bg-blue-500", JavaScript: "bg-yellow-400", TypeScript: "bg-blue-400",
  Elixir: "bg-purple-500", HTML: "bg-orange-500", CSS: "bg-pink-500",
  Shell: "bg-green-500", Rust: "bg-orange-600", Go: "bg-cyan-500",
  Ruby: "bg-red-500", Java: "bg-red-400", "C++": "bg-pink-600",
};

export default function Repos() {
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: repos, isLoading } = useQuery<GHRepo[]>({
    queryKey: ["/api/github/repos"],
    refetchInterval: 60_000,
  });

  const languages = [...new Set(repos?.map((r) => r.language).filter(Boolean) || [])].sort();

  const filtered = repos?.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchLang = langFilter === "all" || r.language === langFilter;
    const matchType = typeFilter === "all" ||
      (typeFilter === "original" && !r.isForked) ||
      (typeFilter === "forked" && r.isForked);
    return matchSearch && matchLang && matchType;
  }) || [];

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search repos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/30"
            data-testid="input-search-repos"
          />
        </div>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs" data-testid="select-language">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            {languages.map((l) => (
              <SelectItem key={l} value={l!}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs" data-testid="select-type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="original">Original</SelectItem>
            <SelectItem value="forked">Forked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} repositor{filtered.length === 1 ? "y" : "ies"}
      </p>

      {isLoading ? (
        <div className="grid gap-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((r) => (
            <a
              key={r.id}
              href={r.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              data-testid={`repo-row-${r.name}`}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <GitBranch className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{r.name}</span>
                        {r.isForked && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">fork</Badge>}
                        {r.language && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className={`w-2 h-2 rounded-full ${LANG_COLOR_MAP[r.language] || "bg-gray-400"}`} />
                            {r.language}
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        {r.stars > 0 && (
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3" />{r.stars}</span>
                        )}
                        {r.forks > 0 && (
                          <span className="flex items-center gap-0.5"><GitFork className="w-3 h-3" />{r.forks}</span>
                        )}
                        <span>{timeAgo(r.updatedAt)}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
