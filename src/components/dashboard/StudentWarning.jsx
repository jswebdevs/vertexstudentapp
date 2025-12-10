import { useEffect, useState } from "react";
<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaExclamationTriangle, 
  FaClock, 
  FaCoffee, 
  FaCheckCircle 
} from "react-icons/fa";
=======

>>>>>>> f1ca4728081b52ee59c7252d4450072925164495

const StudentWarning = ({ quizzes }) => {
  const [warningMessages, setWarningMessages] = useState([]);
  
  useEffect(() => {
    const checkQuizzes = () => {
      // 1. Safety Check
      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        setWarningMessages([
          {
            text: "Stay Relaxed, No exams in the next 24 hours.",
            type: "info",
          },
        ]);
        return;
      }

      const today = new Date();
      const messages = [];

      // 2. Ongoing Quizzes Logic
      const ongoingQuizzes = quizzes.filter((quiz) => {
        if (!quiz || !quiz.quizDate || !quiz.endTime) return false;
        
        // Handle date string safely
        const datePart = quiz.quizDate.includes("T") ? quiz.quizDate.split("T")[0] : quiz.quizDate;
        
        const quizStartTime = new Date(`${datePart}T${quiz.startTime}`);
        const quizEndTime = new Date(`${datePart}T${quiz.endTime}`);
        return today >= quizStartTime && today <= quizEndTime;
      });

      if (ongoingQuizzes.length > 0) {
        ongoingQuizzes.forEach((quiz) => {
          const datePart = quiz.quizDate.includes("T") ? quiz.quizDate.split("T")[0] : quiz.quizDate;
          const startTimeDisplay = new Date(`${datePart}T${quiz.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          messages.push({
            text: `LIVE NOW: Quiz "${quiz.quizTitle}" started at ${startTimeDisplay}.`,
            type: "ongoing",
            title: "Happening Now!",
          });
        });
      }

      // 3. Upcoming Quizzes Logic (Next 24 Hours)
      const upcomingQuizzes = quizzes.filter((quiz) => {
        if (!quiz || !quiz.quizDate) return false;

        const datePart = quiz.quizDate.includes("T") ? quiz.quizDate.split("T")[0] : quiz.quizDate;
        const quizDate = new Date(`${datePart}T${quiz.startTime}`);
        const timeDifference = quizDate - today;
        
        return timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000;
      });

      if (upcomingQuizzes.length > 0) {
        upcomingQuizzes.forEach((quiz) => {
          const datePart = quiz.quizDate.includes("T") ? quiz.quizDate.split("T")[0] : quiz.quizDate;
          const quizDate = new Date(`${datePart}T${quiz.startTime}`);
          const timeRemaining = quizDate - today;

          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

          const validHours = Math.max(0, hours);
          const validMinutes = Math.max(0, minutes);

          messages.push({
            text: `Quiz "${quiz.quizTitle}" starts in ${validHours}h ${validMinutes}m.`,
            type: "upcoming",
            title: "Upcoming Exam",
          });
        });
      }

      // 4. Default Relax Message
      if (messages.length === 0) {
        messages.push({
          text: "You're all clear! No exams scheduled for the next 24 hours.",
          type: "info",
          title: "Relax Mode On",
        });
      }

      setWarningMessages(messages);
    };

    checkQuizzes();
    
    // Optional: Refresh every minute to keep timers accurate
    const timer = setInterval(checkQuizzes, 60000);
    return () => clearInterval(timer);
    
  }, [quizzes]);

  // --- Styles Helper ---
  const getAlertStyle = (type) => {
    switch (type) {
      case "ongoing":
        return {
          bg: "bg-emerald-500",
          border: "border-emerald-600",
          icon: <FaClock className="text-2xl animate-pulse" />,
          shadow: "shadow-emerald-500/30"
        };
      case "upcoming":
        return {
          bg: "bg-gradient-to-r from-red-500 to-pink-600",
          border: "border-pink-600",
          icon: <FaExclamationTriangle className="text-2xl animate-bounce" />,
          shadow: "shadow-pink-500/30"
        };
      default: // info
        return {
          bg: "bg-gradient-to-r from-indigo-500 to-blue-500",
          border: "border-indigo-600",
          icon: <FaCoffee className="text-2xl" />,
          shadow: "shadow-indigo-500/30"
        };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <AnimatePresence>
        {warningMessages.map((msg, index) => {
          const style = getAlertStyle(msg.type);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5, type: "spring" }}
              className={`relative overflow-hidden rounded-xl p-5 text-white shadow-lg ${style.shadow} ${style.bg} border border-white/20`}
            >
              {/* Decorative Background Blob */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm shadow-inner">
                  {style.icon}
                </div>
                
                <div className="flex-1">
                  {msg.title && (
                    <h3 className="font-bold text-lg uppercase tracking-wide opacity-90 mb-1">
                      {msg.title}
                    </h3>
                  )}
                  <p className="font-medium text-base leading-relaxed">
                    {msg.text}
                  </p>
                </div>

                {msg.type === "ongoing" && (
                   <button className="hidden sm:block px-4 py-2 bg-white text-emerald-600 font-bold rounded-lg shadow hover:bg-emerald-50 transition-colors text-sm">
                     Join Now
                   </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default StudentWarning;