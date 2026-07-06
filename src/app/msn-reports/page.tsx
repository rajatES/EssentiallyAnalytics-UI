"use client";

import { FileBarChart } from "lucide-react";
import ReportsView from "@/features/msn-production/components/reports/ReportsView";

export default function MsnReportsPage() {
  return (
    <div className="min-h-screen space-y-4 px-4 pb-6 pt-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <FileBarChart size={18} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            MSN Reports
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Syndication numbers from the MSN Partner Hub scraper — EOD, EOW and MTD
          </p>
        </div>
      </div>

      <ReportsView />
    </div>
  );
}
