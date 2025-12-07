// src/pages/student/auth/StudentRegister.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
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
  const [isEmailAvailable, setIsEmailAvailable] = useState(null);
  const navigate = useNavigate();

  // 1. Check Email Availability
  const checkEmailAvailability = async (email) => {
    if (!email || !email.includes("@")) {
      setIsEmailAvailable(null);
      return;
    }
    try {
      const res = await fetch(
        `https://backend.vertexforbcs.org/api/users/check-email/${email}`
      );
      const data = await res.json();
      setIsEmailAvailable(data.available);
    } catch (error) {
      console.error("Email check failed:", error);
      setIsEmailAvailable(null);
    }
  };

  // 2. Generate Username Logic (Internal)
  const generateUsername = (fName, lName) => {
    if (!fName && !lName) return "";
    const cleanFirst = fName.trim().toLowerCase().replace(/\s/g, "");
    const cleanLast = lName.trim().toLowerCase().replace(/\s/g, "");
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${cleanFirst}${cleanLast}${randomNum}`;
  };

  // 3. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    if (name === "firstName" || name === "lastName") {
      const fName = name === "firstName" ? value : formData.firstName;
      const lName = name === "lastName" ? value : formData.lastName;
      if (fName || lName) {
        updatedFormData.username = generateUsername(fName, lName);
      }
    }
    if (name === "email") {
      checkEmailAvailability(value);
    }
    setFormData(updatedFormData);
  };

  // 4. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEmailAvailable === false) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "This email address is already registered.",
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

  return (
    // 🎨 STYLING CHANGES: min-h-screen, p-4, md:hidden
    <div className="md:hidden flex flex-col justify-center items-center h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 w-screen">
      {/* Registration Form Container */}
      <div className="card w-4/5 max-w-100 shadow-2xl bg-white/50 text-black dark:text-white dark:bg-gray-900/70 backdrop-blur-md rounded-lg border border-white/20 dark:border-pink-400/30">
        <form
          onSubmit={handleSubmit}
          // 🎨 STYLING CHANGES: Smaller gap, single column
          className="card-body flex flex-col gap-2 p-5 te"
        >
          <h1 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">
            Register Now!
          </h1>
          <h3 className="text-sm text-center">
            Alread a Student? <Link to="/login" className="text-accent">Login here</Link>
          </h3>

          {/* Names */}
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "First Name *", name: "firstName" },
              { label: "Last Name *", name: "lastName" },
            ].map((field) => (
              <div key={field.name} className="form-control">
                <input
                  type="text"
                  name={field.name}
                  placeholder={field.label}
                  className="input input-sm input-bordered bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-0 focus:ring-1 focus:ring-pink-500 w-full"
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>

          {/* Email Field with Availability Check */}
          <div className="form-control">
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              className={`input w-full input-sm input-bordered bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-0 focus:ring-1 ${
                isEmailAvailable === false
                  ? "input-error focus:ring-red-500"
                  : "focus:ring-pink-500"
              }`}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contact Number */}
          <div className="form-control">
            <input
              type="text"
              name="contactNO"
              placeholder="Contact Number *"
              className="input w-full input-sm input-bordered bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-0 focus:ring-1 focus:ring-pink-500"
              value={formData.contactNO}
              onChange={handleChange}
              required
            />
          </div>

          {/* Passwords */}
          {[
            {
              label: "Password *",
              name: "password",
              show: showPassword,
              toggle: setShowPassword,
            },
            {
              label: "Confirm Password *",
              name: "confirmPassword",
              show: showConfirm,
              toggle: setShowConfirm,
            },
          ].map(({ label, name, show, toggle }) => (
            <div key={name} className="form-control relative">
              <input
                type={show ? "text" : "password"}
                name={name}
                placeholder={label}
                className="input w-full input-sm input-bordered bg-white dark:bg-gray-800 text-gray-800 dark:text-white pr-9 focus:outline-0 focus:ring-1 focus:ring-pink-500"
                value={formData[name]}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => toggle(!show)}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg dark:hover:text-gray-300"
              >
                {show ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          ))}

          {/* Submit Button */}
          <div className="form-control mt-2 flex items-center justify-center">
            <button
              type="submit"
              disabled={isEmailAvailable === false}
              className="btn btn-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Register Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
