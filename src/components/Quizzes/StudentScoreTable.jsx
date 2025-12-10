<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { FaTrophy, FaSpinner, FaMedal, FaUserGraduate } from "react-icons/fa";
import { motion } from "framer-motion";
=======
import React, { useEffect, useState, useCallback } from "react";
import {
  FaTrophy,
  FaSpinner,
  FaMedal,
  FaUserGraduate,
  FaSyncAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
>>>>>>> f1ca4728081b52ee59c7252d4450072925164495

const StudentScoreTable = ({ quizId }) => {
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state for subtle refresh indicator

  const API_BASE_URL = "https://backend.vertexforbcs.org/api";

  // Use useCallback to memoize the fetch function
  const fetchLeaderboard = useCallback(async () => {
    if (!quizId) return;

    // Only set loading true initially, use isRefreshing for subsequent updates
    if (topScorers.length === 0) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/quizzes/leaderboard/${quizId}`
      );
      setTopScorers(res.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [quizId, topScorers.length]); // Added topScorers.length as a dependency for initial loading check

  useEffect(() => {
    // 1. Initial fetch
    fetchLeaderboard();

    // 2. Set up the interval for refreshing every 5000 milliseconds (5 seconds)
    const intervalId = setInterval(() => {
      fetchLeaderboard();
    }, 5000);

    // 3. Cleanup function: clear the interval when the component unmounts or quizId changes
    return () => clearInterval(intervalId);
  }, [quizId, fetchLeaderboard]); // Depend on quizId and memoized fetchLeaderboard

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  // --- Loading State ---
  if (loading)
    return (
<<<<<<< HEAD
      <div className="flex justify-center items-center p-8 text-purple-600 dark:text-purple-400">
=======
      <div className="flex justify-center items-center p-6 text-purple-600 dark:text-purple-400">
>>>>>>> f1ca4728081b52ee59c7252d4450072925164495
        <FaSpinner className="animate-spin text-2xl" />
      </div>
    );

  // --- Empty State ---
  if (topScorers.length === 0)
    return (
<<<<<<< HEAD
      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
        <FaTrophy className="text-3xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Be the first to break the record!
        </p>
      </div>
    );

  // --- Rank Styling Helper ---
  const getRankStyle = (index) => {
    switch (index) {
      case 0: // Gold
        return { 
          icon: <FaTrophy className="drop-shadow-sm" />, 
          color: "text-yellow-500", 
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800"
        };
      case 1: // Silver
        return { 
          icon: <FaMedal className="drop-shadow-sm" />, 
          color: "text-gray-400", 
          bg: "bg-gray-50 dark:bg-gray-700/30",
          border: "border-gray-200 dark:border-gray-600"
        };
      case 2: // Bronze
        return { 
          icon: <FaMedal className="drop-shadow-sm" />, 
          color: "text-orange-400", 
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-200 dark:border-orange-800"
        };
      default: 
        return { 
          icon: <span className="font-mono font-bold text-sm">#{index + 1}</span>, 
          color: "text-gray-500 dark:text-gray-400", 
          bg: "bg-transparent",
          border: "border-transparent"
        };
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner">
            <FaTrophy className="text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider leading-tight">Top Performers</h3>
            <p className="text-[10px] text-purple-100 opacity-90">Live Leaderboard</p>
          </div>
        </div>
        <div className="text-[10px] font-bold text-indigo-900 bg-white/90 px-2.5 py-1 rounded-full shadow-sm">
          Top 5
        </div>
      </div>

      {/* Leaderboard List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="divide-y divide-gray-100 dark:divide-gray-700"
      >
        {topScorers.map((student, index) => {
          const rankStyle = getRankStyle(index);
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                index === 0 ? "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Icon */}
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border ${rankStyle.bg} ${rankStyle.color} ${rankStyle.border}`}>
                  {rankStyle.icon}
                </div>

                {/* Student Info */}
                <div className="flex flex-col">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate max-w-[150px] sm:max-w-xs">
                    {student.firstName} {student.lastName}
                  </h4>
                  {index < 3 && (
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium flex items-center gap-1">
                      <FaUserGraduate className="text-[9px]" /> {index === 0 ? "Champion" : index === 1 ? "Runner Up" : "High Achiever"}
                    </span>
                  )}
                </div>
              </div>

              {/* Score Badge */}
              <div className="flex flex-col items-end">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-lg leading-none">
                  {student.score.toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Points</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
=======
      <div className="flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-500 italic text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <FaUserGraduate className="mb-2 text-xl" />
        No submissions yet. Be the first!
      </div>
    );

  const getRankIcon = (index) => {
    if (index === 0) return <FaMedal className="text-yellow-400 text-lg" />;
    if (index === 1) return <FaMedal className="text-gray-400 text-lg" />;
    if (index === 2) return <FaMedal className="text-orange-400 text-lg" />;
    return (
      <span className="text-gray-500 font-mono text-xs font-bold">
        #{index + 1}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <FaTrophy className="text-yellow-300 text-lg drop-shadow-sm" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Top Performers
          </h3>
        </div>
        {/* Refresh Indicator */}
        <div
          className={`flex items-center gap-1 text-xs font-medium transition-opacity ${
            isRefreshing ? "opacity-100" : "opacity-0"
          }`}
        >
          <FaSyncAlt className="animate-spin text-white text-xs" />
          <span className="text-white">Refreshing...</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="py-3 px-4 w-16 text-center">Rank</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {topScorers.map((student, index) => (
              <motion.tr
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="hover:bg-purple-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
              >
                <td className="py-3 px-4 text-center flex justify-center items-center h-full">
                  {getRankIcon(index)}
                </td>
                <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200 truncate max-w-[140px] sm:max-w-xs group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {student.firstName} {student.lastName}
                </td>
                <td className="py-3 px-4 text-right font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {student.score.toFixed(2)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
>>>>>>> f1ca4728081b52ee59c7252d4450072925164495
  );
};

export default StudentScoreTable;