import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import { attendanceAPI } from '../../api/api';
import Card from '../Common/Card';
import Spinner from '../Common/Spinner';
import RevealText from '../Common/RevealText';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await attendanceAPI.getTeamAttendance(new Date().toISOString().split('T')[0]);
        setMetrics(data.stats);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: 'Active Users', value: metrics?.total || '—', gradient: 'from-[#C4B5FD] to-[#8B5CF6]', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
    { label: 'Present Today', value: metrics?.present || '—', gradient: 'from-[#A7F3D0] to-[#10B981]', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'EOD Submitted', value: metrics?.eodSubmitted || '—', gradient: 'from-[#A5F3FC] to-[#06B6D4]', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
    { label: 'Absent', value: metrics?.absent || '—', gradient: 'from-[#F9A8D4] to-[#EC4899]', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 pt-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <RevealText className="text-4xl font-bold text-white font-display">Admin Panel</RevealText>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-gray-500 mt-2 text-sm">System overview & company management</motion.p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22, delay: i * 0.08 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="cursor-pointer"
          >
            <Card glass glow hover tilt padding={false}>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${c.gradient} shadow-lg`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{c.label}</p>
                    <p className="text-3xl font-bold text-white mt-1 font-display">{c.value}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card glass glow tilt>
          <h2 className="text-lg font-semibold text-white mb-4 font-display">System Information</h2>
          <div className="space-y-4">
            {[
              { label: 'Admin', value: user?.name },
              { label: 'Platform', value: 'Workflow v2.0' },
              { label: 'Environment', value: 'Production' },
              { label: 'Total Departments', value: '—' },
              { label: 'Active Employees', value: metrics?.total || '—' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex justify-between py-3 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-200">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card glass glow tilt>
          <h2 className="text-lg font-semibold text-white mb-4 font-display">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
              { label: 'View Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
              { label: 'Audit Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
              >
                <svg className="w-5 h-5 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
                <span className="text-xs text-gray-400">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
