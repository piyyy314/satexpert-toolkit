import { LayoutDashboard, GitBranch, FolderPlus, Activity, Sun, Moon, Compass, Calculator, Wrench } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";

const devItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Repositories", url: "/repos", icon: GitBranch },
  { title: "Local Projects", url: "/projects", icon: FolderPlus },
  { title: "Activity", url: "/activity", icon: Activity },
];

const satcomItems = [
  { title: "Look Angles", url: "/look-angles", icon: Compass },
  { title: "Link Budget", url: "/link-budget", icon: Calculator },
  { title: "Field Toolkit", url: "/field-toolkit", icon: Wrench },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { theme, toggle } = useTheme();

  const renderGroup = (label: string, items: typeof devItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 px-4">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <Link href={item.url}>
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            aria-label="DevPulse logo"
            className="shrink-0"
          >
            <rect width="32" height="32" rx="8" className="fill-primary" />
            <path
              d="M8 16h4l3-6 5 12 3-6h4"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div>
            <span className="font-semibold text-sm tracking-tight" data-testid="text-logo">SatExpert</span>
            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">DevPulse + VSAT Toolkit</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Development", devItems)}
        {renderGroup("SatCom", satcomItems)}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className="w-full justify-start gap-2 text-muted-foreground"
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="text-xs">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
