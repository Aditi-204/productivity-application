import { useState, useCallback } from 'react';
import { todoAPI } from '../api/api';

const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await todoAPI.getAll(date);
      setTodos(data.todos);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch todos.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = useCallback(async (todoData) => {
    setError(null);
    try {
      const { data } = await todoAPI.create(todoData);
      setTodos((prev) => [...prev, data.todo].sort((a, b) => a.order - b.order));
      return data.todo;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create todo.';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateTodo = useCallback(async (id, updates) => {
    setError(null);
    try {
      const { data } = await todoAPI.update(id, updates);
      setTodos((prev) => prev.map((t) => (t._id === id ? data.todo : t)));
      return data.todo;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update todo.';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const deleteTodo = useCallback(async (id) => {
    setError(null);
    try {
      await todoAPI.delete(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete todo.';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const reorderTodos = useCallback(async (reorderedTodos) => {
    try {
      const payload = reorderedTodos.map((t, index) => ({ id: t._id, order: index }));
      await todoAPI.reorder(payload);
      setTodos(reorderedTodos);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reorder todos.';
      setError(message);
    }
  }, []);

  return { todos, loading, error, fetchTodos, createTodo, updateTodo, deleteTodo, reorderTodos };
};

export default useTodos;
