// src/pages/courses/AddCourse.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCartPlus, FaSearch, FaTag, FaBookOpen, FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import Cart from "./Cart"; // Ensure this path is correct

const AddCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Modal State ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // 1. Fetch All Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://backend.vertexforbcs.org/api/courses");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setAllCourses(data);
          setAvailableCourses(data);
        } else {
          console.error("API did not return an array:", data);
          setAllCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    if (!allCourses.length) return;

    let filtered = [...allCourses];

    // Remove Enrolled Courses
    if (user && user.courses && user.courses.length > 0) {
      const enrolledIds = user.courses.map((c) => {
        const id = c.courseId?._id || c.courseId;
        return id ? id.toString() : null;
      }).filter(Boolean);

      filtered = filtered.filter((course) => 
        !enrolledIds.includes(course._id.toString())
      );
    }

    // Apply Search Filter
    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.title?.toLowerCase().includes(lowerTerm) ||
        course.category?.toLowerCase().includes(lowerTerm)
      );
    }

    setAvailableCourses(filtered);
  }, [user, allCourses, searchTerm]);

  // --- Handler to Open Cart ---
  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setIsCartOpen(true);
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    // pb-24 ensures the bottom content is not hidden
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 pb-24">
      
      {/* LAYOUT CONTAINER: Fixed width 768px on Desktop, Centered */}
      <div className="w-full md:w-[768px] mx-auto space-y-6">
        
        {/* --- Header & Search --- */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
          
          {/* Title Row */}
          <div className="flex items-center gap-3">
             <button
                onClick={() => navigate(-1)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:text-purple-600 transition-colors"
              >
                <FaArrowLeft size={14} />
              </button>
            <div>
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 leading-tight">
                Explore Courses
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Find your next learning path.
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or category..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- Course List (Single Column Stack) --- */}
        {availableCourses.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5" // Vertical Stack
          >
            {availableCourses.map((course) => (
              <motion.div
                key={course._id}
                variants={cardVariants}
                // Removed whileHover scale effect
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden"
              >
                {/* Image Section (No Hover Zoom) */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  {course.courseImage ? (
                    <img
                      src={course.courseImage}
                      alt={course.title}
                      className="w-full h-full object-cover" // Removed hover scale class
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      <FaBookOpen className="text-4xl opacity-20 mb-2" />
                      <span className="text-[10px] font-semibold opacity-40 uppercase tracking-widest">No Preview</span>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-md text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded shadow-sm border border-indigo-100 dark:border-indigo-900 uppercase tracking-wide">
                      {course.category || "General"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white line-clamp-2 leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {course.description || "No description available for this course yet."}
                    </p>

                    {/* Meta Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-2 py-1 rounded border border-purple-100 dark:border-purple-800">
                        <FaTag size={9} /> {course.level || "All Levels"}
                      </span>
                      <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                        {course.duration ? `${course.duration} Hours` : "Self Paced"}
                      </span>
                    </div>
                  </div>

                  {/* Footer: Price & Action */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Price</span>
                      <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
                        {course.subscription?.amount
                          ? `${course.subscription.amount} ${course.subscription.currency}`
                          : "Free"}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleEnrollClick(course)}
                      className="flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all hover:bg-gray-800 dark:hover:bg-white"
                    >
                      <FaCartPlus /> Enroll Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-full mb-4">
              <FaSearch className="text-3xl text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
              No Courses Found
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-4">
              {searchTerm 
                ? `No matches for "${searchTerm}"` 
                : "No new courses available right now."}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="text-sm text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            course={selectedCourse}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddCourse;