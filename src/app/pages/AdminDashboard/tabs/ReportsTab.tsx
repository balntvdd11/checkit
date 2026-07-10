import { useState } from "react";
import { Download, Filter, FileText, Calendar, Building2 } from "lucide-react";
import Card from "../../../components/shared/Card";
import StatusBadge from "../../../components/shared/StatusBadge";
import { MOCK_REPORT_RECORDS } from "../../../constants/mockData";
import type { EventConfig } from "../../../types";

export default function ReportsTab({ events }: { events: EventConfig[] }) {
  const [reportSession, setReportSession] = useState("");
  const [reportSectionFilter, setReportSectionFilter] = useState("All");
  const [reportDateFilter, setReportDateFilter] = useState("");

  const filteredReports = MOCK_REPORT_RECORDS.filter(r => {
    const matchSec = reportSectionFilter === "All" || r.section === reportSectionFilter;
    const matchDate = !reportDateFilter || r.date === reportDateFilter;
    return matchSec && matchDate;
  });

  const reportPresent = filteredReports.filter(r => r.status === "present").length;
  const reportLate = filteredReports.filter(r => r.status === "late").length;
  const reportAbsent = filteredReports.filter(r => r.status === "absent").length;
  const reportTotal = filteredReports.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Attendance Reports</h2>
          <p className="text-sm text-white mt-1">Export and analyze attendance data for events and sessions</p>
        </div>
        <button className="w-full sm:w-auto px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors border border-indigo-100 flex items-center justify-center gap-2 text-sm shadow-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <Card className="p-5 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Building2 size={14} /> Select Event / Session
            </label>
            <select value={reportSession} onChange={e => setReportSession(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="">All Events & Sessions</option>
              <optgroup label="Events">
                {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </optgroup>
              <optgroup label="Academic Sessions">
                <option value="s1">CIT-2025-042 (BSIT 3A)</option>
                <option value="s2">CIT-2025-041 (BSIT 3B)</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Filter size={14} /> Section Filter
            </label>
            <select value={reportSectionFilter} onChange={e => setReportSectionFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="All">All Sections</option>
              <option value="BSIT 2A">BSIT 2A</option>
              <option value="BSIT 3A">BSIT 3A</option>
              <option value="BSIT 3B">BSIT 3B</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Calendar size={14} /> Date Filter
            </label>
            <input type="date" value={reportDateFilter} onChange={e => setReportDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-100 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-slate-800">{reportTotal}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Total Records</p>
        </Card>
        <Card className="p-4 border border-emerald-100 bg-emerald-50 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-emerald-700">{reportPresent}</p>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-1">Present</p>
        </Card>
        <Card className="p-4 border border-amber-100 bg-amber-50 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-amber-700">{reportLate}</p>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mt-1">Late</p>
        </Card>
        <Card className="p-4 border border-rose-100 bg-rose-50 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-rose-700">{reportAbsent}</p>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide mt-1">Absent</p>
        </Card>
      </div>

      <Card className="border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" /> Detailed Records
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">ID / Section</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time In</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-700">{r.name}</td>
                  <td className="px-5 py-3">
                    <p className="font-mono text-slate-600">{r.studentId}</p>
                    <p className="text-xs text-slate-400">{r.section}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.date}</td>
                  <td className="px-5 py-3 font-mono text-slate-600">{r.timeIn}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
