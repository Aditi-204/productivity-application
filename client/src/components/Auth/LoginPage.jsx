import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import useAuthStore from '../../store/useAuthStore';
import Button from '../Common/Button';
import Input from '../Common/Input';

const Scene3D = React.lazy(() => import('../Common/Scene3D'));

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '☀️', sub: 'The early bird catches the workflow.' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '🌤', sub: 'Your focus is your superpower.' };
  if (h < 21) return { text: 'Good Evening', emoji: '🌅', sub: 'Winding down or leveling up?' };
  return { text: 'Night Owl', emoji: '🌙', sub: 'Creativity strikes when the world sleeps.' };
};

const quotes = [
  "Today's effort is tomorrow's freedom.",
  "Discipline beats motivation.",
  "One task at a time.",
  "Lock in.",
  "Small wins create massive futures.",
  "Consistency > Intensity.",
  "Done is better than perfect.",
  "Your only competition is yesterday's you.",
  "Progress over perfection.",
  "The best time to start was yesterday. The next best time is now.",
];

const playWelcomeSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.12 + 0.06);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch {}
};

const fireConfetti = () => {
  const colors = ['#C4B5FD', '#A5F3FC', '#A7F3D0', '#F9A8D4', '#D6BCFA'];
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60 + Math.random() * 60,
      spread: 55 + Math.random() * 40,
      origin: { x: Math.random(), y: Math.random() * 0.5 },
      colors: [colors[Math.floor(Math.random() * colors.length)]],
      startVelocity: 25 + Math.random() * 20,
      ticks: 60,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [welcomeUser, setWelcomeUser] = useState(null);
  const [oauthLoading, setOauthLoading] = useState(null);

  const greeting = getGreeting();
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const validate = () => {
    const errors = {};
    if (!form.email) errors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email';
    if (!form.password) errors.password = 'Required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      const data = await login(form.email, form.password);
      setWelcomeUser(data.user);
      fireConfetti();
      playWelcomeSound();
      setTimeout(() => navigate('/dashboard', { state: { morph: true } }), 2200);
    } catch {}
  };

  const handleOAuth = (provider) => {
    clearError();
    setOauthLoading(provider);
    window.location.href = `/api/auth/oauth/${provider}?redirect=${encodeURIComponent(window.location.origin)}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0B0F17]">
      <div className="fixed inset-0 mesh-gradient" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="fixed inset-0 noise-bg" />
      <React.Suspense fallback={null}><Scene3D /></React.Suspense>

      <div className="relative z-10 min-h-screen flex items-stretch">
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center">
          <div className="relative z-10 text-center px-16 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Next-Gen Productivity Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-7xl font-bold text-white mb-4 font-display tracking-tight"
            >
              Welcome to{' '}
              <span className="gradient-text-primary">Workflow</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-gray-400 font-light leading-relaxed"
            >
              Your intelligent command center for{" "}
              <span className="text-gray-200">productivity</span>,{" "}
              <span className="text-gray-200">focus</span>, and{" "}
              <span className="text-gray-200">growth</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 flex items-center justify-center gap-6"
            >
              {['AI-Powered', '3D Workspace', 'Smart Analytics', 'Gamified'].map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="px-4 py-2 rounded-2xl bg-white/[0.04] backdrop-blur-sm text-sm text-gray-300 border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full max-w-sm"
          >
            <div className="glass-strong rounded-3xl p-8 lg:p-10">
              <div className="text-center mb-8">
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-4xl mb-3"
                >
                  {greeting.emoji}
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold text-white font-display"
                >
                  {greeting.text}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm text-primary-300/70 mt-2 italic"
                >
                  "{quote}"
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {error}
                  </motion.div>
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={formErrors.email}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={formErrors.password}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded-lg border-white/[0.12] bg-white/[0.03] text-primary-500 focus:ring-primary-500/30 cursor-pointer" />
                    <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Remember me</span>
                  </label>
                  <button type="button" className="text-xs text-primary-300/70 hover:text-primary-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" loading={isLoading} className="w-full" variant="premium" size="lg">
                  Sign In
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-[#141C29] text-gray-500">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={oauthLoading !== null}
                    onClick={() => handleOAuth('google')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-white/[0.08] hover:bg-white/[0.04] transition-all text-sm text-gray-300 group disabled:opacity-50"
                  >
                    {oauthLoading === 'google' ? (
                      <div className="w-4 h-4 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    )}
                    Google
                  </button>
                  <button
                    type="button"
                    disabled={oauthLoading !== null}
                    onClick={() => handleOAuth('microsoft')}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-white/[0.08] hover:bg-white/[0.04] transition-all text-sm text-gray-300 group disabled:opacity-50"
                  >
                    {oauthLoading === 'microsoft' ? (
                      <div className="w-4 h-4 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 23 23" fill="currentColor"><path d="M0 3.449v16.102h11.255V3.449H0zm2.89 2.89h2.89v2.89H2.89V6.34zm4.335 0h2.89v2.89H7.225V6.34zM2.89 10.339h2.89v2.89H2.89v-2.89zm4.335 0h2.89v2.89H7.225v-2.89zM2.89 14.338h2.89v2.89H2.89v-2.89zm4.335 0h2.89v2.89H7.225v-2.89z"/></svg>
                    )}
                    Microsoft
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary-300 hover:text-primary-200 font-medium transition-colors">
                    Create one
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {welcomeUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-8xl mb-8"
              >
                ✨
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-5xl font-bold text-white font-display mb-3"
              >
                Welcome, {welcomeUser.name?.split(' ')[0]}!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-primary-300/80"
              >
                Your workspace is ready. 🚀
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
