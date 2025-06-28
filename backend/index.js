const express = require('express');
const mongoose = require('mongoose');
const employeeRoutes = require('./routes/employeeRoutes'); // ✅ import routes

const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
const PORT = 5000;
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // your Vite frontend URL
  credentials: true,
}));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/employeesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/employees', require('./routes/employeeRoutes'));

 // ✅ Set base path

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
