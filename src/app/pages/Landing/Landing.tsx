import { motion } from "motion/react";
import coaLogo from "../../../asset/coalogo.png";
import studentPortalIcon from "../../../asset/studentportalICON.png";
import adminPortalIcon from "../../../asset/adminportalICON.png";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage({ onStudent, onAdmin }: { onStudent: () => void; onAdmin: () => void }) {

  return (
    <div className="min-h-screen pb-[180px] sm:pb-[220px] landing-page-black flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-0 pointer-events-none" />

      {/* static background illustration removed per request */}

      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 flex flex-col items-center px-4 w-full max-w-4xl mx-auto py-2">

        {/* Wordmark */}
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="flex flex-col items-center mb-1 -translate-y-16 sm:-translate-y-16">
          <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="relative w-40 sm:w-56 h-40 sm:h-56 shrink-0">
              <img src={coaLogo} alt="COAccess logo" className="relative z-10 w-full h-full object-contain drop-shadow-2xl rounded-full" />
            </div>
            <div className="flex items-center gap-0 checkit-wordmark text-5xl sm:text-7xl">
              <span className="checkit-wordmark__check">CO</span>
              <span className="checkit-wordmark__it">Access</span>
            </div>
          </div>
          <div className="relative -translate-y-10 sm:-translate-y-15 flex flex-col items-center justify-center w-full">
            <p className="text-black text-sm sm:text-lg font-medium text-center my-0 max-w-2xl px-2">
              Fast and Secure Event Attendance for COA students
            </p>
            <div className="mt-0 flex items-center justify-center gap-2 text-white/35 text-xs">
            </div>
          </div>
        </motion.div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-4xl mt-1">
          <motion.button
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={onStudent}
            className="group relative premium-border-card border-[1.5px] text-left rounded-2xl border border-[#7EEAF8]/24 bg-black hover:bg-[rgba(14,32,68,0.18)] hover:border-[#7EEAF8]/40 transition-all duration-200 p-6 sm:p-9 flex flex-col gap-4 sm:gap-6 cursor-pointer min-h-[200px] sm:min-h-[265px] h-auto overflow-hidden"
          >

            <img src={studentPortalIcon} alt="Student portal" className="w-16 h-16 sm:w-24 sm:h-24 object-contain" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-1.5">Student Portal</h2>
              <p className="text-[#d7f8ff]/50 text-xs sm:text-sm leading-relaxed">Generate Event Passes</p>
            </div>
            <div className="mt-auto" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={onAdmin}
            className="group relative premium-border-card border-[1.5px] text-left rounded-2xl border border-[#7EEAF8]/24 bg-black hover:bg-[rgba(14,32,68,0.18)] hover:border-[#7EEAF8]/40 transition-all duration-200 p-6 sm:p-9 flex flex-col gap-4 sm:gap-6 cursor-pointer min-h-[200px] sm:min-h-[265px] h-auto overflow-hidden"
          >

            <img src={adminPortalIcon} alt="Admin portal" className="w-24 h-24 object-contain" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-1.5">Admin Portal</h2>
              <p className="text-[#d7f8ff]/50 text-sm leading-relaxed">Manage Events and Reports</p>
            </div>
            <div className="mt-auto" />
          </motion.button>
        </div>
      </motion.div>
      <DeveloperFooter />
      </div>
  );
}
