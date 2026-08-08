import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Modal from '../Common/Modal';
import Input from '../Common/Input';
import Button from '../Common/Button';

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  const addTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  const buttons = [
    { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
    { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { label: '•', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { label: '1.', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { label: '<>', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
    { label: '▦', action: addTable, active: editor.isActive('table') },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-white/[0.06] bg-white/[0.02] rounded-t-xl">
      {buttons.map((btn) => (
        <motion.button
          key={btn.label}
          onClick={btn.action}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className={`px-3 py-1.5 text-sm rounded-lg font-bold transition-colors ${
            btn.active ? 'bg-primary-500/20 text-primary-300' : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.06]'
          }`}
        >
          {btn.label}
        </motion.button>
      ))}
    </div>
  );
};

const TodoEditor = ({ isOpen, onClose, todo, onSave }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Table, TableRow, TableCell, TableHeader],
    content: todo?.content || '<p>Add details about this task...</p>',
    editorProps: { attributes: { class: 'prose prose-sm prose-invert max-w-none min-h-[180px] focus:outline-none text-gray-300' } },
  });

  useEffect(() => {
    if (todo) {
      setTitle(todo.title); setPriority(todo.priority); setStatus(todo.status); setEstimatedMinutes(todo.estimatedMinutes || 30);
      if (editor && todo.content) editor.commands.setContent(todo.content);
    } else {
      setTitle(''); setPriority('medium'); setStatus('pending'); setEstimatedMinutes(30);
      if (editor) editor.commands.setContent('<p>Add details about this task...</p>');
    }
  }, [todo, editor]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({ _id: todo?._id, title: title.trim(), priority, status, estimatedMinutes, content: editor ? editor.getJSON() : null });
      onClose();
    } catch {} finally { setSaving(false); }
  }, [title, priority, status, estimatedMinutes, editor, todo, onSave, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={todo ? 'Edit Task' : 'New Task'} size="lg">
      <div className="space-y-5">
        <Input label="Task Title" placeholder="What do you need to do?" value={title} onChange={(e) => setTitle(e.target.value)} />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}
              className="block w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-200">
              {['low', 'medium', 'high'].map(p => (
                <option key={p} value={p} className="bg-[#141C29]">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-200">
              {['pending', 'in-progress', 'done'].map(s => (
                <option key={s} value={s} className="bg-[#141C29]">{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Est. Minutes</label>
            <input type="number" min="0" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="block w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-200" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
          <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.02]">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} disabled={!title.trim()} variant="premium">
            {todo ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TodoEditor;
