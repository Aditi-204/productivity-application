import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTodos from '../../hooks/useTodos';
import useTilt from '../../hooks/useTilt';
import TodoEditor from './TodoEditor';
import Card from '../Common/Card';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import Spinner from '../Common/Spinner';

const priorityConfig = {
  low: { variant: 'gray', label: 'Low', color: 'border-l-gray-500' },
  medium: { variant: 'warning', label: 'Medium', color: 'border-l-amber-500' },
  high: { variant: 'danger', label: 'High', color: 'border-l-red-500' },
};
const statusConfig = {
  pending: { variant: 'gray', label: 'Pending' },
  'in-progress': { variant: 'primary', label: 'In Progress' },
  done: { variant: 'success', label: 'Done' },
};

const FlashCard = ({ todo, onToggle, onEdit, onDelete, onNext, index, total }) => {
  const tilt = useTilt({ maxTilt: 5 });

  return (
    <div className="relative w-full max-w-lg mx-auto" style={{ height: 520 }}>
      {[3, 2, 1].map((offset) => (
        <motion.div
          key={offset}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 - offset * 0.025 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: offset * 0.05 }}
          className="absolute rounded-3xl border border-white/[0.04] bg-white/[0.02]"
          style={{
            width: '88%',
            height: '92%',
            bottom: `${-offset * 6}px`,
            zIndex: 5 - offset,
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        <motion.div
          key={todo._id}
          initial={{ opacity: 0, x: 200, rotate: 8 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: -200, rotate: -8 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          whileHover={{ y: -6, scale: 1.01, boxShadow: '0 40px 80px -20px rgba(196, 181, 253, 0.2)' }}
          onMouseMove={tilt.handleMouseMove}
          onMouseLeave={tilt.handleMouseLeave}
          style={tilt.style}
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={onNext}
        >
          <div className="h-full rounded-3xl glass-strong p-7 lg:p-8 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C4B5FD] via-[#A5F3FC] to-[#A7F3D0] opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#C4B5FD]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); onToggle(todo._id, todo.status === 'done' ? 'pending' : 'done'); }}
                className={`mt-0.5 w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                  todo.status === 'done'
                    ? 'bg-gradient-to-br from-[#A7F3D0] to-[#10B981] border-[#A7F3D0] shadow-lg shadow-emerald-500/30'
                    : 'border-white/[0.15] hover:border-primary-300/50'
                }`}
              >
                {todo.status === 'done' && (
                  <svg className="w-4 h-4 text-[#0B0F17]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.button>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
                  className="p-2 text-gray-500 hover:text-primary-300 rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onDelete(todo._id); }}
                  className="p-2 text-gray-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </div>
            </div>

            <div className="flex gap-2 mb-3 relative z-10">
              <Badge variant={priorityConfig[todo.priority].variant}>{priorityConfig[todo.priority].label}</Badge>
              <Badge variant={statusConfig[todo.status].variant}>{statusConfig[todo.status].label}</Badge>
            </div>

            <h3 className={`text-xl font-bold mb-3 font-display relative z-10 ${todo.status === 'done' ? 'line-through text-gray-600' : 'text-white'}`}>
              {todo.title}
            </h3>

            {todo.estimatedMinutes > 0 && (
              <div className="mt-auto pt-4 relative z-10">
                <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-white/[0.06] pt-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{todo.estimatedMinutes} min estimated</span>
                </div>
              </div>
            )}

            <div className="mt-2 text-center text-xs text-gray-600 relative z-10">
              {index + 1} of {total} · Tap to see next
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const TodoList = () => {
  const { todos, loading, error, fetchTodos, createTodo, updateTodo, deleteTodo } = useTodos();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => { fetchTodos(dateStr); }, []);

  useEffect(() => { setCurrentIndex(0); }, [todos.length]);

  const handleCreate = async (todoData) => {
    if (todoData._id) {
      await updateTodo(todoData._id, {
        title: todoData.title,
        priority: todoData.priority,
        status: todoData.status,
        estimatedMinutes: todoData.estimatedMinutes,
        content: todoData.content,
      });
    } else {
      await createTodo({ ...todoData, date: dateStr });
    }
  };

  const handleToggle = async (id, newStatus) => { await updateTodo(id, { status: newStatus }); };
  const handleDelete = async (id) => { if (window.confirm('Delete this task?')) await deleteTodo(id); };

  const goNext = () => { if (currentIndex < todos.length - 1) setCurrentIndex((p) => p + 1); };
  const goPrev = () => { if (currentIndex > 0) setCurrentIndex((p) => p - 1); };

  const currentTodo = todos[currentIndex];

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Today's Tasks</h2>
          <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button onClick={() => { setEditingTodo(null); setEditorOpen(true); }} variant="premium">+ Add Task</Button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 mb-4">{error}</div>
      )}

      {loading && todos.length === 0 ? (
        <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
      ) : todos.length === 0 ? (
        <Card glass glow tilt className="text-center py-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#C4B5FD]/20 to-[#A5F3FC]/20 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white font-display">No tasks for today</h3>
            <p className="mt-1 text-sm text-gray-500">Start fresh — create your first task.</p>
            <div className="mt-6"><Button onClick={() => { setEditingTodo(null); setEditorOpen(true); }} variant="premium">+ Add Task</Button></div>
          </motion.div>
        </Card>
      ) : (
        <div className="flex flex-col items-center">
          <FlashCard
            todo={currentTodo}
            onToggle={handleToggle}
            onEdit={(t) => { setEditingTodo(t); setEditorOpen(true); }}
            onDelete={handleDelete}
            onNext={goNext}
            index={currentIndex}
            total={todos.length}
          />

          <div className="flex items-center gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-xl transition-all ${
                currentIndex === 0
                  ? 'text-gray-700 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] hover:border-white/[0.1] border border-white/[0.06]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.div
              key={currentIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-5 py-2.5 rounded-xl glass-strong text-sm font-medium text-gray-300 min-w-[90px] text-center"
            >
              {currentIndex + 1} / {todos.length}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={goNext}
              disabled={currentIndex === todos.length - 1}
              className={`p-3 rounded-xl transition-all ${
                currentIndex === todos.length - 1
                  ? 'text-gray-700 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] hover:border-white/[0.1] border border-white/[0.06]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      )}

      <TodoEditor isOpen={editorOpen} onClose={() => { setEditorOpen(false); setEditingTodo(null); }} todo={editingTodo} onSave={handleCreate} />
    </div>
  );
};

export default TodoList;
