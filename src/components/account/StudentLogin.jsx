// src/pages/student/auth/StudentLogin.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import Swal from "sweetalert2";
import { motion } from "framer-motion"; // Animation library
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // Icons

=======
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaSpinner,
  FaTimes,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaKey,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
>>>>>>> f1ca4728081b52ee59c7252d4450072925164495
import useAuth from "../../../../hooks/useAuth";

// 🛑 Configuration
const BACKEND_BASE_URL = "http://localhost:5000";
axios.defaults.baseURL = `${BACKEND_BASE_URL}/api`;

const StudentLogin = () => {
  const {
    signInWithController,
    user,
    userType,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();

  // Login Form State
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Passwords
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // ------------------------
  // Login Handler
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!usernameOrEmail || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const result = await signInWithController(
        usernameOrEmail.trim().toLowerCase(),
        password
      );

      if (!result) {
        setError("Invalid credentials or not a student");
        return;
      }

      if (result.user.userType !== "student") {
        Swal.fire({
          icon: "warning",
          title: "Access Denied",
          text: "This login is for students only.",
          confirmButtonColor: "#9333ea",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome ${
          result.user.firstName || result.user.username || "Student"
        }!`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("[StudentLogin] Controller login error:", err);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message || "Unexpected error, try again later.",
        confirmButtonColor: "#db2777",
      });
    }
  };

  // ------------------------
  // Redirect Logged-in Student
  // ------------------------
  useEffect(() => {
    if (user && userType === "student") {
      navigate("/student/dashboard");
    }
  }, [user, userType, navigate]);

  // ------------------------
  // Animation Variants
  // ------------------------
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } }
  };

  // ------------------------
  // Render Component
  // ------------------------
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4
      bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600
      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
      transition-colors duration-500"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
        rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-purple-500/20"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Enter your credentials to access your portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username/Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
              Username or Email
            </label>
            <motion.div 
              className="relative"
              whileFocus="focus"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-purple-400 dark:text-purple-500" />
              </div>
              <motion.input
                variants={inputVariants}
                type="text"
                placeholder="Enter your username or email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                bg-gray-50 dark:bg-gray-700/50 
                text-gray-700 dark:text-gray-200 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent
                transition-all duration-300"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                disabled={loading}
              />
            </motion.div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
              Password
            </label>
            <motion.div 
              className="relative"
              whileFocus="focus"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-purple-400 dark:text-purple-500" />
              </div>
              <motion.input
                variants={inputVariants}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                bg-gray-50 dark:bg-gray-700/50 
                text-gray-700 dark:text-gray-200 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent
                transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              {/* Toggle Visibility */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800"
            >
              <p className="text-pink-600 dark:text-pink-400 text-sm text-center font-medium">
                {error}
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={!loading ? { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(147, 51, 234, 0.3)" } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full py-3.5 px-4 text-white font-bold rounded-xl 
            bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
            hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500
            shadow-lg shadow-purple-500/20 dark:shadow-purple-900/40
            transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login to Account"
            )}
          </motion.button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link
              to="/student/register"
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 hover:opacity-80 transition-opacity"
            >
              Register Here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;