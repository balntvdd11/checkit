import React, { createContext, useContext, useReducer, useMemo } from "react";
import type { StudentRecord, EventConfig, AttendanceRecord } from "../types";

type State = {
  students: StudentRecord[];
  events: EventConfig[];
  attendance: AttendanceRecord[];
  loading: boolean;
  error?: string | null;
};

type Action =
  | { type: "INIT_LOAD"; payload: { students: StudentRecord[]; events: EventConfig[]; attendance: AttendanceRecord[] } }
  | { type: "SET_EVENTS"; payload: EventConfig[] }
  | { type: "ADD_EVENT"; payload: EventConfig }
  | { type: "UPDATE_EVENT"; payload: EventConfig }
  | { type: "TOGGLE_EVENT_STATUS"; payload: { id: string } }
  | { type: "ADD_STUDENT"; payload: StudentRecord }
  | { type: "UPDATE_STUDENT"; payload: StudentRecord }
  | { type: "SET_STUDENTS"; payload: StudentRecord[] }
  | { type: "ADD_ATTENDANCE"; payload: AttendanceRecord }
  | { type: "ADD_ATTENDANCE_RECORD"; payload: AttendanceRecord }
  | { type: "UPDATE_ATTENDANCE_RECORD"; payload: AttendanceRecord }
  | { type: "SET_ATTENDANCE"; payload: AttendanceRecord[] };

const initialState: State = { students: [], events: [], attendance: [], loading: false, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT_LOAD":
      return { ...state, students: action.payload.students, events: action.payload.events, attendance: action.payload.attendance, loading: false };
    case "SET_EVENTS":
      return { ...state, events: action.payload };
    case "ADD_EVENT":
      return { ...state, events: [action.payload, ...state.events] };
    case "UPDATE_EVENT":
      return { ...state, events: state.events.map(e => e.id === action.payload.id ? action.payload : e) };
    case "TOGGLE_EVENT_STATUS":
      return { ...state, events: state.events.map(e => e.id === action.payload.id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e) };
    case "SET_STUDENTS":
      return { ...state, students: action.payload };
    case "ADD_STUDENT":
      return { ...state, students: [action.payload, ...state.students] };
    case "UPDATE_STUDENT":
      return { ...state, students: state.students.map(s => s.studentId === action.payload.studentId ? action.payload : s) };
    case "SET_ATTENDANCE":
      return { ...state, attendance: action.payload };
    case "ADD_ATTENDANCE":
      return { ...state, attendance: [action.payload, ...state.attendance] };
    case "ADD_ATTENDANCE_RECORD":
      return { ...state, attendance: [action.payload, ...state.attendance] };
    case "UPDATE_ATTENDANCE_RECORD":
      return { ...state, attendance: state.attendance.map(a => (a as any).id === (action.payload as any).id ? action.payload : a) };
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useSelectors() {
  const { state } = useStore();
  const activeEvents = state.events.filter(e => e.status === "active");
  const totalStudents = state.students.length;
  const totalPresent = state.attendance.filter(a => a.status === "present").length;
  const totalAbsent = state.attendance.filter(a => a.status === "absent").length;
  return { ...state, activeEvents, totalStudents, totalPresent, totalAbsent };
}
