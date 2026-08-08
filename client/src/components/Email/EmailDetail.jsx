import { useState } from 'react';
import { motion } from 'framer-motion';
import useEmail from '../../hooks/useEmail';
import Badge from '../Common/Badge';
import Button from '../Common/Button';

const AI_REPLY_TONES = ['professional', 'friendly', 'formal', 'short'];

const EmailDetail = ({ email, onBack, onStatusChange, onReply, onDelete }) => {
  const { generateAiReply } = useEmail();
  const [showComposer, setShowComposer] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyTone, setReplyTone] = useState('professional');
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  const categoryLabels = {
    meeting: { label: 'Meeting', emoji: '📅' },
    invoice: { label: 'Invoice', emoji: '💰' },
    approval: { label: 'Approval', emoji: '✅' },
    support: { label: 'Support', emoji: '🛠' },
    hr: { label: 'HR', emoji: '👤' },
    finance: { label: 'Finance', emoji: '📊' },
    marketing: { label: 'Marketing', emoji: '📢' },
    development: { label: 'Development', emoji: '💻' },
    sales: { label: 'Sales', emoji: '🤝' },
    personal: { label: 'Personal', emoji: '💬' },
    job: { label: 'Job', emoji: '💼' },
    newsletter: { label: 'Newsletter', emoji: '📰' },
    general: { label: 'General', emoji: '📧' },
  };
  const cat = categoryLabels[email.aiCategory] || categoryLabels.general;

  const handleGenerateReply = (tone) => {
    const generated = generateAiReply(email, tone);
    setReplyText(generated);
    setReplyTone(tone);
    setShowComposer(true);
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      onReply(email.id, replyText);
      setShowComposer(false);
      setReplyText('');
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to inbox
        </motion.button>

        <div className="flex gap-1">
          {['replied', 'completed', 'follow-up', 'waiting'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStatusChange(email.id, status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                email.status === status
                  ? 'bg-white/[0.08] text-white'
                  : 'bg-white/[0.03] text-gray-500 hover:text-gray-200'
              }`}
            >
              {status.replace('-', ' ')}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4B5FD] to-[#A5F3FC] flex items-center justify-center text-lg font-bold text-[#0B0F17] shrink-0">
            {email.sender?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white font-display mb-1">{email.subject}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{email.sender}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>{timeAgo(email.receivedAt)}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={email.priority === 'critical' ? 'danger' : email.priority === 'high' ? 'warning' : email.priority === 'medium' ? 'primary' : 'gray'} dot>
                {email.priority}
              </Badge>
              <span className="text-xs text-gray-600">{cat.emoji} {cat.label}</span>
              {email.hasAttachments && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  1 attachment
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6">
          <div className="prose prose-sm prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
            {email.body}
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowAiSuggestions(!showAiSuggestions)}
              className="flex items-center gap-2 text-sm text-primary-300 hover:text-primary-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              AI Actions
            </button>
          </div>

          <AnimateAiSuggestions
            show={showAiSuggestions}
            email={email}
            onGenerateReply={handleGenerateReply}
            onStatusChange={(s) => onStatusChange(email.id, s)}
          />
        </div>

        {!showComposer ? (
          <div className="flex gap-2 pt-2">
            {AI_REPLY_TONES.map((tone) => (
              <motion.button
                key={tone}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenerateReply(tone)}
                className="px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)} Reply
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 pt-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary-300 font-medium">AI Reply ({replyTone})</span>
              <div className="flex gap-1">
                {AI_REPLY_TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleGenerateReply(t)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg transition-all ${
                      t === replyTone ? 'bg-primary-500/20 text-primary-300' : 'text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full h-32 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none placeholder:text-gray-600"
              placeholder="Write your reply..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowComposer(false)}>Cancel</Button>
              <Button variant="premium" onClick={handleSendReply}>Send Reply</Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const AnimateAiSuggestions = ({ show, email, onGenerateReply, onStatusChange }) => {
  if (!show) return null;

  const getFollowUps = (email) => {
    const sugs = [];
    if (email.priority === 'critical' || email.priority === 'high') {
      sugs.push({ type: 'priority', text: `High priority — respond within 2 hours` });
    }
    if (email.status !== 'replied' && email.status !== 'completed') {
      sugs.push({ type: 'reply', text: 'Generate a professional reply' });
      sugs.push({ type: 'short', text: 'Generate a short reply' });
    }
    if (email.aiCategory === 'meeting') {
      sugs.push({ type: 'calendar', text: 'Suggest adding to calendar' });
    }
    sugs.push({ type: 'task', text: 'Extract tasks from this email' });
    return sugs;
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-2 mb-3">
        {getFollowUps(email).map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.02 }}
            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] text-left transition-all"
          >
            {s.text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default EmailDetail;
