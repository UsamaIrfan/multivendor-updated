import request from 'supertest';
import {
  APP_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from '../utils/constants';

describe('Financial Dashboard (E2E)', () => {
  const app = APP_URL;
  let adminToken: string;
  let tenantId: string;
  let branchId: string;

  beforeAll(async () => {
    // ── Login as admin ──
    const adminLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const baseAdminToken = adminLogin.body.token;

    // ── Create Tenant ──
    const tenantRes = await request(app)
      .post('/api/v1/tenants')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({
        name: `E2E FinDash Tenant ${Date.now()}`,
        slug: `e2e-fd-${Date.now()}`,
        contactEmail: `fd-${Date.now()}@test.com`,
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
        name: 'E2E FinDash Branch',
        code: `FD-BR-${Date.now()}`,
        isActive: true,
      });
    branchId = branchRes.body.id;

    // ── Seed income data ──
    await request(app)
      .post('/api/v1/income')
      .auth(adminToken, { type: 'bearer' })
      .send({
        tenantId,
        branchId,
        category: 'Tuition',
        amount: 100000,
        date: '2025-03-15',
      });

    await request(app)
      .post('/api/v1/income')
      .auth(adminToken, { type: 'bearer' })
      .send({
        tenantId,
        category: 'Donation',
        amount: 50000,
        date: '2025-03-20',
      });

    // ── Seed expense data ──
    await request(app)
      .post('/api/v1/expenses')
      .auth(adminToken, { type: 'bearer' })
      .send({
        tenantId,
        branchId,
        category: 'Utilities',
        amount: 30000,
        date: '2025-03-18',
      });

    await request(app)
      .post('/api/v1/expenses')
      .auth(adminToken, { type: 'bearer' })
      .send({
        tenantId,
        category: 'Office Supplies',
        amount: 10000,
        date: '2025-03-22',
      });
  });

  // ─── Dashboard ────────────────────────────────────────

  describe('GET /api/v1/financial-dashboard', () => {
    it('should return tenant financial summary', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body).toHaveProperty('tenantSummary');
      expect(res.body.tenantSummary).toHaveProperty('totalIncome');
      expect(res.body.tenantSummary).toHaveProperty('totalExpense');
      expect(res.body.tenantSummary).toHaveProperty('profit');
      expect(res.body.tenantSummary).toHaveProperty('profitMarginPercent');
    });

    it('should include head office financials', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body).toHaveProperty('headOffice');
      expect(res.body.headOffice).toHaveProperty('income');
      expect(res.body.headOffice).toHaveProperty('expense');
      expect(res.body.headOffice).toHaveProperty('profit');
    });

    it('should include branch breakdown', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body).toHaveProperty('branchBreakdown');
      expect(Array.isArray(res.body.branchBreakdown)).toBe(true);
    });

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard')
        .auth(adminToken, { type: 'bearer' })
        .query({ startDate: '2025-03-01', endDate: '2025-03-31' })
        .expect(200);

      expect(res.body.tenantSummary.startDate).toBe('2025-03-01');
      expect(res.body.tenantSummary.endDate).toBe('2025-03-31');
    });
  });

  // ─── Profit & Loss ────────────────────────────────────

  describe('GET /api/v1/financial-dashboard/profit-loss', () => {
    it('should return P&L for all branches', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard/profit-loss')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return P&L for a specific branch', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard/profit-loss')
        .auth(adminToken, { type: 'bearer' })
        .query({ branchId })
        .expect(200);

      expect(res.body).toHaveProperty('branchId');
      expect(res.body).toHaveProperty('totalIncome');
      expect(res.body).toHaveProperty('totalExpense');
      expect(res.body).toHaveProperty('profit');
      expect(res.body).toHaveProperty('cashFlow');
    });
  });

  // ─── Balance Sheet ────────────────────────────────────

  describe('GET /api/v1/financial-dashboard/balance-sheet', () => {
    it('should return consolidated balance sheet', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard/balance-sheet')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body).toHaveProperty('totalIncome');
      expect(res.body).toHaveProperty('totalExpense');
      expect(res.body).toHaveProperty('netPosition');
      expect(res.body).toHaveProperty('entries');
    });
  });

  // ─── Cash Flow ────────────────────────────────────────

  describe('GET /api/v1/financial-dashboard/cash-flow', () => {
    it('should return cash flow for all branches', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard/cash-flow')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return cash flow for a specific branch', async () => {
      const res = await request(app)
        .get('/api/v1/financial-dashboard/cash-flow')
        .auth(adminToken, { type: 'bearer' })
        .query({ branchId })
        .expect(200);

      expect(res.body).toHaveProperty('branchId');
      expect(res.body).toHaveProperty('cashFlow');
    });
  });
});
