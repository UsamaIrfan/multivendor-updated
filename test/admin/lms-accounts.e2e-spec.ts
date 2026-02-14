import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('LMS Accounts Module (e2e)', () => {
  const app = APP_URL;
  let apiToken: string;

  beforeAll(async () => {
    await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .then(({ body }) => {
        apiToken = body.token;
      });
  });

  // ─── Income ───────────────────────────────────────────
  describe('Income CRUD', () => {
    let incomeId: number;

    it('POST /api/v1/lms/incomes - should create an income', () => {
      return request(app)
        .post('/api/v1/lms/incomes')
        .auth(apiToken, { type: 'bearer' })
        .send({
          title: `E2E Income ${Date.now()}`,
          amount: 50000,
          date: '2026-01-15',
          category: 'fee',
          description: 'Test income',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          incomeId = body.id;
        });
    });

    it('GET /api/v1/lms/incomes - should return all incomes', () => {
      return request(app)
        .get('/api/v1/lms/incomes')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('GET /api/v1/lms/incomes/:id - should return one income', () => {
      return request(app)
        .get(`/api/v1/lms/incomes/${incomeId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(incomeId);
        });
    });

    it('PATCH /api/v1/lms/incomes/:id - should update an income', () => {
      return request(app)
        .patch(`/api/v1/lms/incomes/${incomeId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ amount: 60000 })
        .expect(200);
    });

    it('GET /api/v1/lms/incomes/999999 - should return 404', () => {
      return request(app)
        .get('/api/v1/lms/incomes/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('DELETE /api/v1/lms/incomes/:id - should delete an income', () => {
      return request(app)
        .delete(`/api/v1/lms/incomes/${incomeId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Expense ──────────────────────────────────────────
  describe('Expense CRUD', () => {
    let expenseId: number;

    it('POST /api/v1/lms/expenses - should create an expense', () => {
      return request(app)
        .post('/api/v1/lms/expenses')
        .auth(apiToken, { type: 'bearer' })
        .send({
          title: `E2E Expense ${Date.now()}`,
          amount: 20000,
          date: '2026-02-10',
          category: 'utilities',
          description: 'Test expense',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expenseId = body.id;
        });
    });

    it('GET /api/v1/lms/expenses - should return all expenses', () => {
      return request(app)
        .get('/api/v1/lms/expenses')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('GET /api/v1/lms/expenses/:id - should return one expense', () => {
      return request(app)
        .get(`/api/v1/lms/expenses/${expenseId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(expenseId);
        });
    });

    it('PATCH /api/v1/lms/expenses/:id - should update an expense', () => {
      return request(app)
        .patch(`/api/v1/lms/expenses/${expenseId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ amount: 25000 })
        .expect(200);
    });

    it('GET /api/v1/lms/expenses/999999 - should return 404', () => {
      return request(app)
        .get('/api/v1/lms/expenses/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('DELETE /api/v1/lms/expenses/:id - should delete an expense', () => {
      return request(app)
        .delete(`/api/v1/lms/expenses/${expenseId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });
});
