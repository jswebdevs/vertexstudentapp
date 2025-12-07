// src/context/AuthProvider.jsx

import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import Swal from "sweetalert2";

const BASE_URL = "https://backend.vertexforbcs.org/api";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------
  // RESTORE SESSION FROM LOCALSTORAGE
  // --------------------------------
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedUserType = localStorage.getItem("userType");

        if (savedToken && savedUser) {
          // Validate token expiry
          const [, payloadBase64] = savedToken.split(".");
          const payload = JSON.parse(atob(payloadBase64));

          if (payload.exp * 1000 > Date.now()) {
            // Token is still valid
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setUserType(savedUserType || parsedUser.userType);
          } else {
            // Token expired
            console.warn("[AuthProvider] ⚠️ Token expired, clearing session");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userType");
            setUser(null);
            setUserType(null);
          }
        }
      } catch (err) {
        console.error("[AuthProvider] Error restoring session:", err);
        localStorage.clear();
        setUser(null);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // --------------------------------
  // LOGIN (Email/Username)
  // --------------------------------
  const signInWithController = async (usernameOrEmail, password) => {
    setLoading(true);

    const payload = {
      usernameOrEmail: (usernameOrEmail || "").trim().toLowerCase(),
      password: password || "",
    };

    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Invalid credentials.";
        try {
          const data = await res.json();
          msg = data?.message || msg;
        } catch {
          // Fallback if response is not JSON
        }
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: msg,
        });
        return null;
      }

      const data = await res.json();

      if (!data?.user) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data?.message || "Invalid credentials.",
        });
        return null;
      }

      // Save user to state and localStorage
      setUser(data.user);
      setUserType(data.user.userType);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userType", data.user.userType);

      console.log("[AuthProvider] Controller login successful:", {
        email: data.user.email,
        userType: data.user.userType,
      });

      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: `Logged in as ${data.user.firstName || data.user.username}`,
        timer: 1200,
        showConfirmButton: false,
      });

      return data;
    } catch (err) {
      console.error("[AuthProvider] Controller login error:", err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: err.message || "Login request failed.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // LOGOUT
  // --------------------------------
  const signOutUser = async () => {
    setLoading(true);
    try {
      localStorage.clear();
      setUser(null);
      setUserType(null);
      console.log("[AuthProvider] User logged out");
    } catch (err) {
      console.error("[AuthProvider] Logout error:", err);
      Swal.fire({
        icon: "error",
        title: "Sign Out Failed",
        text: err.message || "Logout failed.",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // PROVIDER VALUE
  // --------------------------------
  const authInfo = {
    user,
    userType,
    loading,
    signInWithController,
    signOutUser,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
