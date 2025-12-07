import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function Error({ code = 404, message = "Page Not Found" }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center p-6 sm:p-8 md:p-10 max-w-sm sm:max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl transition-colors duration-300"
      >
        <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 text-purple-600 dark:text-purple-400 mb-4 transition-colors duration-300" />
        <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-700 dark:text-gray-200 mb-2 transition-colors duration-300">
          {code}
        </h1>
        <p className="text-base sm:text-xl font-medium text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
          {message}
        </p>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow:
              "0 10px 15px -3px rgba(139, 92, 246, 0.5), 0 4px 6px -2px rgba(139, 92, 246, 0.05)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-600/50 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 cursor-pointer text-base w-full sm:w-auto"
        >
          Go Back Home
        </motion.button>
      </motion.div>
    </div>
  );
}
