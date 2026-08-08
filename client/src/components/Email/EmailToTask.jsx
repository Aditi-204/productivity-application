import { useState } from 'react';
import { motion } from 'framer-motion';
import useEmail from '../../hooks/useEmail';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import toast from 'react-hot-toast';

const EmailToTask = ({ email, isOpen, onClose }) => {
  const { generateAiReply } = useEmail();
  const [taskData, setTaskData] = useState({
    title: email ? `Follow up: ${email.subject?.slice(0, 60)}` : '',
    description: email ? `From: ${email.sender}\n\n${email.body?.slice(0, 200)}...` : '',
    priority: email?.priority === 'critical' || email?.priority === 'high' ? 'high' : email?.priority || 'medium',
    deadline: '',
  });

  const extractDeadline = (body) => {
    const patterns = [
      /by\s+(this\s+)?(Friday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i,
      /due\s+(on\s+)?(\d{1,2}\/\d{1,2})/,
      /deadline\s+(is\s+)?(\d{1,2}\/\d{1,2})/,
      /by\s+(this\s+)?(week|month|EOD|end of day)/i,
    ];
    for (const p of patterns) {
      const match = body?.match(p);
      if (match) return match[0];
    }
    return '';
  };

  const handleConvert = () => {
    try {
      const existingTasks = JSON.parse(localStorage.getItem('wf_email_tasks') || '[]');
      const newTask = {
        id: crypto.randomUUID(),
        emailId: email?.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        deadline: taskData.deadline,
        sender: email?.sender,
        source: 'email',
        createdAt: new Date().toISOString(),
      };
      existingTasks.push(newTask);
      localStorage.setItem('wf_email_tasks', JSON.stringify(existingTasks));
      toast.success('Email converted to task!', {
        style: { borderRadius: '16px', background: 'rgba(20,28,41,0.95)', backdropFilter: 'blur(20px)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' },
      });
      onClose();
    } catch {
      toast.error('Failed to create task');
    }
  };

  const detectedDeadline = extractDeadline(email?.body);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convert Email to Task" size="md">
      <div className="space-y-4">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-xs text-gray-500 mb-1">From email</p>
          <p className="text-sm text-gray-200 truncate">{email?.subject}</p>
          <p className="text-xs text-gray-600 truncate">{email?.sender}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
          <input
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={taskData.description}
            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
            rows={4}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select value={taskData.priority} onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {['low', 'medium', 'high'].map(p => <option key={p} value={p} className="bg-[#141C29]">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
            <input
              type="date"
              value={taskData.deadline}
              onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {detectedDeadline && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-300">
              <span className="font-semibold">AI Detected:</span> Deadline mentioned — "{detectedDeadline}"
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="premium" onClick={handleConvert}>Convert to Task</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EmailToTask;
