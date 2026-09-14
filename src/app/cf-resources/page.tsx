"use client";

import { useCallback, useMemo, useState } from "react";
import type { ResourcePerson, ResourceStatus } from "@/features/critical-flow/types";
import {
  useCfResourceBoard,
  useCfResourceHealth,
  useCfResourceSummary,
} from "@/features/critical-flow/hooks/useCriticalFlowData";
import ResourcesHeader, { type RoleFilter } from "@/features/cf-resources/components/ResourcesHeader";
import DivisionSummaryStrip from "@/features/cf-resources/components/DivisionSummaryStrip";
import ResourceBoard from "@/features/cf-resources/components/ResourceBoard";
import FindResourcePanel from "@/features/cf-resources/components/FindResourcePanel";
import ProfileModal from "@/features/cf-resources/components/ProfileModal";
import ScheduleHealthCard from "@/features/cf-resources/components/ScheduleHealthCard";
import ResourcesSkeleton from "@/features/cf-resources/components/ResourcesSkeleton";
import { useRole } from "@/hooks/useRole";

/** Today in the desk's zone (IST), matching how the API defines "today". */
function todayIst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

interface FindInit {
  division?: string;
  role?: "writer" | "editor";
  forPerson?: string;
}

export default function CfResourcesPage() {
  const { canAccess } = useRole();
  const today = useMemo(todayIst, []);

  const [date, setDate] = useState("");
  const [divisions, setDivisions] = useState<string[]>([]);
  const [role, setRole] = useState<RoleFilter>("all");
  const [statuses, setStatuses] = useState<ResourceStatus[]>([]);
  const [query, setQuery] = useState("");
  const [find, setFind] = useState<{ open: boolean; key: number; init: FindInit }>({
    open: false,
    key: 0,
    init: {},
  });
  const [profilesOpen, setProfilesOpen] = useState(false);

  const dateParam = date || undefined;
  const summary = useCfResourceSummary(dateParam);
  const board = useCfResourceBoard({ date: dateParam, divisions, role, statuses, q: query });
  const health = useCfResourceHealth();

  // Every division anyone belongs to, plus Associate for the float pool.
  const allDivisions = useMemo(() => {
    const s = new Set<string>();
    summary.data?.divisions.forEach((d) => s.add(d.division));
    board.data?.people.forEach((p) => s.add(p.primaryDivision));
    return [...s].sort();
  }, [summary.data, board.data]);

  const toggle = <T,>(setter: (f: (prev: T[]) => T[]) => void) => (v: T) =>
    setter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const openFind = useCallback((init: FindInit = {}) => {
    setFind((f) => ({ open: true, key: f.key + 1, init }));
  }, []);

  const findCoverFor = useCallback(
    (p: ResourcePerson) =>
      openFind({
        division: p.primaryDivision === "Associate" ? undefined : p.primaryDivision,
        role: p.roleGroup === "editor" || p.roleGroup === "writer" ? p.roleGroup : undefined,
        forPerson: p.name,
      }),
    [openFind],
  );

  if (summary.isLoading && board.isLoading && !summary.data && !board.data) {
    return <ResourcesSkeleton />;
  }

  const contentDivisions = summary.data?.divisions.map((d) => d.division) ?? allDivisions;

  return (
    <div className="min-h-screen space-y-4 px-4 pb-6 pt-4 lg:px-6">
      <ResourcesHeader
        date={date}
        onDate={setDate}
        today={today}
        weekday={board.data?.weekday ?? summary.data?.weekday}
        currentShift={summary.data?.currentShift}
        divisions={allDivisions}
        selectedDivisions={divisions}
        onToggleDivision={toggle<string>(setDivisions)}
        onClearDivisions={() => setDivisions([])}
        role={role}
        onRole={setRole}
        statuses={statuses}
        onToggleStatus={toggle<ResourceStatus>(setStatuses)}
        counts={board.data?.counts}
        query={query}
        onQuery={setQuery}
        onFind={() => openFind({ division: divisions[0] })}
        onEditQuotas={() => setProfilesOpen(true)}
        canEdit={canAccess("management")}
      />

      <DivisionSummaryStrip
        data={summary.data}
        isLoading={summary.isLoading}
        selectedDivisions={divisions}
        onPick={toggle<string>(setDivisions)}
      />

      <ResourceBoard data={board.data} isLoading={board.isLoading} onFindCover={findCoverFor} />

      <ScheduleHealthCard data={health.data} isLoading={health.isLoading} />

      {find.open && (
        <FindResourcePanel
          key={find.key}
          open
          onClose={() => setFind((f) => ({ ...f, open: false }))}
          divisions={contentDivisions}
          people={board.data?.people ?? []}
          date={dateParam}
          initialDivision={find.init.division}
          initialRole={find.init.role}
          initialForPerson={find.init.forPerson}
        />
      )}

      <ProfileModal open={profilesOpen} onClose={() => setProfilesOpen(false)} />
    </div>
  );
}
