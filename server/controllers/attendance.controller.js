const Attendance = require('../models/Attendance');
const Todo = require('../models/Todo');
const User = require('../models/User');
const { generateEODSummary } = require('../services/ai.service');

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const submitEOD = async (req, res) => {
  try {
    const today = formatDate(new Date());

    const todos = await Todo.find({
      user: req.user._id,
      date: today,
    });

    const completedTodos = todos.filter(t => t.status === 'done');

    if (completedTodos.length < 1) {
      return res.status(400).json({
        message: 'Complete at least 1 task before submitting EOD report.',
        completedCount: completedTodos.length,
        totalCount: todos.length,
      });
    }

    const aiSummary = await generateEODSummary(todos);

    const attendance = await Attendance.findOneAndUpdate(
      { user: req.user._id, date: today },
      {
        $set: {
          eodSubmittedAt: new Date(),
          eodCompleted: true,
          aiSummary,
          status: 'present',
        },
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for today.' });
    }

    res.json({
      message: 'EOD report submitted successfully. Attendance marked as complete.',
      attendance,
      summary: {
        completedTasks: completedTodos.length,
        totalTasks: todos.length,
        completionRate: todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0,
        aiSummary,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit EOD report.' });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const { range } = req.query;
    const userId = req.user._id;
    const today = new Date();

    let startDate;
    switch (range) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        break;
      case 'quarter':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
    }

    const records = await Attendance.find({
      user: userId,
      date: {
        $gte: formatDate(startDate),
        $lte: formatDate(today),
      },
    }).sort({ date: -1 });

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const partialDays = records.filter(r => r.status === 'partial').length;
    const eodCompletedDays = records.filter(r => r.eodCompleted).length;

    res.json({
      records,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        partialDays,
        eodCompletedDays,
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance records.' });
  }
};

const getTeamAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only managers and admins can view team attendance.' });
    }

    const { date } = req.query;
    const queryDate = date ? formatDate(new Date(date)) : formatDate(new Date());

    let teamUsers;
    if (req.user.role === 'admin') {
      teamUsers = await User.find({ isActive: true });
    } else {
      teamUsers = await User.find({
        company: req.user.company,
        isActive: true,
      });
    }

    const attendanceRecords = await Attendance.find({
      user: { $in: teamUsers.map(u => u._id) },
      date: queryDate,
    });

    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.user.toString()] = record;
    });

    const teamAttendance = teamUsers.map(user => {
      const record = attendanceMap[user._id.toString()];
      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
        },
        attendance: record || null,
        status: record ? record.status : 'absent',
        loginTime: record ? record.loginTime : null,
        eodCompleted: record ? record.eodCompleted : false,
      };
    });

    const presentCount = teamAttendance.filter(t => t.status === 'present').length;
    const absentCount = teamAttendance.filter(t => t.status === 'absent').length;
    const submittedCount = teamAttendance.filter(t => t.eodCompleted).length;

    res.json({
      team: teamAttendance,
      date: queryDate,
      stats: {
        total: teamUsers.length,
        present: presentCount,
        absent: absentCount,
        eodSubmitted: submittedCount,
        pending: teamUsers.length - submittedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch team attendance.' });
  }
};

module.exports = { submitEOD, getMyAttendance, getTeamAttendance };
