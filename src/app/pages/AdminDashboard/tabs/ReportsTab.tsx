import { useState } from "react";
import { Download, Filter, FileText, Calendar, Building2, Search } from "lucide-react";
import Card from "../../../components/shared/Card";
import StatusBadge from "../../../components/shared/StatusBadge";
import type { EventConfig } from "../../../types";
import { useSelectors } from "../../../state/store";
import { formatTime12Hour, formatNameLastFirst } from "../../../lib/utils";

declare global {
  interface Window {
    jspdf: any;
  }
}

export default function ReportsTab({ events }: { events: EventConfig[] }) {
  const [reportEVENTS, setReportEVENTS] = useState("");
  const [reportSectionFilter, setReportSectionFilter] = useState("All");
  const [reportDateFilter, setReportDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { attendance } = useSelectors();

  const filteredReports = attendance.filter(r => {
    const matchSec = reportSectionFilter === "All" || r.section === reportSectionFilter;
    const matchDate = !reportDateFilter || r.date === reportDateFilter;
    const matchEvent = !reportEVENTS || r.EVENTSCode === events.find(ev => ev.id === reportEVENTS)?.checkItCode;
    const matchSearch = !searchQuery || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSec && matchDate && matchEvent && matchSearch;
  }).sort((a, b) => {
    const nameA = formatNameLastFirst(a.name).toLowerCase();
    const nameB = formatNameLastFirst(b.name).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const reportPresent = filteredReports.filter(r => r.status === "present").length;
  const reportLate = filteredReports.filter(r => r.status === "late").length;
  const reportAbsent = filteredReports.filter(r => r.status === "absent").length;
  const reportTotal = filteredReports.length;

  const handleExportCSV = () => {
    if (filteredReports.length === 0) return alert("No data to export.");
    const selectedEventName = reportEVENTS ? events.find(ev => ev.id === reportEVENTS)?.name : null;
    const headers = ["Student Name", "ID", "Section", "Date", "Time In", "Time Out", "Status"];
    const rows = filteredReports.map(r => [formatNameLastFirst(r.name), r.studentId, r.section, r.date, formatTime12Hour(r.timeIn), r.timeOut ? formatTime12Hour(r.timeOut) : "Did Not Time-out", r.status]);
    
    let csvContent = "";
    if (selectedEventName) {
      csvContent += `Event:,${selectedEventName}\n\n`;
    }
    csvContent += [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredReports.length === 0) return alert("No data to export.");
    if (!window.jspdf) return alert("PDF generator is still loading. Please try again in a moment.");
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const selectedEventName = reportEVENTS ? events.find(ev => ev.id === reportEVENTS)?.name : null;

    doc.text("COAccess Attendance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    let startY = 30;
    if (selectedEventName) {
      doc.text(`Event: ${selectedEventName}`, 14, 29);
      startY = 35;
    }
    
    // The autotable plugin automatically attaches itself to the jsPDF instance via window
    if (typeof doc.autoTable !== "function") {
      alert("PDF table generator failed to load.");
      return;
    }

    doc.autoTable({
      startY,
      head: [["Student Name", "ID", "Section", "Date", "Time In", "Time Out", "Status"]],
      body: filteredReports.map(r => [formatNameLastFirst(r.name), r.studentId, r.section, r.date, formatTime12Hour(r.timeIn), r.timeOut ? formatTime12Hour(r.timeOut) : "Did Not Time-out", r.status]),
    });
    
    doc.save("attendance_report.pdf");
  };



  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Attendance Reports</h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleExportCSV} className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors border border-indigo-100 flex items-center justify-center gap-2 text-sm shadow-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handleExportPDF} className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl transition-colors border border-rose-100 flex items-center justify-center gap-2 text-sm shadow-sm">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      <Card className="p-5 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Building2 size={14} /> Select Event / EVENTS
              </label>
              <select value={reportEVENTS} onChange={e => setReportEVENTS(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="">All Events</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name}{e.status !== "active" ? ` — Ended` : ""}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Filter size={14} /> Section Filter
            </label>
            <select value={reportSectionFilter} onChange={e => setReportSectionFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="All">All Sections</option>
              <optgroup label="First Year">
                <option value="BSA 1A">BSA 1A</option><option value="BSA 1B">BSA 1B</option><option value="BSA 1C">BSA 1C</option><option value="BSA 1D">BSA 1D</option>
              </optgroup>
              <optgroup label="Second Year">
                <option value="BSA 2A">BSA 2A</option><option value="BSA 2B">BSA 2B</option><option value="BSAIS 2A">BSAIS 2A</option>
              </optgroup>
              <optgroup label="Third Year">
                <option value="BSA 3A">BSA 3A</option><option value="BSAIS 3A">BSAIS 3A</option><option value="BSAIS 3B">BSAIS 3B</option>
              </optgroup>
              <optgroup label="Fourth Year">
                <option value="BSA 4A">BSA 4A</option><option value="BSAIS 4A">BSAIS 4A</option>
              </optgroup>
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
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 shrink-0">
            <FileText size={16} className="text-indigo-600" /> Detailed Records
          </h3>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name or ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100 whitespace-nowrap">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">ID / Section</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time In</th>
                <th className="px-5 py-3">Time Out</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                  <td className="px-5 py-3 font-semibold text-slate-700">{formatNameLastFirst(r.name)}</td>
                  <td className="px-5 py-3">
                    <p className="font-mono text-slate-600">{r.studentId}</p>
                    <p className="text-xs text-slate-400">{r.section}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.date}</td>
                  <td className="px-5 py-3 font-mono text-slate-600">{formatTime12Hour(r.timeIn)}</td>
                  <td className="px-5 py-3 font-mono text-slate-600">{r.timeOut ? formatTime12Hour(r.timeOut) : "Did Not Time-out"}</td>
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
