import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

// ─── Card Shell ───────────────────────────────────────────────────────────────

export default function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-[0_4px_32px_rgba(11,42,77,0.08)]", className)}>
      {children}
    </div>
  );
}
