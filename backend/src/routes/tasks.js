const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const logger = require('../middleware/logger');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { completed, priority, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (completed !== undefined) {
      params.push(completed === 'true');
      query += ` AND completed = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      query += ` AND priority = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    logger.error('Failed to fetch tasks', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tasks/:id
router.get('/:id',
  param('id').isUUID(),
  handleValidation,
  async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Failed to fetch task', { id: req.params.id, error: err.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/tasks
router.post('/',
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  handleValidation,
  async (req, res) => {
    try {
      const { title, description = null, priority = 'medium' } = req.body;
      const result = await db.query(
        'INSERT INTO tasks (title, description, priority) VALUES ($1, $2, $3) RETURNING *',
        [title, description, priority]
      );
      logger.info('Task created', { id: result.rows[0].id });
      res.status(201).json(result.rows[0]);
    } catch (err) {
      logger.error('Failed to create task', { error: err.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /api/tasks/:id
router.patch('/:id',
  param('id').isUUID(),
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('completed').optional().isBoolean(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  handleValidation,
  async (req, res) => {
    try {
      const allowed = ['title', 'description', 'completed', 'priority'];
      const updates = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => allowed.includes(k))
      );

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`);
      const values = [req.params.id, ...Object.values(updates)];
      const result = await db.query(
        `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      logger.error('Failed to update task', { id: req.params.id, error: err.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/tasks/:id
router.delete('/:id',
  param('id').isUUID(),
  handleValidation,
  async (req, res) => {
    try {
      const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      logger.info('Task deleted', { id: req.params.id });
      res.status(204).send();
    } catch (err) {
      logger.error('Failed to delete task', { id: req.params.id, error: err.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
