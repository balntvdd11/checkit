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

        {/* Logo and Subtitle */}
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="flex flex-col items-center mb-8 sm:mb-12 mt-4 sm:mt-0">
          <div className="relative w-80 sm:w-[400px] h-80 sm:h-[400px] shrink-0 mb-0">
            <img src={coaLogo} alt="COA logo" className="relative z-10 w-full h-full object-contain drop-shadow-2xl rounded-full" />
          </div>
          <div className="relative flex flex-col items-center justify-center w-full -mt-24 sm:-mt-32">
            <p className="bg-white text-[#123499] px-3 sm:px-5 py-2 rounded-full shadow-sm text-[11px] sm:text-lg font-bold text-center my-0 whitespace-nowrap max-w-full">
              Fast and Secure Event Attendance for COA students
            </p>
          </div>
        </motion.div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-4xl">
          <motion.button
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={onStudent}
            className="group relative premium-border-card border-[1.5px] text-left rounded-2xl border border-[#7EEAF8]/24 bg-gradient-to-br from-[#123499] to-[#0a2472] hover:from-[#1a4ac2] hover:to-[#0f3099] shadow-xl shadow-[#123499]/20 transition-all duration-300 p-6 sm:p-9 flex flex-col gap-4 sm:gap-6 cursor-pointer min-h-[200px] sm:min-h-[265px] h-auto overflow-hidden"
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
            className="group relative premium-border-card border-[1.5px] text-left rounded-2xl border border-[#7EEAF8]/24 bg-gradient-to-br from-[#123499] to-[#0a2472] hover:from-[#1a4ac2] hover:to-[#0f3099] shadow-xl shadow-[#123499]/20 transition-all duration-300 p-6 sm:p-9 flex flex-col gap-4 sm:gap-6 cursor-pointer min-h-[200px] sm:min-h-[265px] h-auto overflow-hidden"
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
