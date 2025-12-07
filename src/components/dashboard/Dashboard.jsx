import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaBookOpen,
  FaShoppingCart,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";

// --- Calendar Logic Helpers ---
const getQuizDetails = (quiz, currentTime) => {
  const now = currentTime;
  if (!quiz.quizDate || !quiz.startTime || !quiz.endTime)
    return { status: "error", start: new Date(), end: new Date() };

  const datePart = quiz.quizDate.split("T")[0];
  const start = new Date(`${datePart}T${quiz.startTime}`);
  const end = new Date(`${datePart}T${quiz.endTime}`);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  let status = "upcoming";
  if (now > end) status = "completed";
  else if (now >= start && now <= end) status = "ongoing";
  else if (start > now && start <= tomorrow) status = "urgent";

  return { status, start, end };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Hook for navigation
  const [fullUser, setFullUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  const [allQuizzes, setAllQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [hasCourses, setHasCourses] = useState(true);

  const [tooltip, setTooltip] = useState({
    visible: false,
    content: null,
    status: "",
    x: 0,
    y: 0,
  });

  const backendURL = "https://backend.vertexforbcs.org/api";

  // --- Data Dependencies ---
  const attendedQuizzes = useMemo(
    () => fullUser?.quizzesAttended?.map((q) => q.quizId) || [],
    [fullUser]
  );

  // 1. Fetch Full User Data (including QuizzesAttended)
  useEffect(() => {
    const fetchFullUser = async () => {
      if (!user?._id) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendURL}/users/${user._id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setFullUser(res.data);
      } catch (error) {
        console.error("Error fetching full user data:", error);
      }
    };
    fetchFullUser();
  }, [user?._id]);

  // 2. Fetch All Quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`${backendURL}/quizzes`);
        setAllQuizzes(res.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };
    fetchQuizzes();
  }, []);

  // 3. Filter Quizzes based on Full User's Courses
  useEffect(() => {
    if (fullUser && fullUser.courses) {
      const enrolledCourseIds = fullUser.courses.map((c) =>
        c.courseId.toString()
      );
      setHasCourses(enrolledCourseIds.length > 0);

      if (enrolledCourseIds.length > 0) {
        const myQuizzes = allQuizzes.filter((quiz) => {
          const quizCourseId = quiz.courseID || quiz.courseId;
          return enrolledCourseIds.includes(quizCourseId?.toString());
        });
        setFilteredQuizzes(myQuizzes);
      } else {
        setFilteredQuizzes([]);
      }
    }
  }, [fullUser, allQuizzes]);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Helpers ---
  const getCountdown = (targetDate) => {
    const diff = new Date(targetDate) - currentTime;
    if (diff <= 0) return "00h 00m 00s";
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };

  // --- Active Alerts Logic (Only Ongoing or Urgent & Not Submitted) ---
  const activeAlerts = useMemo(() => {
    return filteredQuizzes
      .filter((quiz) => {
        const { status } = getQuizDetails(quiz, currentTime);
        const isSubmitted = attendedQuizzes.includes(quiz._id);
        return (status === "ongoing" || status === "urgent") && !isSubmitted;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.quizDate.split("T")[0]}T${a.startTime}`);
        const dateB = new Date(`${b.quizDate.split("T")[0]}T${b.startTime}`);
        return dateA - dateB;
      });
  }, [filteredQuizzes, currentTime, attendedQuizzes]);

  // --- Styling Map (Submitted/Blue) ---
  const getStatusStyles = (status, isSubmitted) => {
    if (isSubmitted) {
      // Show submitted as Blue
      return "bg-blue-600 text-white shadow-lg shadow-blue-600/50";
    }
    switch (status) {
      case "ongoing":
        return "bg-pink-600 text-white ring-2 ring-pink-400 shadow-lg shadow-pink-600/50 animate-pulse";
      case "urgent":
        return "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40";
      case "upcoming":
        return "bg-purple-600 text-white shadow-lg shadow-purple-600/40";
      case "completed":
        return "bg-gray-700 text-gray-400 opacity-80";
      default:
        return "bg-gray-800 text-gray-400 hover:bg-gray-700/80 border-gray-700";
    }
  };

  // --- Navigation Handler ---
  const handleEnterQuiz = () => {
    // Redirects to the quizzes page instead of opening a modal
    navigate("/student/quizzes");
  };

  // --- Month Names Definition ---
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // --- Render Calendar Grid ---
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = [];

    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === currentTime.getDate() &&
        month === currentTime.getMonth() &&
        year === currentTime.getFullYear();

      const dailyQuizzes = filteredQuizzes.filter((q) => {
        if (!q.quizDate) return false;
        const qDate = new Date(q.quizDate);
        return (
          qDate.getDate() === day &&
          qDate.getMonth() === month &&
          qDate.getFullYear() === year
        );
      });

      let dominantStatus = "";
      let isSubmitted = false;

      if (dailyQuizzes.length > 0) {
        const details = dailyQuizzes.map((q) => {
          const status = getQuizDetails(q, currentTime).status;
          if (attendedQuizzes.includes(q._id)) {
            isSubmitted = true;
          }
          return { status, id: q._id };
        });

        const statuses = details.map((d) => d.status);

        // Priority: Submitted > Ongoing > Urgent > Upcoming > Completed
        if (isSubmitted) dominantStatus = "submitted";
        else if (statuses.includes("ongoing")) dominantStatus = "ongoing";
        else if (statuses.includes("urgent")) dominantStatus = "urgent";
        else if (statuses.includes("upcoming")) dominantStatus = "upcoming";
        else dominantStatus = "completed";
      }

      daysArray.push(
        <div
          key={day}
          onClick={() => {
            // Optional: You could navigate here too if desired
            // handleEnterQuiz();
          }}
          onMouseEnter={(e) => {
            if (dailyQuizzes.length === 0) return;
            const content = dailyQuizzes.map((q) => {
              const { status, start, end } = getQuizDetails(q, currentTime);
              const isAttended = attendedQuizzes.includes(q._id);
              return (
                <div key={q._id} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isAttended
                          ? "bg-blue-400"
                          : status === "ongoing"
                          ? "bg-pink-400 animate-pulse"
                          : status === "urgent"
                          ? "bg-indigo-400"
                          : status === "upcoming"
                          ? "bg-purple-400"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="font-bold text-sm uppercase tracking-wider">
                      {q.courseTitle || "Course"}: {q.quizTitle}
                    </span>
                  </div>
                  <div className="text-xs opacity-90 pl-5">
                    <p>
                      {isAttended
                        ? "✅ Submitted"
                        : status === "ongoing"
                        ? `Ends: ${end.toLocaleDateString()} ${end.toLocaleTimeString()}`
                        : `Starts: ${start.toLocaleDateString()} ${start.toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
              );
            });
            setTooltip({
              visible: true,
              content: content,
              status: dominantStatus,
              x: e.clientX,
              y: e.clientY,
            });
          }}
          onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
          className={`relative h-14 w-full rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 border select-none ${
            dominantStatus ? "cursor-pointer scale-105" : "cursor-default"
          } ${getStatusStyles(
            dominantStatus,
            attendedQuizzes.includes(dailyQuizzes[0]?._id)
          )} ${
            isToday ? "ring-4 ring-pink-300/70 border-white" : "border-white/5"
          }`}
        >
          {day}
          {dailyQuizzes.length > 1 && (
            <span className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></span>
          )}
        </div>
      );
    }
    return daysArray;
  };

  // --- RENDER ---
  if (!fullUser)
    return (
      <div className="text-center text-sm text-gray-500 mt-5 dark:text-gray-400">
        Loading user profile and quizzes...
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 select-none w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence>
        {/* No Courses Warning */}
        <h2 className="text-xl text-black dark:text-white py-5"> Welcome to Dashboard, {user.firstName} {user.lastName}</h2>

        {!hasCourses ? (
          <motion.div
            key="no-courses"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="w-full max-w-2xl bg-gradient-to-br from-indigo-900/60 via-purple-900/60 to-pink-900/60 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-10 text-center flex flex-col items-center"
          >
            <div className="bg-white/10 p-6 rounded-full mb-6 animate-bounce">
              <FaBookOpen className="text-5xl text-pink-300" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              No Active Enrollments
            </h2>
            <p className="text-gray-300 mb-8 max-w-md text-lg">
              It looks like you haven't enrolled in any courses yet.
            </p>
            <Link
              to="/courses"
              className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 text-base sm:text-lg"
            >
              <FaShoppingCart /> Browse Courses
            </Link>
          </motion.div>
        ) : (
          /* Calendar View */
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl"
          >
            {/* --- WARNING / ALERT SECTION (Ongoing or Urgent) --- */}
            {activeAlerts.length > 0 && (
              <div className="flex w-full gap-4 sm:gap-6 justify-center mb-6 flex-wrap">
                {activeAlerts.map((quiz) => {
                  const { status, start, end } = getQuizDetails(
                    quiz,
                    currentTime
                  );
                  const isOngoing = status === "ongoing";

                  return (
                    <motion.div
                      key={quiz._id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className={`relative overflow-hidden rounded-xl p-4 sm:p-6 border shadow-2xl backdrop-blur-md transition-all duration-500 min-w-[300px] w-full sm:w-auto ${
                        isOngoing
                          ? "bg-pink-900/60 border-pink-400/50 shadow-pink-500/20"
                          : "bg-indigo-900/60 border-indigo-400/50 shadow-indigo-500/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3
                            className={`font-bold text-lg ${
                              isOngoing ? "text-pink-100" : "text-indigo-100"
                            }`}
                          >
                            {isOngoing ? "🔴 Live Now: " : "⚠️ Urgent: "}
                            {quiz.quizTitle}
                          </h3>
                          <p className="text-xs text-gray-300 uppercase tracking-wider mb-1">
                            {quiz.courseTitle}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 bg-black/20 rounded-lg p-2">
                        <div
                          className={`text-xl sm:text-2xl font-mono font-bold ${
                            isOngoing ? "text-pink-300" : "text-indigo-300"
                          }`}
                        >
                          {isOngoing ? getCountdown(end) : getCountdown(start)}
                        </div>
                        <div className="text-xs text-gray-400 flex flex-col leading-tight">
                          <span>Time until {isOngoing ? "end" : "start"}</span>
                          <span className="opacity-50">
                            Make sure to attend!
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleEnterQuiz} // Navigate to Quizzes page
                        className={`mt-3 w-full py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95 ${
                          isOngoing
                            ? "bg-pink-600 hover:bg-pink-700 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        {isOngoing ? "Enter Quiz Now" : "View Details"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {/* --- MAIN CALENDAR GRID --- */}
            <div className="w-full bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                  className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all active:scale-95"
                >
                  <FaChevronLeft />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide drop-shadow-md">
                  {monthNames[currentDate.getMonth()]}{" "}
                  <span className="text-pink-300">
                    {currentDate.getFullYear()}
                  </span>
                </h2>
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                  className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all active:scale-95"
                >
                  <FaChevronRight />
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="text-pink-200/70 text-xs sm:text-sm font-bold uppercase tracking-widest"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
              </div>

              {/* Legend */}
              <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-600 shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse"></div>
                  Live
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]"></div>
                  Urgent
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                  Upcoming
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  Submitted
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
                  Done
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip Portal */}
      {tooltip.visible && (
        <div
          className="fixed z-50 p-4 bg-gray-900/95 text-white text-xs rounded-xl shadow-2xl border border-white/10 backdrop-blur-md pointer-events-none transform -translate-x-1/2 mt-4"
          style={{ top: tooltip.y, left: tooltip.x, minWidth: "220px" }}
        >
          <div className="mb-2 pb-2 border-b border-white/10 font-bold text-center uppercase tracking-wider text-[10px] text-gray-400">
            {tooltip.status === "urgent"
              ? "⚠️ Action Required"
              : tooltip.status === "ongoing"
              ? "🔴 Happening Now"
              : tooltip.status === "submitted"
              ? "✅ Submitted"
              : "Quiz Information"}
          </div>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
