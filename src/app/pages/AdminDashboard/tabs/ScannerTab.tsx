import { useState, useEffect, useRef } from "react";
import { ScanLine, History, CheckCircle2, UserX, UserCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "motion/react";
import Card from "../../../components/shared/Card";
import StatusBadge from "../../../components/shared/StatusBadge";
import type { EventConfig } from "../../../types";
import { createAttendanceRecord, updateAttendanceRecord } from "../../../services/attendance";
import { useStore } from "../../../state/store";
import { formatTime12Hour, getLocalDateStr } from "../../../lib/utils";

export default function ScannerTab({ events }: { events: EventConfig[] }) {
  const [selectedScanEVENTS, setSelectedScanEVENTS] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ id: string; name: string; status: "success" | "invalid" | "duplicate"; action?: "present" | "late" | "time-out" | "early-timeout"; time: string }[]>([]);
  const [scanAlert, setScanAlert] = useState<{ name: string; visible: boolean } | null>(null);
  const { state, dispatch } = useStore();
  
  // Refs for current state to avoid scanner restart on every scan
  const stateRef = useRef(state);
  const eventsRef = useRef(events);
  
  useEffect(() => {
    stateRef.current = state;
    eventsRef.current = events;
  }, [state, events]);
  
  // Keep track of recently scanned QR codes to prevent rapid duplicates
  const recentlyScanned = useRef<Set<string>>(new Set());

  const activeScanEVENTS = events.find(s => s.id === selectedScanEVENTS);

  useEffect(() => {
    if (!scanning || !selectedScanEVENTS) return;

    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("qr-reader");
        await html5QrCode.start(
          { facingMode: "environment" }, // Forces back camera
          { fps: 30, qrbox: { width: 250, height: 250 } }, // 30 fps for faster scanning
          async (decodedText) => {
            // Decode QR string: expected format `studentId:EVENTSCode:qrSeed`
            try {
              const parts = decodedText.split(":");
              if (parts.length < 2) throw new Error("Invalid format");
              
              const [studentId, code, seed] = parts;
              const scanKey = `${studentId}-${code}-${seed}`;
              
              // Prevent rapid duplicate processing of the exact same QR frame
              if (recentlyScanned.current.has(scanKey)) return;
              recentlyScanned.current.add(scanKey);
              
              // Cleanup memory after 5 seconds
              setTimeout(() => recentlyScanned.current.delete(scanKey), 5000);

              const activeEvent = eventsRef.current.find(e => e.id === selectedScanEVENTS);
              const student = stateRef.current.students.find(s => s.studentId === studentId);

              // We need a strictly formatted HH:mm for reliable string comparison
              const now = new Date();
              const time24 = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              // Display time can still be localized AM/PM
              const displayTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              if (!student || !activeEvent || code !== activeEvent.checkItCode) {
                setScanResults(prev => [{ id: `scan-${Date.now()}`, name: "Unknown / Invalid", status: "invalid", time: displayTime }, ...prev]);
                return;
              }

              // Use the WebSocket-synced store to check for duplicates
              // instead of making an HTTP call on every scan.
              const latestAttendance = stateRef.current.attendance;

              // Check if student already has attendance for this event today
              const today = getLocalDateStr();
              const existingRecord = latestAttendance.find(a => 
                a.studentId === student.studentId && 
                a.EVENTSCode === activeEvent.checkItCode
              );

              if (existingRecord) {
                if (existingRecord.timeOut) {
                  // Already timed out
                  setScanResults(prev => [{ id: `scan-${Date.now()}`, name: student.name, status: "duplicate", time: displayTime }, ...prev]);
                  return;
                } else {
                  // Second scan: Record Time-Out
                  if (activeEvent.timeOut && time24 < activeEvent.timeOut) {
                    setScanResults(prev => [{ id: `scan-${Date.now()}`, name: student.name, status: "invalid", action: "early-timeout", time: displayTime }, ...prev]);
                    setScanAlert({ name: `${student.name} (Too Early to Time Out)`, visible: true });
                    setTimeout(() => {
                      setScanAlert(prev => prev ? { ...prev, visible: false } : null);
                    }, 3000);
                    return;
                  }

                  // Use the internal backend ID which should be in the store if it's fetched, 
                  // but we might need to handle if it's missing. Assuming record has `id` if fetched from API.
                  const recordId = (existingRecord as any).id;
                  if (recordId) {
                    const updated = await updateAttendanceRecord(recordId, { timeOut: time24 });
                    dispatch({ type: "UPDATE_ATTENDANCE_RECORD", payload: updated }); 
                    
                    setScanResults(prev => [{ id: `scan-${Date.now()}`, name: student.name, status: "success", action: "time-out", time: displayTime }, ...prev]);
                    setScanAlert({ name: `${student.name} (Timed Out)`, visible: true });
                    setTimeout(() => {
                      setScanAlert(prev => prev ? { ...prev, visible: false } : null);
                    }, 3000);
                  } else {
                     setScanResults(prev => [{ id: `scan-${Date.now()}`, name: student.name, status: "duplicate", time: displayTime }, ...prev]);
                  }
                  return;
                }
              }

              // First scan: Determine if Present or Late based on lateThreshold
              let scanStatus: "present" | "late" = "present";
              if (activeEvent.lateThreshold && time24 > activeEvent.lateThreshold) {
                scanStatus = "late";
              }

              const record = {
                name: student.name,
                studentId: student.studentId,
                email: student.email,
                date: today,
                subject: activeEvent.name,
                section: student.section,
                status: scanStatus, 
                timeIn: time24,
                EVENTSCode: activeEvent.checkItCode,
              };

              const saved = await createAttendanceRecord(record as any);
              dispatch({ type: "ADD_ATTENDANCE_RECORD", payload: saved });
              setScanResults(prev => [{ id: `scan-${Date.now()}`, name: student.name, status: "success", action: scanStatus, time: displayTime }, ...prev]);
              
              setScanAlert({ name: `${student.name} (${scanStatus === 'late' ? 'Late' : 'Time In'})`, visible: true });
              setTimeout(() => {
                setScanAlert(prev => prev ? { ...prev, visible: false } : null);
              }, 3000);

            } catch (err) {
              const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              setScanResults(prev => [{ id: `scan-${Date.now()}`, name: "Invalid QR Code", status: "invalid", time }, ...prev]);
            }
          },
          (errorMessage) => {
            // Ignored: html5-qrcode triggers this constantly when looking for a code
          }
        );
      } catch (err) {
        console.error("Failed to start scanner:", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode?.clear()).catch(console.error);
      }
    };
  }, [scanning, selectedScanEVENTS, dispatch]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-[#123499]">Scanner Station</h2>
        </div>
        {!scanning && (
            <select value={selectedScanEVENTS} onChange={e => { setSelectedScanEVENTS(e.target.value); setScanResults([]); }}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white shadow-sm">
            <option value="">Select Events</option>
            {events.filter(s => s.status === "active").map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {selectedScanEVENTS ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
            {scanning ? (
              <div className="w-full flex flex-col items-center">
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Scanner Active
                  </div>
                  <h3 className="font-bold text-slate-800">{activeScanEVENTS?.name}</h3>
                </div>
                
                <div className="w-full max-w-sm relative rounded-2xl overflow-hidden bg-slate-50 mb-8 border border-slate-200">
                  <div id="qr-reader" className="w-full relative z-0" />
                  
                  <AnimatePresence>
                    {scanAlert?.visible && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute inset-x-4 bottom-4 z-10 p-4 bg-emerald-500/95 backdrop-blur-md rounded-xl shadow-lg border border-emerald-400/50 flex flex-col items-center text-center"
                      >
                        <CheckCircle2 size={28} className="text-white mb-1" />
                        <p className="text-white font-bold text-sm">Successfully scanned</p>
                        <p className="text-emerald-50 text-sm font-medium">{scanAlert.name}</p>
                        <p className="text-emerald-100 text-xs mt-1">Thank you!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setScanning(false)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold rounded-lg transition-colors">
                    Stop Scanner
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <ScanLine size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Ready to Scan</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-[250px] mx-auto">
                  Position the QR code within the frame to automatically record attendance.
                </p>
                <button onClick={() => setScanning(true)}
                  className="px-8 py-3 bg-[var(--primary)] hover:bg-[#A61831] text-white font-bold rounded-xl transition-colors shadow-md flex items-center gap-2 mx-auto">
                  <ScanLine size={18} /> Start Camera
                </button>
              </div>
            )}
          </Card>

          <Card className="border border-slate-100 flex flex-col h-[400px]">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History size={16} className="text-[var(--secondary)]" /> Scan Log
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
                {scanResults.length} Scanned
              </span>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {scanResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <p className="text-sm">No scans yet for this EVENTS</p>
                </div>
              ) : (
                scanResults.map(res => (
                  <div key={res.id} className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between transition-colors animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        res.status === "success" ? "bg-emerald-50 text-emerald-600" :
                        res.status === "invalid" ? "bg-rose-50 text-rose-600" :
                        "bg-amber-50 text-amber-600")}>
                        {res.status === "success" ? <CheckCircle2 size={16} /> :
                         res.status === "invalid" ? <UserX size={16} /> :
                         <UserCheck size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{res.name}</p>
                        <p className="text-xs font-medium mt-0.5">
                          {res.status === "success" ? (
                            <span className={res.action === "late" ? "text-amber-600" : res.action === "time-out" ? "text-blue-600" : "text-emerald-600"}>
                              {res.action === "time-out" ? "Time Out Recorded" :
                               res.action === "late" ? "Marked Late" : "Marked Present"}
                            </span>
                          ) :
                           res.status === "invalid" ? (
                             <span className="text-rose-600">
                               {res.action === "early-timeout" ? "Too Early to Time Out" : "Invalid / Spoofed QR"}
                             </span>
                           ) :
                           <span className="text-amber-600">Already Scanned</span>}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{res.time}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <ScanLine size={28} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Event Selected</h3>
        </Card>
      )}
    </div>
  );
}
