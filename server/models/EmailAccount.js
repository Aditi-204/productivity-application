const mongoose = require('mongoose');

const emailAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: String,
    enum: ['gmail', 'outlook', 'office365', 'exchange', 'yahoo', 'imap', 'custom'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  displayName: {
    type: String,
    default: '',
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    default: '',
  },
  tokenExpiry: {
    type: Date,
  },
  isConnected: {
    type: Boolean,
    default: true,
  },
  settings: {
    syncEnabled: { type: Boolean, default: true },
    syncFrequency: { type: String, enum: ['realtime', 'hourly', 'daily'], default: 'hourly' },
    autoCategorize: { type: Boolean, default: true },
    autoPrioritize: { type: Boolean, default: true },
    signature: { type: String, default: '' },
  },
  lastSynced: {
    type: Date,
  },
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'error'],
    default: 'idle',
  },
}, {
  timestamps: true,
});

emailAccountSchema.index({ user: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('EmailAccount', emailAccountSchema);
