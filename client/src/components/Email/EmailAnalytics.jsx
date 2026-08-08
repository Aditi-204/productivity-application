import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useEmail from '../../hooks/useEmail';
import Card from '../Common/Card';

const EmailAnalytics = () => {
  const email = useEmail();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const data = email.getEmailAnalytics();
    if (data) setAnalytics(data);
  }, [email.emails]);

  if (!analytics) {
    return (
      <Card glass glow className="text-center py-12">
        <p className="text-sm text-gray-500">Load emails to see analytics</p>
      </Card>
    );
  }

  const statCards = [
    { label: 'Today', value: analytics.today.total, sub: `${analytics.today.replied} replied`, gradient: 'from-[#C4B5FD] to-[#8B5CF6]' },
    { label: 'Weekly', value: analytics.weekly.total, sub: `${analytics.weekly.replied} replied`, gradient: 'from-[#A5F3FC] to-[#06B6D4]' },
    { label: 'Response Time', value: `${analytics.weekly.avgResponseTime}m`, sub: 'average', gradient: 'from-[#A7F3D0] to-[#10B981]' },
    { label: 'Score', value: `${analytics.weekly.productivityScore}%`, sub: 'productivity', gradient: 'from-[#F9A8D4] to-[#EC4899]' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white font-display">Email Analytics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <p className="text-2xl font-bold text-white font-display">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            <p className="text-[10px] text-gray-600">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card glass glow className="p-5">
          <h4 className="text-sm font-semibold text-white mb-3">Category Breakdown</h4>
          <div className="space-y-2">
            {analytics.categoryBreakdown.slice(0, 6).map((cat, i) => {
              const max = Math.max(...analytics.categoryBreakdown.map(c => c.value));
              const pct = (cat.value / max) * 100;
              const colors = ['#C4B5FD', '#A5F3FC', '#A7F3D0', '#F9A8D4', '#D6BCFA', '#FDE68A'];
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 capitalize truncate">{cat.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{cat.value}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card glass glow className="p-5">
          <h4 className="text-sm font-semibold text-white mb-3">Top Contacts</h4>
          <div className="space-y-2">
            {analytics.topContacts.map((contact, i) => (
              <motion.div
                key={contact.sender}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C4B5FD] to-[#A5F3FC] flex items-center justify-center text-[10px] font-bold text-[#0B0F17] shrink-0">
                    {contact.sender.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-400 truncate">{contact.sender.split('<')[0]?.trim() || contact.sender}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{contact.count}</span>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card glass glow className="p-5 lg:col-span-2">
          <h4 className="text-sm font-semibold text-white mb-3">Monthly Overview</h4>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Emails', value: analytics.monthly.total, color: 'text-[#C4B5FD]' },
              { label: 'Completion Rate', value: `${analytics.monthly.completedRate}%`, color: 'text-[#A7F3D0]' },
              { label: 'Time Saved', value: `${analytics.monthly.timeSavedHours}h`, color: 'text-[#A5F3FC]' },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 rounded-2xl bg-white/[0.02]">
                <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-600 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailAnalytics;
