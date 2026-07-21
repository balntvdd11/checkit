import { AlertTriangle, ExternalLink, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import COAccessLogo from "../../components/shared/COAccessLogo";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

export default function InAppBrowserWarning() {
  const [copied, setCopied] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsAndroid(/android/i.test(ua));
  }, []);

  const handleAction = () => {
    if (isAndroid) {
      const url = window.location.href.replace(/^https?:\/\//, '');
      window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end;`;
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
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
        
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Please open this page in your system browser for the best experience.
        </p>

        {isIOS && (
          <div className="mb-6 text-sm text-amber-200/90 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-left">
            <p className="mb-2"><strong>How to open in Safari:</strong></p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Tap the <strong>...</strong> menu or share icon at the bottom right.</li>
              <li>Select <strong>Open in System Browser</strong> or <strong>Open in Safari</strong>.</li>
            </ol>
          </div>
        )}

        <button 
          onClick={handleAction}
          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isAndroid ? (
            <>
              <ExternalLink size={16} /> Open System Browser
            </>
          ) : (
            <>
              <Copy size={16} /> {copied ? "Link Copied!" : "Copy Link"}
            </>
          )}
        </button>
      </div>
      <DeveloperFooter />
    </div>
  );
}
