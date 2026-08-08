const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 500,
  },
  description: {
    type: String,
    default: '',
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'done'],
    default: 'pending',
  },
  estimatedMinutes: {
    type: Number,
    default: 30,
    min: 0,
  },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String,
    size: Number,
  }],
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

todoSchema.index({ user: 1, date: 1, order: 1 });

module.exports = mongoose.model('Todo', todoSchema);
