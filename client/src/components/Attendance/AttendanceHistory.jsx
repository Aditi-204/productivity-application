import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAttendance from '../../hooks/useAttendance';
import Card from '../Common/Card';
import Badge from '../Common/Badge';
import Spinner from '../Common/Spinner';

const statusConfig = {
  present: { variant: 'success', label: 'Present' },
  absent: { variant: 'danger', label: 'Absent' },
  partial: { variant: 'warning', label: 'Partial' },
};

const AttendanceHistory = () => {
  const { records, fetchMyAttendance, loading } = useAttendance();
  const [range, setRange] = useState('month');

  useEffect(() => { fetchMyAttendance(range); }, [range]);

  if (loading) return <div className="flex items-center justify-center h-32"><Spinner /></div>;

  return (
    <Card glass glow>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-display">History</h3>
        <select value={range} onChange={(e) => setRange(e.target.value)}
          className="text-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-300"
        >
          <option value="week" className="bg-[#141C29]">7 Days</option>
          <option value="month" className="bg-[#141C29]">30 Days</option>
          <option value="quarter" className="bg-[#141C29]">90 Days</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Date', 'Status', 'Login', 'EOD'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-sm font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-sm text-gray-600">No records found.</td></tr>
            ) : (
              records.map((record, i) => (
                <motion.tr key={record._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ x: 4 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-sm text-gray-200 font-medium">
                    {new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusConfig[record.status]?.variant || 'gray'}>
                      {statusConfig[record.status]?.label || record.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {record.loginTime ? new Date(record.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {record.eodCompleted ? (
                      <span className="text-sm text-[#A7F3D0] font-medium">
                        {record.eodSubmittedAt ? new Date(record.eodSubmittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done'}
                      </span>
                    ) : <span className="text-sm text-gray-600">—</span>}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AttendanceHistory;
