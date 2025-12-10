import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const ModalDL = ({ onClose, children }) => {

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Animation Variants
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <AnimatePresence>
        {/* Backdrop */}
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Content */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button Header */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-pink-100 hover:text-pink-600 dark:hover:bg-gray-600 dark:hover:text-pink-400 transition-all duration-200"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Children Container (Scrollable) */}
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar text-gray-800 dark:text-gray-200">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ModalDL;