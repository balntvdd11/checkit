import peakLogo from "../../../asset/1NEPEAK LOGO.png";

export default function DeveloperFooter() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full pb-6 sm:pb-8 pt-4 px-4 text-center text-black/60 text-[11px] sm:text-xs flex flex-col items-center z-10 pointer-events-none">
      <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 opacity-100">
        <span className="font-medium text-xs sm:text-sm text-black/80">Developed by:</span>
        <img src={peakLogo} alt="1NEPEAK" className="h-20 sm:h-24 w-auto object-contain invert opacity-80 drop-shadow-none" />
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 max-w-2xl mx-auto opacity-80 leading-relaxed font-medium">
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
