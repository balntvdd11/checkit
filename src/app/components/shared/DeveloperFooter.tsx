import peakLogo from "../../../asset/1NEPEAK LOGO.png";
import citLogo from "../../../asset/citlogo.png";

export default function DeveloperFooter() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full pb-6 sm:pb-8 pt-4 px-4 text-center text-[#0a2472] text-[11px] sm:text-xs flex flex-col items-center z-10 pointer-events-none">
      <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 mb-0">
        <span className="font-bold text-xs sm:text-sm text-[#0a2472]">Developed by:</span>
        <img 
          src={peakLogo} 
          alt="1NEPEAK" 
          className="h-20 sm:h-24 w-auto object-contain drop-shadow-none" 
          style={{ filter: "brightness(0) saturate(100%) invert(13%) sepia(43%) saturate(4681%) hue-rotate(213deg) brightness(88%) contrast(101%)" }}
        />
        <a href="https://ua-cit.com" target="_blank" rel="noopener noreferrer" className="pointer-events-auto -ml-3 sm:-ml-4">
          <img 
            src={citLogo} 
            alt="CIT Logo" 
            className="h-12 sm:h-16 w-auto object-contain drop-shadow-none" 
          />
        </a>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 max-w-2xl mx-auto font-bold -mt-3 sm:-mt-4">
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
