// src/pages/student/courses/ViewCourse.jsx

import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTag,
  FaExclamationCircle,
  FaLayerGroup,
  FaRedo,
  FaShoppingCart,
  FaBookOpen,
} from "react-icons/fa";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import Cart from "./Cart";

const ViewCourse = () => {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart/Renewal State
  const [isCartOpen, setIsCartOpen] = useState(false);

  const backendURL = "https://backend.vertexforbcs.org/api";

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = [axios.get(`${backendURL}/courses/${id}`)];
        if (authUser?._id) {
          promises.push(axios.get(`${backendURL}/users/${authUser._id}`));
        }
        const [courseRes, userRes] = await Promise.all(promises);
        setCourse(courseRes.data);
        if (userRes) setUserData(userRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, authUser?._id]);

  // 2. Logic to find Student's Enrollment
  const enrollmentInfo = useMemo(() => {
    const currentUser = userData || authUser;
    if (!currentUser || !currentUser.courses) return null;
    return currentUser.courses.find((c) => String(c.courseId) === String(id));
  }, [userData, authUser, id]);

  // --- Helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const total = Date.parse(expiryDate) - Date.parse(new Date());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleCartAction = () => {
    setIsCartOpen(true);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-red-500 gap-4">
        <FaExclamationCircle className="text-4xl" />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="text-indigo-500 underline">
          Go Back
        </button>
      </div>
    );

  if (!course) return null;

  const isEnrolled = !!enrollmentInfo;
  const daysLeft = isEnrolled ? getDaysRemaining(enrollmentInfo.expiryDate) : 0;
  const isExpired = daysLeft <= 0;

  return (
    // Added pb-28 to ensure content isn't hidden behind the fixed bottom menu
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 pb-28">
      
      {/* Container: Full width on mobile, Fixed 768px centered on desktop */}
      <div className="w-full md:w-[768px] mx-auto space-y-6">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors text-sm font-medium"
        >
          <FaArrowLeft /> Back to Courses
        </button>

        {/* --- Hero Image & Title --- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700"
        >
          <div className="relative h-56 sm:h-64">
            <img
              src={course.courseImage?.url || "https://via.placeholder.com/800x400?text=No+Image"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end p-6">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {course.category}
                </span>
                {course.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {course.title}
              </h1>
            </div>
          </div>

          {/* --- Enrollment Status / Action Bar --- */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            {isEnrolled ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {isExpired ? <FaExclamationCircle size={20}/> : <FaCheckCircle size={20}/>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">
                      {isExpired ? "Subscription Expired" : "Active Subscription"}
                    </p>
                    <p className={`text-xs font-semibold ${isExpired ? "text-red-500" : "text-green-500"}`}>
                      {isExpired ? "0 Days Left" : `${daysLeft} Days Remaining`}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleCartAction}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
                >
                  <FaRedo /> Extend Access
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price for 1 Month</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {course.subscription?.amount} {course.subscription?.currency}
                  </p>
                </div>
                <button
                  onClick={handleCartAction}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                >
                  <FaShoppingCart /> Enroll Now
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* --- Course Info Cards --- */}
        <div className="flex flex-col gap-4">
          
          {/* 1. Dates & Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4 text-center">
             <div className="flex flex-col gap-1 items-center">
                <span className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><FaCalendarAlt /> Start Date</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatDate(course.startDate)}</span>
             </div>
             <div className="flex flex-col gap-1 items-center">
                <span className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1"><FaCalendarAlt /> End Date</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatDate(course.endDate)}</span>
             </div>
          </div>

          {/* 2. Description (Centered) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center justify-center gap-2">
              <FaBookOpen className="text-indigo-500" /> About Course
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed mx-auto">
              {course.description}
            </div>
          </div>

          {/* 3. Syllabus / Content (Centered and Fully Visible) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-2">
              <FaLayerGroup className="text-pink-500" /> What You'll Learn
            </h2>
            
            {course.syllabus && course.syllabus.length > 0 ? (
              // Used flex-col and items-center to center the list visual
              <div className="flex flex-col items-center w-full">
                <ul className="space-y-3 w-full max-w-md">
                  {course.syllabus.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                      <div className="min-w-[6px] h-[6px] rounded-full bg-pink-500 mt-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 text-left">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-xs text-gray-500">Syllabus details coming soon.</p>
              </div>
            )}
          </div>

        </div>

        {/* --- Cart Modal --- */}
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          course={course}
          isRenewal={isEnrolled}
        />
      </div>
    </div>
  );
};

export default ViewCourse;