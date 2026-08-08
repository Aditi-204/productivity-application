import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import useTodos from '../../hooks/useTodos';
import Spinner from '../Common/Spinner';

const ProductivityChart = () => {
  const { fetchTodos } = useTodos();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateData = async () => {
      const weekData = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const result = await fetchTodos(dateStr);
        const completed = result?.todos?.filter((t) => t.status === 'done').length || 0;
        const total = result?.todos?.length || 0;
        weekData.push({
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          completed,
          total,
          rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }
      setData(weekData);
      setLoading(false);
    };
    generateData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-48"><Spinner /></div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="pGradCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="pGradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A5F3FC" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#A5F3FC" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#fff',
          }}
          labelStyle={{ fontWeight: 600, color: '#fff' }}
        />
        <Area type="monotone" dataKey="total" stroke="#A5F3FC" strokeWidth={1.5} fill="url(#pGradTotal)" dot={false} name="Total" />
        <Area type="monotone" dataKey="completed" stroke="#C4B5FD" strokeWidth={2.5} fill="url(#pGradCompleted)" dot={{ fill: '#C4B5FD', r: 4, strokeWidth: 2, stroke: '#0B0F17' }} activeDot={{ r: 6, fill: '#C4B5FD' }} name="Completed" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ProductivityChart;
