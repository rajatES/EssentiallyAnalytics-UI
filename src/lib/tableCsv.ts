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

export function downloadTableCsv(table: HTMLTableElement, filename: string) {
  const csv = serializeTableToCsv(table);
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
