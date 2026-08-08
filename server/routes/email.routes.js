const express = require('express');
const {
  connectAccount, disconnectAccount, reConnectAccount, listAccounts, updateAccountSettings,
  syncEmails, getEmails, getEmail, sendEmail, replyEmail,
  updateEmailStatus, batchUpdateStatus, deleteEmail,
  emailToTask,
  analyzeEmail, analyzeBatch, getBriefing, suggestReply, generateSummary, extractTasks, getAnalytics,
  getEndOfDaySummary,
} = require('../controllers/email.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Account management
router.post('/connect', connectAccount);
router.post('/disconnect/:accountId', disconnectAccount);
router.post('/reconnect/:accountId', reConnectAccount);
router.get('/accounts', listAccounts);
router.put('/accounts/:accountId/settings', updateAccountSettings);

// Sync
router.post('/sync/:accountId', syncEmails);

// Email CRUD
router.get('/:accountId/messages', getEmails);
router.get('/:accountId/messages/:emailId', getEmail);
router.post('/:accountId/send', sendEmail);
router.post('/:accountId/reply/:emailId', replyEmail);
router.patch('/:accountId/messages/:emailId/status', updateEmailStatus);
router.post('/:accountId/messages/batch-status', batchUpdateStatus);
router.delete('/:accountId/messages/:emailId', deleteEmail);

// Email-to-task
router.post('/:accountId/to-task/:emailId', emailToTask);

// AI features
router.post('/ai/analyze/:accountId/:emailId', analyzeEmail);
router.post('/ai/analyze-batch/:accountId', analyzeBatch);
router.get('/ai/briefing/:accountId', getBriefing);
router.post('/ai/suggest-reply/:accountId/:emailId', suggestReply);
router.post('/ai/summarize/:accountId', generateSummary);
router.post('/ai/extract-tasks/:accountId/:emailId', extractTasks);
router.get('/analytics/:accountId', getAnalytics);
router.get('/eod-summary/:accountId', getEndOfDaySummary);

module.exports = router;
