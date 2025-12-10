import { FaUser, FaCamera, FaTimes, FaCheck, FaKey } from "react-icons/fa";
import { useLoaderData } from "react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const StudentProfile = () => {
  const initialStudentData = useLoaderData();
  // Ensure we get a valid ID. If the loader uses '/users/me', the ID is in the response.
  const studentId =
    initialStudentData._id || initialStudentData.id || "current";

  const [student, setStudent] = useState(initialStudentData);
  const [avatar, setAvatar] = useState(student.avatar);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Endpoint used for PATCH requests
  const USER_API_ENDPOINT = `/users/${studentId}`;

  // Clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (previewAvatar) URL.revokeObjectURL(previewAvatar);
    };
  }, [previewAvatar]);

  // --- Image Handlers ---

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewAvatar) URL.revokeObjectURL(previewAvatar);
      const previewURL = URL.createObjectURL(file);
      setPreviewAvatar(previewURL);
      setIsUpdatingImage(true);
    }
  };

  const resetImageState = () => {
    if (previewAvatar) URL.revokeObjectURL(previewAvatar);
    setPreviewAvatar(null);
    setIsUpdatingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateImage = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setIsImageLoading(true);

    try {
      // API call: PATCH /api/users/:userid/avatar
      const res = await axios.patch(`${USER_API_ENDPOINT}/avatar`, formData, {
        headers: {
          ...getAuthHeaders(), // Include token
          "Content-Type": "multipart/form-data",
        },
      });

      // Assuming the backend returns the new avatar URL or updated user object
      const newAvatarUrl =
        res.data.avatarUrl || res.data.user?.avatar || student.avatar;

      setAvatar(newAvatarUrl);
      setStudent((prev) => ({ ...prev, avatar: newAvatarUrl }));
      resetImageState();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Profile image updated.",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        customClass: { popup: "bg-gray-800 text-gray-200" },
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK"
          ? "CORS/Network Error. Check backend configuration."
          : "Failed to update image.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        customClass: { popup: "bg-gray-800 text-gray-200" },
      });
      resetImageState();
    } finally {
      setIsImageLoading(false);
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-white p-4 sm:p-8 transition-colors duration-500">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 dark:border-purple-500/20"
      >
        <div className="flex flex-col md:flex-row">
          
          {/* --- LEFT: IMAGE SECTION --- */}
          <div className="w-full md:w-5/12 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800/50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
            
            {/* Avatar Container */}
            <div className="relative group">
              <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-full p-1 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
                <div className="h-full w-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 relative">
                  {previewAvatar ? (
                    <img
                      src={previewAvatar}
                      alt="Preview Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : avatar ? (
                    <img
                      src={avatar}
                      alt="Student Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <FaUser className="h-24 w-24 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  
                  {/* Hover Overlay for Upload (Only if buttons not showing) */}
                  {!showUpdateButtons && (
                    <div 
                      onClick={handleUploadClick}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                    >
                      <FaCamera className="text-white text-3xl opacity-80" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Floating Status Badge (Optional - can be used to show role) */}
              <div className="absolute bottom-2 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                STUDENT
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />

            {/* Upload Button (Mobile friendly / Explicit button) */}
            {!showUpdateButtons && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUploadClick}
                className="mt-6 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                <FaCamera /> Change Photo
              </motion.button>
            )}

            {/* Update & Cancel Buttons */}
            <AnimatePresence>
              {showUpdateButtons && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex gap-3 mt-6 w-full justify-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelImage}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    <FaTimes /> Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdateImage}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-purple-500/30"
                  >
                    <FaCheck /> Save
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- RIGHT: INFO SECTION --- */}
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-2">
                My Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Manage your account details and security.
              </p>
            </div>

            <div className="space-y-6">
              {/* Name Field */}
              <div className="group p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-md transition-all duration-300">
                <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {student.firstName} {student.lastName}
                </p>
              </div>

              {/* Email Field */}
              <div className="group p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-md transition-all duration-300">
                <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {student.email}
                </p>
              </div>

              {/* Change Password Button */}
              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsPasswordOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:border-pink-500 dark:hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-300 shadow-sm"
                >
                  <FaKey className="text-pink-500" /> Change Password
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --------------------------------- PASSWORD POPUP --------------------------------- */}
      <AnimatePresence>
        {isPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasswordOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700 overflow-hidden"
            >
              {/* Decorative Header Gradient */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <FaKey className="text-purple-500" /> Edit Password
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="••••••••" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="••••••••" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="••••••••" 
                  />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => setIsPasswordOpen(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 rounded-lg shadow-md shadow-red-500/30 transition-all"
                  >
                    Update Password
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentProfile;