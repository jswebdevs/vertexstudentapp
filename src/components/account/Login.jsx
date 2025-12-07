import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import useAuth from "../../hooks/useAuth"

// 🛑 Configuration
const BACKEND_BASE_URL = "https://backend.vertexforbcs.org";
axios.defaults.baseURL = `${BACKEND_BASE_URL}/api`;

const Login = () => {
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
  // Forgot Password Handlers
  // ------------------------

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return showWarning("Please enter your email");

    setIsForgotLoading(true);
    try {
      await axios.post("/users/send-otp", { email: forgotEmail });
      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: `Check ${forgotEmail} for your code.`,
        timer: 2000,
        showConfirmButton: false,
      });
      setForgotStep(2);
    } catch (err) {
      showError(err.response?.data?.message || "Could not send OTP");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length !== 6)
      return showWarning("Enter a valid 6-digit OTP");

    setIsForgotLoading(true);
    try {
      // NOTE: Ensure your backend has this route, or validation will fail.
      // If you don't have this route yet, you can comment this axios call out
      // and just do setForgotStep(3) to skip server validation here.
      await axios.post("/users/verify-otp", {
        email: forgotEmail,
        otp: forgotOtp,
      });

      setForgotStep(3); // Move to password reset step
    } catch (err) {
      showError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Step 3: Update Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) return showWarning("Fill all fields");
    if (newPassword.length < 6)
      return showWarning("Password must be at least 6 chars");
    if (newPassword !== confirmPassword)
      return showWarning("Passwords do not match");

    setIsForgotLoading(true);
    try {
      // Calls the final reset endpoint (which requires OTP again to be safe)
      await axios.post("/users/reset-password-otp", {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: newPassword,
      });

      // Success
      closeForgotModal();
      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been changed. Please login.",
        confirmButtonColor: "#9333ea",
      });
    } catch (err) {
      showError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Helpers
  const showWarning = (msg) => {
    Swal.fire({
      icon: "warning",
      title: "Warning",
      text: msg,
      confirmButtonColor: "#f59e0b",
    });
  };

  const showError = (msg) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      confirmButtonColor: "#db2777",
    });
  };

  const closeForgotModal = () => {
    setIsForgotOpen(false);
    setTimeout(() => {
      setForgotStep(1);
      setForgotEmail("");
      setForgotOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }, 300); // Reset state after animation
  };

  useEffect(() => {
    if (user && userType === "student") {
      navigate("/dashboard");
    }
  }, [user, userType, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 transition-colors duration-500">
      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 drop-shadow-sm">
            Student Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm font-medium">
            New here?{" "}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-300 underline transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username/Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
              <input
                type="text"
                placeholder="Enter your credentials"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-sm"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                disabled={authLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={authLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm py-2 px-3 rounded-lg text-center border border-red-100 dark:border-red-800"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
            type="submit"
            disabled={authLoading}
          >
            {authLoading ? (
              <>
                <FaSpinner className="animate-spin" /> Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                  {forgotStep === 1 && "Reset Password"}
                  {forgotStep === 2 && "Enter OTP"}
                  {forgotStep === 3 && "Set New Password"}
                </h3>
                <button
                  onClick={closeForgotModal}
                  className="text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                {/* STEP 1: Email Input */}
                {forgotStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Enter your email to receive a 6-digit code.
                    </p>
                    <div className="relative">
                      <FaEnvelope className="absolute top-4 left-3 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer"
                    >
                      {isForgotLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2: OTP Verification */}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-green-600 dark:text-green-400 text-xs font-medium bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center border border-green-200 dark:border-green-800">
                      Code sent to: {forgotEmail}
                    </p>
                    <div className="text-center">
                      <input
                        type="text"
                        required
                        placeholder="000000"
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer"
                    >
                      {isForgotLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        "Verify Code"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline cursor-pointer"
                    >
                      Change Email
                    </button>
                  </form>
                )}

                {/* STEP 3: Set New Password */}
                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      OTP Verified. Create your new password.
                    </p>

                    <div className="space-y-3">
                      <div className="relative">
                        <FaKey className="absolute top-4 left-3 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <FaKey className="absolute top-4 left-3 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer"
                    >
                      {isForgotLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
