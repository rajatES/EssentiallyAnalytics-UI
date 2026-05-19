import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusMixEntry } from "../types";

const PALETTE = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#a855f7"];

interface Props {
  data: { source: StatusMixEntry[]; allotment: StatusMixEntry[] } | undefined;
  isLoading: boolean;
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold text-gray-900 dark:text-white">{d.status}</p>
      <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>
        {d.count.toLocaleString()} ({d.percentage}%)
      </p>
    </div>
  );
}

function StatusDonut({ title, items }: { title: string; items: StatusMixEntry[] }) {
  const chartData = items.map((item, i) => ({
    ...item,
    fill: PALETTE[i % PALETTE.length],
  }));

  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h4>
      <div className="flex items-center gap-4">
        <div className="h-48 w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                strokeWidth={2}
                stroke="#fff"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1.5 overflow-hidden">
          {chartData.slice(0, 8).map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ backgroundColor: item.fill }} />
              <span className="truncate text-xs text-gray-700 dark:text-gray-300">{item.status}</span>
              <span className="ml-auto text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                {item.count.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StatusDistribution({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Status Distribution</h3>
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          {isLoading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Status Distribution</h3>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {data.source?.length > 0 && <StatusDonut title="Source Sheet" items={data.source} />}
        {data.allotment?.length > 0 && <StatusDonut title="Allotment Sheet" items={data.allotment} />}
        {!data.source?.length && !data.allotment?.length && (
          <div className="col-span-full flex h-48 items-center justify-center text-sm text-gray-400">No data</div>
        )}
      </div>
    </div>
  );
}
