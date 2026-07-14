import peakLogo from "../../../asset/1NEPEAK LOGO.png";

export default function DeveloperFooter() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full pb-4 sm:pb-6 pt-4 text-center text-white/40 text-[10px] sm:text-xs flex flex-col items-center z-10 pointer-events-none">
      <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2 opacity-60">
        <span className="font-bold tracking-[0.2em] uppercase mt-0.5">Developed by</span>
        <img src={peakLogo} alt="1NEPEAK" className="h-6 sm:h-7 object-contain mix-blend-screen -ml-1" />
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-lg mx-auto opacity-75">
        <span>BONDOC, K.</span>
        <span>DAVID, C.</span>
        <span>GIRADO, S.</span>
        <span>NATIVIDAD, B.</span>
        <span>PASCUA, Z.</span>
        <span>SALAC, J.</span>
        <span>SICAT, M.</span>
      </div>
    </div>
  );
}
