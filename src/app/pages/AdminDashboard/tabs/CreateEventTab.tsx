import { useState } from "react";
import { Copy, CheckCircle2, Clock, MapPin, Hash, Building2, Ticket, Archive, Trash2, ArrowLeft, Calendar } from "lucide-react";
import Card from "../../../components/shared/Card";
import { generateCheckItCode, cn, formatTime12Hour } from "../../../lib/utils";
import type { EventConfig } from "../../../types";
import { createEvent, updateEvent } from "../../../services/events";
import { useStore, useSelectors } from "../../../state/store";
import TimePicker from "../../../components/shared/TimePicker";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../../components/ui/alert-dialog";

export default function CreateEventTab() {
  const [eventForm, setEventForm] = useState<{ name: string; date: string; timeIn: string; lateThreshold: string; timeOut: string; status: EventConfig["status"] }>({
    name: "",
    date: new Date().toISOString().split("T")[0],
    timeIn: "08:00",
    lateThreshold: "08:15",
    timeOut: "17:00",
    status: "active"
  });
  const { dispatch } = useStore();
  const { events } = useSelectors();
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [showArchivedEvents, setShowArchivedEvents] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'restore', evt: EventConfig } | null>(null);

  const confirmDeleteEvent = (evt: EventConfig) => {
    setConfirmAction({ type: "delete", evt });
  };

  const confirmRestoreEvent = (evt: EventConfig) => {
    setConfirmAction({ type: "restore", evt });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, evt } = confirmAction;
    setConfirmAction(null);

    if (type === "delete") {
      const updatedEvent: EventConfig = { ...evt, status: "archived" };
      const saved = await updateEvent(updatedEvent);
      dispatch({ type: "UPDATE_EVENT", payload: saved });
    } else if (type === "restore") {
      const updatedEvent: EventConfig = { ...evt, status: "inactive" };
      const saved = await updateEvent(updatedEvent);
      dispatch({ type: "UPDATE_EVENT", payload: saved });
    }
  };

  const activeEventsList = events.filter(e => e.status !== "archived");
  const archivedEventsList = events.filter(e => e.status === "archived");

  const handleCreateEvent = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (editingEventId) {
      const updatedEvent: EventConfig = {
        id: editingEventId,
        name: eventForm.name,
        checkItCode: events.find(e => e.id === editingEventId)?.checkItCode || generateCheckItCode(eventForm.name),
        date: eventForm.date,
        timeIn: eventForm.timeIn,
        lateThreshold: eventForm.lateThreshold,
        timeOut: eventForm.timeOut,
        status: eventForm.status,
      };
      // call service
      updateEvent(updatedEvent).then(res => {
        dispatch({ type: "UPDATE_EVENT", payload: res });
      });
      setEditingEventId(null);
      setShowEventForm(false);
      setEventForm({ name: "", date: new Date().toISOString().split("T")[0], timeIn: "08:00", lateThreshold: "08:15", timeOut: "17:00", status: "active" });
      return;
    }

    const newEvent: EventConfig = {
      id: `e${Date.now()}`,
      name: eventForm.name,
      checkItCode: generateCheckItCode(eventForm.name),
      date: eventForm.date,
      timeIn: eventForm.timeIn,
      lateThreshold: eventForm.lateThreshold,
      timeOut: eventForm.timeOut,
      status: eventForm.status,
    };
    createEvent(newEvent).then(res => dispatch({ type: "ADD_EVENT", payload: res }));
    setShowEventForm(false);
    setEventForm({ name: "", date: new Date().toISOString().split("T")[0], timeIn: "08:00", lateThreshold: "08:15", timeOut: "17:00", status: "active" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const inputCls = "w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl shadow-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all";
  const previewCheckItCode = eventForm.name ? generateCheckItCode(eventForm.name) : "—";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#123499]">Event Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowArchivedEvents(!showArchivedEvents); setShowEventForm(false); }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm border border-slate-700 flex items-center gap-2">
            {showArchivedEvents ? <><ArrowLeft size={16} /> Back</> : <><Archive size={16} /> Archives</>}
          </button>
          {!showArchivedEvents && (
            <button onClick={() => { setShowEventForm(!showEventForm); }}
              className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[#A61831] text-white font-semibold rounded-xl transition-colors shadow-sm text-sm">
              {showEventForm ? "Cancel" : "+ Create New Event"}
            </button>
          )}
        </div>
      </div>

      {showEventForm && (
        <Card className="p-6 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreateEvent}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Ticket size={16} className="text-[var(--primary)]" /> Event Details
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Title / Description</label>
                  <input type="text" placeholder="e.g. 1st Semester General Assembly" required
                    value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                    className={inputCls} />
                </div>

              </div>

              <div className="space-y-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock size={16} className="text-[var(--primary)]" /> Time & Logistics
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Date</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time In</label>
                    <TimePicker label="Time In" value={eventForm.timeIn} onChange={v => setEventForm({ ...eventForm, timeIn: v })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Late Threshold</label>
                    <TimePicker label="Late Threshold" value={eventForm.lateThreshold} onChange={v => setEventForm({ ...eventForm, lateThreshold: v })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time Out</label>
                  <TimePicker label="Time Out" value={eventForm.timeOut} onChange={v => setEventForm({ ...eventForm, timeOut: v })} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowEventForm(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-[var(--secondary)] hover:bg-[#0E3A65] text-white font-semibold rounded-xl transition-colors shadow-sm text-sm">Deploy Event</button>
            </div>
          </form>
        </Card>
      )}

      

      {!showEventForm && !showArchivedEvents && (
        <Card className="border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Events</h3>
          </div>
          <div className="divide-y divide-slate-50">
              {activeEventsList.map((evt, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                    evt.status === "active" ? "bg-emerald-50 border-emerald-100" : "bg-slate-100 border-slate-200")}>
                    <Building2 size={20} className={evt.status === "active" ? "text-emerald-600" : "text-slate-400"} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-800">{evt.name}</h4>
                      {evt.status === "active" ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide rounded-sm">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wide rounded-sm">Ended</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {evt.date || new Date().toISOString().split("T")[0]}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {formatTime12Hour(evt.timeIn)} – {formatTime12Hour(evt.timeOut)}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> UA Campus</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-center sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg space-y-2">
                  <div className="mt-2 flex items-center justify-center sm:justify-end gap-2">
                    <button onClick={async () => {
                      const updatedEvent: EventConfig = {
                        ...evt,
                        status: evt.status === "active" ? "inactive" : "active",
                      };
                      const saved = await updateEvent(updatedEvent);
                      dispatch({ type: "UPDATE_EVENT", payload: saved });
                    }}
                      className="px-3 py-1 text-xs font-semibold rounded-lg border transition-colors bg-white hover:bg-slate-50">
                      {evt.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => {
                      // start editing
                      setEditingEventId(evt.id);
                      setEventForm({ name: evt.name, date: evt.date || new Date().toISOString().split("T")[0], timeIn: evt.timeIn, lateThreshold: evt.lateThreshold, timeOut: evt.timeOut, status: evt.status });
                      setShowEventForm(true);
                    }}
                      className="px-3 py-1 text-xs font-semibold rounded-lg border transition-colors bg-[var(--primary)] text-white hover:bg-[#A61831]">
                      Edit
                    </button>
                    <button onClick={() => confirmDeleteEvent(evt)}
                      className="px-3 py-1 text-xs font-semibold rounded-lg border transition-colors bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200">
                      <Trash2 size={14} className="inline-block mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {activeEventsList.length === 0 && (
              <div className="p-8 text-center text-slate-500">No active events found. Create one to get started!</div>
            )}
          </div>
        </Card>
      )}

      {showArchivedEvents && (
        <Card className="border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <Archive size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Archived Events</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {archivedEventsList.map((evt, idx) => (
              <div key={idx} className="p-6 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-slate-200 border-slate-300">
                    <Archive size={20} className="text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 line-through">{evt.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {formatTime12Hour(evt.timeIn)} – {formatTime12Hour(evt.timeOut)}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-center sm:text-right p-3 sm:p-0">
                  <button onClick={() => confirmRestoreEvent(evt)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border transition-colors bg-white text-slate-600 hover:bg-slate-100">
                    Restore Event
                  </button>
                </div>
              </div>
            ))}
            {archivedEventsList.length === 0 && (
              <div className="p-8 text-center text-slate-400">No archived events found.</div>
            )}
          </div>
        </Card>
      )}

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete" ? "Delete Event" : "Restore Event"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "delete" 
                ? "Are you sure you want to delete this event? It will be moved to Archives." 
                : "Are you sure you want to restore this event?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeConfirmAction} className={confirmAction?.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-600' : ''}>
              {confirmAction?.type === "delete" ? "Delete" : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
