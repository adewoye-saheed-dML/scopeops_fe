"use client";

import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import { CloudUpload, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui";

type CsvRow = {
  id: string;
} & Record<string, string>;

type CsvUploaderProps = {
  onUploaded: () => void;
  onCancel: () => void;
};

type ApiErrorResponse = {
  detail?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

function normalizeCsvRows(rawRows: Record<string, unknown>[]) {
  return rawRows.map((row, index) => {
    const normalized: CsvRow = { id: `row-${index}` };
    Object.entries(row).forEach(([key, value]) => {
      normalized[key] = value === null || value === undefined ? "" : String(value);
    });
    return normalized;
  });
}

export default function CsvUploader({ onUploaded, onCancel }: CsvUploaderProps) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [allRows, setAllRows] = useState<CsvRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const previewRows = useMemo(() => allRows.slice(0, 5), [allRows]);
  const headers = useMemo(() => {
    if (allRows.length === 0) {
      return [];
    }

    return Object.keys(allRows[0]).filter((key) => key !== "id");
  }, [allRows]);

  const previewColumns = useMemo<DataTableColumn<CsvRow>[]>(() => {
    return headers.map((header) => ({
      key: header,
      header,
      accessor: (row) => row[header] || "",
    }));
  }, [headers]);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) {
      return;
    }

    setParseError(null);
    setFile(selectedFile);

    Papa.parse<Record<string, unknown>>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setAllRows([]);
          setParseError(results.errors[0]?.message || "Failed to parse CSV.");
          return;
        }

        const parsedRows = normalizeCsvRows(results.data);
        setAllRows(parsedRows);
        if (parsedRows.length === 0) {
          toast.info("No rows found", "The CSV has headers but no data rows.");
        }
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "text/csv": [".csv"],
    },
    disabled: isUploading,
  });

  async function handleUpload() {
    if (!file) {
      toast.error("No file selected", "Please choose a CSV file first.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/spend/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("CSV import complete", `${allRows.length} records were ingested.`);
      onUploaded();
    } catch (error: unknown) {
      toast.error("CSV import failed", getErrorMessage(error, "Could not ingest this CSV file."));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-scope-primary bg-scope-primary/10"
            : "border-slate-300 bg-slate-50 hover:border-scope-primary hover:bg-scope-primary/5 dark:border-scope-border dark:bg-scope-bg/30"
        }`}
      >
        <input {...getInputProps()} />
        <CloudUpload className="mx-auto h-8 w-8 text-scope-primary" />
        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-scope-text">
          Drag and drop your ERP export (.csv)
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-scope-textMuted">
          or click to select a file
        </p>
        {file ? (
          <p className="mt-3 text-xs font-medium text-scope-primary">
            Selected: {file.name}
          </p>
        ) : null}
      </div>

      {parseError ? (
        <p className="text-sm font-medium text-error">{parseError}</p>
      ) : null}

      {previewColumns.length > 0 ? (
        <DataTable
          title="CSV Preview (First 5 rows)"
          columns={previewColumns}
          rows={previewRows}
          rowKey={(row) => row.id}
          pageSize={5}
          emptyMessage="No preview rows available."
        />
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ingesting {allRows.length.toLocaleString()} records...
            </>
          ) : (
            "Import CSV"
          )}
        </Button>
      </div>
    </div>
  );
}
