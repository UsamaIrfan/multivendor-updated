import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

/**
 * Staff Management E2E Tests
 *
 * Covers:
 * - Staff CRUD with tenant-scoped staff ID generation
 * - Multi-branch assignment
 * - Branch-specific roles
 * - Branch transfer within same tenant
 * - Tenant isolation
 * - Staff view own branch assignments
 */
describe('Staff Management (e2e)', () => {
  const app = APP_URL;
  let apiToken: string;
  let tenantAToken: string;
  let tenantBToken: string;

  // IDs captured during tests
  let staffId: number;
  let staffStaffId: string; // auto-generated format: SLUG-STF-YYYY-XXXX
  let assignmentId: number;

  // Assumed tenant / branch UUIDs (seeded)
  const TENANT_A_ID = '00000000-0000-0000-0000-000000000001';
  const TENANT_B_ID = '00000000-0000-0000-0000-000000000002';
  const BRANCH_A1_ID = '00000000-0000-0000-0000-0000000000a1';
  const BRANCH_A2_ID = '00000000-0000-0000-0000-0000000000a2';
  const BRANCH_B1_ID = '00000000-0000-0000-0000-0000000000b1';

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
  //  Staff CRUD
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/staff-management', () => {
    it('should create staff in current tenant with auto-generated staff ID', async () => {
      const res = await request(app)
        .post('/api/v1/staff-management')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          userId: 1,
          institutionId: 1,
          designation: 'Senior Teacher',
          qualification: 'M.Ed',
          employmentType: 'full_time',
          basicSalary: 50000,
          roles: ['teacher', 'coordinator'],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.staffId).toBeDefined();
      // Staff ID should match format: <slug>-STF-<YYYY>-<XXXX>
      expect(res.body.staffId).toMatch(/^.+-STF-\d{4}-\d{4}$/);
      expect(res.body.tenantId).toBe(TENANT_A_ID);

      staffId = res.body.id;
      staffStaffId = res.body.staffId;
    });

    it('should auto-assign to current branch on creation', async () => {
      const res = await request(app)
        .get(`/api/v1/staff-management/${staffId}/branches`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].branchId).toBe(BRANCH_A1_ID);
      expect(res.body[0].isPrimary).toBe(true);
    });

    it('should create second staff and auto-increment sequence', async () => {
      const res = await request(app)
        .post('/api/v1/staff-management')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          userId: 2,
          institutionId: 1,
          designation: 'Teacher',
          employmentType: 'full_time',
          basicSalary: 40000,
          roles: ['teacher'],
        })
        .expect(201);

      // Should have incremented sequence
      const seq1 = parseInt(staffStaffId.split('-').pop()!);
      const seq2 = parseInt(res.body.staffId.split('-').pop()!);
      expect(seq2).toBe(seq1 + 1);
    });

    it('should enforce tenant isolation — tenant B cannot see tenant A staff', async () => {
      const res = await request(app)
        .get('/api/v1/staff-management')
        .auth(tenantBToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_B_ID)
        .expect(200);

      const tenantAStaff = res.body.filter(
        (s: any) => s.tenantId === TENANT_A_ID,
      );
      expect(tenantAStaff.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Multi-Branch Assignment
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/staff-management/:id/branches', () => {
    it('should assign staff to additional branch within same tenant', async () => {
      const res = await request(app)
        .post(`/api/v1/staff-management/${staffId}/branches`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A2_ID,
          roles: ['department_head'],
          isPrimary: false,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.branchId).toBe(BRANCH_A2_ID);
      expect(res.body.isPrimary).toBe(false);
      assignmentId = res.body.id;
    });

    it('should list multiple branch assignments', async () => {
      const res = await request(app)
        .get(`/api/v1/staff-management/${staffId}/branches`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(2);
      const branchIds = res.body.map((a: any) => a.branchId);
      expect(branchIds).toContain(BRANCH_A1_ID);
      expect(branchIds).toContain(BRANCH_A2_ID);
    });

    it('should reject assignment to different tenant branch', async () => {
      await request(app)
        .post(`/api/v1/staff-management/${staffId}/branches`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_B1_ID, // belongs to tenant B
          roles: ['teacher'],
          isPrimary: false,
        })
        .expect(400);
    });

    it('should set branch-specific roles', async () => {
      const res = await request(app)
        .get(`/api/v1/staff-management/${staffId}/branches`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      const a1Assignment = res.body.find(
        (a: any) => a.branchId === BRANCH_A1_ID,
      );
      const a2Assignment = res.body.find(
        (a: any) => a.branchId === BRANCH_A2_ID,
      );

      expect(a1Assignment.roles).toEqual(
        expect.arrayContaining(['teacher', 'coordinator']),
      );
      expect(a2Assignment.roles).toEqual(
        expect.arrayContaining(['department_head']),
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET Staff listing
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/staff-management', () => {
    it('should list staff of current tenant only', async () => {
      const res = await request(app)
        .get('/api/v1/staff-management')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((s: any) => {
        expect(s.tenantId).toBe(TENANT_A_ID);
      });
    });

    it('should filter staff by branch', async () => {
      const res = await request(app)
        .get('/api/v1/staff-management')
        .query({ branchId: BRANCH_A2_ID })
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // Staff assigned to branch A2 should appear
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should include multi-branch assignments in staff detail', async () => {
      const res = await request(app)
        .get(`/api/v1/staff-management/${staffId}`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(res.body.id).toBe(staffId);
      expect(res.body.branchAssignments).toBeDefined();
      expect(res.body.branchAssignments.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Branch Transfer
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/staff-management/:id/transfer-branch', () => {
    it('should transfer primary branch from A1 to A2 within same tenant', async () => {
      const res = await request(app)
        .post(`/api/v1/staff-management/${staffId}/transfer-branch`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          fromBranchId: BRANCH_A1_ID,
          toBranchId: BRANCH_A2_ID,
        })
        .expect(200);

      expect(res.body.primaryBranchId).toBe(BRANCH_A2_ID);
    });

    it('should update primary flag on branch assignments', async () => {
      const res = await request(app)
        .get(`/api/v1/staff-management/${staffId}/branches`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      const a1 = res.body.find((a: any) => a.branchId === BRANCH_A1_ID);
      const a2 = res.body.find((a: any) => a.branchId === BRANCH_A2_ID);

      expect(a1.isPrimary).toBe(false);
      expect(a2.isPrimary).toBe(true);
    });

    it('should reject transfer to different tenant branch', async () => {
      await request(app)
        .post(`/api/v1/staff-management/${staffId}/transfer-branch`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({
          tenantId: TENANT_A_ID,
          fromBranchId: BRANCH_A2_ID,
          toBranchId: BRANCH_B1_ID,
        })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Staff Branches (self view)
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/staff-management/my-branches', () => {
    it('should return 200 with branch assignments for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/staff-management/my-branches')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Update & Delete Staff
  // ═══════════════════════════════════════════════════════
  describe('PATCH /api/v1/staff-management/:id', () => {
    it('should update staff fields', async () => {
      const res = await request(app)
        .patch(`/api/v1/staff-management/${staffId}`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({ designation: 'Vice Principal' })
        .expect(200);

      expect(res.body.designation).toBe('Vice Principal');
    });
  });

  describe('DELETE /api/v1/staff-management/:id', () => {
    it('should soft-delete staff', async () => {
      await request(app)
        .delete(`/api/v1/staff-management/${staffId}`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(204);
    });

    it('should return 404 after deletion', async () => {
      await request(app)
        .get(`/api/v1/staff-management/${staffId}`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Delete Branch Assignment
  // ═══════════════════════════════════════════════════════
  describe('DELETE /api/v1/staff-management/branch-assignments/:id', () => {
    it('should remove a branch assignment', async () => {
      if (assignmentId) {
        await request(app)
          .delete(`/api/v1/staff-management/branch-assignments/${assignmentId}`)
          .auth(tenantAToken, { type: 'bearer' })
          .set('X-Tenant-ID', TENANT_A_ID)
          .expect(204);
      }
    });
  });
});
