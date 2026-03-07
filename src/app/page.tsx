"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-scope-bg dark:via-scope-surface dark:to-scope-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-scope-primary text-xs font-bold text-white shadow-sm">
            SO
          </span>
          <span className="font-semibold tracking-tight text-slate-900 dark:text-scope-text">
            ScopeOps
          </span>
        </div>
        <nav>
          <button
            onClick={() => router.push("/login")}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-scope-textMuted dark:hover:text-scope-text"
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </button>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 dark:text-scope-text sm:text-5xl">
            Decarbonize Your Supply Chain with Carbon Engine
          </h1>
          <p className="mt-5 text-pretty text-base text-slate-600 dark:text-scope-textMuted sm:text-lg">
            Ingest ERP data, accurately calculate Scope 1, 2, and 3 emissions, and generate
            audit-ready ESG reports in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/login")}>
              Log in
            </Button>
            <Button onClick={() => router.push("/signup")}>Get Started</Button>
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

