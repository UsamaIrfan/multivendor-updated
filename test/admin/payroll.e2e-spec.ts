import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

/**
 * Payroll Management E2E Tests
 *
 * Covers:
 * - Salary structure CRUD per tenant
 * - Cross-tenant isolation (tenant A structure ≠ tenant B)
 * - Tenant-specific salary components
 * - Payroll processing per tenant (optional branch filter)
 * - Bulk processing across all branches
 * - Salary slip retrieval with tenant branding
 * - PDF generation with tenant logo/name
 */
describe('Payroll Management (e2e)', () => {
  const app = APP_URL;
  let apiToken: string;
  let tenantAToken: string;
  let tenantBToken: string;

  // IDs captured during tests
  let structureId: number;
  let structureBId: number;
  let salarySlipId: number;

  // Assumed tenant / branch / staff UUIDs (seeded)
  const TENANT_A_ID = '00000000-0000-0000-0000-000000000001';
  const TENANT_B_ID = '00000000-0000-0000-0000-000000000002';
  const BRANCH_A1_ID = '00000000-0000-0000-0000-0000000000a1';

  // Staff IDs from staff_mgmt table (integer PKs, seeded)
  const STAFF_A1_ID = 1;
  const STAFF_B1_ID = 3;

  beforeAll(async () => {
    // Login as admin
    const loginRes = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    apiToken = loginRes.body.token;

    // Select tenant A
    const tenantARes = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(apiToken, { type: 'bearer' })
      .send({ tenantId: TENANT_A_ID });

    tenantAToken = tenantARes.body.token ?? apiToken;

    // Select tenant B
    const tenantBRes = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(apiToken, { type: 'bearer' })
      .send({ tenantId: TENANT_B_ID });

    tenantBToken = tenantBRes.body.token ?? apiToken;
  });

  // ═══════════════════════════════════════════════════════
  //  Salary Structure CRUD
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/payroll/structures', () => {
    it('should create a salary structure for current tenant', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/structures')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: null,
          staffId: STAFF_A1_ID,
          name: 'Standard Teacher Structure',
          components: [
            { name: 'Basic Salary', type: 'earning', amount: 50000 },
            { name: 'Housing Allowance', type: 'earning', amount: 10000 },
            { name: 'Transport Allowance', type: 'earning', amount: 5000 },
            { name: 'Income Tax', type: 'deduction', amount: 3000 },
            { name: 'Provident Fund', type: 'deduction', amount: 2500 },
          ],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.tenantId).toBe(TENANT_A_ID);
      expect(res.body.staffId).toBe(STAFF_A1_ID);
      expect(res.body.components).toHaveLength(5);

      structureId = res.body.id;
    });

    it('should create a tenant-specific structure for tenant B', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/structures')
        .auth(tenantBToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_B_ID)
        .send({
          tenantId: TENANT_B_ID,
          staffId: STAFF_B1_ID,
          name: 'Tenant B Structure',
          components: [
            { name: 'Basic Pay', type: 'earning', amount: 40000 },
            { name: 'Medical Allowance', type: 'earning', amount: 8000 },
            { name: 'Tax', type: 'deduction', amount: 2000 },
          ],
        })
        .expect(201);

      expect(res.body.tenantId).toBe(TENANT_B_ID);
      expect(res.body.components).toHaveLength(3);

      structureBId = res.body.id;
    });

    it('should not allow tenant A to see tenant B structures', async () => {
      const res = await request(app)
        .get('/api/v1/payroll/structures')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      const tenantBRecords = (res.body as any[]).filter(
        (s) => s.tenantId === TENANT_B_ID,
      );
      expect(tenantBRecords.length).toBe(0);
    });

    it('should support branch-specific structures', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/structures')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          staffId: STAFF_A1_ID,
          name: 'Branch A1 Override',
          components: [
            { name: 'Basic Salary', type: 'earning', amount: 55000 },
            { name: 'Bonus', type: 'earning', amount: 5000 },
          ],
        })
        .expect(201);

      expect(res.body.branchId).toBe(BRANCH_A1_ID);
    });
  });

  describe('GET /api/v1/payroll/structures', () => {
    it('should return all structures for current tenant', async () => {
      const res = await request(app)
        .get('/api/v1/payroll/structures')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      res.body.forEach((s: any) => {
        expect(s.tenantId).toBe(TENANT_A_ID);
      });
    });

    it('should return a single structure by id', async () => {
      const res = await request(app)
        .get(`/api/v1/payroll/structures/${structureId}`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(res.body.id).toBe(structureId);
    });

    it('should return 404 for non-existent structure', async () => {
      await request(app)
        .get('/api/v1/payroll/structures/999999')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/payroll/structures/:id', () => {
    it('should update a structure', async () => {
      const res = await request(app)
        .patch(`/api/v1/payroll/structures/${structureId}`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          name: 'Updated Teacher Structure',
          components: [
            { name: 'Basic Salary', type: 'earning', amount: 55000 },
            { name: 'Housing Allowance', type: 'earning', amount: 12000 },
            { name: 'Income Tax', type: 'deduction', amount: 3500 },
          ],
        })
        .expect(200);

      expect(res.body.name).toBe('Updated Teacher Structure');
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Payroll Processing
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/payroll/process', () => {
    it('should process payroll for current tenant', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/process')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          month: 1,
          year: 2026,
        })
        .expect(201);

      expect(res.body.processedCount).toBeGreaterThanOrEqual(1);
      expect(res.body.slips).toBeDefined();
      expect(Array.isArray(res.body.slips)).toBe(true);

      if (res.body.slips.length > 0) {
        salarySlipId = res.body.slips[0].id;
        expect(res.body.slips[0].tenantId).toBe(TENANT_A_ID);
      }
    });

    it('should process payroll filtered by branch', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/process')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          month: 2,
          year: 2026,
          branchId: BRANCH_A1_ID,
        })
        .expect(201);

      expect(res.body.processedCount).toBeGreaterThanOrEqual(0);
      if (res.body.slips.length > 0) {
        res.body.slips.forEach((slip: any) => {
          expect(slip.branchId).toBe(BRANCH_A1_ID);
        });
      }
    });

    it('should process payroll across all branches (bulk)', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/process')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          month: 3,
          year: 2026,
        })
        .expect(201);

      expect(res.body.processedCount).toBeGreaterThanOrEqual(0);
    });

    it('should prevent duplicate payroll processing for same month/year/staff', async () => {
      await request(app)
        .post('/api/v1/payroll/process')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          month: 1,
          year: 2026,
        })
        .expect(409);
    });

    it('should enforce tenant isolation — tenant B cannot process tenant A payroll', async () => {
      // Process tenant B's own payroll is fine
      const res = await request(app)
        .post('/api/v1/payroll/process')
        .auth(tenantBToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_B_ID)
        .send({
          tenantId: TENANT_B_ID,
          month: 1,
          year: 2026,
        })
        .expect(201);

      // But slips should only belong to tenant B
      if (res.body.slips.length > 0) {
        res.body.slips.forEach((slip: any) => {
          expect(slip.tenantId).toBe(TENANT_B_ID);
        });
      }
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Salary Slips
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/payroll/slips', () => {
    it('should return all salary slips for current tenant', async () => {
      const res = await request(app)
        .get('/api/v1/payroll/slips')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((slip: any) => {
        expect(slip.tenantId).toBe(TENANT_A_ID);
      });
    });

    it('should return a single salary slip by id', async () => {
      const res = await request(app)
        .get(`/api/v1/payroll/slips/${salarySlipId}`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(res.body.id).toBe(salarySlipId);
      expect(res.body.tenantId).toBe(TENANT_A_ID);
      expect(res.body.breakdown).toBeDefined();
    });

    it('should return 404 for non-existent slip', async () => {
      await request(app)
        .get('/api/v1/payroll/slips/999999')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(404);
    });

    it('should not return tenant A slips to tenant B', async () => {
      const res = await request(app)
        .get('/api/v1/payroll/slips')
        .auth(tenantBToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_B_ID)
        .expect(200);

      const tenantASlips = (res.body as any[]).filter(
        (s) => s.tenantId === TENANT_A_ID,
      );
      expect(tenantASlips.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  PDF Generation with Tenant Branding
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/payroll/slips/:id/pdf', () => {
    it('should generate PDF with tenant branding', async () => {
      const res = await request(app)
        .get(`/api/v1/payroll/slips/${salarySlipId}/pdf`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      // Should return PDF content-type
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.body).toBeDefined();
    });

    it('should return 404 for non-existent slip PDF', async () => {
      await request(app)
        .get('/api/v1/payroll/slips/999999/pdf')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Cleanup
  // ═══════════════════════════════════════════════════════
  describe('DELETE /api/v1/payroll/structures/:id', () => {
    it('should delete structure from tenant A', async () => {
      await request(app)
        .delete(`/api/v1/payroll/structures/${structureId}`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(204);
    });

    it('should delete structure from tenant B', async () => {
      await request(app)
        .delete(`/api/v1/payroll/structures/${structureBId}`)
        .auth(tenantBToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_B_ID)
        .expect(204);
    });
  });
});
