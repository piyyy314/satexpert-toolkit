import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <Card className="border-border/50 max-w-sm w-full">
        <CardContent className="p-8 text-center">
          <p className="text-4xl font-mono font-bold text-primary mb-2">404</p>
          <p className="text-sm text-muted-foreground mb-4">Page not found</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
