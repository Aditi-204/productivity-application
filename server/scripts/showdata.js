const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Todo = require('../models/Todo');
const Attendance = require('../models/Attendance');

async function show() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/worktrack');
  
  console.log('\n========== USERS ==========');
  const users = await User.find().select('-password').lean();
  users.forEach(u => {
    console.log(`[${u._id}] ${u.name} | ${u.email} | Role: ${u.role} | Dept: ${u.department || '-'} | Company: ${u.company || '-'}`);
  });
  console.log(`\nTotal: ${users.length} users`);

  console.log('\n========== TODOS ==========');
  const todos = await Todo.find().populate('user', 'name email').lean();
  todos.forEach(t => {
    const user = t.user ? (t.user.name || t.user.email) : 'unknown';
    console.log(`[${t._id}] "${t.title}" | By: ${user} | Status: ${t.status} | Priority: ${t.priority} | Date: ${t.date} | Est: ${t.estimatedMinutes}min`);
  });
  console.log(`\nTotal: ${todos.length} todos`);

  console.log('\n========== ATTENDANCE ==========');
  const att = await Attendance.find().populate('user', 'name email').lean();
  att.forEach(a => {
    const user = a.user ? (a.user.name || a.user.email) : 'unknown';
    console.log(`[${a._id}] ${user} | Date: ${a.date} | Status: ${a.status} | Login: ${a.loginTime ? new Date(a.loginTime).toLocaleTimeString() : '-'} | EOD: ${a.eodCompleted ? 'Done' : 'Pending'}`);
    if (a.aiSummary) console.log(`  AI: ${a.aiSummary.slice(0, 100)}`);
  });
  console.log(`\nTotal: ${att.length} attendance records`);

  await mongoose.disconnect();
}

show().catch(e => { console.error('Error:', e.message); process.exit(1); });
