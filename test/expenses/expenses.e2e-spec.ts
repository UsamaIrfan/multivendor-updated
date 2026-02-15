import request from 'supertest';
import {
  APP_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  TESTER_EMAIL,
  TESTER_PASSWORD,
} from '../utils/constants';

describe('Expenses (E2E)', () => {
  const app = APP_URL;
  let adminToken: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userToken: string;
  let tenantId: string;
  let branchId: string;

  let createdExpenseId: string;
  let createdBranchExpenseId: string;

  beforeAll(async () => {
    // ── Login as admin ──
    const adminLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const baseAdminToken = adminLogin.body.token;

    // ── Login as regular user ──
    const userLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: TESTER_EMAIL, password: TESTER_PASSWORD });
    userToken = userLogin.body.token;

    // ── Create Tenant ──
    const tenantRes = await request(app)
      .post('/api/v1/tenants')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({
        name: `E2E Expense Tenant ${Date.now()}`,
        slug: `e2e-exp-${Date.now()}`,
        contactEmail: `exp-${Date.now()}@test.com`,
        isActive: true,
      });
    tenantId = tenantRes.body.id;

    // ── Select Tenant ──
    const selectTenantRes = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({ tenantId });
    adminToken = selectTenantRes.body.token;

    // ── Create Branch ──
    const branchRes = await request(app)
      .post('/api/v1/branches')
      .auth(adminToken, { type: 'bearer' })
      .send({
        tenantId,
        name: 'E2E Expense Branch',
        code: `EXP-BR-${Date.now()}`,
        isActive: true,
      });
    branchId = branchRes.body.id;
  });

  // ─── Create Expenses ─────────────────────────────────

  describe('POST /api/v1/expenses', () => {
    it('should create a head-office expense', async () => {
      const res = await request(app)
        .post('/api/v1/expenses')
        .auth(adminToken, { type: 'bearer' })
        .send({
          tenantId,
          category: 'Utilities',
          description: 'Electricity bill',
          amount: 25000,
          date: '2025-01-20',
          referenceNumber: 'REF-EXP-001',
          paidTo: 'WAPDA',
          remarks: 'Monthly bill',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.category).toBe('Utilities');
      createdExpenseId = res.body.id;
    });

    it('should create a branch-specific expense', async () => {
      const res = await request(app)
        .post('/api/v1/expenses')
        .auth(adminToken, { type: 'bearer' })
        .send({
          tenantId,
          branchId,
          category: 'Office Supplies',
          amount: 5000,
          date: '2025-02-15',
        })
        .expect(201);

      expect(res.body.branchId).toBe(branchId);
      createdBranchExpenseId = res.body.id;
    });
  });

  // ─── List Expenses ────────────────────────────────────

  describe('GET /api/v1/expenses', () => {
    it('should list all expenses', async () => {
      const res = await request(app)
        .get('/api/v1/expenses')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─── Get by ID ────────────────────────────────────────

  describe('GET /api/v1/expenses/:id', () => {
    it('should return expense by id', async () => {
      const res = await request(app)
        .get(`/api/v1/expenses/${createdExpenseId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body.id).toBe(createdExpenseId);
      expect(res.body.category).toBe('Utilities');
    });

    it('should return 404 for nonexistent expense', async () => {
      await request(app)
        .get('/api/v1/expenses/00000000-0000-0000-0000-000000000000')
        .auth(adminToken, { type: 'bearer' })
        .expect(404);
    });
  });

  // ─── Update ───────────────────────────────────────────

  describe('PATCH /api/v1/expenses/:id', () => {
    it('should update expense amount', async () => {
      const res = await request(app)
        .patch(`/api/v1/expenses/${createdExpenseId}`)
        .auth(adminToken, { type: 'bearer' })
        .send({ amount: 30000, status: 'approved' })
        .expect(200);

      expect(res.body.amount).toBe(30000);
    });
  });

  // ─── Reports ──────────────────────────────────────────

  describe('GET /api/v1/expenses/reports', () => {
    it('should return expense report', async () => {
      const res = await request(app)
        .get('/api/v1/expenses/reports')
        .auth(adminToken, { type: 'bearer' })
        .query({ startDate: '2025-01-01', endDate: '2025-12-31' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/expenses/reports/consolidated', () => {
    it('should return consolidated expense report', async () => {
      const res = await request(app)
        .get('/api/v1/expenses/reports/consolidated')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body).toHaveProperty('grandTotal');
      expect(res.body).toHaveProperty('branches');
    });
  });

  // ─── Delete ───────────────────────────────────────────

  describe('DELETE /api/v1/expenses/:id', () => {
    it('should soft delete an expense', async () => {
      await request(app)
        .delete(`/api/v1/expenses/${createdBranchExpenseId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(204);
    });
  });
});
