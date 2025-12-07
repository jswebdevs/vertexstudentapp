import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import useAuth from "../hooks/useAuth";

const Root = () => {
  const { user, loading } = useAuth(); // Assuming useAuth provides a loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Only navigate if loading is done and no user exists
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Optional: Show a loader while checking auth state
  if (loading) return <p>Loading...</p>;

  // If no user (and effect hasn't run yet), don't render children to prevent flashes
  if (!user) return null;

  return (
    <div className="max-w-3xl">
      {/* Header usually goes above the content */}
      <Header></Header>
      <Outlet></Outlet>
    </div>
  );
};

export default Root;
