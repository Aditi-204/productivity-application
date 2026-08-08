import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmail from '../../hooks/useEmail';
import EmailCard from './EmailCard';
import EmailDetail from './EmailDetail';

const FILTERS = [
  { key: 'today', label: 'Today', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'unread', label: 'Unread', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'important', label: 'Important', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { key: 'action-required', label: 'Action Req.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  { key: 'waiting', label: 'Waiting', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'replied', label: 'Replied', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
  { key: 'completed', label: 'Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const EmailWorkspace = () => {
  const email = useEmail();
  const [activeFilter, setActiveFilter] = useState('today');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showConnections, setShowConnections] = useState(false);

  useEffect(() => {
    if (email.accounts.length > 0 && email.emails.length === 0) {
      email.initEmailWorkspace();
    }
  }, []);

  const filtered = email.getFilteredEmails(activeFilter);
  const briefing = email.briefing;

  const handleSync = async () => {
    if (email.accounts.length > 0) {
      await email.syncEmails();
      email.getDailyBriefing();
    } else {
      email.loadDemoEmails();
    }
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Email Command Center</h2>
          <p className="text-sm text-gray-500 mt-1">AI-powered email management</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowConnections(!showConnections)}
            className="px-4 py-2.5 rounded-2xl glass-strong text-sm text-gray-300 hover:text-white transition-all"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 0a3 3 0 11-4.243 4.243 3 3 0 014.243-4.243z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-3 3m0 0l-3-3m3 3V8" />
              </svg>
              {email.accounts.length > 0 ? `${email.accounts.length} connected` : 'Connect Email'}
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSync}
            disabled={email.isSyncing}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#C4B5FD] to-[#A5F3FC] text-[#0B0F17] text-sm font-medium disabled:opacity-50"
          >
            {email.isSyncing ? 'Syncing...' : email.accounts.length > 0 ? 'Sync Emails' : 'Load Demo Emails'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showConnections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <EmailConnections />
          </motion.div>
        )}
      </AnimatePresence>

      {briefing && briefing.totalToday > 0 && !selectedEmail && (
        <EmailBriefing briefing={briefing} />
      )}

      {selectedEmail ? (
        <EmailDetail
          email={selectedEmail}
          onBack={() => setSelectedEmail(null)}
          onStatusChange={(id, status) => { email.changeStatus(id, status); }}
          onReply={(id, text) => { email.markAsReplied(id, text); }}
          onDelete={(id) => { email.changeStatus(id, 'archived'); setSelectedEmail(null); }}
        />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {FILTERS.map((f) => (
              <motion.button
                key={f.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === f.key
                    ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                    : 'bg-white/[0.03] text-gray-500 hover:text-gray-200 border border-white/[0.04] hover:border-white/[0.08]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
                {f.label}
                {email.getFilteredEmails(f.key).length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06]">{email.getFilteredEmails(f.key).length}</span>
                )}
              </motion.button>
            ))}
          </div>

          {email.emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C4B5FD]/20 to-[#A5F3FC]/20 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white font-display">No emails yet</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Connect your email accounts or load demo emails to get started with AI-powered email management.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No emails in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((e, i) => (
                <EmailCard
                  key={e.id || e._id}
                  email={e}
                  index={i}
                  onSelect={(email) => setSelectedEmail(email)}
                  onQuickAction={(id, status) => email.changeStatus(id, status)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

import EmailBriefing from './EmailBriefing';
import EmailConnections from './EmailConnections';
export default EmailWorkspace;
