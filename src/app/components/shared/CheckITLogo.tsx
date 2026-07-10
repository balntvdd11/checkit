import checkITLogo from "../../../asset/checkITlogo.png";
import { cn } from "../../lib/utils";

// ─── Logo ─────────────────────────────────────────────────────────────────────

export default function CheckITLogo({ size = "md", inverted }: { size?: "sm" | "md" | "lg"; inverted?: boolean }) {
  void inverted; // prop accepted for API compatibility; visual variant handled by parent context/CSS
  const iconBox = { sm: "w-24 h-24", md: "w-36 h-36", lg: "w-48 h-48" };
  const text = { sm: "text-xl", md: "text-5xl", lg: "text-6xl" };
  return (
    <div className={cn("flex items-center", text[size])}>
      <img src={checkITLogo} alt="CheckIT logo" className={cn("object-contain block self-center", iconBox[size])} />
      <div className={cn(
        "flex items-baseline leading-none checkit-wordmark",
        size === "sm" ? "-ml-6 -translate-y-0.5" : size === "md" ? "-ml-10 -translate-y-1" : "-ml-14 -translate-y-1"
      )}>
        <span className="checkit-wordmark__check">Check</span>
        <span className="checkit-wordmark__it">IT</span>
      </div>
    </div>
  );
}
