import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('Income (e2e)', () => {
  const app = APP_URL;
  let adminToken: string;
  let tenantId: string;
  let createdIncomeId: string;
  let branchA1Id: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);

    tenantId = loginRes.body.user?.tenantId || 'default-tenant';

    try {
      const selectRes = await request(app)
        .post('/api/v1/auth/tenant/select')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ tenantId })
        .expect(200);

      adminToken = selectRes.body.token;
    } catch {
      adminToken = loginRes.body.token;
    }

    branchA1Id = 'branch-a1-uuid';
  });

  // ─── Create Income ───────────────────────────────────

  describe('POST /api/v1/income', () => {
    it('should create a branch-level income record', async () => {
      const res = await request(app)
        .post('/api/v1/income')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .send({
          tenantId,
          branchId: branchA1Id,
          category: 'Tuition',
          amount: 50000,
          date: '2025-01-15',
          description: 'January tuition collection',
          referenceNumber: 'REF-2025-001',
          receivedFrom: 'John Doe',
          remarks: 'First semester',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.category).toBe('Tuition');
      expect(res.body.amount).toBe(50000);
      createdIncomeId = res.body.id;
    });

    it('should create tenant-wide income with null branchId', async () => {
      const res = await request(app)
        .post('/api/v1/income')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .send({
          tenantId,
          category: 'Donation',
          amount: 100000,
          date: '2025-02-01',
          description: 'Annual donation',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.category).toBe('Donation');
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .post('/api/v1/income')
        .send({
          tenantId,
          category: 'Test',
          amount: 1000,
          date: '2025-01-01',
        })
        .expect(401);
    });

    it('should reject invalid data (missing required fields)', async () => {
      await request(app)
        .post('/api/v1/income')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .send({
          tenantId,
          description: 'Missing category and amount',
        })
        .expect(422);
    });
  });

  // ─── List Income ──────────────────────────────────────

  describe('GET /api/v1/income', () => {
    it('should list all income records for tenant', async () => {
      const res = await request(app)
        .get('/api/v1/income')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ─── Get by ID ────────────────────────────────────────

  describe('GET /api/v1/income/:id', () => {
    it('should get income record by ID', async () => {
      if (!createdIncomeId) return;

      const res = await request(app)
        .get(`/api/v1/income/${createdIncomeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(200);

      expect(res.body.id).toBe(createdIncomeId);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app)
        .get('/api/v1/income/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(404);
    });
  });

  // ─── Update Income ────────────────────────────────────

  describe('PATCH /api/v1/income/:id', () => {
    it('should update an income record', async () => {
      if (!createdIncomeId) return;

      const res = await request(app)
        .patch(`/api/v1/income/${createdIncomeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .send({ amount: 55000, remarks: 'Updated amount' })
        .expect(200);

      expect(res.body.amount).toBe(55000);
    });
  });

  // ─── Income Report ────────────────────────────────────

  describe('GET /api/v1/income/reports', () => {
    it('should return income report for date range', async () => {
      const res = await request(app)
        .get('/api/v1/income/reports')
        .query({ startDate: '2025-01-01', endDate: '2025-12-31' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter report by branch', async () => {
      const res = await request(app)
        .get('/api/v1/income/reports')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          branchId: branchA1Id,
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter report by category', async () => {
      const res = await request(app)
        .get('/api/v1/income/reports')
        .query({ category: 'Tuition' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ─── Consolidated Report ──────────────────────────────

  describe('GET /api/v1/income/reports/consolidated', () => {
    it('should return consolidated report grouped by branch', async () => {
      const res = await request(app)
        .get('/api/v1/income/reports/consolidated')
        .query({ startDate: '2025-01-01', endDate: '2025-12-31' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(200);

      expect(res.body).toHaveProperty('branches');
      expect(res.body).toHaveProperty('grandTotal');
      expect(res.body).toHaveProperty('totalCount');
      expect(res.body).toHaveProperty('tenantId');
      expect(Array.isArray(res.body.branches)).toBe(true);
    });
  });

  // ─── Delete Income ────────────────────────────────────

  describe('DELETE /api/v1/income/:id', () => {
    it('should soft-delete an income record', async () => {
      if (!createdIncomeId) return;

      await request(app)
        .delete(`/api/v1/income/${createdIncomeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(204);
    });

    it('should return 404 after soft-delete', async () => {
      if (!createdIncomeId) return;

      await request(app)
        .get(`/api/v1/income/${createdIncomeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(404);
    });
  });

  // ─── Tenant Isolation ─────────────────────────────────

  describe('Tenant Isolation', () => {
    it('should not expose income records from other tenants', async () => {
      const res = await request(app)
        .get('/api/v1/income')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-ID', tenantId)
        .expect(200);

      // All returned records should belong to the current tenant
      if (res.body.length > 0) {
        for (const record of res.body) {
          expect(record.tenantId).toBe(tenantId);
        }
      }
    });
  });
});
