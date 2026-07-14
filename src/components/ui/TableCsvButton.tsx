"use client";

import { useRef } from "react";
import { Download } from "lucide-react";
import { downloadTableCsv } from "@/lib/tableCsv";
import { cn } from "@/lib/utils";

interface Props {
  filename: string;
  title?: string;
  className?: string;
}

/** Small download-CSV icon for data tables. It locates the table on its own —
 *  climbs to the nearest ancestor containing a <table> — so a table only needs
 *  this dropped into its card, no data wiring. */
export function TableCsvButton({ filename, title = "Download CSV", className }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    let node: HTMLElement | null = ref.current?.parentElement ?? null;
    let table: HTMLTableElement | null = null;
    while (node && !table) {
      table = node.querySelector("table");
      node = node.parentElement;
    }
    if (table) downloadTableCsv(table, filename);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-200",
        className,
      )}
    >
      <Download className="h-4 w-4" />
    </button>
  );
}
