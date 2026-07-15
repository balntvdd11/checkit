// ─── Helpers ──────────────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateCheckItCode(eventName: string): string {
  const normalized = eventName.trim().toUpperCase();
  if (!normalized) return "EVT";
  if (normalized.includes("ORIENTATION")) return "ORIENT";
  if (normalized.includes("TECHKADA")) return "TchKD";

  const words = normalized.split(/[^A-Z0-9]+/).filter(Boolean);
  if (words.length === 0) return "EVT";

  const compact = words
    .map(word => {
      if (word.length <= 3) return word;
      return `${word.slice(0, 2)}${word.slice(-1)}`;
    })
    .join("");

  return compact.length > 8 ? compact.slice(0, 8) : compact || "EVT";
}

export function formatTime12Hour(time24: string | undefined | null): string {
  if (!time24) return "";
  const [hoursStr, minutesStr] = time24.split(":");
  if (!hoursStr || !minutesStr) return time24;
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  return `${hours}:${minutesStr} ${ampm}`;
}
