import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaBookOpen,
  FaShoppingCart,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth"; // Adjust path if needed

// --- Helper: Determine Quiz Status ---
const getQuizDetails = (quiz, currentTime) => {
  if (!quiz.quizDate || !quiz.startTime || !quiz.endTime)
    return { status: "error", start: new Date(), end: new Date() };

  // Combine Date + Time strings into Date objects
  const datePart = quiz.quizDate.split("T")[0];
  const start = new Date(`${datePart}T${quiz.startTime}`);
  const end = new Date(`${datePart}T${quiz.endTime}`);
  
  // Logic
  let status = "upcoming";
  if (currentTime > end) status = "completed";
  else if (currentTime >= start && currentTime <= end) status = "ongoing";
  else if (currentTime < start && (start - currentTime) < 86400000) status = "urgent"; // Less than 24h

  return { status, start, end };
};

const StudentCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [hasCourses, setHasCourses] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Tooltip State
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: null,
    status: "",
    x: 0,
    y: 0,
  });

  const BACKEND_URL = "https://backend.vertexforbcs.org/api";
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // 1. Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const [userRes, quizRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/users/${user._id}`),
          axios.get(`${BACKEND_URL}/quizzes`)
        ]);

        const courses = userRes.data.courses || [];
        setEnrolledCourses(courses);
        setHasCourses(courses.length > 0);
        setAllQuizzes(quizRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 3. Filter Quizzes by Enrollment
  useEffect(() => {
    if (enrolledCourses.length > 0 && allQuizzes.length > 0) {
      const enrolledCourseIds = enrolledCourses.map((c) => c.courseId.toString());
      const myQuizzes = allQuizzes.filter((quiz) => {
        const quizCourseId = quiz.courseID || quiz.courseId;
        return quizCourseId && enrolledCourseIds.includes(quizCourseId.toString());
      });
      setFilteredQuizzes(myQuizzes);
    } else {
      setFilteredQuizzes([]);
    }
  }, [enrolledCourses, allQuizzes]);

  // 4. Calculate Alerts (Live or Urgent Quizzes)
  const activeAlerts = useMemo(() => {
    return filteredQuizzes.filter((quiz) => {
      const { status } = getQuizDetails(quiz, currentTime);
      return status === "ongoing" || status === "urgent";
    });
  }, [filteredQuizzes, currentTime]);

  // 5. Calendar Navigation Helpers
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // --- RENDER GRID LOGIC ---
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month (0-6)
    const firstDay = new Date(year, month, 1).getDay();
    // Total days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = [];

    // Empty slots for previous month days
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-10 sm:h-14"></div>);
    }

    // Actual Days
    for (let day = 1; day <= daysInMonth; day++) {
      // Find quizzes for this specific day
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const dailyQuizzes = filteredQuizzes.filter((q) => 
        q.quizDate && q.quizDate.startsWith(dateString)
      );

      // Determine Status for coloring
      let dominantStatus = null;
      if (dailyQuizzes.length > 0) {
        // Priority: Ongoing > Urgent > Upcoming > Completed
        const statuses = dailyQuizzes.map(q => getQuizDetails(q, currentTime).status);
        if (statuses.includes("ongoing")) dominantStatus = "ongoing";
        else if (statuses.includes("urgent")) dominantStatus = "urgent";
        else if (statuses.includes("upcoming")) dominantStatus = "upcoming";
        else dominantStatus = "completed";
      }

      const isToday = 
        day === new Date().getDate() && 
        month === new Date().getMonth() && 
        year === new Date().getFullYear();

      // Style Map
      let bgClass = "bg-white/5 text-gray-400 hover:bg-white/10";
      if (dominantStatus === "ongoing") bgClass = "bg-pink-600 text-white shadow-lg shadow-pink-600/40 animate-pulse";
      else if (dominantStatus === "urgent") bgClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40";
      else if (dominantStatus === "upcoming") bgClass = "bg-purple-600 text-white";
      else if (dominantStatus === "completed") bgClass = "bg-gray-700/50 text-gray-500";

      daysArray.push(
        <div
          key={day}
          onMouseEnter={(e) => {
            if (dailyQuizzes.length === 0) return;
            // Tooltip Content Generator
            const content = dailyQuizzes.map((q) => {
              const { start, end, status } = getQuizDetails(q, currentTime);
              return (
                <div key={q._id} className="mb-2 last:mb-0">
                  <p className="font-bold text-white text-[10px] sm:text-xs">{q.quizTitle}</p>
                  <p className="text-[9px] text-gray-300">{q.courseTitle}</p>
                  <p className="text-[9px] text-gray-400">
                    {status === 'ongoing' ? 'Ends: ' : 'Starts: '}
                    {status === 'ongoing' ? end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              );
            });

            setTooltip({
              visible: true,
              content: content,
              status: dominantStatus,
              x: e.clientX, // Simplified position, relies on fixed tooltip logic below
              y: e.clientY,
            });
          }}
          onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
          className={`relative h-10 sm:h-14 rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer border ${bgClass} ${
            isToday ? "border-pink-300 ring-1 ring-pink-300" : "border-transparent"
          }`}
        >
          {day}
          {dailyQuizzes.length > 0 && (
            <span className="mt-0.5 w-1 h-1 rounded-full bg-white"></span>
          )}
        </div>
      );
    }
    return daysArray;
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Calendar...</div>;

  return (
    <div className="w-full flex flex-col items-center select-none pb-20"> {/* pb-20 for menu space */}
      <AnimatePresence>
        
        {/* VIEW 1: NO COURSES */}
        {!hasCourses ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 mx-4 p-8 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl text-center shadow-2xl"
          >
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBookOpen className="text-2xl text-pink-300" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Active Enrollments</h2>
            <p className="text-gray-400 text-sm mb-6">Purchase a course to view your schedule.</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform text-sm"
            >
              <FaShoppingCart /> Browse Courses
            </Link>
          </motion.div>
        ) : (
          
          /* VIEW 2: CALENDAR & ALERTS */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full px-2 sm:px-4"
          >
            {/* ALERTS SECTION */}
            {activeAlerts.length > 0 && (
              <div className="mb-4 space-y-3">
                {activeAlerts.map((quiz) => {
                  const { status } = getQuizDetails(quiz, currentTime);
                  const isOngoing = status === "ongoing";
                  
                  return (
                    <motion.div
                      key={quiz._id}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={`p-3 rounded-xl border flex justify-between items-center shadow-lg backdrop-blur-md ${
                        isOngoing 
                          ? "bg-pink-900/60 border-pink-500/30 shadow-pink-500/10" 
                          : "bg-indigo-900/60 border-indigo-500/30 shadow-indigo-500/10"
                      }`}
                    >
                      <div>
                        <h4 className={`text-sm font-bold ${isOngoing ? "text-pink-200" : "text-indigo-200"}`}>
                          {isOngoing ? "🔴 Live Now" : "⚠️ Starting Soon"}
                        </h4>
                        <p className="text-xs text-white mt-0.5">{quiz.quizTitle}</p>
                      </div>
                      <button 
                        onClick={() => navigate("/quizzes")}
                        className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        Enter
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* MAIN CALENDAR CARD */}
            <div className="w-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden p-4">
              
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/10 text-gray-300">
                  <FaChevronLeft size={14} />
                </button>
                <h2 className="text-lg font-bold text-white">
                  {monthNames[currentDate.getMonth()]} <span className="text-pink-400">{currentDate.getFullYear()}</span>
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10 text-gray-300">
                  <FaChevronRight size={14} />
                </button>
              </div>

              {/* DAYS HEADER */}
              <div className="grid grid-cols-7 text-center mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <div key={d} className="text-[10px] font-bold text-gray-500 uppercase">{d}</div>
                ))}
              </div>

              {/* DAYS GRID */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {renderCalendarDays()}
              </div>

              {/* LEGEND */}
              <div className="mt-6 flex justify-center gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-pink-600 animate-pulse"></div>
                  <span className="text-[9px] text-gray-400 uppercase">Live</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <span className="text-[9px] text-gray-400 uppercase">Urgent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  <span className="text-[9px] text-gray-400 uppercase">Next</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOOLTIP PORTAL (Fixed Position at bottom of screen or follows mouse) */}
      {tooltip.visible && (
        <div
          className="fixed z-[60] p-3 bg-gray-950/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-lg pointer-events-none w-48"
          // Calculate safe position to avoid going off screen
          style={{ 
            top: Math.min(tooltip.y + 10, window.innerHeight - 150), 
            left: Math.min(tooltip.x - 90, window.innerWidth - 200) 
          }}
        >
          <div className="mb-1 pb-1 border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {tooltip.status === "ongoing" ? "🔴 Live Event" : "Details"}
          </div>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default StudentCalendar;