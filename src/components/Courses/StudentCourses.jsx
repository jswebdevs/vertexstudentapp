// src/pages/student/courses/StudentCourses.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBook,
  FaCalendarAlt,
  FaClock,
  FaExternalLinkAlt,
  FaRedo,
  FaSpinner,
  FaLayerGroup,
  FaHourglassHalf,
  FaExclamationCircle
} from "react-icons/fa";
import { motion } from "framer-motion";
import useAuth from "../../../../hooks/useAuth";

const StudentCourses = () => {
  const { user } = useAuth();
  const studentId = user?._id || null;

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "https://backend.vertexforbcs.org/api";

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (expiryDate) => {
    const total = Date.parse(expiryDate) - Date.parse(new Date());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Expired";
  };

  const fetchData = async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      const [userRes, quizRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${studentId}`),
        fetch(`${API_BASE_URL}/quizzes`),
      ]);

      if (!userRes.ok || !quizRes.ok) throw new Error("Failed to fetch data");

      const userData = await userRes.json();
      const quizData = await quizRes.json();

      setEnrolledCourses(userData.courses || []);
      setAllQuizzes(quizData);
    } catch (err) {
      console.error(err);
      setError("Could not load course data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
      </div>
    );

  if (error) 
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-500 font-bold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center sm:justify-start gap-3">
            <FaBook className="text-purple-600 dark:text-purple-400" />
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Manage your learning journey and track progress.
          </p>
        </div>
        <Link to="/student/add-courses">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-purple-500/30 transition-all text-sm"
          >
            + Add New Course
          </motion.button>
        </Link>
      </div>

      {enrolledCourses.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {enrolledCourses.map((course) => {
            const courseQuizzes = allQuizzes
              .filter((q) => q.courseID === course.courseId)
              .sort((a, b) => new Date(a.quizDate) - new Date(b.quizDate));

            const isExpired = getDaysRemaining(course.expiryDate) === "Expired";

            return (
              <motion.div
                key={course.courseId}
                variants={cardVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Card Header */}
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      course.plan === "Lifetime" 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                    }`}>
                      {course.plan} Plan
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] font-bold ${
                      isExpired ? "text-red-500" : "text-green-500"
                    }`}>
                      <FaHourglassHalf /> {getDaysRemaining(course.expiryDate)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-tight line-clamp-2">
                    {course.title}
                  </h2>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                     <FaCalendarAlt /> Expires: {formatDate(course.expiryDate)}
                  </div>
                </div>

                {/* Card Body - Quizzes */}
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FaLayerGroup /> Upcoming Quizzes
                  </h3>
                  
                  <div className="flex-grow bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700">
                    {courseQuizzes.length > 0 ? (
                      <ul className="space-y-2">
                        {courseQuizzes.map((quiz) => (
                          <li
                            key={quiz._id}
                            className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col gap-1"
                          >
                            <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-300 line-clamp-1">
                              {quiz.quizTitle}
                            </span>
                            <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1"><FaCalendarAlt /> {formatDate(quiz.quizDate)}</span>
                              <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"><FaClock /> {quiz.startTime}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic">
                        <FaExclamationCircle className="mb-1 text-lg opacity-50" />
                        No quizzes scheduled
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 bg-gray-50/50 dark:bg-gray-800">
                  <Link to={`/student/view-course/${course.courseId}`} className="w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold shadow-md transition-colors"
                    >
                      View <FaExternalLinkAlt />
                    </motion.button>
                  </Link>

                  <Link to={`/student/edit-course`} className="w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-600 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-600 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                      <FaRedo /> Update
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 px-4"
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
              <FaBook className="text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              No Active Enrollments
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              You haven't enrolled in any courses yet. Start your journey today!
            </p>
            <Link to="/student/add-courses">
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all">
                Browse Available Courses
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentCourses;