import { useState, useRef, useEffect, useCallback } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a "HH:MM" 24h string → { hour12, minute, ampm } */
function parse24(value: string) {
  const [hStr, mStr] = (value || "08:00").split(":");
  let h = parseInt(hStr ?? "8", 10);
  const m = parseInt(mStr ?? "0", 10);
  const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return { hour12: h, minute: m, ampm };
}

/** Convert { hour12, minute, ampm } → "HH:MM" 24h */
function to24(hour12: number, minute: number, ampm: "AM" | "PM"): string {
  let h = hour12 % 12;
  if (ampm === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// ─── Drum column ─────────────────────────────────────────────────────────────

const ITEM_H = 40; // px per item

function DrumColumn({
  items,
  selectedIndex,
  onSelect,
  label,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  label?: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);

  const MULTIPLIER = 30; // 30 before, 1 center, 30 after = 61 copies
  const MIDDLE_OFFSET = items.length * MULTIPLIER;
  const TOTAL_ITEMS = items.length * (MULTIPLIER * 2 + 1);

  // Sync scroll to selectedIndex
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const currentIdx = Math.round(el.scrollTop / ITEM_H);
    const currentModulo = currentIdx % items.length;
    
    // Only snap if we are completely out of sync (initial mount or external change)
    if (currentModulo !== selectedIndex) {
      el.scrollTop = (MIDDLE_OFFSET + selectedIndex) * ITEM_H;
    }
  }, [selectedIndex, items.length, MIDDLE_OFFSET]);

  // Snap on scroll end
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isDragging.current) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(TOTAL_ITEMS - 1, idx));
    const moduloIdx = clamped % items.length;
    
    if (moduloIdx !== selectedIndex) {
      onSelect(moduloIdx);
    }
  }, [items.length, selectedIndex, onSelect, TOTAL_ITEMS]);

  // Mouse drag support
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startScroll.current = listRef.current?.scrollTop ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !listRef.current) return;
    listRef.current.scrollTop = startScroll.current - (e.clientY - startY.current);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    handleScroll();
    
    // Recenter gently when interaction finishes
    const el = listRef.current;
    if (el) {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const moduloIdx = idx % items.length;
      el.scrollTop = (MIDDLE_OFFSET + moduloIdx) * ITEM_H;
    }
  };

  return (
    <div className="flex flex-col items-center select-none" style={{ width: 56 }}>
      {label && (
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </span>
      )}
      <div className="relative" style={{ height: ITEM_H * 3, width: 56, overflow: "hidden" }}>
        {/* Selection highlight */}
        <div
          className="absolute inset-x-0 pointer-events-none z-10 rounded-lg"
          style={{
            top: ITEM_H,
            height: ITEM_H,
            background: "rgba(18,52,153,0.08)",
          }}
        />
        {/* Top & bottom fade */}
        <div
          className="absolute inset-x-0 top-0 z-10 pointer-events-none"
          style={{
            height: ITEM_H,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.95), transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: ITEM_H,
            background: "linear-gradient(to top, rgba(255,255,255,0.95), transparent)",
          }}
        />
        <ul
          ref={listRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="overflow-y-scroll cursor-grab active:cursor-grabbing"
          style={{
            height: "100%",
            scrollSnapType: "y mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* top padding */}
          <li style={{ height: ITEM_H, flexShrink: 0 }} />
          {Array.from({ length: MULTIPLIER * 2 + 1 }).map((_, blockIdx) => (
            <div key={blockIdx} style={{ display: "contents" }}>
              {items.map((item, i) => {
                const absoluteIdx = blockIdx * items.length + i;
                const isSelected = i === selectedIndex;
                return (
                  <li
                    key={absoluteIdx}
                    onClick={() => {
                      if (listRef.current) {
                        listRef.current.scrollTop = absoluteIdx * ITEM_H;
                      }
                      onSelect(i);
                    }}
                    style={{
                      height: ITEM_H,
                      scrollSnapAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontWeight: isSelected ? 700 : 400,
                      fontSize: isSelected ? 20 : 15,
                      color: isSelected ? "#123499" : "#94a3b8",
                      transition: "font-size 0.15s, color 0.15s, font-weight 0.15s",
                    }}
                  >
                    {item}
                  </li>
                );
              })}
            </div>
          ))}
          {/* bottom padding */}
          <li style={{ height: ITEM_H, flexShrink: 0 }} />
        </ul>
      </div>
    </div>
  );
}

// ─── Main TimePicker ──────────────────────────────────────────────────────────

export interface TimePickerProps {
  label: string;
  value: string; // "HH:MM" 24h
  onChange: (val: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export default function TimePicker({ label, value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = parse24(value);
  const [hour12, setHour12] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(parsed.ampm);

  // Re-sync local state when `value` prop changes externally
  useEffect(() => {
    const p = parse24(value);
    setHour12(p.hour12);
    setMinute(p.minute);
    setAmpm(p.ampm);
  }, [value]);

  const handleOpen = () => {
    const p = parse24(value);
    setHour12(p.hour12);
    setMinute(p.minute);
    setAmpm(p.ampm);
    setOpen(true);
  };

  const handleSet = () => {
    onChange(to24(hour12, minute, ampm));
    setOpen(false);
  };

  const display = (() => {
    const p = parse24(value);
    return `${String(p.hour12).padStart(2, "0")}:${String(p.minute).padStart(2, "0")} ${p.ampm}`;
  })();

  const hourIdx = hour12 - 1; // 1-based → 0-based
  const minuteIdx = minute;

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-left font-medium text-slate-700 bg-white flex items-center justify-between"
      >
        <span>{display}</span>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.30)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl px-6 py-5 flex flex-col items-center"
            style={{ minWidth: 240, maxWidth: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <p className="text-sm font-bold text-slate-700 mb-4">{label}</p>

            {/* Drums row */}
            <div className="flex items-center gap-1">
              {/* Hours */}
              <DrumColumn
                items={HOURS}
                selectedIndex={hourIdx}
                onSelect={(i) => setHour12(i + 1)}
              />

              {/* Colon */}
              <span className="text-2xl font-bold text-slate-700 pb-1 select-none">:</span>

              {/* Minutes */}
              <DrumColumn
                items={MINUTES}
                selectedIndex={minuteIdx}
                onSelect={(i) => setMinute(i)}
              />

              {/* AM/PM */}
              <div className="flex flex-col gap-1.5 ml-3">
                {(["AM", "PM"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setAmpm(period)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      ampm === period
                        ? "bg-[#123499] text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5 w-full">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSet}
                className="flex-1 py-2.5 rounded-xl bg-[#123499] hover:bg-[#0e2a7d] text-white text-sm font-bold transition-colors shadow-sm"
              >
                Set Time
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
