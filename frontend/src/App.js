import React, { useState, useEffect, useCallback } from 'react';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';

const API = '/api/tasks';

const styles = {
  app: { minHeight: '100vh', background: '#f0f2f5', padding: '32px 16px' },
  container: { maxWidth: 800, margin: '0 auto' },
  header: { marginBottom: 32, textAlign: 'center' },
  h1: { fontSize: 32, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280' },
  filters: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: (active) => ({
    padding: '6px 16px', borderRadius: 20, border: '1px solid',
    borderColor: active ? '#4f46e5' : '#d1d5db',
    background: active ? '#4f46e5' : '#fff',
    color: active ? '#fff' : '#374151',
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
  }),
  stats: { display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  stat: { background: '#fff', borderRadius: 8, padding: '12px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: 1, minWidth: 120, textAlign: 'center' },
  statNum: { fontSize: 24, fontWeight: 800, color: '#4f46e5' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  error: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 },
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const url = filter === 'all' ? API : `${API}?completed=${filter === 'done'}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load tasks');
      const { data } = await res.json();
      setTasks(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAdd = (task) => setTasks((prev) => [task, ...prev]);

  const handleToggle = async (task) => {
    try {
      const res = await fetch(`${API}/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const allTasks = tasks;
  const doneTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  const displayed = filter === 'all' ? tasks : filter === 'done' ? doneTasks : pendingTasks;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.h1}>Task Manager</h1>
          <p style={styles.subtitle}>Containerized Microservices Demo — React + Node.js + PostgreSQL</p>
        </div>

        <div style={styles.stats}>
          <div style={styles.stat}><div style={styles.statNum}>{allTasks.length}</div><div style={styles.statLabel}>Total</div></div>
          <div style={styles.stat}><div style={styles.statNum}>{pendingTasks.length}</div><div style={styles.statLabel}>Pending</div></div>
          <div style={styles.stat}><div style={styles.statNum}>{doneTasks.length}</div><div style={styles.statLabel}>Completed</div></div>
        </div>

        <AddTask onAdd={handleAdd} />

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.filters}>
          {['all', 'pending', 'done'].map((f) => (
            <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Loading tasks...</div>
        ) : (
          <TaskList tasks={displayed} onToggle={handleToggle} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
