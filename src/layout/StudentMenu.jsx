import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FiHome, FiBookOpen, FiCheckSquare, FiUser, FiLogOut } from "react-icons/fi";

const StudentMenu = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: FiHome, end: true },
    { path: "/courses", label: "Courses", icon: FiBookOpen },
    { path: "/quizzes", label: "Quizzes", icon: FiCheckSquare },
    { path: `/account/${user._id}`, label: "Account", icon: FiUser },
  ];

  // Base styles for navigation icons
  const baseClass =
    "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ease-in-out group";
  
  // Active: Glow effect + Scale up slightly
  const activeClass = "text-cyan-400 scale-110 bg-white/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]";
  
  // Inactive: Dimmed + Hover effect
  const inactiveClass = "text-gray-400 hover:text-white hover:bg-white/5";

  return (
    /* Container Layout Logic:
      1. fixed bottom-4: Floats slightly above bottom edge
      2. left-1/2 -translate-x-1/2: Perfectly centers the bar horizontally
      3. w-[95%]: Takes up most width on small phones
      4. max-w-[600px]: Stops growing on tablets/desktops (keeps the 'phone' look)
    */
    <nav className="fixed z-50 left-1/2 transform -translate-x-1/2 bottom-0.5 
                    w-[95%] max-w-[600px] 
                    bg-slate-900/90 backdrop-blur-md 
                    border border-white/10 rounded-2xl shadow-2xl">
      
      <div className="flex items-center justify-between px-3 py-2">
        
        {/* Navigation Links Group */}
        <div className="flex items-center justify-around flex-grow gap-1 mr-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `${baseClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <item.icon size={22} className="mb-0.5" />
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-2 ml-1 text-red-400 transition-all duration-300 rounded-xl hover:bg-red-500/10 hover:text-red-300 group"
          title="Logout"
        >
          <FiLogOut size={22} className="mb-0.5 group-hover:rotate-[-45deg] transition-transform duration-300" />
          <span className="text-[10px] font-bold">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default StudentMenu;