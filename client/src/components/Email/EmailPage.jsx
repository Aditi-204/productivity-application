import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useEmail from '../../hooks/useEmail';
import { todoAPI } from '../../api/api';
import EmailWorkspace from './EmailWorkspace';
import EmailAnalytics from './EmailAnalytics';
import EmailSearch from './EmailSearch';
import EmailVoiceAssistant from './EmailVoiceAssistant';
import EmailToTask from './EmailToTask';
import EndOfDayEmail from './EndOfDayEmail';

const TABS = [
  { key: 'inbox', label: 'Command Center', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'analytics', label: 'Analytics', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
  { key: 'eod', label: 'End of Day', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const EmailPage = () => {
  const email = useEmail();
  const [activeTab, setActiveTab] = useState('inbox');
  const [emailToTask, setEmailToTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await todoAPI.getAll(today);
      setTasks(data.todos || []);
    } catch {
      setTasks([]);
    }
  };

  const handleVoiceCommand = (command) => {
    if (command.includes('unread')) setActiveTab('inbox');
    if (command.includes('end of day') || command.includes('report')) setActiveTab('eod');
  };

  const handleEmailToTask = (e) => {
    setEmailToTask(e);
    setShowTaskModal(true);
  };

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Email</h2>
          <p className="text-sm text-gray-500 mt-1">AI-powered email command center</p>
        </div>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'bg-white/[0.03] text-gray-500 hover:text-gray-200 border border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      <EmailVoiceAssistant onCommand={handleVoiceCommand} />

      <EmailSearch onEmailToTask={handleEmailToTask} />

      {activeTab === 'inbox' && <EmailWorkspace />}
      {activeTab === 'analytics' && <EmailAnalytics />}
      {activeTab === 'eod' && (
        <EndOfDayEmail
          tasks={tasks}
          attendance={{}}
          onClose={() => setActiveTab('inbox')}
        />
      )}

      <EmailToTask
        email={emailToTask}
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEmailToTask(null); }}
      />
    </div>
  );
};

export default EmailPage;
