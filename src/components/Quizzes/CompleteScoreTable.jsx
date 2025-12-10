<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { FaTrophy, FaSpinner, FaMedal, FaUserGraduate, FaSadTear } from "react-icons/fa";
import { useParams } from "react-router";
import { motion } from "framer-motion";

const CompleteScoreTable = () => {
  const { quizId } = useParams();
  const [topScorers, setTopScorers] = useState([]);
=======
import React, { useEffect, useState, useCallback } from "react";
import {
  FaTrophy,
  FaSpinner,
  FaMedal,
  FaUserGraduate,
  FaSortAlphaDown,
  FaSortNumericDown,
} from "react-icons/fa";
import { useParams } from "react-router";
import { motion } from "framer-motion";
import axios from "axios";

const CompleteScoreTable = () => {
  const { quizId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
>>>>>>> f1ca4728081b52ee59c7252d4450072925164495
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("score"); // 'score' or 'name'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  const API_BASE_URL = "https://backend.vertexforbcs.org/api";

  const fetchLeaderboard = useCallback(async () => {
    if (!quizId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/quizzes/leaderboard/${quizId}`
      );
      setLeaderboard(res.data);
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

<<<<<<< HEAD
  // --- Helpers for Medals ---
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <FaMedal className="text-yellow-400 text-2xl drop-shadow-sm" />; // Gold
      case 1:
        return <FaMedal className="text-gray-300 text-2xl drop-shadow-sm" />;   // Silver
      case 2:
        return <FaMedal className="text-orange-400 text-2xl drop-shadow-sm" />; // Bronze
      default:
        return <span className="font-mono font-bold text-gray-500 dark:text-gray-400">#{index + 1}</span>;
    }
  };

  const getRankStyles = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 shadow-md transform scale-[1.02]";
      case 1:
        return "bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600";
      case 2:
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      default:
        return "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700";
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
  };

  // --- Loading State ---
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse text-sm">Loading Leaderboard...</p>
      </div>
    );

  // --- Empty State ---
  if (topScorers.length === 0)
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-10 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center"
      >
        <FaSadTear className="text-4xl text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">No results found yet.</p>
        <p className="text-gray-400 text-sm">Be the first to submit!</p>
      </motion.div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-white/20 dark:border-gray-800">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/30 mb-4">
          <FaTrophy className="text-yellow-300 text-2xl" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          Leaderboard
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Top performers for this quiz
        </p>
      </div>

      {/* Leaderboard List */}
      <div className="overflow-hidden">
        {/* Table Header (Desktop only) */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-t-xl text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-7">Student Name</div>
          <div className="col-span-3 text-right">Score</div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 sm:space-y-2 mt-2"
        >
          {topScorers.map((student, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className={`relative flex sm:grid sm:grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-all duration-300 ${getRankStyles(index)}`}
            >
              
              {/* Rank Column */}
              <div className="flex-shrink-0 sm:col-span-2 flex justify-center items-center w-12 sm:w-auto">
                {getRankIcon(index)}
              </div>

              {/* Name Column */}
              <div className="flex-grow sm:col-span-7 flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-full hidden xs:block ${
                   index < 3 ? 'bg-white/50 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <FaUserGraduate className={`text-sm ${
                    index < 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex flex-col">
                   <span className="font-bold text-gray-800 dark:text-gray-100 truncate text-sm sm:text-base">
                     {student.firstName} {student.lastName}
                   </span>
                   {index < 3 && (
                     <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide sm:hidden">
                       {index === 0 ? "Winner" : index === 1 ? "Runner Up" : "3rd Place"}
                     </span>
                   )}
                </div>
              </div>

              {/* Score Column */}
              <div className="flex-shrink-0 sm:col-span-3 text-right">
                <span className="block font-extrabold text-lg sm:text-xl text-indigo-600 dark:text-indigo-400">
                  {student.score % 1 === 0 ? student.score : student.score.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-bold sm:hidden">Points</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
=======
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder(key === "score" ? "desc" : "asc");
    }
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    let comparison = 0;
    const order = sortOrder === "asc" ? 1 : -1;

    if (sortKey === "score") {
      comparison = a.score - b.score;
    } else if (sortKey === "name") {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      if (nameA < nameB) comparison = -1;
      if (nameA > nameB) comparison = 1;
    }

    return comparison * order;
  });

  const getRankIcon = (index) => {
    if (index === 0) return <FaMedal className="text-yellow-400 text-lg" />;
    if (index === 1) return <FaMedal className="text-gray-400 text-lg" />;
    if (index === 2) return <FaMedal className="text-orange-400 text-lg" />;
    return (
      <span className="text-gray-500 dark:text-gray-400 font-mono text-xs font-bold">
        #{index + 1}
      </span>
    );
  };

  const getSortIcon = (key) => {
    if (sortKey !== key) return null;
    return sortOrder === "desc" ? (
      <FaSortNumericDown className="ml-1 text-xs" />
    ) : (
      <FaSortAlphaDown className="ml-1 text-xs rotate-180" />
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-8 text-purple-600 dark:text-purple-400">
        <FaSpinner className="animate-spin text-3xl" />
      </div>
    );

  if (leaderboard.length === 0)
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400 dark:text-gray-500 italic text-base border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
        <FaUserGraduate className="mb-3 text-2xl" />
        No submissions have been recorded for this quiz yet.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 px-6 flex items-center gap-3 shadow-md">
        <FaTrophy className="text-yellow-300 text-xl drop-shadow-sm" />
        <h3 className="text-lg font-extrabold uppercase tracking-wider text-white">
          Complete Leaderboard (Quiz ID: {quizId})
        </h3>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          {/* Table Head */}
          <thead className="bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-semibold uppercase text-xs border-b border-gray-200 dark:border-gray-700 sticky top-0">
            <tr>
              <th className="py-3 px-4 w-16 text-center">Rank</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name {getSortIcon("name")}
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center justify-end">
                  Score {getSortIcon("score")}
                </div>
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <motion.tbody
            layout
            className="divide-y divide-gray-200 dark:divide-gray-700/50 text-gray-800 dark:text-gray-200"
          >
            {sortedLeaderboard.map((student, index) => (
              <motion.tr
                key={student.id || index} // Assuming a unique student ID exists, otherwise use index
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className={`hover:bg-purple-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                  index < 3 ? "bg-purple-100/50 dark:bg-gray-700" : ""
                }`}
              >
                <td className="py-3 px-4 text-center">{getRankIcon(index)}</td>
                <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px] sm:max-w-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {student.firstName} {student.lastName}
                  {index < 3 && (
                    <span className="ml-2 text-xs font-bold text-pink-600 dark:text-purple-400 hidden sm:inline">
                      (Top {index + 1})
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-bold font-mono text-indigo-600 dark:text-indigo-400 text-base">
                  {student.score.toFixed(2)}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
>>>>>>> f1ca4728081b52ee59c7252d4450072925164495
  );
};

export default CompleteScoreTable;