import { useState } from "react";
import { AlertTriangle, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import COAccessLogo from "../../components/shared/COAccessLogo";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

export default function InAppBrowserWarning() {
  const [copied, setCopied] = useState(false);

  const handleAction = () => {
    // Try Android intent to force open Chrome
    if (/android/i.test(navigator.userAgent)) {
      const url = window.location.href.replace(/^https?:\/\//, '');
      window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end;`;
    }
    
    // Copy to clipboard as a universal fallback
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="min-h-screen pb-[180px] sm:pb-[220px] landing-page-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md bg-black border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        <div className="mb-8 flex justify-center">
          <COAccessLogo size="md" />
        </div>
        
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
          <AlertTriangle size={32} className="text-amber-400" />
        </div>
        
        <h1 className="text-xl font-bold text-white mb-3">In-App Browser Detected</h1>
        
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          You are currently viewing this page inside an app like Messenger or Facebook. 
          For security reasons, COAccess's browser activation cannot run inside in-app browsers.
        </p>

        <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
          <p className="text-sm font-semibold text-white mb-2">How to fix this:</p>
          <ol className="text-xs text-slate-400 text-left list-decimal list-inside space-y-2">
            <li>Tap the three dots <span className="font-bold">...</span> or menu icon in the top/bottom corner of this screen.</li>
            <li>Select <span className="font-bold text-white">"Open in system browser"</span>, <span className="font-bold text-white">"Open in Safari"</span>, or <span className="font-bold text-white">"Open in Chrome"</span>.</li>
          </ol>
        </div>

        <button 
          onClick={handleAction}
          className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <ExternalLink size={16} />}
          {copied ? "Link Copied! Paste in Chrome/Safari" : "Open System Browser / Copy Link"}
        </button>
      </div>
      <DeveloperFooter />
      </div>
  );
}
