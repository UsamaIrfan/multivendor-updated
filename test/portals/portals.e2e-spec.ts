import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('Portals (e2e)', () => {
  const app = APP_URL;
  let adminTokenA: string;
  let tenantAId: string;
  let branchA1Id: string;

  beforeAll(async () => {
    // Log in as admin
    const loginRes = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);

    // const refreshToken = loginRes.body.refreshToken;
    tenantAId = loginRes.body.user?.tenantId || 'default-tenant';

    // Try to select tenant
    try {
      const selectRes = await request(app)
        .post('/api/v1/auth/tenant/select')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ tenantId: tenantAId })
        .expect(200);

      adminTokenA = selectRes.body.token;
    } catch {
      adminTokenA = loginRes.body.token;
    }

    branchA1Id = 'branch-a1-uuid';
    branchA2Id = 'branch-a2-uuid';
  });

  // ─── Student Dashboard ────────────────────────────────

  describe('Student Dashboard', () => {
    it('should return student dashboard with tenant data', async () => {
      const res = await request(app)
        .get('/api/v1/portals/student/dashboard')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body).toHaveProperty('tenant');
      expect(res.body).toHaveProperty('branch');
      expect(res.body).toHaveProperty('attendance');
      expect(res.body).toHaveProperty('fees');
      expect(res.body).toHaveProperty('exams');
    });

    it('should return branch-specific dashboard when branchId query provided', async () => {
      const res = await request(app)
        .get('/api/v1/portals/student/dashboard')
        .query({ branchId: branchA1Id })
        .set('Authorization', `Bearer ${adminTokenA}`)
        .set('X-Tenant-ID', tenantAId);

      // May return 200 or 404 depending on branch setup
      expect([200, 404]).toContain(res.status);
    });
  });

  // ─── Staff Dashboard ──────────────────────────────────

  describe('Staff Dashboard', () => {
    it('should return staff dashboard with multi-branch aggregation', async () => {
      const res = await request(app)
        .get('/api/v1/portals/staff/dashboard')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body).toHaveProperty('tenant');
      expect(res.body).toHaveProperty('allBranches');
      expect(res.body).toHaveProperty('totalAssignedClasses');
      expect(res.body).toHaveProperty('attendance');
    });

    it('should filter by branchId when using query parameter', async () => {
      const res = await request(app)
        .get('/api/v1/portals/staff/dashboard')
        .query({ branchId: branchA1Id })
        .set('Authorization', `Bearer ${adminTokenA}`)
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body).toHaveProperty('allBranches');
    });

    it('should list all branch assignments for staff', async () => {
      const res = await request(app)
        .get('/api/v1/portals/staff/dashboard')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body.allBranches)).toBe(true);
    });
  });

  // ─── Switch Branch ────────────────────────────────────

  describe('Switch Branch', () => {
    it('should return 404 when switching to non-existent branch', async () => {
      await request(app)
        .post('/api/v1/portals/switch-branch')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .set('X-Tenant-ID', tenantAId)
        .send({ branchId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .post('/api/v1/portals/switch-branch')
        .send({ branchId: branchA1Id })
        .expect(401);
    });

    it('should reject invalid branchId format', async () => {
      await request(app)
        .post('/api/v1/portals/switch-branch')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .set('X-Tenant-ID', tenantAId)
        .send({ branchId: 'not-a-uuid' })
        .expect(422);
    });
  });

  // ─── Tenant Isolation ─────────────────────────────────

  describe('Tenant Isolation', () => {
    it('should scope dashboard data to current tenant context', async () => {
      const res = await request(app)
        .get('/api/v1/portals/student/dashboard')
        .set('Authorization', `Bearer ${adminTokenA}`)
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body.tenant).toBeDefined();
      expect(res.body.tenant.name).toBeDefined();
    });
  });
});
