import React, { useState } from 'react';

const styles = {
  form: { background: '#fff', borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  title: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1a1a2e' },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  input: { flex: 2, minWidth: 200, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none' },
  select: { flex: 1, minWidth: 120, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, background: '#fff', outline: 'none' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, resize: 'vertical', marginBottom: 12, outline: 'none', minHeight: 80 },
  button: { padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 8 },
};

export default function AddTask({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, priority }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      const task = await res.json();
      onAdd(task);
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.title}>Add New Task</div>
      <textarea
        style={styles.textarea}
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div style={styles.row}>
        <input
          style={styles.input}
          type="text"
          placeholder="Task title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
        />
        <select style={styles.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Adding...' : '+ Add Task'}
        </button>
      </div>
      {error && <div style={styles.error}>{error}</div>}
    </form>
  );
}
