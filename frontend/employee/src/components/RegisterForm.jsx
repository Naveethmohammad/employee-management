import React, { useState } from 'react';
import './RegisterForm.css';
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    aadhaarNumber: "",
    panCard: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/employees/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      console.log("Register response:", data);

      if (res.ok) {
        alert(data.message); // ✅ shows success
        navigate("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/online-registration-8086620-6487633.png"
          alt="Register Illustration"
        />
      </div>

      <div className="register-right">
        <div className="register-form">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <label>Name</label>
            <input type="text" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} required />

            <label>Email</label>
            <input type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />

            <label>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />

            <label>Aadhaar Number</label>
            <input type="text" name="aadhaarNumber" placeholder="Enter your Aadhaar Number" value={form.aadhaarNumber} onChange={handleChange} required />

            <label>PAN Card</label>
            <input type="text" name="panCard" placeholder="Enter your PAN Card" value={form.panCard} onChange={handleChange} required />

            <button type="submit">Register</button>
          </form>

          <p>
            Already have an account? <Link to="/">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
