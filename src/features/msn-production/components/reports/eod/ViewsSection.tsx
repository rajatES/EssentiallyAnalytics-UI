"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { EodReportRow, ReportsConfig } from "../../../types";
import { fmtCompact, fmtInt } from "../../../format";
import { ReportCard } from "../shared";
import {
  CONTENT_TYPES,
  DEFAULT_REGION_TIERS,
  TYPE_COLOR,
  TYPE_LABEL,
  shortName,
  tierViews,
  typeTotal,
} from "./helpers";

interface Props {
  rows: EodReportRow[];
  config?: ReportsConfig;
}

const TOP_OPTIONS = [10, 20, 0]; // 0 = all

function Legend() {
  return (
    <div className="flex items-center gap-3">
      {CONTENT_TYPES.map((t) => (
        <span
          key={t}
          className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500"
        >
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: TYPE_COLOR[t] }}
          />
          {TYPE_LABEL[t]}
        </span>
      ))}
    </div>
  );
}

export default function ViewsSection({ rows, config }: Props) {
  const [topN, setTopN] = useState(10);

  // Grand totals per content type + overall.
  const totals = useMemo(() => {
    const t = { Article: 0, Gallery: 0, Video: 0 };
    for (const r of rows) {
      t.Article += typeTotal(r, "Article");
      t.Gallery += typeTotal(r, "Gallery");
      t.Video += typeTotal(r, "Video");
    }
    return { ...t, all: t.Article + t.Gallery + t.Video };
  }, [rows]);

  // Chart data: feeds ranked by total views.
  const chartData = useMemo(() => {
    const mapped = rows.map((r) => ({
      name: shortName(config, r.publication),
      full: r.publication,
      Article: typeTotal(r, "Article"),
      Gallery: typeTotal(r, "Gallery"),
      Video: typeTotal(r, "Video"),
      total:
        typeTotal(r, "Article") + typeTotal(r, "Gallery") + typeTotal(r, "Video"),
    }));
    mapped.sort((a, b) => b.total - a.total);
    return topN > 0 ? mapped.slice(0, topN) : mapped;
  }, [rows, config, topN]);

  // Region-tier breakdown per content type.
  const tierData = useMemo(() => {
    const tiers = config?.regionTiers ?? DEFAULT_REGION_TIERS;
    const tierKeys = Object.keys(tiers);
    return CONTENT_TYPES.map((type) => {
      const perTier = tierKeys.map((tk) => {
        let sum = 0;
        for (const r of rows) sum += tierViews(r, type, tiers[tk]) ?? 0;
        return { tier: tk, value: sum };
      });
      const total = perTier.reduce((a, b) => a + b.value, 0);
      return { type, perTier, total };
    });
  }, [rows, config]);

  const chartHeight = Math.max(chartData.length * 30 + 40, 200);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      {/* Views by feed — stacked bar */}
      <div className="xl:col-span-3">
        <ReportCard title="Views by feed" subtitle="Ranked by total views · stacked by content type">
          <div className="mb-3 flex items-center justify-between">
            <Legend />
            <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
              {TOP_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setTopN(n)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    topN === n
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {n === 0 ? "All" : `Top ${n}`}
                </button>
              ))}
            </div>
          </div>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-xs text-gray-400">No view data</p>
          ) : (
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#9ca3af22"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => fmtCompact(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#6366f111" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                      background: "var(--tooltip-bg, #fff)",
                    }}
                    formatter={(value, name) => [
                      fmtInt(typeof value === "number" ? value : Number(value)),
                      TYPE_LABEL[name as keyof typeof TYPE_LABEL] ?? String(name),
                    ]}
                  />
                  {CONTENT_TYPES.map((t) => (
                    <Bar
                      key={t}
                      dataKey={t}
                      stackId="views"
                      fill={TYPE_COLOR[t]}
                      radius={t === "Video" ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ReportCard>
      </div>

      {/* Right column: content-type share + region tier split */}
      <div className="space-y-4 xl:col-span-2">
        <ReportCard title="Content-type share" subtitle="Total views by type">
          <div className="space-y-3">
            {CONTENT_TYPES.map((t) => {
              const v = totals[t];
              const pct = totals.all > 0 ? (v / totals.all) * 100 : 0;
              return (
                <div key={t}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{ background: TYPE_COLOR[t] }}
                      />
                      {TYPE_LABEL[t]}
                    </span>
                    <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                      {fmtInt(v)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: TYPE_COLOR[t] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ReportCard>

        <ReportCard
          title="Views by region tier"
          subtitle="T1 US/UK/CA/AU/NZ · T2 MY/PH/SG · T3 IN"
        >
          <div className="space-y-3">
            {tierData.map((d) => (
              <div key={d.type}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {TYPE_LABEL[d.type]}
                  </span>
                  <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">
                    {fmtInt(d.total)}
                  </span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  {d.perTier.map((pt, i) => {
                    if (!pt.value || d.total === 0) return null;
                    // Tiers shaded via opacity of the type colour.
                    const opacity = [1, 0.6, 0.3][i] ?? 0.3;
                    return (
                      <div
                        key={pt.tier}
                        style={{
                          width: `${(pt.value / d.total) * 100}%`,
                          background: TYPE_COLOR[d.type],
                          opacity,
                        }}
                        title={`${pt.tier}: ${fmtInt(pt.value)}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-1">
              {Object.keys(config?.regionTiers ?? DEFAULT_REGION_TIERS).map(
                (tk, i) => (
                  <span
                    key={tk}
                    className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500"
                  >
                    <span
                      className="h-2 w-2 rounded-sm bg-gray-500"
                      style={{ opacity: [1, 0.6, 0.3][i] ?? 0.3 }}
                    />
                    {tk}
                  </span>
                ),
              )}
            </div>
          </div>
        </ReportCard>
      </div>
    </div>
  );
}
