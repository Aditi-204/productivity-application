const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'partial'],
    default: 'present',
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
  eodSubmittedAt: {
    type: Date,
  },
  eodCompleted: {
    type: Boolean,
    default: false,
  },
  aiSummary: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
