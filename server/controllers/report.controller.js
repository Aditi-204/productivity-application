const Attendance = require('../models/Attendance');
const Todo = require('../models/Todo');
const { generateReport } = require('../services/ai.service');

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generatePeriodReport = async (req, res) => {
  try {
    const { type } = req.params;
    if (!['weekly', 'monthly'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "weekly" or "monthly".' });
    }

    const days = type === 'weekly' ? 7 : 30;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    const startStr = formatDate(startDate);
    const endStr = formatDate(today);

    const attendanceRecords = await Attendance.find({
      user: req.user._id,
      date: { $gte: startStr, $lte: endStr },
    }).sort({ date: -1 });

    const todos = await Todo.find({
      user: req.user._id,
      date: { $gte: startStr, $lte: endStr },
    }).sort({ date: -1 });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
    const eodCompletedDays = attendanceRecords.filter(r => r.eodCompleted).length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const totalTasks = todos.length;
    const completedTasks = todos.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const highPriorityCompleted = todos.filter(t => t.status === 'done' && t.priority === 'high').length;
    const totalHighPriority = todos.filter(t => t.priority === 'high').length;
    const totalMinutes = todos.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const totalHoursWorked = Math.round((totalMinutes / 60) * 10) / 10;

    const dayCount = {};
    todos.filter(t => t.status === 'done').forEach(t => {
      dayCount[t.date] = (dayCount[t.date] || 0) + 1;
    });
    const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const priorityBreakdown = { high: { total: 0, done: 0 }, medium: { total: 0, done: 0 }, low: { total: 0, done: 0 } };
    todos.forEach(t => {
      if (priorityBreakdown[t.priority]) {
        priorityBreakdown[t.priority].total++;
        if (t.status === 'done') priorityBreakdown[t.priority].done++;
      }
    });

    const taskSummary = Object.entries(priorityBreakdown)
      .map(([p, v]) => `${p}: ${v.done}/${v.total} completed`)
      .join(', ');

    const reportData = {
      totalDays, presentDays, absentDays, eodCompletedDays, attendanceRate,
      totalTasks, completedTasks, completionRate, highPriorityCompleted,
      totalHighPriority, totalHoursWorked, bestDay, taskSummary,
    };

    const report = await generateReport(type, reportData);

    res.json({
      type,
      period: { start: startStr, end: endStr },
      stats: reportData,
      report,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report.' });
  }
};

module.exports = { generatePeriodReport };
