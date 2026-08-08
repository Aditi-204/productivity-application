const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Company = require('../models/Company');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, company: companyName, department } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    let company = null;
    if (companyName) {
      company = await Company.findOne({ name: companyName });
      if (!company) {
        company = await Company.create({ name: companyName });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'employee',
      department: department || 'General',
      company: company ? company._id : undefined,
    });

    if (company) {
      if (user.role === 'admin') {
        company.admins.push(user._id);
      }
      company.employees.push(user._id);
      await company.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const today = formatDate(new Date());
    const existingAttendance = await Attendance.findOne({
      user: user._id,
      date: today,
    });

    if (!existingAttendance) {
      await Attendance.create({
        user: user._id,
        date: today,
        status: 'present',
        loginTime: new Date(),
      });
    }

    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user,
      accessToken,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account has been deactivated. Contact your admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const today = formatDate(new Date());
    const existingAttendance = await Attendance.findOne({
      user: user._id,
      date: today,
    });

    if (!existingAttendance) {
      await Attendance.create({
        user: user._id,
        date: today,
        status: 'present',
        loginTime: new Date(),
      });
    }

    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      user,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie('refreshToken', '', { httpOnly: true, maxAge: 0 });
    res.cookie('accessToken', '', { httpOnly: true, maxAge: 0 });
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company', 'name domain');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data.' });
  }
};

module.exports = { register, login, refresh, logout, getMe };
