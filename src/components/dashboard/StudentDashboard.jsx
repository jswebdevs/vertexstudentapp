import { motion } from "framer-motion";
import { FaUserGraduate, FaSpinner, FaBan } from "react-icons/fa";
import useAuth from "../../../../hooks/useAuth";
import StudentCalendar from "./StudentCalendar";

const StudentDashboard = () => {
  const { user, userType } = useAuth();

  // --- Animation Variants ---
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // --- 1. Loading State ---
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  // --- 2. Access Denied State ---
  if (userType !== "student") {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl border border-red-100 dark:border-red-800 text-center shadow-xl">
          <FaBan className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-red-600 dark:text-red-300">
            This dashboard is restricted to student accounts only.
          </p>
        </div>
      </div>
    );
  }

  // --- 3. Main Dashboard ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 p-4 sm:p-8">
      
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              {user.avatar ? (
                 <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800" />
              ) : (
                 <FaUserGraduate className="text-white text-2xl" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Welcome back, {user.firstName || user.username}!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Here is your learning schedule and upcoming quizzes.
              </p>
            </div>
          </div>
          
          <div className="hidden sm:block text-right">
             <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                STUDENT PORTAL
             </span>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="relative">
           {/* Decorative background blur behind calendar */}
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 blur-3xl rounded-full -z-10" />
           
           <StudentCalendar />
        </div>

      </motion.div>
    </div>
  );
};

export default StudentDashboard;