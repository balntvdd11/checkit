import type { AttendanceStatus, SessionStatus } from "../../types";
import { cn } from "../../lib/utils";

// ─── Status Badge ─────────────────────────────────────────────────────────────

export default function StatusBadge({ status }: { status: AttendanceStatus | SessionStatus }) {
  const cfg: Record<string, { label: string; cls: string; dot: string }> = {
    present:   { label: "Present",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
    late:      { label: "Late",      cls: "bg-[#E6F4FF] text-[#0B2A4D] border border-[#A8D6FF]",       dot: "bg-[#2A84D2]" },
    absent:    { label: "Absent",    cls: "bg-[#F8F4EF] text-[#7A6268] border border-[#D7D5D0]",             dot: "bg-[#0B2A4D]" },
    active:    { label: "Active",    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
    completed: { label: "Completed", cls: "bg-gray-50 text-gray-500 border border-gray-200",          dot: "bg-gray-400" },
    inactive:  { label: "Inactive",  cls: "bg-gray-50 text-gray-400 border border-gray-200",          dot: "bg-gray-300" },
  };
  const c = cfg[status] ?? cfg.inactive;
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5", c.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}
