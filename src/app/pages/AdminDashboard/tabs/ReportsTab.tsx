import { useState, useEffect } from "react";
import { Download, Filter, FileText, Calendar, Building2, Search } from "lucide-react";
import Card from "../../../components/shared/Card";
import StatusBadge from "../../../components/shared/StatusBadge";
import type { EventConfig } from "../../../types";
import { useStore, useSelectors } from "../../../state/store";
import { fetchAttendance } from "../../../services/attendance";
import { formatTime12Hour, formatNameLastFirst } from "../../../lib/utils";
import uaLogoUrl from "../../../../asset/UALOGO.png";
import jpiaLogoUrl from "../../../../asset/JPIALOGO.png";

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
  const { attendance, students } = useSelectors();
  const { dispatch } = useStore();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await fetchAttendance();
        dispatch({ type: "SET_ATTENDANCE", payload: data });
      } catch (err) {
        console.error("Failed to auto-refresh attendance data", err);
      }
    }, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const selectedEvent = reportEVENTS ? events.find(ev => ev.id === reportEVENTS) : null;

  /** Build the file-name stem: COAccess_EVENTNAME_YYYY-MM-DD */
  const buildFileName = (ext: string) => {
    const eventPart = selectedEvent ? selectedEvent.name.replace(/[^a-zA-Z0-9]+/g, "_") : "AllEvents";
    const datePart = reportDateFilter || new Date().toISOString().split("T")[0];
    return `COAccess_${eventPart}_${datePart}${ext}`;
  };

  // ── Build combined data: attendance records + absent students ───────────────
  // Absent = registered student with NO timeIn record for the selected event+date
  const buildCombinedRows = () => {
    // Filter attendance records first
    const attendedRows = attendance.filter(r => {
      const matchSec = reportSectionFilter === "All" || r.section === reportSectionFilter;
      const matchDate = !reportDateFilter || r.date === reportDateFilter;
      const matchEvent = !reportEVENTS || r.EVENTSCode === selectedEvent?.checkItCode;
      const matchSearch = !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSec && matchDate && matchEvent && matchSearch;
    });

    // Sort attended alphabetically by surname
    const sortedAttended = [...attendedRows].sort((a, b) => {
      const nameA = formatNameLastFirst(a.name).toLowerCase();
      const nameB = formatNameLastFirst(b.name).toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Determine absent students: registered students who have NO attendance record
    // matching the current filters (event + date)
    const attendedStudentIds = new Set(attendedRows.map(r => r.studentId));

    let absentStudents = students.filter(s => {
      if (attendedStudentIds.has(s.studentId)) return false;
      if (!s.registered) return false;
      const matchSec = reportSectionFilter === "All" || s.section === reportSectionFilter;
      const matchSearch = !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSec && matchSearch;
    });

    // Sort absent alphabetically by surname
    absentStudents = [...absentStudents].sort((a, b) => {
      const nameA = formatNameLastFirst(a.name).toLowerCase();
      const nameB = formatNameLastFirst(b.name).toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return { sortedAttended, absentStudents };
  };

  const { sortedAttended, absentStudents } = buildCombinedRows();

  const reportPresent = sortedAttended.filter(r => r.status === "present").length;
  const reportLate = sortedAttended.filter(r => r.status === "late").length;
  const reportAbsentCount = absentStudents.length;
  const reportTotal = sortedAttended.length + reportAbsentCount;

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (sortedAttended.length === 0 && absentStudents.length === 0) return alert("No data to export.");
    const headers = ["Student Name", "ID", "Section", "Date", "Time In", "Time Out", "Status"];

    let csvContent = "";
    if (selectedEvent) {
      csvContent += `Event:,${selectedEvent.name}\n\n`;
    }
    csvContent += headers.join(",") + "\n";

    // Present / Late rows first
    for (const r of sortedAttended) {
      csvContent += [
        formatNameLastFirst(r.name),
        r.studentId,
        r.section,
        r.date,
        formatTime12Hour(r.timeIn),
        r.timeOut ? formatTime12Hour(r.timeOut) : "Did Not Time-out",
        r.status,
      ].join(",") + "\n";
    }

    // Blank separator + Absent section
    if (absentStudents.length > 0) {
      csvContent += "\n";
      csvContent += "--- ABSENT STUDENTS ---\n";
      for (const s of absentStudents) {
        csvContent += [
          formatNameLastFirst(s.name),
          s.studentId,
          s.section,
          reportDateFilter || new Date().toISOString().split("T")[0],
          "",
          "",
          "Absent",
        ].join(",") + "\n";
      }
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", buildFileName(".csv"));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (sortedAttended.length === 0 && absentStudents.length === 0) return alert("No data to export.");
    if (!window.jspdf) return alert("PDF generator is still loading. Please try again in a moment.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (typeof doc.autoTable !== "function") {
      alert("PDF table generator failed to load.");
      return;
    }

    // ── Load logos as base64 ─────────────────────────────────────────────────
    const loadImageAsBase64 = (src: string): Promise<string> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve("");
        img.src = src;
      });

    const [uaBase64, jpiaBase64] = await Promise.all([
      loadImageAsBase64(uaLogoUrl),
      loadImageAsBase64(jpiaLogoUrl),
    ]);

    const pageW = doc.internal.pageSize.getWidth();

    // ── Header with logos ────────────────────────────────────────────────────
    const logoSize = 18;
    const headerY = 10;

    if (uaBase64) {
      doc.addImage(uaBase64, "PNG", 14, headerY, logoSize, logoSize);
    }
    if (jpiaBase64) {
      doc.addImage(jpiaBase64, "PNG", pageW - 14 - logoSize, headerY, logoSize, logoSize);
    }

    // Title block (centered between logos)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("University of the Assumption", pageW / 2, headerY + 5, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Junior Philippine Institute of Accountants", pageW / 2, headerY + 10, { align: "center" });
    doc.text("City of San Fernando, Pampanga", pageW / 2, headerY + 15, { align: "center" });

    // Divider line
    const dividerY = headerY + logoSize + 4;
    doc.setDrawColor(18, 52, 153); // #123499
    doc.setLineWidth(0.6);
    doc.line(14, dividerY, pageW - 14, dividerY);

    // Report title
    let cursorY = dividerY + 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("COAccess Attendance Report", pageW / 2, cursorY, { align: "center" });

    cursorY += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (selectedEvent) {
      doc.text(`Event: ${selectedEvent.name}`, 14, cursorY);
      cursorY += 5;
    }
    if (reportSectionFilter !== "All") {
      doc.text(`Section: ${reportSectionFilter}`, 14, cursorY);
      cursorY += 5;
    }
    doc.text(`Date: ${reportDateFilter || new Date().toISOString().split("T")[0]}`, 14, cursorY);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 14, cursorY, { align: "right" });
    cursorY += 4;

    // Summary boxes
    cursorY += 3;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const summaryItems = [
      { label: "Total", value: reportTotal },
      { label: "Present", value: reportPresent },
      { label: "Late", value: reportLate },
      { label: "Absent", value: reportAbsentCount },
    ];
    const boxW = (pageW - 28 - 12) / 4; // 4 boxes with 4px gaps
    summaryItems.forEach((item, i) => {
      const x = 14 + i * (boxW + 4);
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(x, cursorY, boxW, 10, 2, 2, "F");
      doc.setTextColor(30, 41, 59);
      doc.text(`${item.label}: ${item.value}`, x + boxW / 2, cursorY + 6.5, { align: "center" });
    });
    doc.setTextColor(0, 0, 0);
    cursorY += 14;

    // ── Attendance Table (Present + Late) ─────────────────────────────────────
    const tableHead = [["#", "Student Name", "ID", "Section", "Date", "Time In", "Time Out", "Status"]];
    const tableBody = sortedAttended.map((r, i) => [
      String(i + 1),
      formatNameLastFirst(r.name),
      r.studentId,
      r.section,
      r.date,
      formatTime12Hour(r.timeIn),
      r.timeOut ? formatTime12Hour(r.timeOut) : "Did Not Time-out",
      r.status.charAt(0).toUpperCase() + r.status.slice(1),
    ]);

    if (tableBody.length > 0) {
      doc.autoTable({
        startY: cursorY,
        head: tableHead,
        body: tableBody,
        theme: "grid",
        headStyles: {
          fillColor: [18, 52, 153],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        bodyStyles: { fontSize: 7.5, cellPadding: 2 },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          4: { halign: "center" },
          5: { halign: "center" },
          6: { halign: "center" },
          7: { halign: "center" },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
      });
    }

    // ── Absent Table ──────────────────────────────────────────────────────────
    if (absentStudents.length > 0) {
      const absentStartY = tableBody.length > 0 ? doc.lastAutoTable.finalY + 10 : cursorY;

      // Section header for absent
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(220, 38, 38); // rose-600
      doc.text("Absent Students", 14, absentStartY);
      doc.setTextColor(0, 0, 0);

      const absentHead = [["#", "Student Name", "ID", "Section", "Status"]];
      const absentBody = absentStudents.map((s, i) => [
        String(i + 1),
        formatNameLastFirst(s.name),
        s.studentId,
        s.section,
        "Absent",
      ]);

      doc.autoTable({
        startY: absentStartY + 4,
        head: absentHead,
        body: absentBody,
        theme: "grid",
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        bodyStyles: { fontSize: 7.5, cellPadding: 2 },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          4: { halign: "center" },
        },
        alternateRowStyles: { fillColor: [255, 241, 242] },
        margin: { left: 14, right: 14 },
      });
    }

    // ── Footer on every page ──────────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("COAccess — Attendance Management System", 14, pageH - 8);
      doc.text(`Page ${i} of ${totalPages}`, pageW - 14, pageH - 8, { align: "right" });
    }

    doc.save(buildFileName(".pdf"));
  };



  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-[#123499]">Attendance Reports</h2>
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
                <Building2 size={14} /> Select Event
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
          <p className="text-2xl font-bold text-rose-700">{reportAbsentCount}</p>
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
              {/* Present / Late rows */}
              {sortedAttended.map((r, i) => (
                <tr key={`att-${i}`} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
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

              {/* Absent separator */}
              {absentStudents.length > 0 && sortedAttended.length > 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-2 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider text-center border-y border-rose-100">
                    Absent Students
                  </td>
                </tr>
              )}

              {/* Absent rows */}
              {absentStudents.map((s, i) => (
                <tr key={`abs-${i}`} className="hover:bg-rose-50/30 transition-colors whitespace-nowrap bg-rose-50/10">
                  <td className="px-5 py-3 font-semibold text-slate-700">{formatNameLastFirst(s.name)}</td>
                  <td className="px-5 py-3">
                    <p className="font-mono text-slate-600">{s.studentId}</p>
                    <p className="text-xs text-slate-400">{s.section}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{reportDateFilter || "—"}</td>
                  <td className="px-5 py-3 font-mono text-slate-400">—</td>
                  <td className="px-5 py-3 font-mono text-slate-400">—</td>
                  <td className="px-5 py-3"><StatusBadge status="absent" /></td>
                </tr>
              ))}

              {sortedAttended.length === 0 && absentStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
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
