import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import Button from '../Common/Button';
import Input from '../Common/Input';

const Scene3D = React.lazy(() => import('../Common/Scene3D'));

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'employee', department: '', company: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Required';
    if (!form.email) errors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email';
    if (!form.password) errors.password = 'Required';
    else if (form.password.length < 6) errors.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!form.department.trim()) errors.department = 'Required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        role: form.role, department: form.department, company: form.company || undefined,
      });
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0B0F17]">
      <div className="fixed inset-0 mesh-gradient" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="fixed inset-0 noise-bg" />
      <React.Suspense fallback={null}><Scene3D /></React.Suspense>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="glass-strong rounded-3xl p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white font-display">Create Account</h2>
              <p className="text-gray-500 mt-1 text-sm">Join the future of productivity</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="John Doe" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} />
                <Input label="Department" placeholder="Engineering" value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })} error={formErrors.department} />
              </div>

              <Input label="Email" type="email" placeholder="you@company.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} error={formErrors.password} />
                <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={formErrors.confirmPassword} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'employee', label: 'Employee', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { value: 'manager', label: 'Manager', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
                    { value: 'admin', label: 'Admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                  ].map((role) => (
                    <button key={role.value} type="button"
                      onClick={() => setForm({ ...form, role: role.value })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                        form.role === role.value
                          ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                          : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-200 hover:bg-white/[0.06]'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={role.icon} />
                      </svg>
                      <span className="text-xs">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" loading={isLoading} className="w-full" variant="premium" size="lg">
                Create Account
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-300 hover:text-primary-200 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
