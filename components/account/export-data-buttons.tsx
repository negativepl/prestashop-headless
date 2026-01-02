"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportDataButtons() {
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null);

  const handleExport = async (format: "pdf" | "csv") => {
    setLoadingFormat(format);

    try {
      const response = await fetch(`/api/account/export?format=${format}`);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moje-dane-${new Date().toISOString().split('T')[0]}.${format === "pdf" ? "html" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Wystąpił błąd podczas eksportu danych");
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("pdf")}
        disabled={loadingFormat !== null}
      >
        {loadingFormat === "pdf" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        Pobierz jako PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("csv")}
        disabled={loadingFormat !== null}
      >
        {loadingFormat === "csv" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        Pobierz jako CSV
      </Button>
    </div>
  );
}
