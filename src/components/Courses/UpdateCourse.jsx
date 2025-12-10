// src/pages/student/courses/UpdateCourse.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBook,
  FaCalendarAlt,
  FaRedo,
  FaSpinner,
  FaArrowLeft,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLayerGroup
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import Cart from "./Cart";

const UpdateCourse = () => {
  const { user } = useAuth();
  const studentId = user?._id || null;
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const API_BASE_URL = "https://backend.vertexforbcs.org/api";

  // --- Helper: Format Date ---
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // --- Helper: Calculate Days Left ---
  const getDaysRemaining = (expiryDate) => {
    const total = Date.parse(expiryDate) - Date.parse(new Date());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return days;
  };

  // --- Fetch Data ---
  const fetchData = async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setEnrolledCourses(data.courses || []);
    } catch (err) {
      console.error(err);
      setError("Could not load your courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  // --- Handlers ---
  const handleRenewal = (course) => {
    setSelectedCourse(course);
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
    setSelectedCourse(null);
    fetchData(); // Refresh data after update
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 pb-24">
      
      {/* LAYOUT CONTAINER */}
      <div className="w-full md:w-[768px] mx-auto space-y-6">

        {/* --- Header --- */}
        {/* 'relative' allows us to position the back button absolutely */}
        {/* 'justify-center' keeps the text content centered */}
        <div className="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
          
          {/* Back Button (Absolute Left) */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-purple-600 bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors z-10"
          >
            <FaArrowLeft /> <span className="hidden sm:inline">Back</span>
          </button>

          {/* Centered Content */}
          <div className="text-center flex flex-col items-center">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center gap-2">
              <FaRedo className="text-purple-600 dark:text-purple-400" />
              Manage & Renew
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Extend subscriptions to keep access.
            </p>
          </div>
        </div>

        {/* --- Course List (Single Column) --- */}
        {enrolledCourses.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            {enrolledCourses.map((course) => {
              const daysLeft = getDaysRemaining(course.expiryDate);
              const isExpired = daysLeft <= 0;
              const isUrgent = daysLeft <= 7 && !isExpired;

              return (
                <motion.div
                  key={course.courseId}
                  variants={cardVariants}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden relative"
                >
                  {/* Status Strip */}
                  <div className={`h-1.5 w-full ${
                    isExpired
                      ? "bg-red-500"
                      : isUrgent
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`} />

                  <div className="p-5 flex flex-col gap-4">
                    
                    {/* Header: Badge & Title */}
                    <div>
                      <div className="flex justify-between items-start mb-2">
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 uppercase tracking-wide">
                          <FaLayerGroup /> {course.plan}
                        </span>
                        
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                          isExpired
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-green-50 text-green-600 border-green-100"
                        }`}>
                          {isExpired ? (
                            <><FaExclamationTriangle /> Expired</>
                          ) : (
                            <><FaCheckCircle /> Active</>
                          )}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                        {course.title}
                      </h3>
                    </div>

                    {/* Info Block */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <FaCalendarAlt /> Expires On
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {formatDate(course.expiryDate)}
                        </span>
                      </div>
                      
                      <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <FaHourglassHalf /> Time Left
                        </span>
                        <span className={`font-bold font-mono ${
                          isExpired ? "text-red-500" : isUrgent ? "text-yellow-500" : "text-green-500"
                        }`}>
                            {isExpired ? "0 Days" : `${daysLeft} Days`}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRenewal(course)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 text-sm transition-all"
                    >
                      <FaRedo className={loading ? "animate-spin" : ""} />
                      {isExpired ? "Renew Now" : "Extend Subscription"}
                    </motion.button>

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
            className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-indigo-500">
              <FaBook className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              No Courses Found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-8">
              You don't have any enrolled courses to renew.
            </p>
            <Link
              to="/add-courses"
              className="bg-gray-900 dark:bg-gray-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg text-sm"
            >
              Browse Courses
            </Link>
          </motion.div>
        )}
      </div>

      {/* Renewal Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <Cart
            isOpen={isCartOpen}
            onClose={handleCloseCart}
            course={selectedCourse}
            isRenewal={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpdateCourse;