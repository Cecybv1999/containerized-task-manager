import React from 'react';

const priorityColors = { high: '#dc2626', medium: '#d97706', low: '#16a34a' };
const priorityBg = { high: '#fef2f2', medium: '#fffbeb', low: '#f0fdf4' };

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: (completed) => ({
    background: completed ? '#f9fafb' : '#fff',
    borderRadius: 8,
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    opacity: completed ? 0.7 : 1,
    transition: 'all 0.2s',
  }),
  checkbox: { marginTop: 2, width: 18, height: 18, cursor: 'pointer', accentColor: '#4f46e5' },
  content: { flex: 1 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: (completed) => ({
    fontSize: 15,
    fontWeight: 600,
    color: completed ? '#9ca3af' : '#111827',
    textDecoration: completed ? 'line-through' : 'none',
  }),
  badge: (priority) => ({
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 12,
    color: priorityColors[priority],
    background: priorityBg[priority],
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),
  description: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  meta: { fontSize: 12, color: '#9ca3af' },
  deleteBtn: {
    background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
    fontSize: 18, padding: '0 4px', lineHeight: 1,
  },
  empty: { textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 15 },
};

export default function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <div style={styles.empty}>No tasks yet. Add one above to get started.</div>;
  }

  return (
    <div style={styles.list}>
      {tasks.map((task) => (
        <div key={task.id} style={styles.card(task.completed)}>
          <input
            type="checkbox"
            style={styles.checkbox}
            checked={task.completed}
            onChange={() => onToggle(task)}
          />
          <div style={styles.content}>
            <div style={styles.titleRow}>
              <span style={styles.title(task.completed)}>{task.title}</span>
              <span style={styles.badge(task.priority)}>{task.priority}</span>
            </div>
            {task.description && <div style={styles.description}>{task.description}</div>}
            <div style={styles.meta}>
              Created {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <button style={styles.deleteBtn} onClick={() => onDelete(task.id)} title="Delete task">×</button>
        </div>
      ))}
    </div>
  );
}
