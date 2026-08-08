import { useCallback, useEffect } from 'react';
import useEmailStore from '../store/useEmailStore';
import { emailAPI } from '../api/api';
import toast from 'react-hot-toast';

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

const getTimeBasedGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Morning Briefing', emoji: '☀️' };
  if (h < 17) return { text: 'Afternoon Briefing', emoji: '🌤' };
  if (h < 21) return { text: 'Evening Briefing', emoji: '🌅' };
  return { text: 'Night Briefing', emoji: '🌙' };
};

const analyzeEmail = (email) => {
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

  const senderStr = typeof email.sender === 'string' ? email.sender : (email.sender?.name || email.sender?.email || '');
  const senderLower = senderStr.toLowerCase();
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

  let status = 'unread';
  if (email.status) status = email.status;

  return { priority, score, status, category };
};

const generateBriefing = (emails, date = new Date()) => {
  const todayStr = date.toDateString();
  const todayEmails = emails.filter(e => e.receivedAt && new Date(e.receivedAt).toDateString() === todayStr);
  const unread = todayEmails.filter(e => e.status === 'unread');
  const actionRequired = todayEmails.filter(e => ['follow-up', 'needs-approval', 'waiting'].includes(e.status));
  const replied = todayEmails.filter(e => e.status === 'replied' || e.status === 'completed');
  const waiting = todayEmails.filter(e => e.status === 'waiting');
  const newsletters = todayEmails.filter(e => e.aiCategory === 'newsletter');
  const highPriority = todayEmails.filter(e => e.priority === 'critical' || e.priority === 'high');

  const avgResponseTime = todayEmails.length > 0 && replied.length > 0
    ? Math.round(todayEmails.reduce((acc, e) => acc + (e.responseTimeMinutes || 0), 0) / todayEmails.length) : 0;
  const totalReadTime = todayEmails.reduce((acc, e) => acc + (e.readTimeMinutes || 2), 0);

  return {
    greeting: getTimeBasedGreeting(),
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
    topSenders: [...new Set(todayEmails.map(e => typeof e.sender === 'string' ? e.sender : e.sender?.name || e.sender?.email))].slice(0, 5),
    priorityBreakdown: {
      critical: todayEmails.filter(e => e.priority === 'critical').length,
      high: todayEmails.filter(e => e.priority === 'high').length,
      medium: todayEmails.filter(e => e.priority === 'medium').length,
      low: todayEmails.filter(e => e.priority === 'low').length,
    },
  };
};

const generateDailySummary = (emails, tasks = [], attendance = {}) => {
  const todayStr = new Date().toDateString();
  const todayEmails = emails.filter(e => e.receivedAt && new Date(e.receivedAt).toDateString() === todayStr);
  const unread = todayEmails.filter(e => e.status === 'unread');
  const replied = todayEmails.filter(e => e.status === 'replied' || e.status === 'completed');
  const waiting = todayEmails.filter(e => e.status === 'waiting');
  const followUp = todayEmails.filter(e => e.status === 'follow-up');
  const highPriorityPending = todayEmails.filter(e => (e.priority === 'critical' || e.priority === 'high') && e.status !== 'replied' && e.status !== 'completed');

  const avgResponse = todayEmails.length > 0 && replied.length > 0
    ? Math.round(todayEmails.reduce((acc, e) => acc + (e.responseTimeMinutes || 0), 0) / replied.length) : 0;

  const completedTasks = tasks.filter(t => t.status === 'done');
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const focusScore = Math.round((completionRate + (replied.length / Math.max(todayEmails.length, 1)) * 100) / 2);

  const narrativeParts = [];
  if (completedTasks.length > 0) {
    narrativeParts.push(`Today you completed ${completedTasks.length} of ${tasks.length} assigned tasks (${completionRate}% completion rate).`);
  }
  if (replied.length > 0) {
    narrativeParts.push(`You replied to ${replied.length} of ${todayEmails.length} emails today.`);
  }
  if (highPriorityPending.length > 0) {
    narrativeParts.push(`${highPriorityPending.length} high-priority email${highPriorityPending.length > 1 ? 's' : ''} still require${highPriorityPending.length === 1 ? 's' : ''} your attention.`);
  }
  narrativeParts.push(`You maintained a productivity score of ${focusScore}%.`);

  if (highPriorityPending.length > 0) {
    narrativeParts.push(`Tomorrow's first recommendation: respond to "${highPriorityPending[0].subject}"`);
  }

  return {
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
      timeSaved: 0,
    },
    taskSummary: {
      assigned: tasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      completionRate,
      focusScore,
      productivityScore: focusScore,
    },
    aiNarrative: narrativeParts.join(' '),
    tomorrowPlan: {
      carryForwardEmails: highPriorityPending.length,
      carryForwardTasks: pendingTasks.length,
      recommendations: highPriorityPending.slice(0, 3).map(e => ({ type: 'email', subject: e.subject })),
    },
  };
};

const useEmail = () => {
  const store = useEmailStore();

  const loadDemoEmails = useCallback(() => {
    const sampleEmails = [
      { id: 'e1', accountId: 'acc1', subject: 'Urgent: Project Alpha deadline moved to Friday', sender: { name: 'Sarah Chen', email: 'sarah.chen@company.com' }, body: 'Hi, the client has requested we move the Project Alpha deadline to this Friday. Please confirm you can deliver by then.', receivedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), hasAttachments: false, priority: 'critical', importanceScore: 28, status: 'unread', aiCategory: 'development', responseTimeMinutes: 0, readTimeMinutes: 3 },
      { id: 'e2', accountId: 'acc1', subject: 'Meeting: Q3 Planning Session', sender: { name: 'Alex Torres', email: 'alex.torres@company.com' }, body: 'Team, we need to schedule the Q3 planning session. I have proposed Tuesday at 2pm.', receivedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), hasAttachments: true, priority: 'high', importanceScore: 15, status: 'unread', aiCategory: 'meeting', responseTimeMinutes: 0, readTimeMinutes: 2 },
      { id: 'e3', accountId: 'acc1', subject: 'Invoice #INV-2024-0891 for review', sender: { name: 'Finance Team', email: 'finance@company.com' }, body: 'Please find attached invoice #INV-2024-0891 for your review and approval. Total: $12,450.', receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), hasAttachments: true, priority: 'high', importanceScore: 18, status: 'unread', aiCategory: 'finance', responseTimeMinutes: 0, readTimeMinutes: 4 },
      { id: 'e4', accountId: 'acc1', subject: 'Re: Update on customer onboarding flow', sender: { name: 'Maya Patel', email: 'maya.patel@company.com' }, body: 'Thanks for the update! Everything looks good on my end.', receivedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), hasAttachments: false, priority: 'medium', importanceScore: 5, status: 'waiting', aiCategory: 'general', responseTimeMinutes: 15, readTimeMinutes: 1 },
      { id: 'e5', accountId: 'acc1', subject: 'Your weekly productivity report', sender: { name: 'Workflow AI', email: 'ai@workflow.app' }, body: 'Here is your weekly productivity summary. You completed 85% of tasks this week.', receivedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), hasAttachments: false, priority: 'low', importanceScore: 2, status: 'read', aiCategory: 'general', responseTimeMinutes: 0, readTimeMinutes: 2 },
      { id: 'e6', accountId: 'acc1', subject: 'Approval needed: New hire for Engineering', sender: { name: 'HR Department', email: 'hr@company.com' }, body: 'We have a candidate for the Senior Engineer position. Please review and provide your approval by Thursday.', receivedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), hasAttachments: true, priority: 'high', importanceScore: 20, status: 'needs-approval', aiCategory: 'hr', responseTimeMinutes: 0, readTimeMinutes: 5 },
      { id: 'e7', accountId: 'acc1', subject: 'Product demo feedback - Action items', sender: { name: 'James Wilson', email: 'james.wilson@client.com' }, body: 'We loved the demo! A few action items: 1) Add dark mode support 2) Improve mobile responsiveness.', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), hasAttachments: false, priority: 'critical', importanceScore: 25, status: 'unread', aiCategory: 'sales', responseTimeMinutes: 0, readTimeMinutes: 4 },
      { id: 'e8', accountId: 'acc1', subject: 'Quick sync before tomorrow meeting', sender: { name: 'Priya Sharma', email: 'priya.sharma@company.com' }, body: 'Can we do a quick 15-min sync before tomorrow meeting?', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), hasAttachments: false, priority: 'medium', importanceScore: 8, status: 'unread', aiCategory: 'meeting', responseTimeMinutes: 0, readTimeMinutes: 1 },
      { id: 'e9', accountId: 'acc1', subject: 'Monthly newsletter - July 2026', sender: { name: 'Updates', email: 'newsletter@company.com' }, body: 'Latest updates from the company. New features, team spotlights.', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), hasAttachments: false, priority: 'low', importanceScore: 1, status: 'read', aiCategory: 'newsletter', responseTimeMinutes: 0, readTimeMinutes: 1 },
      { id: 'e10', accountId: 'acc1', subject: 'Payment confirmation - Subscription renewal', sender: { name: 'Billing', email: 'billing@service.com' }, body: 'Your annual subscription has been renewed. Amount: $299.', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), hasAttachments: true, priority: 'low', importanceScore: 2, status: 'completed', aiCategory: 'invoice', responseTimeMinutes: 5, readTimeMinutes: 1 },
      { id: 'e11', accountId: 'acc1', subject: 'Marketing campaign results - June', sender: { name: 'Marketing Team', email: 'marketing@company.com' }, body: 'June campaign results: 45% increase in engagement, 22% conversion rate.', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), hasAttachments: true, priority: 'medium', importanceScore: 6, status: 'read', aiCategory: 'marketing', responseTimeMinutes: 0, readTimeMinutes: 3 },
      { id: 'e12', accountId: 'acc1', subject: 'Support request: Login issue on mobile', sender: { name: 'Support', email: 'support@company.com' }, body: 'Login issues on mobile app (iOS 18). Error: Session timeout. Priority: P1.', receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), hasAttachments: false, priority: 'critical', importanceScore: 30, status: 'completed', aiCategory: 'support', responseTimeMinutes: 12, readTimeMinutes: 3 },
    ];

    store.setEmails(sampleEmails);
    const briefing = generateBriefing(sampleEmails);
    store.setBriefing(briefing);
    return sampleEmails;
  }, []);

  const initEmailWorkspace = useCallback(async () => {
    await store.fetchAccounts();
    const accounts = store.accounts;
    if (accounts.length > 0) {
      const emails = await store.fetchEmails();
      if (emails && emails.length > 0) {
        store.setBriefing(generateBriefing(emails));
      }
    }
  }, []);

  const getDailyBriefing = useCallback(() => {
    const emails = store.emails;
    if (emails.length === 0) return null;
    const briefing = generateBriefing(emails);
    store.setBriefing(briefing);
    return briefing;
  }, []);

  const getEmailAnalytics = useCallback(() => {
    const emails = store.emails;
    if (emails.length === 0) return null;
    const todayStr = new Date().toDateString();
    const todayEmails = emails.filter(e => e.receivedAt && new Date(e.receivedAt).toDateString() === todayStr);
    const weekEmails = emails.filter(e => {
      const diff = (Date.now() - new Date(e.receivedAt).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });

    const analytics = {
      today: {
        total: todayEmails.length,
        replied: todayEmails.filter(e => e.status === 'replied' || e.status === 'completed').length,
        unread: todayEmails.filter(e => e.status === 'unread').length,
        replyRate: todayEmails.length > 0 ? Math.round((todayEmails.filter(e => e.status === 'replied' || e.status === 'completed').length / todayEmails.length) * 100) : 0,
      },
      weekly: {
        total: weekEmails.length,
        replied: weekEmails.filter(e => e.status === 'replied' || e.status === 'completed').length,
        avgResponseTime: weekEmails.length > 0 ? Math.round(weekEmails.reduce((acc, e) => acc + (e.responseTimeMinutes || 0), 0) / weekEmails.filter(e => e.responseTimeMinutes > 0).length || 1) : 0,
        productivityScore: weekEmails.length > 0 ? Math.round((weekEmails.filter(e => e.status === 'replied' || e.status === 'completed').length / weekEmails.length) * 100) : 0,
      },
      monthly: {
        total: emails.length,
        replied: emails.filter(e => e.status === 'replied' || e.status === 'completed').length,
        completedRate: Math.round((emails.filter(e => e.status === 'completed').length / emails.length) * 100),
        timeSavedHours: Math.round(emails.reduce((acc, e) => acc + (e.responseTimeMinutes || 0), 0) / 60),
      },
      topContacts: [...new Map(emails.map(e => {
        const key = typeof e.sender === 'string' ? e.sender : e.sender?.email;
        const name = typeof e.sender === 'string' ? e.sender : e.sender?.name || e.sender?.email;
        return [key, { sender: name, count: emails.filter(x => {
          const xKey = typeof x.sender === 'string' ? x.sender : x.sender?.email;
          return xKey === key;
        }).length }];
      })).values()].sort((a, b) => b.count - a.count).slice(0, 5),
      categoryBreakdown: Object.entries(
        emails.reduce((acc, e) => {
          const cat = e.aiCategory || 'general';
          acc[cat] = (acc[cat] || 0) + 1; return acc;
        }, {})
      ).map(([name, value]) => ({ name, value })),
    };
    store.setAnalytics(analytics);
    return analytics;
  }, []);

  const generateEndOfDaySummary = useCallback((tasks = [], attendance = {}) => {
    const emails = store.emails;
    return generateDailySummary(emails, tasks, attendance);
  }, []);

  const smartSearch = useCallback((query) => {
    const emails = store.emails;
    const q = query.toLowerCase();
    let results = [];

    if (q.includes('unread')) results = emails.filter(e => e.status === 'unread');
    else if (q.includes('from hr') || q.includes('from finance')) {
      const dept = q.includes('hr') ? 'hr' : 'finance';
      results = emails.filter(e => e.aiCategory === dept);
    } else if (q.includes('invoice')) {
      results = emails.filter(e => e.aiCategory === 'invoice');
    } else if (q.includes('yesterday')) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      results = emails.filter(e => e.receivedAt && new Date(e.receivedAt).toDateString() === yesterday);
    } else if (q.includes('waiting') || q.includes('awaiting')) {
      results = emails.filter(e => e.status === 'waiting');
    } else if (q.includes('reply')) {
      results = emails.filter(e => e.status === 'waiting' || e.status === 'follow-up');
    } else if (q.includes('high priority') || q.includes('important')) {
      results = emails.filter(e => e.priority === 'critical' || e.priority === 'high');
    } else {
      results = emails.filter(e =>
        (e.subject || '').toLowerCase().includes(q) ||
        (typeof e.sender === 'string' ? e.sender : e.sender?.name || e.sender?.email || '').toLowerCase().includes(q) ||
        (e.body || '').toLowerCase().includes(q)
      );
    }

    store.setSearchResults(results);
    return results;
  }, []);

  const markAsReplied = useCallback(async (emailId, replyText = '') => {
    store.updateEmail(emailId, {
      status: 'replied',
      lastReplyAt: new Date().toISOString(),
      aiReply: replyText || undefined,
    });
    const accountId = store.accounts[0]?._id || store.accounts[0]?.id;
    if (accountId) {
      try { await emailAPI.reply(accountId, emailId, { body: replyText || 'Replied', tone: 'professional' }); } catch {}
    }
  }, []);

  const markAsCompleted = useCallback(async (emailId) => {
    store.updateEmail(emailId, { status: 'completed' });
    const accountId = store.accounts[0]?._id || store.accounts[0]?.id;
    if (accountId) {
      try { await emailAPI.getEmail(accountId, emailId); } catch {}
    }
  }, []);

  const changeStatus = useCallback(async (emailId, status) => {
    store.updateEmail(emailId, { status });
    const accountId = store.accounts[0]?._id || store.accounts[0]?.id;
    if (accountId) {
      try {
        await emailAPI.reply(accountId, emailId, { body: '', tone: 'professional' });
      } catch {}
    }
  }, []);

  const generateAiReply = useCallback((email, tone = 'professional') => {
    const tonePrefixes = {
      professional: 'Dear {sender},\n\nThank you for your message regarding "{subject}". ',
      friendly: 'Hey {sender},\n\nThanks for reaching out about "{subject}"! ',
      formal: 'Dear {sender},\n\nI hope this message finds you well. Regarding "{subject}": ',
      short: 'Re: {subject}\n\n',
    };
    const prefix = tonePrefixes[tone] || tonePrefixes.professional;
    const senderName = typeof email.sender === 'string' ? email.sender.split('<')[0].trim() : (email.sender?.name || email.sender?.email || '');
    return prefix
      .replace('{sender}', senderName)
      .replace('{subject}', email.subject)
      + 'I have received your message and will review it shortly. I will follow up with more details soon.\n\nBest regards';
  }, []);

  const generateFollowUpSuggestions = (email) => {
    const suggestions = [];
    if (!email || email.status === 'completed') return suggestions;
    if (email.status === 'waiting') {
      suggestions.push({ type: 'reminder', text: `Remind ${typeof email.sender === 'string' ? email.sender : email.sender?.name || email.sender?.email} about "${email.subject}"`, delay: '2 days' });
    }
    if (email.priority === 'critical' || email.priority === 'high') {
      suggestions.push({ type: 'follow-up', text: `Follow up on "${email.subject}"`, priority: 'today' });
    }
    if (email.aiCategory === 'meeting') {
      suggestions.push({ type: 'calendar', text: `Add "${email.subject}" to calendar`, priority: 'today' });
    }
    return suggestions;
  };

  const emailToTask = useCallback(async (emailId) => {
    const email = store.getEmailById(emailId);
    if (!email) return null;
    const accountId = store.accounts[0]?._id || store.accounts[0]?.id;

    try {
      if (accountId) {
        const { data } = await emailAPI.aiGenerateTasks(accountId, emailId);
        store.updateEmail(emailId, { status: 'delegated' });
        return data.tasks || [];
      }
    } catch {}

    store.updateEmail(emailId, { status: 'delegated' });
    return [{
      title: email.subject,
      deadline: null,
      priority: email.priority === 'critical' ? 'high' : email.priority === 'low' ? 'low' : 'medium',
      description: `From: ${typeof email.sender === 'string' ? email.sender : email.sender?.name || email.sender?.email}\n\n${email.body}`,
    }];
  }, []);

  return {
    ...store,
    loadDemoEmails,
    initEmailWorkspace,
    getDailyBriefing,
    getEmailAnalytics,
    generateEndOfDaySummary,
    smartSearch,
    markAsReplied,
    markAsCompleted,
    changeStatus,
    generateAiReply,
    generateFollowUpSuggestions,
    generateBriefing,
    emailToTask,
  };
};

export default useEmail;
