import coaLogo from "../../../asset/coalogo.png";
import { cn } from "../../lib/utils";

// ─── Logo ─────────────────────────────────────────────────────────────────────

export default function COAccessLogo({ size = "md", inverted }: { size?: "sm" | "md" | "lg"; inverted?: boolean }) {
  const iconBox = { sm: "w-12 h-12 sm:w-14 sm:h-14", md: "w-16 h-16 sm:w-20 sm:h-20", lg: "w-20 h-20 sm:w-24 sm:h-24" };
  const text = { sm: "text-2xl", md: "text-4xl sm:text-5xl", lg: "text-5xl sm:text-6xl" };
  return (
    <a href="/" className={cn("flex items-center gap-3 sm:gap-4 hover:opacity-90 transition-opacity", text[size])} title="Go to home">
      <img src={coaLogo} alt="COAccess logo" className={cn("object-contain block self-center shadow-lg rounded-full", iconBox[size], inverted ? "drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] bg-white/20 p-1" : "")} />
    </a>
  );
}
