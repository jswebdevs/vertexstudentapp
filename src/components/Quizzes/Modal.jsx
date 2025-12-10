import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const Modal = ({ children, onClose }) => {
  
  // Close modal on "Escape" key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // --- Animation Variants ---
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 25 } 
    },
    exit: { scale: 0.95, opacity: 0, y: 20 },
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      <AnimatePresence>
        {/* Backdrop */}
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/20 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
        >
          {/* Close Button (Floating) */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all shadow-sm"
              aria-label="Close Modal"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto p-6 sm:p-8 h-full custom-scrollbar text-gray-800 dark:text-gray-100">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Modal;