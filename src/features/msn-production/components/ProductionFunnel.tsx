import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import type { FunnelStage } from "../types";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

interface Props {
  data: FunnelStage[] | undefined;
  isLoading: boolean;
}

function FunnelTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as FunnelStage;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{d.stage}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {d.count.toLocaleString()} items ({d.percentage}% of allotted)
      </p>
      {d.dropOff > 0 && (
        <p className="text-xs text-red-500">Drop-off: {d.dropOff.toLocaleString()}</p>
      )}
    </div>
  );
}

export default function ProductionFunnel({ data, isLoading }: Props) {
  if (isLoading || !data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Production Funnel</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Production Funnel</h3>

      <div className="mb-4 flex items-center gap-2">
        {data.map((stage, i) => (
          <div key={stage.stage} className="flex items-center gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stage.count.toLocaleString()}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{stage.stage}</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">{stage.percentage}%</p>
            </div>
            {i < data.length - 1 && (
              <div className="flex flex-col items-center px-2">
                <span className="text-gray-300 dark:text-gray-600">→</span>
                {stage.dropOff > 0 && (
                  <span className="text-[9px] text-red-400">-{stage.dropOff}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="stage"
              width={70}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <Tooltip content={<FunnelTooltip />} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                formatter={(v: any) => Number(v).toLocaleString()}
                style={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
