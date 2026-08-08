import { useState, useEffect } from 'react';
import useAttendance from '../../hooks/useAttendance';
import Card from '../Common/Card';
import Spinner from '../Common/Spinner';

const AttendanceCalendar = () => {
  const { records, fetchMyAttendance, loading } = useAttendance();

  useEffect(() => { fetchMyAttendance('month'); }, []);

  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getStatusForDay = (day) => {
    if (!day) return null;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = records.find((r) => r.date === dateStr);
    return record ? record.status : 'future';
  };

  const days = getDaysInMonth();
  const colorMap = {
    present: 'bg-gradient-to-br from-[#A7F3D0] to-[#10B981] text-[#0B0F17] shadow-sm shadow-emerald-500/20',
    absent: 'bg-gradient-to-br from-[#F9A8D4] to-[#EC4899] text-white shadow-sm shadow-rose-500/20',
    partial: 'bg-gradient-to-br from-[#D6BCFA] to-[#8B5CF6] text-white shadow-sm shadow-purple-500/20',
    future: 'bg-white/[0.03] text-gray-600',
  };

  if (loading) return <div className="flex items-center justify-center h-48"><Spinner /></div>;

  return (
    <Card glass glow>
      <h3 className="text-lg font-semibold text-white mb-4 font-display">
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name) => (
          <div key={name} className="text-center text-xs font-medium text-gray-600 py-1.5">{name}</div>
        ))}
        {days.map((day, index) => {
          const status = getStatusForDay(day);
          return (
            <div key={index}
              className={`aspect-square flex items-center justify-center text-sm rounded-2xl transition-all duration-200 ${
                status ? colorMap[status] : ''
              } ${
                day && status !== 'future' ? 'hover:scale-110 hover:shadow-lg cursor-pointer font-bold' : ''
              } ${day ? 'font-medium' : ''}`}
            >
              {day || ''}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 pt-4 border-t border-white/[0.06]">
        {[
          { color: 'bg-[#A7F3D0]', label: 'Present' },
          { color: 'bg-[#F9A8D4]', label: 'Absent' },
          { color: 'bg-[#D6BCFA]', label: 'Partial' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-lg ${item.color}`} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AttendanceCalendar;
