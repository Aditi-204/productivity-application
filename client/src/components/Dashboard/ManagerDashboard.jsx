import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAttendance from '../../hooks/useAttendance';
import Card from '../Common/Card';
import Badge from '../Common/Badge';
import Spinner from '../Common/Spinner';
import RevealText from '../Common/RevealText';

const ManagerDashboard = () => {
  const { teamData, fetchTeamAttendance, loading } = useAttendance();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchTeamAttendance(today); }, []);

  const statCards = [
    { label: 'Total Team', value: teamData?.stats?.total || 0, gradient: 'from-[#C4B5FD] to-[#8B5CF6]', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
    { label: 'Present', value: teamData?.stats?.present || 0, gradient: 'from-[#A7F3D0] to-[#10B981]', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Absent', value: teamData?.stats?.absent || 0, gradient: 'from-[#F9A8D4] to-[#EC4899]', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'EOD Done', value: teamData?.stats?.eodSubmitted || 0, gradient: 'from-[#A5F3FC] to-[#06B6D4]', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ];

  const getStatusBadge = (status, eodCompleted) => {
    if (eodCompleted) return { label: 'Done', variant: 'success' };
    if (status === 'present') return { label: 'Working', variant: 'warning' };
    return { label: 'Absent', variant: 'danger' };
  };

  if (loading && !teamData) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 pt-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <RevealText className="text-4xl font-bold text-white font-display">Team Overview</RevealText>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-gray-500 mt-2 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22, delay: i * 0.07 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="cursor-pointer"
          >
            <Card glass glow hover tilt padding={false}>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{card.label}</p>
                    <p className="text-3xl font-bold text-white mt-1 font-display">{card.value}</p>
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
        transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.35 }}
      >
        <Card glass glow tilt>
          <h2 className="text-lg font-semibold text-white mb-6 font-display">Team Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Member', 'Department', 'Status', 'Login', 'EOD'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-sm font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamData?.team?.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-600">No team data available.</td></tr>
                ) : (
                  teamData?.team?.map((member, i) => {
                    const badge = getStatusBadge(member.status, member.eodCompleted);
                    const loginTime = member.loginTime ? new Date(member.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                    return (
                      <motion.tr
                        key={member.user._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: i * 0.02 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4B5FD] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                              {member.user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-200">{member.user.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">{member.user.department || '—'}</td>
                        <td className="py-4 px-4"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                        <td className="py-4 px-4 text-sm text-gray-500">{loginTime}</td>
                        <td className="py-4 px-4">
                          <Badge variant={member.eodCompleted ? 'success' : 'warning'}>{member.eodCompleted ? 'Done' : 'Pending'}</Badge>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ManagerDashboard;
