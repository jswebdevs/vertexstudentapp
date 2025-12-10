// src/pages/student/auth/StudentRegister.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "", // Hidden & Auto-generated
    email: "",
    password: "",
    confirmPassword: "",
    contactNO: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // State to track email availability: null = unchecked, true = available, false = taken
  const [isEmailAvailable, setIsEmailAvailable] = useState(null);
  const navigate = useNavigate();

  // ----------------------------------
  // 1. Check Email Availability
  // ----------------------------------
  const checkEmailAvailability = async (email) => {
    if (!email || !email.includes("@")) {
      setIsEmailAvailable(null);
      return;
    }

    try {
      // Assuming you have a backend route for checking emails
      const res = await fetch(
        `https://backend.vertexforbcs.org/api/users/check-email/${email}`
      );
      const data = await res.json();

      // If server returns { available: true }, set state to true
      setIsEmailAvailable(data.available);
    } catch (error) {
      console.error("Email check failed:", error);
      setIsEmailAvailable(null); // Reset on error
    }
  };

  // ----------------------------------
  // 2. Generate Username Logic (Internal)
  // ----------------------------------
  const generateUsername = (fName, lName) => {
    if (!fName && !lName) return "";
    const cleanFirst = fName.trim().toLowerCase().replace(/\s/g, "");
    const cleanLast = lName.trim().toLowerCase().replace(/\s/g, "");
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${cleanFirst}${cleanLast}${randomNum}`;
  };

  // ----------------------------------
  // 3. Handle Input Changes
  // ----------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Copy existing data
    const updatedFormData = { ...formData, [name]: value };

    // A. If changing First/Last Name -> Update hidden Username
    if (name === "firstName" || name === "lastName") {
      const fName = name === "firstName" ? value : formData.firstName;
      const lName = name === "lastName" ? value : formData.lastName;
      if (fName || lName) {
        updatedFormData.username = generateUsername(fName, lName);
      }
    }

    // B. If changing Email -> Trigger Availability Check
    if (name === "email") {
      checkEmailAvailability(value);
    }

    setFormData(updatedFormData);
  };

  // ----------------------------------
  // 4. Submit Form
  // ----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Block submission if email is taken
    if (isEmailAvailable === false) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "This email address is already registered. Please login or use another.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match.",
      });
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      contactNO: formData.contactNO,
    };

    try {
      const res = await fetch(
        "https://backend.vertexforbcs.org/api/users/register-student",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "Registration received. Please wait for admin confirmation.",
        });
        setTimeout(() => navigate("/student/login"), 3500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: data.message || "Something went wrong.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Network unavailable.",
      });
    }
  };

  // --- Animation Variants ---
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500 flex items-center justify-center p-4 lg:p-8">
      
      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        
        {/* --- Left Content (Hero) --- */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="lg:w-1/2 text-center lg:text-left text-white"
        >
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md">
            Become a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-300">Vertex Scholar</span>
          </h1>
          <p className="text-lg lg:text-xl text-indigo-100 mb-8 max-w-lg mx-auto lg:mx-0">
            Join the elite community of learners. Prepare smartly with expert guidance and excel in your BCS journey.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/courses")}
            className="px-8 py-3 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            Explore Courses
          </motion.button>
        </motion.div>

        {/* --- Right Content (Form) --- */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full lg:w-1/2 max-w-2xl"
        >
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-purple-500/20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              Create Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-purple-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-purple-400" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-purple-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="student@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 transition-all
                      ${isEmailAvailable === false 
                        ? "border-red-400 focus:ring-red-400" 
                        : isEmailAvailable === true 
                          ? "border-green-400 focus:ring-green-400"
                          : "border-gray-200 dark:border-gray-600 focus:ring-purple-500"
                      }`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {/* Status Icon inside input */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {formData.email && isEmailAvailable === true && <FaCheckCircle className="text-green-500" />}
                    {formData.email && isEmailAvailable === false && <FaTimesCircle className="text-red-500" />}
                  </div>
                </div>
                {/* Status Text */}
                {formData.email && isEmailAvailable === false && (
                  <p className="text-xs text-red-500 font-semibold ml-1 mt-1">Email is already registered</p>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Contact Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-purple-400" />
                  </div>
                  <input
                    type="text"
                    name="contactNO"
                    placeholder="017XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={formData.contactNO}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-purple-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-purple-400" />
                    </div>
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(147, 51, 234, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isEmailAvailable === false}
                className="w-full py-3.5 mt-4 text-white font-bold rounded-xl 
                bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
                hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500
                shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300"
              >
                Create Account
              </motion.button>
              
              <div className="text-center mt-4">
                 <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Already have an account?{" "}
                  <button onClick={() => navigate("/student/login")} className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                    Login here
                  </button>
                 </p>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentRegister;