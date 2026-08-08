import { useState, useEffect } from 'react';
import useAttendance from '../../hooks/useAttendance';
import Spinner from '../Common/Spinner';

const HeatmapCalendar = () => {
  const { records, fetchMyAttendance } = useAttendance();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => { await fetchMyAttendance('month'); setLoading(false); };
    load();
  }, []);

  const getIntensity = (dateStr) => {
    const record = records.find((r) => r.date === dateStr);
    if (!record) return 0;
    if (record.status === 'absent') return 0;
    if (record.eodCompleted) return 4;
    if (record.status === 'present') return 2;
    return 1;
  };

  const generateGrid = () => {
    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      days.push({
        date: dateStr,
        day: d.getDate(),
        dayOfWeek: d.getDay(),
        weekIndex: Math.floor((29 - i) / 7),
        intensity: getIntensity(dateStr),
      });
    }
    return days;
  };

  const intensityColors = [
    'bg-white/[0.02]',
    'bg-[#C4B5FD]/20',
    'bg-[#C4B5FD]/40',
    'bg-[#C4B5FD]/60',
    'bg-[#C4B5FD]/80',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) return <div className="flex items-center justify-center h-32"><Spinner /></div>;

  const grid = generateGrid();
  const weeks = [];
  for (let w = 0; w < 5; w++) weeks.push(grid.filter((d) => d.weekIndex === w));

  return (
    <div>
      <div className="flex gap-1.5">
        <div className="flex flex-col gap-1.5 pr-2">
          {dayNames.map((name, i) => (
            <div key={name} className="h-3 text-[10px] text-gray-600 leading-3">{i % 2 === 0 ? name : ''}</div>
          ))}
        </div>
        <div className="flex gap-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div key={day.date}
                  className={`w-3 h-3 rounded-md ${intensityColors[day.intensity]} ${day.intensity > 0 ? 'hover:scale-150 hover:shadow-lg hover:z-10 relative transition-all duration-200 cursor-pointer' : 'cursor-default'}`}
                  title={`${day.date}: ${['No data','Present','Working','—','Completed'][day.intensity]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-gray-600">Less</span>
        {intensityColors.map((c, i) => <div key={i} className={`w-3 h-3 rounded-md ${c}`} />)}
        <span className="text-xs text-gray-600">More</span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
