import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import useTodos from '../../hooks/useTodos';
import useAttendance from '../../hooks/useAttendance';
import Button from '../Common/Button';
import Badge from '../Common/Badge';
import toast from 'react-hot-toast';

const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fireCelebration = () => {
  const colors = ['#C4B5FD', '#A5F3FC', '#A7F3D0', '#F9A8D4', '#D6BCFA', '#FDE68A'];
  const end = Date.now() + 3000;
  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60 + Math.random() * 60,
      spread: 80 + Math.random() * 60,
      origin: { x: Math.random(), y: Math.random() * 0.6 },
      colors: [colors[Math.floor(Math.random() * colors.length)]],
      startVelocity: 30 + Math.random() * 25,
      ticks: 80,
      shapes: ['square', 'circle'],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();

  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      origin: { y: 0.6 },
      colors: colors,
    });
  }, 500);
};

const EODSubmit = () => {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showStamp, setShowStamp] = useState(false);
  const { todos, fetchTodos } = useTodos();
  const { submitEOD } = useAttendance();
  const today = formatDate(new Date());

  useEffect(() => {
    if (showModal && !result) {
      fetchTodos(today);
    }
  }, [showModal]);

  const handleOpen = async () => {
    setShowModal(true);
    setResult(null);
    setProgress(0);
    setShowStamp(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 5, 95));
    }, 50);

    try {
      const data = await submitEOD();
      clearInterval(interval);
      setProgress(100);
      fireCelebration();
      setResult(data);

      setTimeout(() => setShowStamp(true), 500);

      toast.success('Day completed! Great work! 🎯', {
        style: { borderRadius: '16px', background: 'rgba(20,28,41,0.95)', backdropFilter: 'blur(20px)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' },
      });
    } catch (error) {
      clearInterval(interval);
      toast.error(error.message || 'Submission failed', {
        style: { borderRadius: '16px', background: 'rgba(20,28,41,0.95)', backdropFilter: 'blur(20px)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const completedTodos = todos.filter((t) => t.status === 'done');
  const totalTodos = todos.length;
  const canSubmit = completedTodos.length >= 1;

  return (
    <>
      <Button onClick={handleOpen} variant="secondary" size="md">
        End My Day
      </Button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-strong rounded-3xl shadow-glass-lg w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center space-y-6"
                  >
                    <div className="relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                        className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-[#A7F3D0] via-[#A5F3FC] to-[#C4B5FD] flex items-center justify-center shadow-2xl"
                      >
                        <svg className="w-12 h-12 text-[#0B0F17]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-2xl font-bold text-white font-display">Great work today!</h3>
                      <p className="text-gray-400 mt-2">You showed up.</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white/[0.03] rounded-2xl p-6 space-y-4 border border-white/[0.06]"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Completed</span>
                        <span className="text-white font-bold">{result.summary?.completedTasks || completedTodos.length} / {result.summary?.totalTasks || totalTodos}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Completion Rate</span>
                        <span className="text-[#A7F3D0] font-bold">{result.summary?.completionRate || Math.round((completedTodos.length / totalTodos) * 100)}%</span>
                      </div>
                      {result.summary?.aiSummary && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-[#C4B5FD]/10 to-[#A5F3FC]/10 border border-[#C4B5FD]/20">
                          <p className="text-xs font-semibold text-primary-300 mb-1">AI Insight</p>
                          <p className="text-sm text-gray-300">{result.summary.aiSummary}</p>
                        </div>
                      )}
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-sm text-gray-500"
                    >
                      See you tomorrow! ✨
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <Button onClick={() => setShowModal(false)} variant="premium">Done</Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white font-display">End Your Day</h3>
                      <p className="text-sm text-gray-400 mt-1">Review your day before wrapping up</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-8 py-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white font-display">{completedTodos.length}</p>
                          <p className="text-xs text-gray-500 mt-1">Completed</p>
                        </div>
                        <div className="w-px h-12 bg-white/[0.06]" />
                        <div className="text-center">
                          <p className="text-3xl font-bold text-gray-400 font-display">{totalTodos - completedTodos.length}</p>
                          <p className="text-xs text-gray-500 mt-1">Remaining</p>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${totalTodos > 0 ? (completedTodos.length / totalTodos) * 100 : 0}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-[#C4B5FD] to-[#A5F3FC]"
                        />
                      </div>

                      {totalTodos > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                          {todos.map((todo) => (
                            <motion.div
                              key={todo._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                            >
                              <div className={`w-2 h-2 rounded-full ${todo.status === 'done' ? 'bg-[#A7F3D0] shadow-sm shadow-emerald-400/50' : 'bg-amber-400'}`} />
                              <span className={`text-sm flex-1 ${todo.status === 'done' ? 'line-through text-gray-600' : 'text-gray-300'}`}>{todo.title}</span>
                              <Badge variant={todo.priority === 'high' ? 'danger' : todo.priority === 'medium' ? 'warning' : 'gray'}>{todo.priority}</Badge>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {submitting && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Processing...</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[#C4B5FD] via-[#A5F3FC] to-[#A7F3D0]"
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.1 }}
                            />
                          </div>
                        </div>
                      )}

                      {!canSubmit && totalTodos > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 flex items-center gap-2">
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          Complete at least 1 task to end your day
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={submitting} disabled={!canSubmit || submitting} variant="premium">
                          {submitting ? 'Completing...' : 'Confirm & End Day'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStamp && (
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -3, 0] }}
              className="text-9xl"
            >
              ✅
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EODSubmit;
