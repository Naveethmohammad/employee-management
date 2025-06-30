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
      const res = await axios.post("http://localhost:5000/api/employees/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.employee));
      navigate("/employeeDashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src="https://media.istockphoto.com/id/1272623962/vector/website-development-concept-group-of-developers-and-designers-create-website-teamwork.webp?a=1&b=1&s=612x612&w=0&k=20&c=44MzY97312FlyOTdL0V0_LAs5Dg15GRfSxHa5GBssMg=" alt="login" />
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Sign In</button>
          </form>
          <p>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} className="signup-link">
              Create a new account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
