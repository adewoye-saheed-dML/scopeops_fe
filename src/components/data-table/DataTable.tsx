"use client";

import { ReactNode, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  accessor?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
};

type DataTableProps<T> = {
  title?: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
};

export default function DataTable<T>({
  title,
  columns,
  rows,
  rowKey,
  pageSize = 6,
  loading = false,
  emptyMessage = "No data available.",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;

    const column = columns.find((item) => item.key === sortKey);
    if (!column) return rows;

    const getValue = (row: T) => {
      if (column.sortValue) return column.sortValue(row);
      if (column.accessor) return String(column.accessor(row));
      const value = (row as Record<string, unknown>)[column.key];
      return typeof value === "number" ? value : String(value ?? "");
    };

    const copy = [...rows];
    copy.sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return copy;
  }, [rows, columns, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function toggleSort(column: DataTableColumn<T>) {
    if (!column.sortable) return;

    setPage(1);
    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDirection("asc");
      return;
    }

    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  return (
    <div className="space-y-3">
      {title ? (
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-scope-textMuted">
          {title}
        </h3>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-scope-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-scope-border">
            <thead className="bg-slate-100/80 dark:bg-scope-surfaceMuted/60">
              <tr>
                {columns.map((column) => {
                  const isActiveSort = sortKey === column.key;
                  return (
                    <th
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-scope-textMuted",
                        column.className,
                      )}
                    >
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-sm px-1 py-0.5",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary",
                          column.sortable
                            ? "cursor-pointer text-slate-800 hover:text-scope-primary dark:text-scope-text"
                            : "cursor-default",
                        )}
                        onClick={() => toggleSort(column)}
                      >
                        {column.header}
                        {column.sortable ? (
                          isActiveSort ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )
                        ) : null}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 bg-white/60 dark:divide-scope-border/70 dark:bg-scope-surface/40">
              {pagedRows.length ? (
                pagedRows.map((row) => (
                  <tr key={rowKey(row)} className="transition-colors hover:bg-slate-50 dark:hover:bg-scope-bg/50">
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3 text-sm text-slate-800 dark:text-scope-text", column.className)}>
                        {column.accessor
                          ? column.accessor(row)
                          : String((row as Record<string, unknown>)[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-sm text-slate-500 dark:text-scope-textMuted"
                  >
                    {loading ? "Loading..." : emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-scope-textMuted">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
