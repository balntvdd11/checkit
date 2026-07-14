import peakLogo from "../../../asset/1NEPEAK LOGO.png";

export default function DeveloperFooter() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full pb-6 sm:pb-8 pt-4 px-4 text-center text-white/50 text-[11px] sm:text-xs flex flex-col items-center z-10 pointer-events-none">
      <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 mb-2 sm:mb-3 opacity-90">
        <span className="font-bold tracking-[0.2em] uppercase text-[9px] sm:text-[10px] text-white/60">Developed by</span>
        <img src={peakLogo} alt="1NEPEAK" className="h-10 sm:h-12 w-auto object-contain mix-blend-screen drop-shadow-md" />
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 max-w-2xl mx-auto opacity-80 leading-relaxed">
        <span className="whitespace-nowrap">BONDOC, K.</span>
        <span className="whitespace-nowrap">DAVID, C.</span>
        <span className="whitespace-nowrap">GIRADO, S.</span>
        <span className="whitespace-nowrap">NATIVIDAD, B.</span>
        <span className="whitespace-nowrap">PASCUA, Z.</span>
        <span className="whitespace-nowrap">SALAC, J.</span>
        <span className="whitespace-nowrap">SICAT, M.</span>
      </div>
    </div>
  );
}
