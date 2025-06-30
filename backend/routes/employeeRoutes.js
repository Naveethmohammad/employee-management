const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load secret from .env
require('dotenv').config(); // Load env vars
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
// 🔐 Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. Token missing.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.employee = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// 🔎 Regex

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/


router.post('/register', async (req, res) => {
  console.log('Registering employee:', req.body);
  try {
    const { name, email, password, aadhaarNumber, panCard } = req.body;

    if (!name || !email || !password || !aadhaarNumber || !panCard) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (!aadhaarRegex.test(aadhaarNumber)) return res.status(400).json({ error: 'Invalid Aadhaar' });
    if (!panRegex.test(panCard)) return res.status(400).json({ error: 'Invalid PAN card' });

    const existing = await Employee.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Declare it as employee, not newemployee
    const employee = new Employee({
      name,
      email,
      password: hashedPassword,
      aadhaarNumber,
      panCard
    });

    await employee.save(); // ✅ Use the same variable name here

    const { password: _, __v, ...data } = employee.toObject();
    res.status(201).json({ message: 'Employee registered', employee: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Attempting login for:", email);

  try {
    const employee = await Employee.findOne({ email }).select('+password');
    if (!employee) {
      console.log("Email not found");
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      console.log(" Password mismatch");
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log("Login successful for:", email);
    const token = jwt.sign({ id: employee._id }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Login failed' });
  }
});



// 🔍 Search (before /:id)
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { name, email, aadhaarNumber, panCard } = req.query;
    const filter = {};
    if (name) filter.name = new RegExp(name, 'i');
    if (email) filter.email = new RegExp(email, 'i');
    if (aadhaarNumber) filter.aadhaarNumber = new RegExp(aadhaarNumber, 'i');
    if (panCard) filter.panCard = new RegExp(panCard, 'i');

    const employees = await Employee.find(filter).select('-password -__v');
    res.json({ message: 'Search successful', results: employees });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ✅ Get all
router.get('/', authMiddleware, async (req, res) => {
  const employees = await Employee.find().select('-password -__v');
  res.json({ message: 'All employees', employees });
});

// ✅ Get by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).select('-password -__v');
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee found', employee: emp });
  } catch {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// ✅ Update
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password -__v');

    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee updated', employee: updated });
  } catch {
    res.status(400).json({ error: 'Update failed' });
  }
});

// ✅ Delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch {
    res.status(400).json({ error: 'Delete failed' });
  }
});

//  Create Employee API
router.post('/create', async (req, res) => {
  const { name, email, password, aadhaarNumber, panCard } = req.body;

  try {
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = new Employee({
      name,
      email,
      password: hashedPassword,
      aadhaarNumber,
      panCard
    });

    await employee.save();

    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Add Employee API
router.post('/add', async (req, res) => {
  const { name, email, password, aadhaarNumber, panCard } = req.body;

  try {
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password || 'default123', 10); // fallback if password not sent

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      aadhaarNumber,
      panCard,
    });

    await newEmployee.save();

    res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


module.exports = router;

//---------------------------------------------------------------------
// const express = require('express');
// const bcrypt = require('bcrypt');
// const router = express.Router();
// const Employee = require('../models/Employee');

// // Create a new employee (Register)
// router.post('/', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const existing = await Employee.findOne({ email });
//     if (existing) return res.status(400).json({ error: 'Email already exists' });

//     const newEmployee = new Employee({ name, email, password });
//     await newEmployee.save();

//     res.status(201).json({ message: 'Employee registered', employee: newEmployee });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Login employee
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const employee = await Employee.findOne({ email });
//     if (!employee) return res.status(401).json({ error: 'Invalid email or password' });

//     const isMatch = await bcrypt.compare(password, employee.password);
//     if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

//     res.json({ message: 'Login successful', employee });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get all employees
// router.get('/', async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get employee by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     if (!employee) return res.status(404).json({ error: 'Employee not found' });
//     res.json(employee);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Update employee
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!updated) return res.status(404).json({ error: 'Employee not found' });
//     res.json({ message: 'Employee updated', employee: updated });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Delete employee
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Employee.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ error: 'Employee not found' });
//     res.json({ message: 'Employee deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // 🔍 Search employees by name, email, or govtId
// router.get('/search', async (req, res) => {
//   try {
//     const { name, email, govtId } = req.query;

//     const filter = {};
//     if (name) filter.name = new RegExp(name, 'i');     // case-insensitive search
//     if (email) filter.email = new RegExp(email, 'i');
//     if (govtId) filter.govtId = new RegExp(govtId, 'i');

//     const results = await Employee.find(filter);
//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;

//===============================================================================================================

// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const Employee = require('../models/Employee');

// // Create new employee (Sign Up)
// router.post('/', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const existingUser = await Employee.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: 'Email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const employee = new Employee({ name, email, password: hashedPassword });

//     await employee.save();
//     res.status(201).json({ message: 'Employee created successfully', employee });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to create employee' });
//   }
// });

// // Login employee
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const employee = await Employee.findOne({ email });
//     if (!employee) return res.status(404).json({ message: 'Employee not found' });

//     const isMatch = await bcrypt.compare(password, employee.password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

//     res.status(200).json({ message: 'Login successful', employee });
//   } catch (err) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// });

// // Get all employees
// router.get('/', async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to get employees' });
//   }
// });

// // Get employee by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     if (!employee) return res.status(404).json({ message: 'Employee not found' });
//     res.json(employee);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to get employee' });
//   }
// });

// // Update employee
// router.put('/:id', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const updatedData = { name, email };
//     if (password) {
//       updatedData.password = await bcrypt.hash(password, 10);
//     }

//     const employee = await Employee.findByIdAndUpdate(req.params.id, updatedData, {
//       new: true,
//     });

//     if (!employee) return res.status(404).json({ message: 'Employee not found' });
//     res.json({ message: 'Employee updated', employee });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update employee' });
//   }
// });

// // Delete employee
// router.delete('/:id', async (req, res) => {
//   try {
//     const employee = await Employee.findByIdAndDelete(req.params.id);
//     if (!employee) return res.status(404).json({ message: 'Employee not found' });
//     res.json({ message: 'Employee deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete employee' });
//   }
// });
// router.get('/search', async (req, res) => {
//   try {
//     const { name, email, govtId } = req.query;

//     const filter = {};
//     if (name) filter.name = new RegExp(name, 'i');     // case-insensitive search
//     if (email) filter.email = new RegExp(email, 'i');
//     if (govtId) filter.govtId = new RegExp(govtId, 'i');

//     const results = await Employee.find(filter);
//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

//-----------------------------------------------------  with employee db-----------------------------------------------------


// Create
// router.post('/', async (req, res) => {
//   try {
//     const employee = new Employee(req.body);
//     const saved = await employee.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Read All
// router.get('/', async (req, res) => {
//   const employees = await Employee.find();
//   res.json(employees);
// });

// // Read by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     if (!employee) return res.status(404).json({ message: 'Not found' });
//     res.json(employee);
//   } catch (err) {
//     res.status(400).json({ error: 'Invalid ID' });
//   }
// });

// // Update
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updated) return res.status(404).json({ message: 'Not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: 'Invalid ID or data' });
//   }
// });

// // Delete
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Employee.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: 'Not found' });
//     res.json({ message: 'Deleted successfully', deleted });
//   } catch (err) {
//     res.status(400).json({ error: 'Invalid ID' });
//   }
// });

//module.exports = router;

