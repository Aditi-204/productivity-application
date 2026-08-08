import { motion } from 'framer-motion';

const EmailBriefing = ({ briefing = {} }) => {
  if (!briefing || !briefing.totalToday) return null;

  const items = [
    { label: 'Total Today', value: briefing.totalToday, color: 'from-[#C4B5FD] to-[#8B5CF6]' },
    { label: 'Unread', value: briefing.unreadCount, color: 'from-[#F9A8D4] to-[#EC4899]', highlight: briefing.unreadCount > 0 },
    { label: 'Action Required', value: briefing.actionRequiredCount, color: 'from-amber-400 to-amber-600', highlight: briefing.actionRequiredCount > 0 },
    { label: 'Replied', value: briefing.repliedCount, color: 'from-[#A7F3D0] to-[#10B981]' },
    { label: 'High Priority', value: briefing.highPriorityCount, color: 'from-red-400 to-red-600', highlight: briefing.highPriorityCount > 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 overflow-hidden relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#C4B5FD]/[0.03] to-[#A5F3FC]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{briefing.greeting?.emoji || '☀️'}</span>
            <h3 className="text-lg font-semibold text-white font-display">
              {briefing.greeting?.text || 'Daily Briefing'}
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Your AI-powered email snapshot
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white font-display">{briefing.totalToday}</p>
          <p className="text-[10px] text-gray-500">emails today</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4 relative z-10">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-2xl bg-white/[0.03] border ${item.highlight ? 'border-white/[0.08]' : 'border-white/[0.04]'} text-center`}
          >
            <p className={`text-xl font-bold font-display ${item.highlight ? 'text-white' : 'text-gray-300'}`}>{item.value}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {briefing.priorityBreakdown && (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400" title={`Critical: ${briefing.priorityBreakdown.critical || 0}`} />
                <span className="w-2 h-2 rounded-full bg-amber-400" title={`High: ${briefing.priorityBreakdown.high || 0}`} />
                <span className="w-2 h-2 rounded-full bg-primary-400" title={`Medium: ${briefing.priorityBreakdown.medium || 0}`} />
                <span className="w-2 h-2 rounded-full bg-gray-500" title={`Low: ${briefing.priorityBreakdown.low || 0}`} />
              </>
            )}
          </div>
          <span className="text-[10px] text-gray-600">
            Est. workload: {briefing.estimatedWorkload} min
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-600">Productivity</span>
          <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${briefing.productivityScore || 0}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#C4B5FD] to-[#A5F3FC]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailBriefing;
