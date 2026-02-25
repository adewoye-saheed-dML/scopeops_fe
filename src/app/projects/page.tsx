"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { CreateScopeValues } from "@/components/scopes/CreateScopeForm";
import CreateScopeForm from "@/components/scopes/CreateScopeForm";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, SlideOver } from "@/components/ui";
import { cn } from "@/lib/utils";

type ScopeRow = {
  id: string;
  scopeName: string;
  owner: string;
  scopeType: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Draft" | "In Review" | "Approved";
  startDate: string;
  dueDate: string;
};

const initialRows: ScopeRow[] = [
  {
    id: "scope-001",
    scopeName: "Supplier Emissions Baseline",
    owner: "Ava Patel",
    scopeType: "Operational",
    priority: "High",
    status: "In Review",
    startDate: "2026-02-03",
    dueDate: "2026-03-12",
  },
  {
    id: "scope-002",
    scopeName: "Q2 Compliance Readiness",
    owner: "Marcus Reed",
    scopeType: "Compliance",
    priority: "Critical",
    status: "Draft",
    startDate: "2026-02-10",
    dueDate: "2026-03-01",
  },
  {
    id: "scope-003",
    scopeName: "Freight Optimization Pilot",
    owner: "Nina Kim",
    scopeType: "Reduction Program",
    priority: "Medium",
    status: "Approved",
    startDate: "2026-01-19",
    dueDate: "2026-04-20",
  },
  {
    id: "scope-004",
    scopeName: "Tier-1 Supplier Enablement",
    owner: "Leo Santos",
    scopeType: "Supplier Engagement",
    priority: "High",
    status: "In Review",
    startDate: "2026-02-14",
    dueDate: "2026-03-28",
  },
  {
    id: "scope-005",
    scopeName: "Energy Data Consolidation",
    owner: "Priya Shah",
    scopeType: "Operational",
    priority: "Low",
    status: "Draft",
    startDate: "2026-01-26",
    dueDate: "2026-03-18",
  },
  {
    id: "scope-006",
    scopeName: "Material Impact Verification",
    owner: "Omar Khan",
    scopeType: "Compliance",
    priority: "Medium",
    status: "Approved",
    startDate: "2026-02-01",
    dueDate: "2026-03-08",
  },
  {
    id: "scope-007",
    scopeName: "Packaging Reduction Initiative",
    owner: "Rachel Wong",
    scopeType: "Reduction Program",
    priority: "High",
    status: "In Review",
    startDate: "2026-02-16",
    dueDate: "2026-04-01",
  },
];

function statusBadge(status: ScopeRow["status"]) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "Approved" && "bg-success/20 text-success",
        status === "In Review" && "bg-warning/20 text-warning",
        status === "Draft" && "bg-scope-surfaceMuted text-scope-textMuted",
      )}
    >
      {status}
    </span>
  );
}

function priorityBadge(priority: ScopeRow["priority"]) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        priority === "Critical" && "bg-error/20 text-error",
        priority === "High" && "bg-warning/20 text-warning",
        priority === "Medium" && "bg-scope-primary/20 text-scope-primary",
        priority === "Low" && "bg-success/20 text-success",
      )}
    >
      {priority}
    </span>
  );
}

export default function ProjectsPage() {
  const [rows, setRows] = useState<ScopeRow[]>(initialRows);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const columns: DataTableColumn<ScopeRow>[] = useMemo(
    () => [
      {
        key: "scopeName",
        header: "Scope",
        sortable: true,
      },
      {
        key: "owner",
        header: "Owner",
        sortable: true,
      },
      {
        key: "scopeType",
        header: "Type",
        sortable: true,
      },
      {
        key: "priority",
        header: "Priority",
        sortable: true,
        accessor: (row) => priorityBadge(row.priority),
        sortValue: (row) => row.priority,
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        accessor: (row) => statusBadge(row.status),
        sortValue: (row) => row.status,
      },
      {
        key: "dueDate",
        header: "Due Date",
        sortable: true,
      },
    ],
    [],
  );

  function handleCreated(values: CreateScopeValues) {
    const newRow: ScopeRow = {
      id: `scope-${Date.now()}`,
      scopeName: values.scopeName,
      owner: values.owner,
      scopeType: values.scopeType,
      priority: values.priority,
      status: "Draft",
      startDate: values.startDate,
      dueDate: values.dueDate,
    };

    setRows((prev) => [newRow, ...prev]);
    setIsPanelOpen(false);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-scope-text">Projects</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-scope-textMuted">
            Manage complex scope lifecycles, ownership, and approvals.
          </p>
        </div>
        <Button onClick={() => setIsPanelOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Scope
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scope Registry</CardTitle>
          <CardDescription>
            Sort, review, and paginate all active scope records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            pageSize={5}
          />
        </CardContent>
      </Card>

      <SlideOver
        open={isPanelOpen}
        title="Create Scope"
        description="Capture the scope details without leaving this page."
        onClose={() => setIsPanelOpen(false)}
      >
        <CreateScopeForm
          onCreated={handleCreated}
          onCancel={() => setIsPanelOpen(false)}
        />
      </SlideOver>
    </section>
  );
}
