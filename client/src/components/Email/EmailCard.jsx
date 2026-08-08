import { motion } from 'framer-motion';
import Badge from '../Common/Badge';

const priorityColors = {
  critical: { badge: 'danger', dot: 'bg-red-400', glow: 'shadow-red-500/10' },
  high: { badge: 'warning', dot: 'bg-amber-400', glow: 'shadow-amber-500/10' },
  medium: { badge: 'primary', dot: 'bg-primary-400', glow: 'shadow-primary-500/10' },
  low: { badge: 'gray', dot: 'bg-gray-500', glow: 'shadow-gray-500/5' },
};

const statusConfig = {
  unread: { label: 'Unread', variant: 'primary' },
  read: { label: 'Read', variant: 'gray' },
  replied: { label: 'Replied', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  'follow-up': { label: 'Follow Up', variant: 'warning' },
  waiting: { label: 'Waiting', variant: 'warning' },
  'needs-approval': { label: 'Needs Approval', variant: 'danger' },
  delegated: { label: 'Delegated', variant: 'info' },
  archived: { label: 'Archived', variant: 'gray' },
  scheduled: { label: 'Scheduled', variant: 'info' },
};

const categoryLabels = {
  meeting: { label: 'Meeting', emoji: '📅' },
  invoice: { label: 'Invoice', emoji: '💰' },
  approval: { label: 'Approval', emoji: '✅' },
  support: { label: 'Support', emoji: '🛠' },
  hr: { label: 'HR', emoji: '👤' },
  finance: { label: 'Finance', emoji: '📊' },
  marketing: { label: 'Marketing', emoji: '📢' },
  development: { label: 'Dev', emoji: '💻' },
  sales: { label: 'Sales', emoji: '🤝' },
  personal: { label: 'Personal', emoji: '💬' },
  job: { label: 'Job', emoji: '💼' },
  newsletter: { label: 'Newsletter', emoji: '📰' },
  general: { label: 'General', emoji: '📧' },
};

const EmailCard = ({ email, onSelect, onQuickAction, index = 0, compact = false }) => {
  const pc = priorityColors[email.priority] || priorityColors.low;
  const sc = statusConfig[email.status] || statusConfig.read;
  const cat = categoryLabels[email.aiCategory] || categoryLabels.general;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22, delay: index * 0.03 }}
      whileHover={{ y: -3, scale: 1.005, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      onClick={() => onSelect(email)}
      className={`group relative rounded-2xl glass-card p-5 cursor-pointer transition-all duration-300 ${pc.glow} ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${email.status === 'unread' ? 'from-[#C4B5FD] to-[#A5F3FC]' : 'from-transparent to-transparent'} transition-opacity duration-300 ${email.status === 'unread' ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />

      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4B5FD] to-[#A5F3FC] flex items-center justify-center text-sm font-bold text-[#0B0F17]`}>
            {email.sender?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {email.status === 'unread' && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#C4B5FD] border-2 border-[#0B0F17] shadow-sm" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-sm font-semibold truncate ${email.status === 'unread' ? 'text-white' : 'text-gray-300'}`}>
                  {email.sender?.split('<')[0]?.trim() || email.sender}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
              </div>
              <h3 className={`text-sm leading-snug truncate mb-0.5 ${email.status === 'unread' ? 'text-white font-medium' : 'text-gray-400'}`}>
                {email.subject}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-gray-500 whitespace-nowrap">{timeAgo(email.receivedAt)}</span>
            </div>
          </div>

          {!compact && (
            <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
              {email.body}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <Badge variant={pc.badge} dot>{email.priority}</Badge>
            <Badge variant={sc.variant}>{sc.label}</Badge>
            <span className="text-xs text-gray-600">{cat.emoji} {cat.label}</span>
            {email.hasAttachments && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attach
              </span>
            )}
          </div>
        </div>

        {onQuickAction && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onQuickAction(email.id, 'replied'); }}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-[#A7F3D0] transition-colors"
              title="Mark as replied"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onQuickAction(email.id, 'completed'); }}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-[#A7F3D0] transition-colors"
              title="Mark as completed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { EmailCard, priorityColors, statusConfig, categoryLabels };
export default EmailCard;
