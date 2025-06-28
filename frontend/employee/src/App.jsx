 import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import EmployeeDashboard from './components/EmployeeDashboard';
 
const App = () => (
  <Routes>
    <Route path="/" element={<LoginForm />} />
    <Route path="/register" element={<RegisterForm />} />
    <Route
      path="/employeeDashboard"
      element={
         
          <EmployeeDashboard />
      
      }
    />
  </Routes>
);

export default App;
