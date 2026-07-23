import { LayoutDashboard, Users, Hash, UsersRound, BookOpen } from "lucide-react";
import Card from "../../../components/shared/Card";
import StatusBadge from "../../../components/shared/StatusBadge";
import { useSelectors } from "../../../state/store";
import { formatTime12Hour } from "../../../lib/utils";

export default function DashboardTab() {
  const { activeEvents, totalStudents, totalRecords, events } = useSelectors();
  const activeEVENTSCount = activeEvents.length;
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <LayoutDashboard size={24} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{activeEVENTSCount}</p>
            <p className="text-xs text-slate-500 font-medium">Active Events</p>
          </div>
        </Card>
        <Card className="p-5 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <Users size={24} className="text-sky-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
            <p className="text-xs text-slate-500 font-medium">Total Students</p>
          </div>
        </Card>
        <Card className="p-5 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Hash size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalRecords}</p>
            <p className="text-xs text-slate-500 font-medium">Total Records</p>
          </div>
        </Card>
      </div>

      <h3 className="text-lg font-bold text-[#123499] mt-8 mb-4">Today's Events</h3>
      <Card className="border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Event Name</th>
                <th className="px-5 py-4">Schedule</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {events.filter(evt => evt.status === 'active').map((evt, idx) => (
                <tr key={evt.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-700">{evt.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">&nbsp;</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    {formatTime12Hour(evt.timeIn)} – {formatTime12Hour(evt.timeOut)}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={evt.status as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
