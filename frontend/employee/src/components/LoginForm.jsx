 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/employees/login",
        { email, password }
      );

      // ✅ Save token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.employee));

      // ✅ Navigate to employee dashboard
      navigate("/employeeDashboard");
      return; // stop further execution
    } catch (err) {
      console.error("❌ Login failed:", err);
      const message = err.response?.data?.message || "Invalid credentials";
      alert(message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src="/login-illustration.png" alt="Login illustration" />
      </div>

      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit">Sign In</button>
        </form>

        <p>
          Don&apos;t have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/register")}>
            Create a new account
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
