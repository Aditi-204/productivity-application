const mongoose = require('mongoose');

const emailMessageSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailAccount',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  threadId: {
    type: String,
    default: '',
  },
  messageId: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    default: '(No Subject)',
    trim: true,
  },
  sender: {
    name: { type: String, default: '' },
    email: { type: String, required: true },
  },
  recipients: [{
    name: { type: String, default: '' },
    email: { type: String, required: true },
  }],
  body: {
    type: String,
    default: '',
  },
  bodyHtml: {
    type: String,
    default: '',
  },
  snippet: {
    type: String,
    default: '',
  },
  hasAttachments: {
    type: Boolean,
    default: false,
  },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String,
    size: Number,
  }],
  receivedAt: {
    type: Date,
    required: true,
  },
  isSent: {
    type: Boolean,
    default: false,
  },

  // Status
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'completed', 'follow-up', 'waiting', 'needs-approval', 'delegated', 'archived', 'scheduled'],
    default: 'unread',
  },
  statusChangedAt: {
    type: Date,
  },

  // Priority
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
  },
  importanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  // AI analysis
  aiCategory: {
    type: String,
    enum: ['general', 'meeting', 'invoice', 'approval', 'support', 'hr', 'finance', 'marketing', 'development', 'sales', 'personal', 'job', 'newsletter'],
    default: 'general',
  },
  aiIntent: {
    type: String,
    default: '',
  },
  aiSummary: {
    type: String,
    default: '',
  },
  aiSuggestedAction: {
    type: String,
    default: '',
  },
  aiDeadline: {
    type: Date,
  },
  aiProject: {
    type: String,
    default: '',
  },
  aiDepartment: {
    type: String,
    default: '',
  },
  aiExtractedTasks: [{
    title: String,
    deadline: Date,
    priority: { type: String, enum: ['low', 'medium', 'high'] },
    description: String,
  }],

  // Reply tracking
  replyCount: {
    type: Number,
    default: 0,
  },
  lastReplyAt: {
    type: Date,
  },
  responseTimeMinutes: {
    type: Number,
    default: 0,
  },
  isRepliedByAI: {
    type: Boolean,
    default: false,
  },

  // Read tracking
  readAt: {
    type: Date,
  },
  readTimeMinutes: {
    type: Number,
    default: 2,
  },

  // Labels / tags
  labels: [{
    type: String,
  }],

  // Folder
  folder: {
    type: String,
    default: 'inbox',
  },
}, {
  timestamps: true,
});

emailMessageSchema.index({ user: 1, account: 1, receivedAt: -1 });
emailMessageSchema.index({ user: 1, status: 1 });
emailMessageSchema.index({ user: 1, priority: 1 });
emailMessageSchema.index({ user: 1, aiCategory: 1 });

module.exports = mongoose.model('EmailMessage', emailMessageSchema);
