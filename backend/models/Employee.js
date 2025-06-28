const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    select: false, // hide password by default
  },
  aadhaarNumber: {
    type: String,
    required: true,
    match: /^\d{12}$/,
  },
  panCard: {
    type: String,
    required: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  },
}, { timestamps: true });

// // 🔐 Hash password before saving
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🧹 Clean output (remove password & __v)
employeeSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('Employee', employeeSchema);
