import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }
  if (!user) {
    // Redirect based on whether admin route or not
    const loginPath = requireAdmin ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={location?.pathname} replace />;
  }
  return children;
};

export default PrivateRoute;
