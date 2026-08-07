function csvField(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return /[",\n]/.test(clean) ? `"${clean.replace(/"/g, '""')}"` : clean;
}

/** Serialize a rendered <table> to CSV using its visible cell text. Reads
 *  thead/tbody/tfoot rows in document order, so collapsed/hidden rows are
 *  naturally excluded and the export mirrors exactly what the user sees. */
export function serializeTableToCsv(table: HTMLTableElement): string {
  const lines: string[] = [];
  for (const row of Array.from(table.rows)) {
    const cells = Array.from(row.cells).map((cell) =>
      csvField(cell.textContent ?? ""),
    );
    if (cells.some((c) => c.length > 0)) lines.push(cells.join(","));
  }
  return lines.join("\n");
}

/** Trigger a browser download for a ready-made CSV string. Appends the current
 *  date to the filename so repeated exports don't clobber each other. */
export function triggerCsvDownload(csv: string, filename: string) {
  if (!csv) return;

  const stamp = new Date().toISOString().slice(0, 10);
  const base = filename.replace(/\.csv$/i, "");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${base}_${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTableCsv(table: HTMLTableElement, filename: string) {
  triggerCsvDownload(serializeTableToCsv(table), filename);
}

type CsvCell = string | number | null | undefined;

/** Build a CSV from a header row + data rows and download it. Each cell is
 *  escaped, so values containing commas (e.g. a UTM-mediums list) are quoted. */
export function downloadRowsCsv(
  headers: string[],
  rows: CsvCell[][],
  filename: string,
) {
  const toLine = (cells: CsvCell[]) =>
    cells.map((c) => csvField(c == null ? "" : String(c))).join(",");
  const csv = [toLine(headers), ...rows.map(toLine)].join("\n");
  triggerCsvDownload(csv, filename);
}
