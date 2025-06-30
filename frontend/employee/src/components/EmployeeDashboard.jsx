 // 📦 Import useEffect, useState, etc. already at the top
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null); // 👈 for edit
  const [editForm, setEditForm] = useState({}); // 👈 edit form data
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchEmployees();
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.employees);
    } catch (err) {
      alert("Failed to fetch employees");
    }
  };

  // ✅ DELETE EMPLOYEE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees(); // refresh list
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ✅ START EDIT MODE
  const handleEdit = (employee) => {
    setEditingEmployee(employee._id);
    setEditForm({ ...employee });
  };

  // ✅ HANDLE EDIT FORM CHANGE
  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // ✅ SUBMIT EDIT
  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/employees/${editingEmployee}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingEmployee(null);
      fetchEmployees();
    } catch {
      alert("Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Employee Dashboard</h2>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <input
        type="text"
        placeholder="Search employees..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Aadhaar</th>
            <th>PAN</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp._id.slice(-4)}</td>
              <td>
                {editingEmployee === emp._id ? (
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                  />
                ) : (
                  emp.name
                )}
              </td>
              <td>
                {editingEmployee === emp._id ? (
                  <input
                    name="email"
                    value={editForm.email}
                    onChange={handleChange}
                  />
                ) : (
                  emp.email
                )}
              </td>
              <td>
                {editingEmployee === emp._id ? (
                  <input
                    name="aadhaarNumber"
                    value={editForm.aadhaarNumber}
                    onChange={handleChange}
                  />
                ) : (
                  emp.aadhaarNumber
                )}
              </td>
              <td>
                {editingEmployee === emp._id ? (
                  <input
                    name="panCard"
                    value={editForm.panCard}
                    onChange={handleChange}
                  />
                ) : (
                  emp.panCard
                )}
              </td>
              <td>
                {editingEmployee === emp._id ? (
                  <>
                    <button className="edit-btn" onClick={handleUpdate}>
                      Save
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => setEditingEmployee(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => handleEdit(emp)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(emp._id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeDashboard;
