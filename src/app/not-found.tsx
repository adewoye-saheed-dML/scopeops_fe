import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl border-scope-primary/30 bg-gradient-to-b from-scope-surface to-scope-bg">
        <CardHeader className="items-center text-center">
          <span className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-error/15 text-error">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <CardTitle className="text-3xl">404 | Page Not Found</CardTitle>
          <CardDescription>
            The route you requested does not exist or may have moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-lg bg-scope-primary px-5 text-sm font-medium text-white shadow-md shadow-scope-primary/20 transition-all duration-150 hover:-translate-y-px hover:bg-scope-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary">
            Return to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
