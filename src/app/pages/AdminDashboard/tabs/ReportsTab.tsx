import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Filter, FileText, Calendar, Building2, Search, X, LogOut, AlertTriangle, UserCheck } from "lucide-react";
import Card from "../../../components/shared/Card";
import StatusBadge from "../../../components/shared/StatusBadge";
import type { EventConfig } from "../../../types";
import { useStore, useSelectors } from "../../../state/store";
import { formatTime12Hour, formatNameLastFirst } from "../../../lib/utils";
import { toast } from "sonner";
import { updateAttendanceRecord, createAttendanceRecord } from "../../../services/attendance";
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
  const [earlyOutModal, setEarlyOutModal] = useState<{ visible: boolean; record: any; reason: string; currentTime?: string }>({ visible: false, record: null, reason: "", currentTime: "" });
  const [submittingEarlyOut, setSubmittingEarlyOut] = useState(false);
  const [exceptionModal, setExceptionModal] = useState(false);
  const [exceptionStudentId, setExceptionStudentId] = useState("");
  const [exceptionConfirmModal, setExceptionConfirmModal] = useState<{ visible: boolean; student: any }>({ visible: false, student: null });
  const { attendance, students } = useSelectors();
  const { dispatch } = useStore();

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

  const resolveStudentEmail = (studentId: string, recordEmail?: string, name?: string) => {
    if (recordEmail && recordEmail.trim() && recordEmail.trim() !== "—") {
      return recordEmail.trim();
    }

    const cleanId = (studentId || "").trim().toLowerCase();
    let match = students.find(s => s.studentId && s.studentId.trim().toLowerCase() === cleanId);

    if (!match && name) {
      const cleanName = name.trim().toLowerCase();
      match = students.find(s => s.name && s.name.trim().toLowerCase() === cleanName);
    }

    if (match?.email && match.email.trim() && match.email.trim() !== "—") {
      return match.email.trim();
    }

    if (name) {
      const parts = name.replace(/[^a-zA-Z\s,]/g, "").trim().split(/\s+/);
      if (parts.length >= 2) {
        if (name.includes(",")) {
          const lastName = parts[0].replace(",", "").toLowerCase();
          const firstName = parts[1].toLowerCase();
          return `${firstName}.${lastName}@student.ua.edu.ph`;
        } else {
          const firstName = parts[0].toLowerCase();
          const lastName = parts[parts.length - 1].toLowerCase();
          return `${firstName}.${lastName}@student.ua.edu.ph`;
        }
      }
    }

    if (cleanId) {
      return `${cleanId}@student.ua.edu.ph`;
    }

    return "—";
  };

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).trim();
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = () => {
    if (sortedAttended.length === 0 && absentStudents.length === 0) { toast.error("No data to export."); return; }
    const headers = ["Student Name", "ID", "Email", "Section", "Date", "Time In", "Time Out", "Status"];

    let csvContent = "\uFEFF";
    if (selectedEvent) {
      csvContent += `${escapeCSV("Event:")},${escapeCSV(selectedEvent.name)}\n\n`;
    }
    csvContent += headers.map(escapeCSV).join(",") + "\n";

    // Present / Late rows first
    for (const r of sortedAttended) {
      csvContent += [
        escapeCSV(formatNameLastFirst(r.name)),
        escapeCSV(r.studentId),
        escapeCSV(resolveStudentEmail(r.studentId, r.email, r.name)),
        escapeCSV(r.section),
        escapeCSV(r.date),
        escapeCSV(formatTime12Hour(r.timeIn)),
        escapeCSV(r.timeOut ? formatTime12Hour(r.timeOut) : "Did Not Time-out"),
        escapeCSV(r.status),
      ].join(",") + "\n";
    }

    // Blank separator + Absent section
    if (absentStudents.length > 0) {
      csvContent += "\n";
      csvContent += `${escapeCSV("--- ABSENT STUDENTS ---")}\n`;
      for (const s of absentStudents) {
        csvContent += [
          escapeCSV(formatNameLastFirst(s.name)),
          escapeCSV(s.studentId),
          escapeCSV(resolveStudentEmail(s.studentId, s.email, s.name)),
          escapeCSV(s.section),
          escapeCSV(reportDateFilter || new Date().toISOString().split("T")[0]),
          escapeCSV("—"),
          escapeCSV("—"),
          escapeCSV("Absent"),
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

  const handleExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }
    const student = students.find(s => s.studentId === exceptionStudentId);
    if (!student) {
      toast.error("Student ID not found in the system");
      return;
    }
    const today = reportDateFilter || new Date().toISOString().split("T")[0];
    const existing = attendance.find(a => a.studentId === student.studentId && a.EVENTSCode === selectedEvent.checkItCode && a.date === today);
    if (existing) {
      toast.error("Student has already timed in for this event today");
      return;
    }
    setExceptionModal(false);
    setExceptionConfirmModal({ visible: true, student });
  };

  const handleExceptionConfirm = async () => {
    const student = exceptionConfirmModal.student;
    if (!student || !selectedEvent) return;
    
    setSubmittingEarlyOut(true);
    try {
      const now = new Date();
      const time24 = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const today = reportDateFilter || now.toISOString().split("T")[0];

      let scanStatus: "present" | "late" = "present";
      if (selectedEvent.lateThreshold && time24 > selectedEvent.lateThreshold) {
        scanStatus = "late";
      }

      const record = {
        name: student.name,
        studentId: student.studentId,
        email: student.email || "", 
        date: today,
        subject: selectedEvent.name,
        section: student.section,
        status: scanStatus, 
        timeIn: time24,
        EVENTSCode: selectedEvent.checkItCode,
      };

      const saved = await createAttendanceRecord(record as any);
      dispatch({ type: "ADD_ATTENDANCE_RECORD", payload: saved });
      toast.success("Attendance exception recorded successfully");
      setExceptionConfirmModal({ visible: false, student: null });
      setExceptionStudentId("");
    } catch (err) {
      toast.error("Failed to record attendance exception");
    } finally {
      setSubmittingEarlyOut(false);
    }
  };

  const handleTimeoutClick = (record: any) => {
    if (!selectedEvent) return;
    const now = new Date();
    const time24 = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setEarlyOutModal({ visible: true, record, reason: "", currentTime: time24 });
  };

  const handleEarlyOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!earlyOutModal.record) return;

    const isEarly = selectedEvent?.timeOut && earlyOutModal.currentTime && earlyOutModal.currentTime < selectedEvent.timeOut;
    
    if (isEarly && !earlyOutModal.reason.trim()) return;

    setSubmittingEarlyOut(true);
    try {
      const timeOutStr = isEarly 
        ? `${earlyOutModal.currentTime} (Early Out: ${earlyOutModal.reason.trim()})`
        : earlyOutModal.currentTime!;

      const updated = await updateAttendanceRecord((earlyOutModal.record as any).id, { 
        timeOut: timeOutStr
      });
      dispatch({ type: "UPDATE_ATTENDANCE_RECORD", payload: updated });
      toast.success("Timeout recorded successfully");
      setEarlyOutModal({ visible: false, record: null, reason: "", currentTime: "" });
    } catch (err) {
      toast.error("Failed to record timeout");
    } finally {
      setSubmittingEarlyOut(false);
    }
  };

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    // PDF export logic omitted for brevity, keeping existing body intact

    if (sortedAttended.length === 0 && absentStudents.length === 0) { toast.error("No data to export."); return; }
    if (!window.jspdf) { toast.error("PDF generator is still loading. Please try again in a moment."); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (typeof doc.autoTable !== "function") {
      toast.error("PDF table generator failed to load.");
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
    const tableHead = [["#", "Student Name", "ID", "Email", "Section", "Date", "Time In", "Time Out", "Status"]];
    const tableBody = sortedAttended.map((r, i) => [
      String(i + 1),
      formatNameLastFirst(r.name),
      r.studentId,
      resolveStudentEmail(r.studentId, r.email, r.name),
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
          fontSize: 7.5,
          halign: "center",
        },
        bodyStyles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: {
          0: { halign: "center", cellWidth: 7 },
          2: { cellWidth: 20 },
          3: { cellWidth: 38 },
          5: { halign: "center" },
          6: { halign: "center" },
          7: { halign: "center" },
          8: { halign: "center" },
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

      const absentHead = [["#", "Student Name", "ID", "Email", "Section", "Status"]];
      const absentBody = absentStudents.map((s, i) => [
        String(i + 1),
        formatNameLastFirst(s.name),
        s.studentId,
        resolveStudentEmail(s.studentId, s.email, s.name),
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
          fontSize: 7.5,
          halign: "center",
        },
        bodyStyles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: {
          0: { halign: "center", cellWidth: 7 },
          2: { cellWidth: 20 },
          3: { cellWidth: 45 },
          5: { halign: "center" },
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
          <button onClick={handleExportCSV} disabled={!reportEVENTS} className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:pointer-events-none text-indigo-700 font-semibold rounded-xl transition-colors border border-indigo-100 flex items-center justify-center gap-2 text-sm shadow-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handleExportPDF} disabled={!reportEVENTS} className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:pointer-events-none text-rose-700 font-semibold rounded-xl transition-colors border border-rose-100 flex items-center justify-center gap-2 text-sm shadow-sm">
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
              <option value="All" className="bg-white text-slate-500">All Sections</option>
              <optgroup label="First Year" className="bg-white text-slate-800 font-semibold">
                <option value="BSA 1A" className="bg-white text-slate-700 font-normal">BSA 1A</option><option value="BSA 1B" className="bg-white text-slate-700 font-normal">BSA 1B</option><option value="BSA 1C" className="bg-white text-slate-700 font-normal">BSA 1C</option><option value="BSA 1D" className="bg-white text-slate-700 font-normal">BSA 1D</option>
              </optgroup>
              <optgroup label="Second Year" className="bg-white text-slate-800 font-semibold">
                <option value="BSA 2A" className="bg-white text-slate-700 font-normal">BSA 2A</option><option value="BSA 2B" className="bg-white text-slate-700 font-normal">BSA 2B</option><option value="BSAIS 2A" className="bg-white text-slate-700 font-normal">BSAIS 2A</option>
              </optgroup>
              <optgroup label="Third Year" className="bg-white text-slate-800 font-semibold">
                <option value="BSA 3A" className="bg-white text-slate-700 font-normal">BSA 3A</option><option value="BSAIS 3A" className="bg-white text-slate-700 font-normal">BSAIS 3A</option><option value="BSAIS 3B" className="bg-white text-slate-700 font-normal">BSAIS 3B</option>
              </optgroup>
              <optgroup label="Fourth Year" className="bg-white text-slate-800 font-semibold">
                <option value="BSA 4A" className="bg-white text-slate-700 font-normal">BSA 4A</option><option value="BSAIS 4A" className="bg-white text-slate-700 font-normal">BSAIS 4A</option>
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

      {reportEVENTS ? (
        <>
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
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 shrink-0">
                <FileText size={16} className="text-indigo-600" /> Detailed Records
              </h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                <button 
                  type="button"
                  onClick={() => {
                    if (!selectedEvent) {
                      toast.error("Please select an event first");
                      return;
                    }
                    setExceptionModal(true);
                    setExceptionStudentId("");
                  }}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[#A61831] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
                >
                  Attendance Exception
                </button>
                <div className="relative w-full sm:w-64 md:w-72">
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
                      <td className="px-5 py-3 font-mono text-slate-600">
                        {r.timeOut ? (
                          formatTime12Hour(r.timeOut)
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 italic">Did Not Time-out</span>
                            <button 
                              onClick={() => handleTimeoutClick(r)}
                              className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300 text-xs font-bold rounded-md shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <LogOut size={12} />
                              Timeout
                            </button>
                          </div>
                        )}
                      </td>
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
        </>
      ) : (
        <Card className="p-12 border border-slate-100 flex flex-col items-center justify-center text-center bg-slate-50/50">
          <Calendar size={48} className="text-indigo-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">Select an Event</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Please select a specific event from the dropdown above to view its attendance statistics and detailed student records.</p>
        </Card>
      )}

      {/* Early Out Modal */}
      <AnimatePresence>
        {earlyOutModal.visible && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !submittingEarlyOut && setEarlyOutModal(prev => ({ ...prev, visible: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">Record Timeout</h3>
                <button 
                  onClick={() => !submittingEarlyOut && setEarlyOutModal(prev => ({ ...prev, visible: false }))}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  disabled={submittingEarlyOut}
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleEarlyOutSubmit} className="p-6">
                <div className="space-y-1.5 mb-5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Select Timeout Time</label>
                  <input
                    type="time"
                    value={earlyOutModal.currentTime || ""}
                    onChange={(e) => setEarlyOutModal(prev => ({ ...prev, currentTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    required
                    disabled={submittingEarlyOut}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {selectedEvent?.timeOut && earlyOutModal.currentTime && earlyOutModal.currentTime < selectedEvent.timeOut ? (
                    <motion.div
                      key="early"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-5 flex items-start gap-3 mt-1">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                          <h4 className="text-amber-800 font-bold text-sm mb-1">Early Timeout Detected</h4>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            The scheduled timeout is <span className="font-bold">{formatTime12Hour(selectedEvent.timeOut)}</span>, but the selected time is <span className="font-bold">{formatTime12Hour(earlyOutModal.currentTime)}</span>.
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-4">
                        You are recording an early timeout for <span className="font-bold text-slate-800">{earlyOutModal.record?.name}</span>. Please provide a reason below.
                      </p>
                      
                      <div className="space-y-1.5 mb-6">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Reason</label>
                        <input
                          type="text"
                          value={earlyOutModal.reason}
                          onChange={(e) => setEarlyOutModal(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="e.g., Medical emergency, Family matters..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          autoFocus
                          required
                          disabled={submittingEarlyOut}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="valid"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-slate-600 mb-6 mt-1">
                        You are recording a timeout for <span className="font-bold text-slate-800">{earlyOutModal.record?.name}</span>. The selected time is valid and on schedule.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEarlyOutModal(prev => ({ ...prev, visible: false }))}
                    disabled={submittingEarlyOut}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEarlyOut || (selectedEvent?.timeOut && earlyOutModal.currentTime && earlyOutModal.currentTime < selectedEvent.timeOut && !earlyOutModal.reason.trim())}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingEarlyOut ? "Saving..." : "Submit Timeout"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exception Modals */}
      <AnimatePresence>
        {exceptionModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setExceptionModal(false)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50">
                <h3 className="font-bold text-amber-800 text-lg flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-600" />
                  Manual Time In
                </h3>
                <button type="button" onClick={() => setExceptionModal(false)} className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleExceptionSubmit} className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                  Enter the Student ID to manually time in the student for the current event.
                </p>
                <div className="space-y-1.5 mb-6">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Student ID</label>
                  <input
                    type="text"
                    value={exceptionStudentId}
                    onChange={(e) => setExceptionStudentId(e.target.value)}
                    placeholder="e.g. 2023000123"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setExceptionModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={!exceptionStudentId.trim()}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50">
                    Yes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {exceptionConfirmModal.visible && exceptionConfirmModal.student && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !submittingEarlyOut && setExceptionConfirmModal({ visible: false, student: null })}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden text-center p-6"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Are you sure?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Do you want to record time in for <b>{exceptionConfirmModal.student.name}</b> ({exceptionConfirmModal.student.studentId})?
              </p>
              <div className="flex gap-3 justify-center">
                <button type="button" onClick={() => setExceptionConfirmModal({ visible: false, student: null })} disabled={submittingEarlyOut}
                  className="px-6 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleExceptionConfirm} disabled={submittingEarlyOut}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                  {submittingEarlyOut ? "Recording..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
