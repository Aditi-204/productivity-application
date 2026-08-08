const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true,
  },
  domain: {
    type: String,
    trim: true,
    default: '',
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  settings: {
    eodCutoff: {
      type: String,
      default: '23:59',
    },
    autoAbsentMark: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Company', companySchema);
