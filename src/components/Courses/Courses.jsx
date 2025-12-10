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
  FaExclamationCircle,
  FaEye
} from "react-icons/fa";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";

const Courses = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 py-6">
      
      {/* LAYOUT CONTAINER: 
        - Centered on screen.
        - Fixed width (768px) on large devices.
        - Full width on mobile/tablet up to 768px.
      */}
      <div className="w-full md:w-[768px] mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center gap-2">
              <FaBook className="text-purple-600 dark:text-purple-400" />
              My Courses
            </h1>
          </div>
          <Link to="/add-course" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-gray-900 dark:bg-gray-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-purple-500/10 text-sm transition-all"
            >
              + Add Course
            </motion.button>
          </Link>
        </div>

        {enrolledCourses.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4" // Single Column Layout
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
                  className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 p-5"
                >
                  
                  {/* --- RIGHT SIDE BUTTONS (Absolute Positioned) --- */}
                  <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
                    {/* View Button */}
                    <Link to={`/view-course/${course.courseId}`}>
                      <button className="w-24 h-8 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] uppercase font-bold rounded shadow-md shadow-indigo-500/20 transition-all">
                        <FaEye /> View
                      </button>
                    </Link>

                    {/* Update Button (Just under view) */}
                    <Link to={`/update-course`}>
                      <button className="w-24 h-8 flex items-center justify-center gap-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50 text-[10px] uppercase font-bold rounded shadow-sm transition-all border border-pink-200 dark:border-pink-800">
                        <FaRedo /> Update
                      </button>
                    </Link>
                  </div>

                  {/* --- LEFT CONTENT --- */}
                  <div className="pr-28"> {/* Padding Right to avoid overlap with buttons */}
                    
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        course.plan === "Lifetime"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                      }`}>
                        {course.plan}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${
                        isExpired ? "text-red-500" : "text-green-500"
                      }`}>
                        <FaHourglassHalf size={10} /> {getDaysRemaining(course.expiryDate)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-tight mb-1">
                      {course.title}
                    </h2>
                    
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-4">
                      <FaCalendarAlt /> Expires: {formatDate(course.expiryDate)}
                    </div>
                  </div>

                  {/* --- QUIZ LIST SECTION (Hidden Scrollbar) --- */}
                  <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FaLayerGroup /> Upcoming Quizzes (Tests)
                    </h3>
                    
                    {/* Scroll Container with 'no-scrollbar' class */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 max-h-32 overflow-y-auto no-scrollbar border border-gray-100 dark:border-gray-700">
                      {courseQuizzes.length > 0 ? (
                        <ul className="space-y-2">
                          {courseQuizzes.map((quiz) => (
                            <li
                              key={quiz._id}
                              className="bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 flex justify-between items-center"
                            >
                              <span className="font-semibold text-xs text-gray-700 dark:text-gray-200 line-clamp-1 w-2/3">
                                {quiz.quizTitle}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <FaClock size={8}/> {quiz.startTime}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="py-4 flex flex-col items-center justify-center text-gray-400 text-xs italic">
                          <FaExclamationCircle className="mb-1 opacity-50" />
                          No quizzes scheduled
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center w-full">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                <FaBook className="text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                No Active Enrollments
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You haven't enrolled in any courses yet.
              </p>
              <Link to="/add-courses">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all text-sm">
                   Available Courses
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Styles to hide scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default Courses;