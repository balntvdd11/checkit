import { motion } from "motion/react";
import { ShieldAlert, LogOut } from "lucide-react";
import Card from "../../components/shared/Card";
import COAccessLogo from "../../components/shared/COAccessLogo";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import { useClerk } from "@clerk/clerk-react";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

export default function DeviceConflict({ email, savedOS, onCancel }: { email: string; savedOS?: string; onCancel: () => void }) {
  const clerk = useClerk();

  const handleSignOut = async () => {
    await clerk.signOut();
    onCancel();
  };

  return (
    <div className="relative min-h-screen pb-[180px] sm:pb-[220px] bg-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center mb-6">
          <COAccessLogo size="md" />
        </motion.div>

        <Card className="p-6 backdrop-blur-xl bg-slate-800/80 border-red-500/30">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <ShieldAlert size={32} className="text-red-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Device Locked</h2>
            
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              The account <span className="font-semibold text-white break-all">{email}</span> is already permanently locked to {savedOS ? `a ${savedOS}` : "another"} device. 
              <br /><br />
              COAccess strictly enforces a <strong>one device per student</strong> policy. You cannot log in from this browser or device.
              <br /><br />
              If you have any concerns, please contact the <a href="https://www.facebook.com/share/14kWxCeL3H1/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium">JPIA facebook page</a>.
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </Card>
      </div>
      <DeveloperFooter />
      </div>
  );
}
