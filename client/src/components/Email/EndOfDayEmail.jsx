import { useState } from 'react';
import { motion } from 'framer-motion';
import useEmail from '../../hooks/useEmail';
import Card from '../Common/Card';
import Button from '../Common/Button';

const EndOfDayEmail = ({ tasks = [], attendance = {}, onClose }) => {
  const { generateEndOfDaySummary } = useEmail();
  const [summary, setSummary] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const data = generateEndOfDaySummary(tasks, attendance);
      setSummary(data);
      setGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {!summary ? (
        <Card glass glow className="text-center py-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#C4B5FD]/20 to-[#A5F3FC]/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 font-display">End of Day Email Review</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Generate a comprehensive AI summary of your email activity today, including replies, pending items, and tomorrow's plan.
          </p>
          <Button onClick={handleGenerate} loading={generating} variant="premium" size="lg">
            {generating ? 'Analyzing your day...' : 'Generate Daily Email Summary'}
          </Button>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card glass glow className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4B5FD] to-[#A5F3FC] flex items-center justify-center text-lg">📊</div>
              <div>
                <h3 className="text-lg font-semibold text-white font-display">Daily Email Summary</h3>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {Object.entries(summary.emailSummary).filter(([k]) => !['topTopics', 'timeSaved'].includes(k)).slice(0, 8).map(([key, val]) => (
                <div key={key} className="p-3 rounded-2xl bg-white/[0.03] text-center">
                  <p className="text-lg font-bold text-white font-display">{val}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#C4B5FD]/10 to-[#A5F3FC]/10 border border-[#C4B5FD]/20">
              <p className="text-xs text-primary-300 font-semibold mb-2">AI Daily Report</p>
              <p className="text-sm text-gray-300 leading-relaxed">{summary.aiNarrative}</p>
            </div>

            {summary.tomorrowPlan && (
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Tomorrow's Plan</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] text-gray-400">
                    {summary.tomorrowPlan.carryForwardEmails} pending emails
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] text-gray-400">
                    {summary.tomorrowPlan.carryForwardTasks} pending tasks
                  </span>
                  {summary.tomorrowPlan.recommendations.slice(0, 2).map((r, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-300">
                      {r.subject?.slice(0, 40)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="premium">Export Report</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EndOfDayEmail;
