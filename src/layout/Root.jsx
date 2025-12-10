import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import StudentMenu from "./StudentMenu";

const Root = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        Loading...
      </div>
    );
  }


  if (!user) return null;

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Outlet />
      <div className="absolute z-index-999 bottom-0">
        <StudentMenu></StudentMenu>
      </div>
      
    </div>
  );
};

export default Root;