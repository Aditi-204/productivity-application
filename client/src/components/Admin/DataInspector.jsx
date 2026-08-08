import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Spinner from '../Common/Spinner';

const DataInspector = () => {
  const [collection, setCollection] = useState('users');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/data/${collection}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card glass glow>
      <h2 className="text-lg font-semibold text-white mb-4 font-display">Data Inspector</h2>
      <div className="flex gap-3 mb-4">
        <select value={collection} onChange={(e) => setCollection(e.target.value)}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-200"
        >
          {['users', 'todos', 'attendance'].map((c) => (
            <option key={c} value={c} className="bg-[#141C29]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <Button onClick={fetchData} loading={loading} variant="secondary">Load</Button>
      </div>

      {error && <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 mb-4">{error}</div>}

      {loading && <Spinner />}

      {data && !loading && (
        <pre className="bg-[#06090F] rounded-2xl p-4 overflow-x-auto text-xs text-gray-400 max-h-96 scrollbar-thin">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </Card>
  );
};

export default DataInspector;
