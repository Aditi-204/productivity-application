import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import Button from '../Common/Button';
import Input from '../Common/Input';

const Scene3D = React.lazy(() => import('../Common/Scene3D'));

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email';
    if (!form.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#12141b]">
      <div className="mesh-bg fixed inset-0" />
      <div className="noise-bg fixed inset-0" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_28px_90px_rgba(5,7,14,0.52)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden overflow-hidden border-r border-white/10 bg-slate-900/60 p-8 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-500/10" />
            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Workflow
              </div>

              <div className="max-w-md">
                <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                  Focus. <span className="text-violet-300">Signal.</span> Deliver.
                </h1>
                <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
                  A quieter, sharper way to run your team, track work, and stay in rhythm.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-8">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tasks', value: '24' },
                  { label: 'Focus', value: '4.8h' },
                  { label: 'Attendance', value: '92%' },
                  { label: 'Reports', value: '08' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-2xl font-semibold text-white">{item.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 opacity-80">
              <React.Suspense fallback={null}>
                <Scene3D />
              </React.Suspense>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full max-w-md"
            >
              <div className="mb-7 pt-3">
                <p className="text-sm text-slate-300">Welcome back</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Sign in</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={formErrors.email}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={formErrors.password}
                />

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-800" />
                    Remember me
                  </label>

                  <button type="button" className="text-violet-300 transition hover:text-violet-200">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" loading={isLoading} className="w-full" variant="primary" size="lg">
                  Sign in
                </Button>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    <span className="bg-[#12141b] px-2">Or continue</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
                  >
                    Microsoft
                  </button>
                </div>

                <p className="mt-6 text-center text-sm text-slate-400">
                  Need an account?{' '}
                  <Link to="/register" className="font-medium text-violet-300 hover:text-violet-200">
                    Create one
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
