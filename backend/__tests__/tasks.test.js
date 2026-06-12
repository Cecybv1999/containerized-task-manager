jest.mock('../src/db', () => ({
  query: jest.fn(),
  checkConnection: jest.fn().mockResolvedValue(true),
}));

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

const VALID_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const SAMPLE_TASK = {
  id: VALID_UUID,
  title: 'Test task',
  description: 'Test description',
  priority: 'medium',
  completed: false,
  created_at: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

describe('GET /api/tasks', () => {
  it('returns task list', async () => {
    db.query.mockResolvedValueOnce({ rows: [SAMPLE_TASK], rowCount: 1 });
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [SAMPLE_TASK], total: 1 });
  });

  it('filters by completed', async () => {
    db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await request(app).get('/api/tasks?completed=true');
    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('completed'),
      expect.arrayContaining([true])
    );
  });

  it('filters by priority', async () => {
    db.query.mockResolvedValueOnce({ rows: [SAMPLE_TASK], rowCount: 1 });
    const res = await request(app).get('/api/tasks?priority=high');
    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('priority'),
      expect.arrayContaining(['high'])
    );
  });

  it('returns 500 on db error', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns a task by id', async () => {
    db.query.mockResolvedValueOnce({ rows: [SAMPLE_TASK] });
    const res = await request(app).get(`/api/tasks/${VALID_UUID}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(SAMPLE_TASK);
  });

  it('returns 404 when task not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get(`/api/tasks/${VALID_UUID}`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid UUID', async () => {
    const res = await request(app).get('/api/tasks/not-a-uuid');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/tasks', () => {
  it('creates a task and returns 201', async () => {
    db.query.mockResolvedValueOnce({ rows: [SAMPLE_TASK] });
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test task', priority: 'medium' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual(SAMPLE_TASK);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ description: 'No title here' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task', priority: 'urgent' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on db error', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task' });
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('updates a task', async () => {
    const updated = { ...SAMPLE_TASK, completed: true };
    db.query.mockResolvedValueOnce({ rows: [updated] });
    const res = await request(app)
      .patch(`/api/tasks/${VALID_UUID}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('returns 404 when task not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .patch(`/api/tasks/${VALID_UUID}`)
      .send({ completed: true });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid UUID', async () => {
    const res = await request(app)
      .patch('/api/tasks/not-a-uuid')
      .send({ completed: true });
    expect(res.status).toBe(400);
  });

  it('returns 400 when no valid fields provided', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${VALID_UUID}`)
      .send({ nonexistent: 'field' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task and returns 204', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: VALID_UUID }] });
    const res = await request(app).delete(`/api/tasks/${VALID_UUID}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when task not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).delete(`/api/tasks/${VALID_UUID}`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid UUID', async () => {
    const res = await request(app).delete('/api/tasks/not-a-uuid');
    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('returns healthy when db is up', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('returns 503 when db is down', async () => {
    db.checkConnection.mockRejectedValueOnce(new Error('Connection refused'));
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('unhealthy');
  });
});