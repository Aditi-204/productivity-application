const EmailAccount = require('../models/EmailAccount');
const EmailMessage = require('../models/EmailMessage');
const Todo = require('../models/Todo');
const { generateEODSummary } = require('../services/ai.service');

// -------------------- ACCOUNT MANAGEMENT --------------------

const connectAccount = async (req, res) => {
  try {
    const { provider, email, displayName, accessToken, refreshToken, tokenExpiry } = req.body;
    if (!provider || !email || !accessToken) {
      return res.status(400).json({ message: 'Provider, email, and accessToken are required.' });
    }
    const existing = await EmailAccount.findOne({ user: req.user._id, email });
    if (existing) {
      existing.accessToken = accessToken;
      if (refreshToken) existing.refreshToken = refreshToken;
      if (tokenExpiry) existing.tokenExpiry = new Date(tokenExpiry);
      existing.isConnected = true;
      await existing.save();
      return res.json({ account: existing });
    }
    const account = await EmailAccount.create({
      user: req.user._id, provider, email,
      displayName: displayName || email,
      accessToken, refreshToken: refreshToken || '',
      tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
    });
    res.status(201).json({ account });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'This email is already connected.' });
    res.status(500).json({ message: 'Failed to connect email account.' });
  }
};

const disconnectAccount = async (req, res) => {
  try {
    const account = await EmailAccount.findOne({ _id: req.params.accountId, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    account.isConnected = false;
    account.accessToken = '';
    account.refreshToken = '';
    await account.save();
    res.json({ message: 'Account disconnected.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect account.' });
  }
};

const reConnectAccount = async (req, res) => {
  try {
    const { accessToken, refreshToken, tokenExpiry } = req.body;
    const account = await EmailAccount.findOne({ _id: req.params.accountId, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    account.accessToken = accessToken;
    if (refreshToken) account.refreshToken = refreshToken;
    if (tokenExpiry) account.tokenExpiry = new Date(tokenExpiry);
    account.isConnected = true;
    await account.save();
    res.json({ account });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reconnect account.' });
  }
};

const listAccounts = async (req, res) => {
  try {
    const accounts = await EmailAccount.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to list accounts.' });
  }
};

const updateAccountSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const account = await EmailAccount.findOne({ _id: req.params.accountId, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    if (settings) {
      Object.assign(account.settings, settings);
    }
    await account.save();
    res.json({ account });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings.' });
  }
};

// -------------------- EMAIL SYNC --------------------

const syncEmails = async (req, res) => {
  try {
    const account = await EmailAccount.findOne({ _id: req.params.accountId, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found.' });

    account.syncStatus = 'syncing';
    await account.save();

    const sampleMessages = generateSampleEmails(account._id, req.user._id);
    for (const msg of sampleMessages) {
      await EmailMessage.findOneAndUpdate(
        { user: req.user._id, account: account._id, messageId: msg.messageId },
        { $setOnInsert: msg },
        { upsert: true, new: false }
      );
    }

    account.lastSynced = new Date();
    account.syncStatus = 'idle';
    await account.save();

    const total = await EmailMessage.countDocuments({ user: req.user._id, account: account._id });
    res.json({ message: `Synced ${sampleMessages.length} emails. Total: ${total}`, synced: sampleMessages.length, total });
  } catch (error) {
    await EmailAccount.findOneAndUpdate({ _id: req.params.accountId }, { syncStatus: 'error' });
    res.status(500).json({ message: 'Failed to sync emails.' });
  }
};

const getEmails = async (req, res) => {
  try {
    const { status, priority, category, folder, limit, offset, sort } = req.query;
    const filter = { user: req.user._id, account: req.params.accountId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.aiCategory = category;
    if (folder) filter.folder = folder;

    const sortOption = {};
    if (sort === 'oldest') sortOption.receivedAt = 1;
    else if (sort === 'priority') { sortOption.importanceScore = -1; sortOption.receivedAt = -1; }
    else sortOption.receivedAt = -1;

    const emails = await EmailMessage.find(filter)
      .sort(sortOption)
      .skip(parseInt(offset) || 0)
      .limit(Math.min(parseInt(limit) || 100, 500));

    const total = await EmailMessage.countDocuments(filter);
    res.json({ emails, total });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch emails.' });
  }
};

const getEmail = async (req, res) => {
  try {
    const email = await EmailMessage.findOne({
      _id: req.params.emailId, user: req.user._id, account: req.params.accountId,
    });
    if (!email) return res.status(404).json({ message: 'Email not found.' });

    if (email.status === 'unread') {
      email.status = 'read';
      email.readAt = new Date();
      await email.save();
    }

    res.json({ email });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch email.' });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { to, subject, body, attachments } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'To, subject, and body are required.' });
    }

    const account = await EmailAccount.findOne({ _id: req.params.accountId, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found.' });

    const sentEmail = await EmailMessage.create({
      account: account._id, user: req.user._id,
      subject, body, isSent: true,
      sender: { name: req.user.name, email: account.email },
      recipients: [{ email: to }],
      receivedAt: new Date(),
      status: 'completed',
      folder: 'sent',
      attachments: attachments || [],
    });

    res.status(201).json({ email: sentEmail });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email.' });
  }
};

const replyEmail = async (req, res) => {
  try {
    const { body, tone } = req.body;
    if (!body) return res.status(400).json({ message: 'Reply body is required.' });

    const original = await EmailMessage.findOne({
      _id: req.params.emailId, user: req.user._id, account: req.params.accountId,
    });
    if (!original) return res.status(404).json({ message: 'Original email not found.' });

    original.status = 'replied';
    original.lastReplyAt = new Date();
    original.replyCount += 1;
    if (original.readAt) {
      original.responseTimeMinutes = Math.round((new Date() - original.readAt) / 60000);
    }
    original.isRepliedByAI = !!tone;
    await original.save();

    const replyEmail = await EmailMessage.create({
      account: original.account, user: req.user._id,
      threadId: original.threadId || original.messageId,
      subject: `Re: ${original.subject}`,
      body,
      isSent: true,
      sender: { name: req.user.name, email: '' },
      recipients: [{ email: original.sender.email }],
      receivedAt: new Date(),
      status: 'completed',
      folder: 'sent',
    });

    res.json({ email: original, reply: replyEmail });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reply.' });
  }
};

// -------------------- EMAIL STATUS/ACTIONS --------------------

const updateEmailStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const email = await EmailMessage.findOne({
      _id: req.params.emailId, user: req.user._id, account: req.params.accountId,
    });
    if (!email) return res.status(404).json({ message: 'Email not found.' });

    email.status = status;
    email.statusChangedAt = new Date();
    await email.save();
    res.json({ email });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status.' });
  }
};

const batchUpdateStatus = async (req, res) => {
  try {
    const { emailIds, status } = req.body;
    if (!Array.isArray(emailIds) || !status) {
      return res.status(400).json({ message: 'emailIds array and status are required.' });
    }
    await EmailMessage.updateMany(
      { _id: { $in: emailIds }, user: req.user._id },
      { $set: { status, statusChangedAt: new Date() } }
    );
    res.json({ message: `Updated ${emailIds.length} emails.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to batch update.' });
  }
};

const deleteEmail = async (req, res) => {
  try {
    const email = await EmailMessage.findOneAndDelete({
      _id: req.params.emailId, user: req.user._id, account: req.params.accountId,
    });
    if (!email) return res.status(404).json({ message: 'Email not found.' });
    res.json({ message: 'Email deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete email.' });
  }
};

// -------------------- EMAIL-TO-TASK --------------------

const emailToTask = async (req, res) => {
  try {
    const email = await EmailMessage.findOne({
      _id: req.params.emailId, user: req.user._id, account: req.params.accountId,
    });
    if (!email) return res.status(404).json({ message: 'Email not found.' });

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const lastTodo = await Todo.findOne({ user: req.user._id, date: dateStr }).sort({ order: -1 });
    const order = lastTodo ? lastTodo.order + 1 : 0;

    const todo = await Todo.create({
      user: req.user._id,
      date: dateStr,
      title: email.subject,
      description: `From: ${email.sender.name || email.sender.email}\n\n${email.body}`,
      priority: email.priority === 'critical' ? 'high' : email.priority === 'low' ? 'low' : 'medium',
      status: 'pending',
      estimatedMinutes: email.readTimeMinutes || 15,
      order,
    });

    email.status = 'delegated';
    email.statusChangedAt = new Date();
    await email.save();

    res.status(201).json({ todo, email });
  } catch (error) {
    res.status(500).json({ message: 'Failed to convert email to task.' });
  }
};

// -------------------- AI FEATURES --------------------

const analyzeEmail = async (req, res) => {
  try {
    const email = await EmailMessage.findOne({
      _id: req.params.emailId, user: req.user._id, account: req.params.accountId,
    });
    if (!email) return res.status(404).json({ message: 'Email not found.' });

    const analysis = runLocalAI(email);

    Object.assign(email, {
      priority: analysis.priority,
      importanceScore: analysis.score,
      aiCategory: analysis.category,
      aiIntent: analysis.intent,
      aiSummary: analysis.summary,
      aiSuggestedAction: analysis.suggestedAction,
      aiDeadline: analysis.deadline,
      aiProject: analysis.project,
      aiDepartment: analysis.department,
      aiExtractedTasks: analysis.extractedTasks,
    });
    await email.save();

    res.json({ email, analysis });
  } catch (error) {
    res.status(500).json({ message: 'Failed to analyze email.' });
  }
};

const analyzeBatch = async (req, res) => {
  try {
    const { emailIds } = req.body;
    const filter = { user: req.user._id, account: req.params.accountId };
    if (Array.isArray(emailIds) && emailIds.length > 0) {
      filter._id = { $in: emailIds };
    }

    const emails = await EmailMessage.find(filter).limit(200);
    let updated = 0;
    for (const email of emails) {
      if (email.aiCategory !== 'general' && email.importanceScore > 0) continue;
      const analysis = runLocalAI(email);
      Object.assign(email, {
        priority: analysis.priority,
        importanceScore: analysis.score,
        aiCategory: analysis.category,
        aiIntent: analysis.intent,
        aiSummary: analysis.summary,
        aiSuggestedAction: analysis.suggestedAction,
        aiDeadline: analysis.deadline,
        aiProject: analysis.project,
      });
      await email.save();
      updated++;
    }

    res.json({ message: `Analyzed ${updated} emails.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to analyze emails.' });
  }
};

const getBriefing = async (req, res) => {
  try {
    const emails = await EmailMessage.find({ user: req.user._id, account: req.params.accountId })
      .sort({ receivedAt: -1 }).limit(500);

    const todayStr = new Date().toDateString();
    const todayEmails = emails.filter(e => new Date(e.receivedAt).toDateString() === todayStr);
    const unread = todayEmails.filter(e => e.status === 'unread');
    const actionRequired = todayEmails.filter(e => ['follow-up', 'needs-approval', 'waiting'].includes(e.status));
    const replied = todayEmails.filter(e => e.status === 'replied' || e.status === 'completed');
    const waiting = todayEmails.filter(e => e.status === 'waiting');
    const newsletters = todayEmails.filter(e => e.aiCategory === 'newsletter');
    const highPriority = todayEmails.filter(e => e.priority === 'critical' || e.priority === 'high');

    const totalReadTime = todayEmails.reduce((acc, e) => acc + (e.readTimeMinutes || 2), 0);
    const avgResponseTime = todayEmails.length > 0 && replied.length > 0
      ? Math.round(todayEmails.reduce((acc, e) => acc + (e.responseTimeMinutes || 0), 0) / todayEmails.length)
      : 0;

    const briefing = {
      totalToday: todayEmails.length,
      unreadCount: unread.length,
      actionRequiredCount: actionRequired.length,
      repliedCount: replied.length,
      waitingCount: waiting.length,
      newsletterCount: newsletters.length,
      highPriorityCount: highPriority.length,
      estimatedWorkload: Math.max(totalReadTime, 10),
      avgResponseTime,
      productivityScore: todayEmails.length > 0
        ? Math.round((replied.length / Math.max(todayEmails.length - newsletters.length, 1)) * 100) : 0,
      priorityBreakdown: {
        critical: todayEmails.filter(e => e.priority === 'critical').length,
        high: todayEmails.filter(e => e.priority === 'high').length,
        medium: todayEmails.filter(e => e.priority === 'medium').length,
        low: todayEmails.filter(e => e.priority === 'low').length,
      },
    };

    res.json({ briefing });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate briefing.' });
  }
};

const suggestReply = async (req, res) => {
  try {
    const { tone } = req.body;
    const email = await EmailMessage.findOne({
      _id: req.params.emailId, user: req.user._id, account: req.params.accountId,
    });
    if (!email) return res.status(404).json({ message: 'Email not found.' });

    const tonePrefixes = {
      professional: `Dear ${email.sender.name || email.sender.email},\n\nThank you for your message regarding "${email.subject}". `,
      friendly: `Hey ${email.sender.name || email.sender.email},\n\nThanks for reaching out about "${email.subject}"! `,
      formal: `Dear ${email.sender.name || email.sender.email},\n\nI hope this message finds you well. Regarding "${email.subject}": `,
      short: `Re: ${email.subject}\n\n`,
    };
    const prefix = tonePrefixes[tone] || tonePrefixes.professional;
    const reply = prefix + 'I have received your message and will review it shortly. I will follow up with more details soon.\n\nBest regards';

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate reply.' });
  }
};

const generateSummary = async (req, res) => {
  try {
    const { emailIds } = req.body;
    const filter = { user: req.user._id, account: req.params.accountId };
    if (Array.isArray(emailIds) && emailIds.length > 0) {
      filter._id = { $in: emailIds };
    }
    const emails = await EmailMessage.find(filter).sort({ receivedAt: -1 }).limit(100);

    const summary = emails.map(e => ({
      id: e._id, subject: e.subject,
      sender: e.sender.email, priority: e.priority,
      category: e.aiCategory, status: e.status,
      summary: e.aiSummary || e.snippet || e.body.substring(0, 150),
      receivedAt: e.receivedAt,
    }));

    const totalUnread = emails.filter(e => e.status === 'unread').length;
    const totalReplied = emails.filter(e => e.status === 'replied' || e.status === 'completed').length;

    res.json({ summary, totalEmails: emails.length, totalUnread, totalReplied });
  } catch (error) {
    res.status(500).json({ message: 'Failed to summarize.' });
  }
};

const extractTasks = async (req, res) => {
  try {
    const email = await EmailMessage.findOne({
      _id: req.params.emailId, user: req.user._id, account: req.params.accountId,
    });
    if (!email) return res.status(404).json({ message: 'Email not found.' });

    const tasks = extractTasksFromText(email.subject, email.body);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to extract tasks.' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const emails = await EmailMessage.find({ user: req.user._id, account: req.params.accountId })
      .sort({ receivedAt: -1 }).limit(1000);

    const now = Date.now();
    const todayStr = new Date().toDateString();
    const todayEmails = emails.filter(e => new Date(e.receivedAt).toDateString() === todayStr);
    const weekEmails = emails.filter(e => (now - new Date(e.receivedAt).getTime()) / 86400000 <= 7);

    const repliedEmails = emails.filter(e => e.status === 'replied' || e.status === 'completed');

    const categoryBreakdown = Object.entries(
      emails.reduce((acc, e) => {
        const cat = e.aiCategory || 'general';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const contactMap = new Map();
    emails.forEach(e => {
      const key = e.sender.email;
      if (!contactMap.has(key)) {
        contactMap.set(key, { sender: e.sender.name || e.sender.email, count: 0 });
      }
      contactMap.get(key).count++;
    });
    const topContacts = [...contactMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);

    const analytics = {
      today: {
        total: todayEmails.length,
        replied: todayEmails.filter(e => e.status === 'replied' || e.status === 'completed').length,
        unread: todayEmails.filter(e => e.status === 'unread').length,
        replyRate: todayEmails.length > 0
          ? Math.round((todayEmails.filter(e => e.status === 'replied' || e.status === 'completed').length / todayEmails.length) * 100) : 0,
      },
      weekly: {
        total: weekEmails.length,
        replied: weekEmails.filter(e => e.status === 'replied' || e.status === 'completed').length,
        avgResponseTime: repliedEmails.length > 0
          ? Math.round(repliedEmails.reduce((acc, e) => acc + (e.responseTimeMinutes || 0), 0) / repliedEmails.length) : 0,
        productivityScore: weekEmails.length > 0
          ? Math.round((weekEmails.filter(e => e.status === 'replied' || e.status === 'completed').length / weekEmails.length) * 100) : 0,
      },
      monthly: {
        total: emails.length,
        replied: repliedEmails.length,
        completedRate: emails.length > 0
          ? Math.round((emails.filter(e => e.status === 'completed').length / emails.length) * 100) : 0,
        timeSavedHours: Math.round(repliedEmails.reduce((acc, e) => acc + (e.responseTimeMinutes || 0), 0) / 60),
      },
      topContacts,
      categoryBreakdown,
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate analytics.' });
  }
};

const getEndOfDaySummary = async (req, res) => {
  try {
    const emails = await EmailMessage.find({ user: req.user._id, account: req.params.accountId })
      .sort({ receivedAt: -1 }).limit(500);
    const todos = await Todo.find({ user: req.user._id, date: new Date().toISOString().split('T')[0] });

    const todayStr = new Date().toDateString();
    const todayEmails = emails.filter(e => new Date(e.receivedAt).toDateString() === todayStr);
    const unread = todayEmails.filter(e => e.status === 'unread');
    const replied = todayEmails.filter(e => e.status === 'replied' || e.status === 'completed');
    const waiting = todayEmails.filter(e => e.status === 'waiting');
    const followUp = todayEmails.filter(e => e.status === 'follow-up');
    const highPriorityPending = todayEmails.filter(e =>
      (e.priority === 'critical' || e.priority === 'high') &&
      e.status !== 'replied' && e.status !== 'completed'
    );

    const avgResponse = replied.length > 0
      ? Math.round(replied.reduce((acc, e) => acc + (e.responseTimeMinutes || 0), 0) / replied.length) : 0;

    const completedTasks = todos.filter(t => t.status === 'done');
    const pendingTasks = todos.filter(t => t.status !== 'done');
    const completionRate = todos.length > 0 ? Math.round((completedTasks.length / todos.length) * 100) : 0;
    const focusScore = todos.length > 0
      ? Math.round((completionRate + (replied.length / Math.max(todayEmails.length, 1)) * 100) / 2) : 0;

    const summary = {
      emailSummary: {
        received: todayEmails.length,
        read: todayEmails.filter(e => e.status !== 'unread').length,
        replied: replied.length,
        completed: todayEmails.filter(e => e.status === 'completed').length,
        unread: unread.length,
        pending: todayEmails.filter(e => e.status !== 'completed' && e.status !== 'replied').length,
        highPriorityPending: highPriorityPending.length,
        waitingForReply: waiting.length,
        followUpRequired: followUp.length,
        averageResponseTime: avgResponse,
        topTopics: [...new Set(todayEmails.map(e => e.aiCategory).filter(Boolean))].slice(0, 5),
      },
      taskSummary: {
        assigned: todos.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
        completionRate,
        focusScore,
        productivityScore: focusScore,
      },
      aiNarrative: `Today you completed ${completedTasks.length} of ${todos.length} assigned tasks (${completionRate}% completion rate). You replied to ${replied.length} of ${todayEmails.length} emails.${highPriorityPending.length > 0 ? ` ${highPriorityPending.length} high-priority email(s) still require attention.` : ''} You maintained a productivity score of ${focusScore}%.`,
      tomorrowPlan: {
        carryForwardEmails: highPriorityPending.length,
        carryForwardTasks: pendingTasks.length,
        recommendations: highPriorityPending.slice(0, 3).map(e => ({ type: 'email', subject: e.subject })),
      },
    };

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate EOD summary.' });
  }
};

// -------------------- HELPERS --------------------

const PRIORITY_KEYWORDS = {
  critical: ['urgent', 'asap', 'deadline', 'immediately', 'critical', 'emergency', 'action required'],
  high: ['important', 'review', 'approval', 'meeting', 'invoice', 'payment', 'contract'],
  medium: ['update', 'request', 'proposal', 'feedback', 'reminder', 'follow-up'],
  low: ['newsletter', 'news', 'weekly', 'digest', 'promo', 'social'],
};

const CATEGORY_KEYWORDS = {
  meeting: ['meeting', 'schedule', 'calendar', 'invite', 'appointment', 'book'],
  invoice: ['invoice', 'bill', 'payment', 'receipt', 'payment due', 'billing'],
  approval: ['approval', 'approve', 'authorize', 'sign off'],
  support: ['support', 'help', 'issue', 'bug', 'problem', 'error', 'broken'],
  hr: ['hr', 'payroll', 'benefits', 'leave', 'vacation', 'sick', 'onboarding'],
  finance: ['finance', 'budget', 'expense', 'reimbursement', 'financial'],
  marketing: ['marketing', 'campaign', 'social media', 'content', 'brand'],
  development: ['deploy', 'code', 'pull request', 'merge', 'api', 'sprint', 'bug fix'],
  sales: ['sales', 'lead', 'client', 'proposal', 'quote', 'deal', 'pipeline'],
  personal: ['personal', 'thanks', 'thank you', 'appreciate'],
  job: ['job', 'application', 'interview', 'hiring', 'recruitment', 'position'],
  newsletter: ['newsletter', 'unsubscribe', 'weekly digest', 'monthly update'],
};

const runLocalAI = (email) => {
  const subject = (email.subject || '').toLowerCase();
  const body = (email.body || '').toLowerCase();
  const text = subject + ' ' + body;

  let score = 0;
  let priority = 'low';
  for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        if (level === 'critical') score += 10;
        else if (level === 'high') score += 5;
        else if (level === 'medium') score += 2;
        else score += 0.5;
      }
    }
  }

  if (score >= 8) priority = 'critical';
  else if (score >= 4) priority = 'high';
  else if (score >= 1.5) priority = 'medium';

  const senderLower = (email.sender?.name || email.sender?.email || '').toLowerCase();
  if (senderLower.includes('ceo') || senderLower.includes('founder') || senderLower.includes('director') || senderLower.includes('vp')) score += 3;
  if (senderLower.includes('manager') || senderLower.includes('lead') || senderLower.includes('head')) score += 1.5;

  let category = 'general';
  let maxCatScore = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let catScore = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) catScore += 2;
    }
    if (catScore > maxCatScore) {
      maxCatScore = catScore;
      category = cat;
    }
  }

  const intent = detectIntent(text, category);
  const summary = generateSummary_fromText(email.subject, body);
  const deadline = extractDeadline(text);
  const extractedTasks = extractTasksFromText(email.subject, email.body || '');

  return {
    priority,
    score: Math.min(Math.round(score), 100),
    category,
    intent,
    summary,
    suggestedAction: intent,
    deadline,
    project: detectProject(text),
    department: detectDepartment(category),
    extractedTasks,
  };
};

const detectIntent = (text, category) => {
  if (text.includes('approve') || text.includes('approval')) return 'Needs your approval';
  if (text.includes('review') || text.includes('feedback')) return 'Review required';
  if (text.includes('schedule') || text.includes('meeting')) return 'Meeting request';
  if (text.includes('invoice') || text.includes('payment')) return 'Payment action needed';
  if (category === 'support') return 'Support request';
  if (text.includes('submit') || text.includes('deadline')) return 'Action required by deadline';
  return 'For your information';
};

const generateSummary_fromText = (subject, body) => {
  const clean = body.replace(/\s+/g, ' ').trim();
  return clean.length > 200 ? clean.substring(0, 200) + '...' : clean;
};

const extractDeadline = (text) => {
  const patterns = [
    /(?:by|before|due)\s+(?:this\s+)?(?:friday|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(?:by|before|due)\s+(?:tomorrow|today|eod|end\s+of\s+day)/i,
    /(?:by|before|due)\s+(?:\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return new Date(Date.now() + 86400000);
  }
  return null;
};

const detectProject = (text) => {
  const projects = ['alpha', 'beta', 'gamma', 'delta', 'project', 'sprint'];
  for (const p of projects) {
    if (text.includes(p)) return `Project ${p.charAt(0).toUpperCase() + p.slice(1)}`;
  }
  return '';
};

const detectDepartment = (category) => {
  const deptMap = {
    finance: 'Finance', hr: 'HR', marketing: 'Marketing',
    development: 'Engineering', sales: 'Sales', support: 'Support',
  };
  return deptMap[category] || '';
};

const extractTasksFromText = (subject, body) => {
  const tasks = [];
  const lines = (body || subject).split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const taskMatch = trimmed.match(/^(?:\d+[.)]\s*)?(?:please\s+)?(submit|review|update|create|fix|add|remove|check|confirm|send|prepare|complete|finish|schedule|approve)\b(.+)$/i);
    if (taskMatch) {
      let priority = 'medium';
      if (trimmed.toLowerCase().includes('urgent') || trimmed.toLowerCase().includes('asap')) priority = 'high';
      else if (trimmed.toLowerCase().includes('when you can') || trimmed.toLowerCase().includes('sometime')) priority = 'low';

      const deadlinePatterns = [/(?:by|before|due)\s+(.+?)(?:\.|!|\n|$)/i];
      let deadline = null;
      for (const dp of deadlinePatterns) {
        const dm = trimmed.match(dp);
        if (dm) deadline = new Date(Date.now() + 86400000);
      }

      tasks.push({
        title: (taskMatch[1] + ' ' + taskMatch[2]).trim(),
        deadline,
        priority,
        description: trimmed,
      });
    }
  }
  return tasks.slice(0, 5);
};

const generateSampleEmails = (accountId, userId) => {
  const now = Date.now();
  return [
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_1',
      subject: 'Urgent: Project Alpha deadline moved to Friday',
      sender: { name: 'Sarah Chen', email: 'sarah.chen@company.com' },
      body: 'Hi, the client has requested we move the Project Alpha deadline to this Friday. Please confirm you can deliver by then. Let me know if there are any blockers.',
      receivedAt: new Date(now - 1000 * 60 * 15),
      priority: 'critical', importanceScore: 28, status: 'unread', aiCategory: 'development',
      aiIntent: 'Action required by deadline', aiProject: 'Project Alpha', aiDepartment: 'Engineering',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_2',
      subject: 'Meeting: Q3 Planning Session',
      sender: { name: 'Alex Torres', email: 'alex.torres@company.com' },
      body: 'Team, we need to schedule the Q3 planning session. I have proposed Tuesday at 2pm. Please confirm your availability.',
      receivedAt: new Date(now - 1000 * 60 * 45),
      priority: 'high', importanceScore: 15, status: 'unread', aiCategory: 'meeting',
      aiIntent: 'Meeting request',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_3',
      subject: 'Invoice #INV-2024-0891 for review',
      sender: { name: 'Finance Team', email: 'finance@company.com' },
      body: 'Please find attached invoice #INV-2024-0891 for your review and approval. Total: $12,450. Due by end of month.',
      receivedAt: new Date(now - 1000 * 60 * 120),
      priority: 'high', importanceScore: 18, status: 'unread', aiCategory: 'finance',
      aiIntent: 'Review required',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_4',
      subject: 'Re: Update on customer onboarding flow',
      sender: { name: 'Maya Patel', email: 'maya.patel@company.com' },
      body: 'Thanks for the update! Everything looks good on my end. We can proceed with the launch next week.',
      receivedAt: new Date(now - 1000 * 60 * 180),
      priority: 'medium', importanceScore: 5, status: 'waiting', aiCategory: 'general',
      aiIntent: 'For your information',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_5',
      subject: 'Your weekly productivity report',
      sender: { name: 'Workflow AI', email: 'ai@workflow.app' },
      body: 'Here is your weekly productivity summary. You completed 85% of tasks this week, up 12% from last week. Great progress!',
      receivedAt: new Date(now - 1000 * 60 * 240),
      priority: 'low', importanceScore: 2, status: 'read', aiCategory: 'general',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_6',
      subject: 'Approval needed: New hire for Engineering',
      sender: { name: 'HR Department', email: 'hr@company.com' },
      body: 'We have a candidate for the Senior Engineer position. Please review the attached resume and provide your approval by Thursday.',
      receivedAt: new Date(now - 1000 * 60 * 300),
      priority: 'high', importanceScore: 20, status: 'needs-approval', aiCategory: 'hr',
      aiIntent: 'Needs your approval',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_7',
      subject: 'Product demo feedback - Action items',
      sender: { name: 'James Wilson', email: 'james.wilson@client.com' },
      body: 'We loved the demo! A few action items: 1) Add dark mode support 2) Improve mobile responsiveness 3) Schedule follow-up for next month.',
      receivedAt: new Date(now - 1000 * 60 * 60 * 2),
      priority: 'critical', importanceScore: 25, status: 'unread', aiCategory: 'sales',
      aiIntent: 'Action required by deadline',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_8',
      subject: 'Quick sync before tomorrow meeting',
      sender: { name: 'Priya Sharma', email: 'priya.sharma@company.com' },
      body: 'Hey! Can we do a quick 15-min sync before tomorrow meeting? Want to align on our presentation points.',
      receivedAt: new Date(now - 1000 * 60 * 60 * 3),
      priority: 'medium', importanceScore: 8, status: 'unread', aiCategory: 'meeting',
      aiIntent: 'Meeting request',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_9',
      subject: 'Monthly newsletter - July 2026',
      sender: { name: 'Updates', email: 'newsletter@company.com' },
      body: 'Here are the latest updates from the company. New features, team spotlights, and upcoming events.',
      receivedAt: new Date(now - 1000 * 60 * 60 * 5),
      priority: 'low', importanceScore: 1, status: 'read', aiCategory: 'newsletter',
    },
    {
      account: accountId, user: userId,
      messageId: 'sample_' + Date.now() + '_10',
      subject: 'Support request: Login issue on mobile',
      sender: { name: 'Support', email: 'support@company.com' },
      body: 'A user reported login issues on the mobile app (iOS 18). Error: Session timeout on biometric auth. Priority: P1.',
      receivedAt: new Date(now - 1000 * 60 * 60 * 12),
      priority: 'critical', importanceScore: 30, status: 'completed', aiCategory: 'support',
      aiIntent: 'Support request', responseTimeMinutes: 12,
    },
  ];
};

module.exports = {
  connectAccount, disconnectAccount, reConnectAccount, listAccounts, updateAccountSettings,
  syncEmails, getEmails, getEmail, sendEmail, replyEmail,
  updateEmailStatus, batchUpdateStatus, deleteEmail,
  emailToTask,
  analyzeEmail, analyzeBatch, getBriefing, suggestReply, generateSummary, extractTasks, getAnalytics,
  getEndOfDaySummary,
};
