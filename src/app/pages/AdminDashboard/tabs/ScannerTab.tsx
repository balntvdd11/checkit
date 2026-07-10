import { useState } from "react";
import { ScanLine, History, CheckCircle2, UserX, UserCheck } from "lucide-react";
import Card from "../../../components/shared/Card";
import StatusBadge from "../../../components/shared/StatusBadge";
import { MOCK_SESSIONS } from "../../../constants/mockData";

export default function ScannerTab() {
  const [selectedScanSession, setSelectedScanSession] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ id: string; name: string; status: "success" | "invalid" | "duplicate"; time: string }[]>([]);

  const activeScanSession = MOCK_SESSIONS.find(s => s.id === selectedScanSession);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Scanner Station</h2>
          <p className="text-sm text-white mt-1">Select a session to begin scanning QR passes</p>
        </div>
        {!scanning && (
          <select value={selectedScanSession} onChange={e => { setSelectedScanSession(e.target.value); setScanResults([]); }}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white shadow-sm">
            <option value="">Select active session...</option>
            {MOCK_SESSIONS.filter(s => s.status === "active").map(s => (
              <option key={s.id} value={s.id}>{s.subject} ({s.section})</option>
            ))}
          </select>
        )}
      </div>

      {selectedScanSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
            {scanning ? (
              <div className="w-full flex flex-col items-center">
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Scanner Active
                  </div>
                  <h3 className="font-bold text-slate-800">{activeScanSession?.subject}</h3>
                  <p className="text-sm text-slate-500">{activeScanSession?.section} · Code: {activeScanSession?.code}</p>
                </div>
                
                <div className="relative w-64 h-64 border-2 border-[var(--primary)]/30 rounded-3xl overflow-hidden bg-slate-50 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/10 to-transparent w-full h-full animate-scan" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanLine size={48} className="text-[var(--primary)]/20" />
                  </div>
                  {/* Corner markers */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[var(--primary)] rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[var(--primary)] rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[var(--primary)] rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[var(--primary)] rounded-br-lg" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => {
                    const mockNames = ["Juan Paolo Reyes", "Ana Gabrielle Cruz", "Miguel Andrei Bautista"];
                    const name = mockNames[Math.floor(Math.random() * mockNames.length)];
                    const isInvalid = Math.random() > 0.8;
                    const isDup = !isInvalid && Math.random() > 0.8;
                    const status = isInvalid ? "invalid" : isDup ? "duplicate" : "success";
                    setScanResults([{ id: `scan-${Date.now()}`, name, status, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...scanResults]);
                  }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                    Simulate Scan
                  </button>
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
                  <p className="text-sm">No scans yet for this session</p>
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
                          {res.status === "success" ? <span className="text-emerald-600">Marked Present</span> :
                           res.status === "invalid" ? <span className="text-rose-600">Invalid / Spoofed QR</span> :
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
          <h3 className="text-lg font-bold text-slate-700">No Session Selected</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Please select an active session from the dropdown above to start scanning QR passes for that class.
          </p>
        </Card>
      )}
    </div>
  );
}
