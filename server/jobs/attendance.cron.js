const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const markAbsentUsers = async () => {
  try {
    const today = formatDate(new Date());
    const allUsers = await User.find({ isActive: true });
    const existingRecords = await Attendance.find({ date: today });

    const existingUserIds = new Set(existingRecords.map(r => r.user.toString()));

    const absentUsers = allUsers.filter(u => !existingUserIds.has(u._id.toString()));

    if (absentUsers.length === 0) {
      console.log(`[Cron] No absent users to mark for ${today}`);
      return;
    }

    const absentRecords = absentUsers.map(user => ({
      user: user._id,
      date: today,
      status: 'absent',
      loginTime: null,
      eodCompleted: false,
    }));

    await Attendance.insertMany(absentRecords);
    console.log(`[Cron] Marked ${absentRecords.length} users absent for ${today}`);
  } catch (error) {
    console.error(`[Cron] Error marking absent users: ${error.message}`);
  }
};

const initCronJobs = () => {
  cron.schedule('59 23 * * *', () => {
    console.log('[Cron] Running nightly attendance job...');
    markAbsentUsers();
  }, {
    timezone: 'Asia/Kolkata',
  });
  console.log('[Cron] Nightly attendance job scheduled for 11:59 PM');
};

module.exports = { initCronJobs };
