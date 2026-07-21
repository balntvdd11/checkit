import { AlertTriangle, ExternalLink } from "lucide-react";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import COAccessLogo from "../../components/shared/COAccessLogo";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

export default function InAppBrowserWarning() {
  const handleAction = () => {
    const url = window.location.href;
    if (/android/i.test(navigator.userAgent)) {
      const cleanUrl = url.replace(/^https?:\/\//, '');
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end;`;
    } else {
      // Attempt to force open system browser on iOS
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Fallback
      setTimeout(() => {
        window.location.href = url;
      }, 500);
    }
  };

  return (
    <div className="min-h-[100dvh] pb-[180px] sm:pb-[220px] landing-page-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-sm bg-black border border-white/10 rounded-3xl p-6 shadow-2xl text-center">
        <div className="mb-6 flex justify-center">
          <COAccessLogo size="md" inverted />
        </div>
        
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <AlertTriangle size={28} className="text-amber-400" />
        </div>
        
        <h1 className="text-lg font-bold text-white mb-2">In-App Browser Detected</h1>
        
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Please open this page in your system browser.
        </p>

        <button 
          onClick={handleAction}
          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink size={16} />
          Open System Browser
        </button>
      </div>
      <DeveloperFooter />
    </div>
  );
}
