import { useState } from 'react';
import { motion } from 'framer-motion';
import { reportAPI } from '../../api/api';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Spinner from '../Common/Spinner';
import RevealText from '../Common/RevealText';

const ReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('weekly');
  const [error, setError] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await reportAPI.getReport(type);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <RevealText className="text-4xl font-bold text-white font-display">Reports</RevealText>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-gray-500 mt-2 text-sm">AI-generated performance insights</motion.p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card glass glow>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {['weekly', 'monthly'].map((t) => (
                <button key={t}
                  onClick={() => setType(t)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    type === t
                      ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                      : 'bg-white/[0.03] text-gray-500 hover:text-gray-200 border border-white/[0.04] hover:border-white/[0.08]'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <Button onClick={generateReport} loading={loading} variant="premium" size="md">
              Generate Report
            </Button>
          </div>
        </Card>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">{error}</motion.div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
      )}

      {report && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card glass glow tilt>
            <h2 className="text-lg font-semibold text-white mb-2 font-display">
              {report.period || `${type.charAt(0).toUpperCase() + type.slice(1)} Report`}
            </h2>
            <p className="text-sm text-gray-400">
              {report.dateRange || `Generated ${new Date().toLocaleDateString()}`}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Total Days', value: report.summary?.totalDays || '—' },
                { label: 'Present', value: report.summary?.presentDays || '—' },
                { label: 'Completion', value: report.summary?.completionRate ? `${report.summary.completionRate}%` : '—' },
                { label: 'Tasks Done', value: report.summary?.totalTasks || '—' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.04] text-center">
                  <p className="text-2xl font-bold text-white font-display">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {report.sections?.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card glass glow tilt>
                <h3 className="text-lg font-semibold text-white mb-3 font-display">{section.title}</h3>
                <div className="space-y-3">
                  {section.items?.map((item, j) => (
                    <div key={j} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.04]">
                      {item.label && <p className="text-sm font-medium text-white mb-1">{item.label}</p>}
                      <p className="text-sm text-gray-400">{item.value || item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}

          {report.aiAnalysis && (
            <Card glass glow tilt>
              <h3 className="text-lg font-semibold text-white mb-3 font-display">AI Analysis</h3>
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#C4B5FD]/10 to-[#A5F3FC]/10 border border-[#C4B5FD]/20">
                <p className="text-sm text-gray-300 leading-relaxed">{report.aiAnalysis}</p>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {!report && !loading && !error && (
        <Card glass glow tilt className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#C4B5FD]/20 to-[#A5F3FC]/20 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white font-display">No reports yet</h3>
          <p className="text-sm text-gray-500 mt-1">Generate your first AI-powered report</p>
        </Card>
      )}
    </div>
  );
};

export default ReportPage;
