// src/pages/student/courses/StudentCart.jsx

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaHashtag,
  FaShoppingCart,
  FaRedo,
  FaSpinner,
  FaCalendarAlt,
  FaCreditCard,
} from "react-icons/fa";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";

const SUBSCRIPTION_PLANS = [
  { value: "1M", label: "1 Month", priceMultiplier: 1 },
  { value: "2M", label: "2 Months", priceMultiplier: 2 },
  { value: "3M", label: "3 Months", priceMultiplier: 2.5 },
];

const Cart = ({ isOpen, onClose, course, isRenewal = false }) => {
  const { user } = useAuth();

  const [trxID, setTrxID] = useState("");
  const [numberUsed, setNumberUsed] = useState("");
  const [plan, setPlan] = useState("1M");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && course) {
      setPlan(course.plan || "1M");
      // Always clear transaction fields for a new request/renewal
      setTrxID("");
      setNumberUsed("");
      setMessage({ type: "", text: "" });
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  // Pricing Calculation
  const basePrice = course.subscription?.amount || 200;
  const selectedPlanObj = SUBSCRIPTION_PLANS.find((p) => p.value === plan);
  const totalPrice = basePrice * (selectedPlanObj?.priceMultiplier || 1);

  const handleBuyNow = async () => {
    if (!trxID || !numberUsed) {
      setMessage({
        type: "error",
        text: "Please fill in the NEW Transaction ID and Sender Number.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    // ID Selection
    const courseIdentifier = isRenewal ? course.courseId : course._id;

    const payload = {
      studentId: user?._id,
      studentName: `${user?.firstName} ${user?.lastName}`,
      email: user?.email,
      courseId: courseIdentifier,
      courseTitle: course.title,
      plan: plan,
      trxID: trxID,
      numberUsed: numberUsed,
      amount: totalPrice,
      paymentMethod: "Mobile Banking",
      requestDate: new Date(),
      isRenewal: isRenewal,
    };

    try {
      const response = await fetch(
        `https://backend.vertexforbcs.org/api/enrollments/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Request submitted successfully! Admin will verify soon.",
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to send request.",
        });
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setMessage({ type: "error", text: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // --- Animation Variants ---
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { scale: 0.95, opacity: 0, y: 20 }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 dark:border-purple-500/20"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
        >
          <FaTimes size={18} />
        </button>

        {/* --- LEFT: Course & Payment Form --- */}
        <div className="w-full md:w-3/5 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FaCreditCard size={20} />
              </span>
              Checkout
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-11">
              Complete your enrollment securely.
            </p>
          </div>

          {/* Course Info Card */}
          <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700/30 dark:to-gray-700/10 p-4 rounded-xl border border-indigo-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${isRenewal ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  {isRenewal ? "Renewing" : "New Enrollment"}
                </span>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-2 leading-tight">
                  {course.title}
                </h3>
              </div>
              <div className="text-right">
                 <span className="block text-xs text-gray-500 dark:text-gray-400">Base Price</span>
                 <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{basePrice} BDT</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Plan Select */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Select Duration
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-purple-400" />
                </div>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                >
                  {SUBSCRIPTION_PLANS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* TrxID */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Transaction ID (TrxID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaHashtag className="text-purple-400" />
                </div>
                <input
                  type="text"
                  value={trxID}
                  onChange={(e) => setTrxID(e.target.value)}
                  placeholder="e.g. 9JKS82..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Sender Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Sender Number (Bkash/Nagad)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhoneAlt className="text-purple-400" />
                </div>
                <input
                  type="text"
                  value={numberUsed}
                  onChange={(e) => setNumberUsed(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: Summary & Action (Darker Background) --- */}
        <div className="w-full md:w-2/5 p-8 bg-gray-50 dark:bg-gray-900/50 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 flex flex-col justify-between">
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>Selected Plan</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {SUBSCRIPTION_PLANS.find((p) => p.value === plan)?.label}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>Multiplier</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  x {SUBSCRIPTION_PLANS.find((p) => p.value === plan)?.priceMultiplier}
                </span>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

              <div className="flex justify-between items-end">
                <span className="text-base font-bold text-gray-800 dark:text-white">Total Payable</span>
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
                  {totalPrice} ৳
                </span>
              </div>
            </div>

            {/* Payment Instruction */}
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
              <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-wide mb-1">
                Payment Instructions
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Send money to <span className="font-mono font-bold bg-white dark:bg-black/20 px-1 rounded">017XXXXXXXX</span> via Bkash/Nagad "Send Money" option.
              </p>
            </div>
          </div>

          <div className="mt-6">
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-3 text-center text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${
                  message.type === "success"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyNow}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Processing...
                </>
              ) : isRenewal ? (
                <>
                  <FaRedo /> Confirm Renewal
                </>
              ) : (
                <>
                  <FaShoppingCart /> Confirm Purchase
                </>
              )}
            </motion.button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Cart;