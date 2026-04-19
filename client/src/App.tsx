import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme";
import Dashboard from "@/pages/dashboard";
import Repos from "@/pages/repos";
import Projects from "@/pages/projects";
import ActivityPage from "@/pages/activity";
import LookAnglesPage from "@/pages/look-angles";
import LinkBudgetPage from "@/pages/link-budget";
import FieldToolkit from "@/pages/field-toolkit";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/repos" component={Repos} />
      <Route path="/projects" component={Projects} />
      <Route path="/activity" component={ActivityPage} />
      <Route path="/look-angles" component={LookAnglesPage} />
      <Route path="/link-budget" component={LinkBudgetPage} />
      <Route path="/field-toolkit" component={FieldToolkit} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router hook={useHashLocation}>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full overflow-hidden">
                <AppSidebar />
                <div className="flex flex-col flex-1 min-w-0">
                  <header className="flex items-center h-12 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
                    <SidebarTrigger data-testid="button-sidebar-toggle" className="mr-3" />
                    <span className="text-xs text-muted-foreground font-mono">piyyy314</span>
                  </header>
                  <main className="flex-1 overflow-y-auto">
                    <AppRouter />
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </Router>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
