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
  const match = time24.match(/^(\d{2}):(\d{2})\s*(.*)$/);
  if (!match) return time24;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const extra = match[3];
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  
  return `${hours}:${minutes} ${ampm}${extra ? ` ${extra}` : ''}`;
}

export function formatNameLastFirst(fullName: string): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;

  const suffixes = new Set(["JR", "JR.", "SR", "SR.", "II", "III", "IV", "V", "VI"]);
  let suffix = "";
  
  if (suffixes.has(parts[parts.length - 1].toUpperCase())) {
    suffix = parts.pop()!;
  }

  if (parts.length === 0) return suffix;

  let lastName = parts.pop()!;
  const particles = new Set(["DE", "DELA", "SAN", "DEL", "LA", "LOS", "MAC", "MC", "VON", "VAN", "DER"]);
  
  if (parts.length > 0 && particles.has(parts[parts.length - 1].toUpperCase())) {
    lastName = `${parts.pop()!} ${lastName}`;
  }
  
  if (suffix) {
    return `${lastName}, ${parts.join(" ")}, ${suffix}`;
  }
  
  return `${lastName}, ${parts.join(" ")}`;
}
