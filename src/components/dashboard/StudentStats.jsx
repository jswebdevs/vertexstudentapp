<<<<<<< HEAD
import { motion } from "framer-motion";
import { 
  FaBookOpen, 
  FaChartLine, 
  FaCheckCircle, 
  FaCalendarAlt 
} from "react-icons/fa";
=======

>>>>>>> f1ca4728081b52ee59c7252d4450072925164495

const StudentStats = ({ studentData }) => {
  // --- Safety Check ---
  if (!studentData || !studentData.courses) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No statistics available.
      </div>
    );
  }

  // --- 1. Logic (Preserved) ---
  const totalCourses = studentData.courses.length;

  // Calculate the average marks from quizzes attended
  const totalMarks = studentData.courses.reduce((acc, course) => {
    const attendedQuizzes = course.QuizAttended || [];
    return (
      acc + attendedQuizzes.reduce((quizAcc, quiz) => quizAcc + quiz.marks, 0)
    );
  }, 0);

  const totalQuizzesAttended = studentData.courses.reduce((acc, course) => {
    return acc + (course.QuizAttended ? course.QuizAttended.length : 0);
  }, 0);

  // Upcoming quizzes calculation
  const upcomingQuizzes = studentData.courses.flatMap(
    (course) => course.upComingQuizes || [] // Added safety fallback
  );

  const averageMarks =
    totalQuizzesAttended > 0
      ? (totalMarks / totalQuizzesAttended).toFixed(2)
      : 0;

  // --- 2. Data Mapping for UI ---
  const statsItems = [
    {
      id: 1,
      label: "Total Courses",
      value: totalCourses,
      icon: FaBookOpen,
      color: "from-indigo-500 to-blue-500",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      id: 2,
      label: "Average Marks",
      value: averageMarks,
      icon: FaChartLine,
      color: "from-purple-500 to-pink-500",
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      id: 3,
      label: "Quizzes Attended",
      value: totalQuizzesAttended,
      icon: FaCheckCircle,
      color: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      id: 4,
      label: "Upcoming Quizzes",
      value: upcomingQuizzes.length,
      icon: FaCalendarAlt,
      color: "from-orange-500 to-red-500",
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  // --- 3. Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, type: "spring", stiffness: 100 } 
    },
  };

  // --- 4. Render ---
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
    >
      {statsItems.map((stat) => (
        <motion.div
          key={stat.id}
          variants={itemVariants}
          whileHover={{ scale: 1.03, y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl dark:shadow-purple-900/10 border border-gray-100 dark:border-gray-700 transition-all duration-300 flex flex-col justify-between h-full"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {stat.label}
              </h3>
              <div className={`text-3xl font-extrabold mt-1 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                {stat.value}
              </div>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.iconColor}`}>
              <stat.icon size={24} />
            </div>
          </div>
          
          {/* Decorative progress bar line at bottom */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className={`h-full bg-gradient-to-r ${stat.color}`} 
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StudentStats;