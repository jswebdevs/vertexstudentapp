import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilePdf,
  FaCheckCircle,
  FaClock,
  FaPlayCircle,
  FaExclamationCircle,
  FaTrophy,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import useAuth from "../../../../hooks/useAuth";
import RunningQuiz from "./RunningQuiz";
import Modal from "./Modal";
import { generateQuizPDF } from "../../../../utils/QuizPDFGenerator";

const StudentQuizzes = () => {
  const { user } = useAuth();
  const studentId = user?._id || null;
  const studentName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";
  const [quizzes, setQuizzes] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const API_BASE_URL = "https://backend.vertexforbcs.org/api";

  const fetchData = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    try {
      const [userRes, quizRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/${studentId}`),
        axios.get(`${API_BASE_URL}/quizzes`),
      ]);
      const userData = userRes.data;
      const allQuizzesData = quizRes.data;
      const enrolledCourseIds = (userData.courses || []).map((c) =>
        c.courseId.toString()
      );
      const relevantQuizzes = allQuizzesData.filter((quiz) =>
        enrolledCourseIds.includes(quiz.courseID || quiz.courseId)
      );
      relevantQuizzes.sort(
        (a, b) => new Date(b.quizDate) - new Date(a.quizDate)
      );
      setQuizzes(relevantQuizzes);
      setStudentResults(userData.quizzesAttended || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong fetching your quizzes!",
        confirmButtonColor: "#9333ea",
      });
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getResult = (quizId) => {
    return studentResults.find(
      (res) => res.quizId === quizId || res._id === quizId
    );
  };

  const handleAttendClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowWelcomeModal(true);
  };

  const handleStartExam = () => {
    setActiveQuiz(selectedQuiz);
    setShowWelcomeModal(false);
  };

  if (loading)
    return (
      <div className="flex justify-center h-64 items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  const now = new Date();

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <span className="text-indigo-500">📝</span> My Quizzes
      </h1>

      <div className="overflow-x-auto shadow-xl rounded-lg">
        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
          <thead className="bg-gray-700 text-gray-200 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">#</th>
              <th className="py-3 px-6 text-left">Quiz Details</th>
              <th className="py-3 px-6 text-left">Schedule</th>
              <th className="py-3 px-6 text-center">Duration</th>
              <th className="py-3 px-6 text-center">Marks</th>
              <th className="py-3 px-6 text-center">Status / Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 text-sm font-light">
            {quizzes.map((quiz, index) => {
              const datePart = quiz.quizDate.split("T")[0];
              const startDateTime = new Date(`${datePart}T${quiz.startTime}`);
              const endDateTime = new Date(`${datePart}T${quiz.endTime}`);

              const isUpcoming = now < startDateTime;
              const isExpired = now > endDateTime;
              const isLive = now >= startDateTime && now <= endDateTime;

              const result = getResult(quiz._id);
              const hasAttended = !!result;

              return (
                <tr
                  key={quiz._id}
                  className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="py-4 px-6 text-left font-bold text-indigo-400">
                    {index + 1}
                  </td>

                  <td className="py-4 px-6 text-left">
                    <div className="flex flex-col">
                      <span className="font-bold text-base text-white">
                        {quiz.quizTitle}
                      </span>
                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {quiz.courseTitle}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-left whitespace-nowrap">
                    <div className="flex flex-col text-xs gap-1">
                      <span className="text-gray-300 font-medium">
                        📅 {new Date(quiz.quizDate).toLocaleDateString()}
                      </span>
                      <span className="text-green-400">
                        🟢 {quiz.startTime}
                      </span>
                      <span className="text-red-400">🔴 {quiz.endTime}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="bg-gray-700 text-white py-1 px-3 rounded-full text-xs">
                      {quiz.duration} min
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center font-mono">
                    {hasAttended ? (
                      <span className="text-green-400 font-bold">
                        {result.score}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}{" "}
                    / {quiz.totalMarks}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {hasAttended ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-green-500 flex items-center gap-1 text-xs font-bold uppercase border border-green-500/30 px-2 py-1 rounded bg-green-500/10">
                            <FaCheckCircle /> Submitted
                          </span>

                          {/* ✅ CONDITION: Show PDF Button ONLY if Exam time is over (isExpired) AND user attended */}
                          {isExpired && (
                            <button
                              onClick={() =>
                                generateQuizPDF(studentId, quiz._id)
                              }
                              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs underline cursor-pointer transition-colors"
                            >
                              <FaFilePdf /> Download Result
                            </button>
                          )}
                        </div>
                      ) : isLive ? (
                        <button
                          onClick={() => handleAttendClick(quiz)}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-4 rounded shadow font-bold text-xs"
                        >
                          <FaPlayCircle /> Start Now
                        </button>
                      ) : isUpcoming ? (
                        <span className="text-yellow-500 flex items-center gap-1 text-xs font-bold uppercase border border-yellow-500/30 px-2 py-1 rounded bg-yellow-500/10">
                          <FaClock /> Upcoming
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-red-500 flex items-center gap-1 text-xs font-bold uppercase">
                            <FaExclamationCircle /> Missed
                          </span>
                          {/* Optional: Allow download of question paper even if missed, after expiry */}
                          {isExpired && (
                            <button
                              onClick={() =>
                                generateQuizPDF(studentId, quiz._id)
                              }
                              className="flex items-center cursor-pointer btn btn-accent"
                            >
                              <FaFilePdf /> Question PDF
                            </button>
                          )}
                        </div>
                      )}

                      <Link
                        to={`/student/dashboard/scoretable/${quiz._id}`}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-yellow-400 transition-colors mt-1"
                      >
                        <FaTrophy /> Score Table
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showWelcomeModal && selectedQuiz && (
        <Modal onClose={() => setShowWelcomeModal(false)}>
          {/* ... (Welcome Modal Content - Same as before) ... */}
          <div className="p-6 text-gray-800 dark:text-white text-center">
            <h2 className="text-2xl font-extrabold mb-2 text-indigo-500">
              Ready, {studentName}?
            </h2>
            <p className="mb-4">
              You are about to start <strong>{selectedQuiz.quizTitle}</strong>
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-4 py-2 bg-gray-300 rounded text-gray-800"
                onClick={() => setShowWelcomeModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded font-bold"
                onClick={handleStartExam}
              >
                Start
              </button>
            </div>
          </div>
        </Modal>
      )}

      {activeQuiz && (
        <Modal onClose={() => {}}>
          <RunningQuiz
            quiz={activeQuiz}
            onClose={() => setActiveQuiz(null)}
            studentId={studentId}
            refreshData={fetchData}
          />
        </Modal>
      )}
    </div>
  );
};

export default StudentQuizzes;