import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import useAttendance from '../../hooks/useAttendance';
import useTodos from '../../hooks/useTodos';
import RevealText from '../Common/RevealText';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Spinner from '../Common/Spinner';
const ProductivityChart = React.lazy(() => import('../Charts/ProductivityChart'));
const HeatmapCalendar = React.lazy(() => import('../Charts/HeatmapCalendar'));
import EODSubmit from '../Todo/EODSubmit';

const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const motivationalQuotes = [
  { text: "Today's effort is tomorrow's freedom.", author: 'Workflow' },
  { text: 'Discipline beats motivation.', author: 'Workflow' },
  { text: 'One task at a time.', author: 'Workflow' },
  { text: 'Lock in.', author: 'Workflow' },
  { text: 'Small wins create massive futures.', author: 'Workflow' },
  { text: 'Consistency > Intensity.', author: 'Workflow' },
  { text: 'Your only competition is yesterday you.', author: 'Workflow' },
  { text: 'Progress over perfection.', author: 'Workflow' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 250, damping: 22 },
  },
};

const FloatingStatCard = ({ icon, label, value, sub, gradient, delay = 0 }) => (
  <motion.div variants={itemVariants} className="group perspective-1000">
    <Card glass glow hover tilt padding={false}>
      <div className="p-6 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-white mt-4 font-display tracking-tight">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </Card>
  </motion.div>
);

const MoodSelector = ({ onSelect }) => {
  const moods = [
    { emoji: '🚀', label: 'Amazing', color: 'from-emerald-500/20 to-emerald-400/10' },
    { emoji: '💪', label: 'Great', color: 'from-accent-500/20 to-accent-400/10' },
    { emoji: '😊', label: 'Good', color: 'from-primary-500/20 to-primary-400/10' },
    { emoji: '😐', label: 'Okay', color: 'from-amber-500/20 to-amber-400/10' },
    { emoji: '😴', label: 'Tired', color: 'from-rose-500/20 to-rose-400/10' },
  ];

  return (
    <div className="flex gap-3">
      {moods.map((m) => (
        <motion.button
          key={m.label}
          whileHover={{ scale: 1.15, y: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(m.label)}
          className={`p-3 rounded-2xl bg-gradient-to-b ${m.color} border border-white/[0.06] hover:border-white/[0.12] transition-all group`}
          title={m.label}
        >
          <span className="text-xl">{m.emoji}</span>
        </motion.button>
      ))}
    </div>
  );
};

const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const { stats, fetchMyAttendance } = useAttendance();
  const { todos, fetchTodos } = useTodos();
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const today = formatDate(new Date());
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchMyAttendance('month'), fetchTodos(today)]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const completedTodos = todos.filter((t) => t.status === 'done');
  const totalTodos = todos.length;
  const pendingTodos = todos.filter((t) => t.status !== 'done');
  const completionRate = totalTodos > 0 ? Math.round((completedTodos.length / totalTodos) * 100) : 0;
  const streak = stats?.currentStreak || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const statValues = {
    attendance: `${stats?.attendanceRate || 0}%`,
    streak: `${streak} days`,
    present: `${stats?.presentDays || 0}/${stats?.totalDays || 0}`,
    tasks: `${completedTodos.length}/${totalTodos.length}`,
    pending: `${pendingTodos.length}`,
    completion: `${completionRate}%`,
  };

  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pt-4">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <RevealText className="text-4xl font-bold text-white font-display">
            Welcome back, <span className="gradient-text-primary">{user?.name?.split(' ')[0]}</span>
          </RevealText>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mt-2"
          >
            <span className="text-gray-400 text-sm">{dateStr}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="text-primary-300 text-sm font-medium">{timeStr}</span>
          </motion.div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Button variant="premium" size="md">+ New Task</Button>
          </button>
          <EODSubmit />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1">
          <Card glass glow padding={false}>
            <div className="p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quote</p>
              <p className="text-sm text-gray-300 italic leading-relaxed">"{quote.text}"</p>
              <p className="text-xs text-gray-600 mt-2">— {quote.author}</p>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <FloatingStatCard
            icon="M13 10V3L4 14h7v7l9-11h-7z"
            label="Focus Score"
            value={statValues.completion}
            sub="Today's tasks"
            gradient="from-[#C4B5FD] to-[#8B5CF6]"
          />
          <FloatingStatCard
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            label="Current Streak"
            value={statValues.streak}
            gradient="from-[#A5F3FC] to-[#06B6D4]"
          />
          <FloatingStatCard
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            label="Attendance"
            value={statValues.attendance}
            sub={`${statValues.present} days`}
            gradient="from-[#A7F3D0] to-[#10B981]"
          />
          <FloatingStatCard
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            label="Pending Tasks"
            value={statValues.pending}
            sub={`${totalTodos} total today`}
            gradient="from-[#F9A8D4] to-[#EC4899]"
          />
          <FloatingStatCard
            icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            label="Performance"
            value={completionRate >= 80 ? 'A+' : completionRate >= 60 ? 'B+' : 'C+'}
            sub={`${completionRate}% rate`}
            gradient="from-[#D6BCFA] to-[#7C3AED]"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card glass glow tilt>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white font-display">Today's Progress</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{completedTodos.length}/{totalTodos} done</span>
                <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#C4B5FD] to-[#A5F3FC]"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {todos.slice(0, 5).map((todo, i) => (
                <motion.div
                  key={todo._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    todo.status === 'done'
                      ? 'bg-white/[0.03]'
                      : 'bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                    todo.status === 'done'
                      ? 'bg-gradient-to-br from-[#A7F3D0] to-[#10B981] border-[#A7F3D0] shadow-lg shadow-emerald-500/20'
                      : 'border-white/[0.12]'
                  }`}>
                    {todo.status === 'done' && (
                      <svg className="w-3 h-3 text-[#0B0F17]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${todo.status === 'done' ? 'line-through text-gray-600' : 'text-gray-200'}`}>{todo.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    todo.priority === 'high' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                    todo.priority === 'medium' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                    'bg-white/[0.05] text-gray-400 border border-white/[0.06]'
                  }`}>{todo.priority}</span>
                </motion.div>
              ))}
              {todos.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No tasks yet. Start your day! 🚀</p>
                </div>
              )}
            </div>
          </Card>

          <Card glass glow tilt>
            <h2 className="text-lg font-semibold text-white mb-4 font-display">Productivity Trend</h2>
            <React.Suspense fallback={<div className="h-32 flex items-center justify-center"><Spinner /></div>}>
              <ProductivityChart />
            </React.Suspense>
          </Card>
        </div>

        <div className="space-y-6">
          <Card glass glow tilt>
            <h2 className="text-lg font-semibold text-white mb-4 font-display">Mood Check</h2>
            <p className="text-xs text-gray-500 mb-3">How are you feeling today?</p>
            <MoodSelector onSelect={setMood} />
            {mood && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary-300 mt-3"
              >
                Thanks for sharing! Feeling {mood.toLowerCase()} today.
              </motion.p>
            )}
          </Card>

          <Card glass glow tilt>
            <h2 className="text-lg font-semibold text-white mb-4 font-display">AI Suggestions</h2>
            <div className="space-y-3">
              {[
                { icon: '💡', text: 'Focus on high-priority tasks first', active: true },
                { icon: '⏰', text: 'Take a 5-min break every 25 min', active: true },
                { icon: '📊', text: `You've completed ${completionRate}% of today's tasks`, active: true },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                >
                  <span className="text-sm">{s.icon}</span>
                  <p className="text-xs text-gray-400">{s.text}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card glass glow tilt>
            <h2 className="text-lg font-semibold text-white mb-4 font-display">Activity</h2>
            <React.Suspense fallback={<div className="h-32 flex items-center justify-center"><Spinner /></div>}>
              <HeatmapCalendar />
            </React.Suspense>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDashboard;
