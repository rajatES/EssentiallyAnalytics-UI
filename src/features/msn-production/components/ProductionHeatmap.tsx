import { useState, useMemo } from "react";
import type { HeatmapCell } from "../types";

interface Props {
  data: HeatmapCell[] | undefined;
  isLoading: boolean;
  type: string;
  onTypeChange: (t: string) => void;
}

function getIntensityClass(value: number, max: number): string {
  if (max === 0 || value === 0) return "bg-gray-50 dark:bg-gray-800";
  const ratio = value / max;
  if (ratio < 0.15) return "bg-indigo-50 dark:bg-indigo-950";
  if (ratio < 0.3) return "bg-indigo-100 dark:bg-indigo-900";
  if (ratio < 0.5) return "bg-indigo-200 dark:bg-indigo-800";
  if (ratio < 0.7) return "bg-indigo-400 dark:bg-indigo-600 text-white";
  return "bg-indigo-600 dark:bg-indigo-400 text-white dark:text-gray-900";
}

export default function ProductionHeatmap({ data, isLoading, type, onTypeChange }: Props) {
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string; value: number } | null>(null);

  const { rows, cols, matrix, maxVal } = useMemo(() => {
    if (!data?.length) return { rows: [], cols: [], matrix: new Map<string, number>(), maxVal: 0 };

    const rowSet = new Set<string>();
    const colSet = new Set<string>();
    const m = new Map<string, number>();
    let max = 0;

    for (const cell of data) {
      rowSet.add(cell.row);
      colSet.add(cell.col);
      const key = `${cell.row}|${cell.col}`;
      m.set(key, (m.get(key) ?? 0) + cell.value);
      max = Math.max(max, m.get(key)!);
    }

    const rowTotals = new Map<string, number>();
    for (const r of rowSet) {
      let total = 0;
      for (const c of colSet) total += m.get(`${r}|${c}`) ?? 0;
      rowTotals.set(r, total);
    }

    const sortedRows = [...rowSet].sort((a, b) => (rowTotals.get(b) ?? 0) - (rowTotals.get(a) ?? 0));
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const sortedCols = type === "calendar"
      ? [...colSet].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
      : [...colSet].sort((a, b) => {
          let ta = 0, tb = 0;
          for (const r of rowSet) {
            ta += m.get(`${r}|${a}`) ?? 0;
            tb += m.get(`${r}|${b}`) ?? 0;
          }
          return tb - ta;
        });

    return { rows: sortedRows, cols: sortedCols, matrix: m, maxVal: max };
  }, [data, type]);

  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Production Heatmap</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Production Heatmap</h3>
        <div className="flex items-center gap-3">
          {hoveredCell && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {hoveredCell.row} × {hoveredCell.col}: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{hoveredCell.value}</span>
            </span>
          )}
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="feed-writer">Feed × Writer</option>
            <option value="calendar">Writer × Day of Week</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-2 py-1 text-left text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {type === "calendar" ? "Writer" : "Feed"}
              </th>
              {cols.map((col) => (
                <th key={col} className="whitespace-nowrap px-1 py-1 text-center font-medium text-gray-500 dark:text-gray-400">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 30).map((row) => (
              <tr key={row}>
                <td className="sticky left-0 z-10 bg-white px-2 py-1 font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300 whitespace-nowrap">
                  {row}
                </td>
                {cols.map((col) => {
                  const val = matrix.get(`${row}|${col}`) ?? 0;
                  return (
                    <td
                      key={col}
                      className={`px-1 py-1 text-center ${getIntensityClass(val, maxVal)} transition-colors`}
                      onMouseEnter={() => setHoveredCell({ row, col, value: val })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {val > 0 ? val : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <span className="inline-block h-3 w-3 rounded-sm bg-gray-50 dark:bg-gray-800" />
        <span className="inline-block h-3 w-3 rounded-sm bg-indigo-100 dark:bg-indigo-900" />
        <span className="inline-block h-3 w-3 rounded-sm bg-indigo-200 dark:bg-indigo-800" />
        <span className="inline-block h-3 w-3 rounded-sm bg-indigo-400 dark:bg-indigo-600" />
        <span className="inline-block h-3 w-3 rounded-sm bg-indigo-600 dark:bg-indigo-400" />
        <span>More</span>
      </div>
    </div>
  );
}
