import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useAttendance from '../../hooks/useAttendance';
import Card from '../Common/Card';
import Spinner from '../Common/Spinner';

const COLORS = ['#A7F3D0', '#F9A8D4', '#D6BCFA'];

const AttendanceBreakdown = () => {
  const { stats, fetchMyAttendance } = useAttendance();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => { await fetchMyAttendance('month'); setLoading(false); };
    load();
  }, []);

  if (loading || !stats) return <div className="flex items-center justify-center h-48"><Spinner /></div>;

  const data = [
    { name: 'Present', value: stats.presentDays || 0, color: '#A7F3D0' },
    { name: 'Absent', value: stats.absentDays || 0, color: '#F9A8D4' },
    { name: 'Partial', value: stats.partialDays || 0, color: '#D6BCFA' },
  ].filter((item) => item.value > 0);

  const total = data.reduce((s, i) => s + i.value, 0);

  return (
    <Card glass glow>
      <h3 className="text-lg font-semibold text-white mb-4 font-display">Attendance Split</h3>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
              {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                color: '#fff',
              }}
              formatter={(value) => [`${value} days`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 hover:scale-105 transition-transform cursor-default">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-500">{item.name} ({Math.round((item.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AttendanceBreakdown;
