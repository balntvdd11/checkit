import { useState } from "react";
import { Search, Filter, AlertCircle, RefreshCw } from "lucide-react";
import Card from "../../../components/shared/Card";
import { useSelectors, useStore } from "../../../state/store";
import { createStudent } from "../../../services/students";

export default function StudentsTab() {
  const [searchStudents, setSearchStudents] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All Sections");

  const { students } = useSelectors();
  const { dispatch } = useStore();

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchStudents.toLowerCase()) || 
                        s.studentId.includes(searchStudents);
    const matchSection = sectionFilter === "All Sections" || s.section === sectionFilter;
    return matchSearch && matchSection;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold text-white">Student Directory</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search name or ID..." 
              value={searchStudents} onChange={e => setSearchStudents(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent" />
          </div>
          <div className="relative shrink-0">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none appearance-none bg-white">
              <option>All Sections</option>
              <option>BSIT 1A</option><option>BSIT 1B</option><option>BSIT 1C</option><option>BSIT 1D</option><option>BSIT 1E</option>
              <option>BSIT 2A</option><option>BSIT 2B</option><option>BSIT 2C</option><option>BSIT 2D</option><option>BSIT 2E</option>
              <option>BSIT 3A</option><option>BSIT 3B</option><option>BSIT 3C</option><option>BSIT 3D</option><option>BSIT 3E</option>
              <option>BSIT 4A</option><option>BSIT 4B</option><option>BSIT 4C</option><option>BSIT 4D</option><option>BSIT 4E</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">ID & Section</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-700">{student.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{student.email}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-600">
                    <p>{student.studentId}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{student.section}</p>
                  </td>
                  <td className="px-5 py-4">
                    {student.registered ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Registered <span className="text-emerald-600/50">· {student.registeredAt}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                        <AlertCircle size={12} /> Pending Registration
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {student.registered && (
                      <button className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-md hover:bg-rose-50 transition-colors flex items-center gap-1.5 ml-auto">
                        <RefreshCw size={12} /> Reset Device
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                    No students found matching your filters.
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
