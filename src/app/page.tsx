import Link from "next/link";
import { BarChart3, DatabaseZap, Leaf } from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  {
    title: "Automated Emission Factors",
    description: "Match activity and spend categories to trusted factors with less manual mapping.",
    icon: Leaf,
  },
  {
    title: "Bulk ERP Ingestion",
    description: "Upload ERP-ready CSV files and process large supplier datasets in minutes.",
    icon: DatabaseZap,
  },
  {
    title: "Real-time Dashboards",
    description: "Track Scope 1, 2, and 3 trends with executive-ready visuals and coverage insights.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-scope-bg dark:via-scope-surface dark:to-scope-bg">
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 dark:text-scope-text sm:text-5xl">
            Decarbonize Your Supply Chain with Carbon Engine
          </h1>
          <p className="mt-5 text-pretty text-base text-slate-600 dark:text-scope-textMuted sm:text-lg">
            Ingest ERP data, accurately calculate Scope 1, 2, and 3 emissions, and generate
            audit-ready ESG reports in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-scope-border dark:bg-scope-surface/80"
            >
              <feature.icon className="h-6 w-6 text-scope-primary" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-scope-text">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-scope-textMuted">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
