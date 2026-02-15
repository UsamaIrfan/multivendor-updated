import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('Notices Management (E2E)', () => {
  const app = APP_URL;
  let adminTokenTenantA: string;
  let adminTokenTenantB: string;
  let tenantAId: string;
  let tenantBId: string;
  let branchA1Id: string;
  let branchA2Id: string;

  // Created resource IDs for cleanup
  const createdNoticeIds: string[] = [];

  beforeAll(async () => {
    // ── Login as admin ──
    const adminLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const baseAdminToken = adminLogin.body.token;

    // ── Create Tenant A ──
    const tenantARes = await request(app)
      .post('/api/v1/tenants')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({
        name: `E2E Notices Tenant A ${Date.now()}`,
        slug: `e2e-notices-a-${Date.now()}`,
        contactEmail: `notices-a-${Date.now()}@test.com`,
        isActive: true,
      });
    tenantAId = tenantARes.body.id;

    // ── Create Tenant B ──
    const tenantBRes = await request(app)
      .post('/api/v1/tenants')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({
        name: `E2E Notices Tenant B ${Date.now()}`,
        slug: `e2e-notices-b-${Date.now()}`,
        contactEmail: `notices-b-${Date.now()}@test.com`,
        isActive: true,
      });
    tenantBId = tenantBRes.body.id;

    // ── Create Branch A1 for Tenant A ──
    const branchA1Res = await request(app)
      .post('/api/v1/branches')
      .auth(baseAdminToken, { type: 'bearer' })
      .set('X-Tenant-ID', tenantAId)
      .send({
        name: 'Notices Branch A1',
        code: `NB-A1-${Date.now()}`,
        isActive: true,
      });
    branchA1Id = branchA1Res.body.id;

    // ── Create Branch A2 for Tenant A ──
    const branchA2Res = await request(app)
      .post('/api/v1/branches')
      .auth(baseAdminToken, { type: 'bearer' })
      .set('X-Tenant-ID', tenantAId)
      .send({
        name: 'Notices Branch A2',
        code: `NB-A2-${Date.now()}`,
        isActive: true,
      });
    branchA2Id = branchA2Res.body.id;

    // ── Select Tenant A for admin ──
    const selectA = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({ tenantId: tenantAId });
    adminTokenTenantA = selectA.body.token || baseAdminToken;

    // ── Select Tenant B for comparison ──
    const selectB = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({ tenantId: tenantBId });
    adminTokenTenantB = selectB.body.token || baseAdminToken;
  });

  afterAll(async () => {
    // Cleanup created notices (in reverse order)
    for (const id of [...createdNoticeIds].reverse()) {
      await request(app)
        .delete(`/api/v1/notices/${id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId);
    }
  });

  // ═══════════════════════════════════════════════════════
  //  POST /api/v1/notices — Create notices
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/notices', () => {
    it('should create a notice for the current tenant', async () => {
      const res = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Annual Day Celebration',
          content: 'All students and staff are invited.',
          targetBranches: [],
          targetRoles: [],
          isPublished: true,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.tenantId).toBe(tenantAId);
      expect(res.body.title).toBe('Annual Day Celebration');
      expect(res.body.isPublished).toBe(true);
      createdNoticeIds.push(res.body.id);
    });

    it('should create a notice targeting all branches (empty targetBranches)', async () => {
      const res = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Tenant-Wide Holiday Notice',
          content: 'School will remain closed on Friday.',
          targetBranches: [],
          targetRoles: [],
          isPublished: true,
        })
        .expect(201);

      expect(res.body.targetBranches).toEqual([]);
      createdNoticeIds.push(res.body.id);
    });

    it('should create a notice targeting specific branches', async () => {
      const res = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Branch A1 PTM Announcement',
          content: 'Parent-Teacher Meeting on Monday.',
          targetBranches: [branchA1Id],
          targetRoles: ['parent'],
          isPublished: true,
        })
        .expect(201);

      expect(res.body.targetBranches).toContain(branchA1Id);
      expect(res.body.targetRoles).toContain('parent');
      createdNoticeIds.push(res.body.id);
    });

    it('should create a notice targeting specific user groups (students, staff, parents)', async () => {
      const res = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Fee Reminder',
          content: 'Fee is due by end of month.',
          targetBranches: [],
          targetRoles: ['student', 'parent'],
          isPublished: true,
        })
        .expect(201);

      expect(res.body.targetRoles).toEqual(
        expect.arrayContaining(['student', 'parent']),
      );
      createdNoticeIds.push(res.body.id);
    });

    it('should create a notice with attachments in tenant folder', async () => {
      const res = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Notice With Attachment',
          content: 'Please see attached document.',
          targetBranches: [],
          targetRoles: [],
          attachments: [
            `${tenantAId}/notices/holiday-schedule.pdf`,
            `${tenantAId}/notices/circular.pdf`,
          ],
          isPublished: true,
        })
        .expect(201);

      expect(res.body.attachments).toHaveLength(2);
      expect(res.body.attachments[0]).toContain(tenantAId);
      createdNoticeIds.push(res.body.id);
    });

    it('should create a notice with expiry date', async () => {
      const res = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Time-Limited Offer',
          content: 'Valid until end of month.',
          targetBranches: [],
          targetRoles: ['student'],
          isPublished: true,
          expiresAt: '2027-12-31',
        })
        .expect(201);

      expect(res.body.expiresAt).toBeDefined();
      createdNoticeIds.push(res.body.id);
    });

    it('should enforce tenant isolation — Tenant B notice not visible to Tenant A', async () => {
      // Create a notice under Tenant B
      const tenantBNotice = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .send({
          title: 'Tenant B Private Notice',
          content: 'This is private to Tenant B.',
          targetBranches: [],
          targetRoles: [],
          isPublished: true,
        });

      const tenantBNoticeId = tenantBNotice.body.id;

      // Tenant A should NOT be able to access Tenant B's notice
      if (tenantBNoticeId) {
        await request(app)
          .get(`/api/v1/notices/${tenantBNoticeId}`)
          .auth(adminTokenTenantA, { type: 'bearer' })
          .set('X-Tenant-ID', tenantAId)
          .expect(404);
      }
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/notices — List notices for current tenant
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/notices', () => {
    it('should list notices for the current tenant only', async () => {
      const res = await request(app)
        .get('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((notice: any) => {
        expect(notice.tenantId).toBe(tenantAId);
      });
    });

    it('should verify tenant isolation — Tenant B list does NOT include Tenant A notices', async () => {
      const res = await request(app)
        .get('/api/v1/notices')
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .expect(200);

      res.body.forEach((notice: any) => {
        expect(notice.tenantId).not.toBe(tenantAId);
      });
    });

    it('should return notices ordered by createdAt DESC', async () => {
      const res = await request(app)
        .get('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      if (res.body.length > 1) {
        for (let i = 0; i < res.body.length - 1; i++) {
          expect(
            new Date(res.body[i].createdAt).getTime(),
          ).toBeGreaterThanOrEqual(
            new Date(res.body[i + 1].createdAt).getTime(),
          );
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/notices/branch/:branchId — Filter by branch
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/notices/branch/:branchId', () => {
    it('should return tenant-wide + branch-specific notices for a given branch', async () => {
      const res = await request(app)
        .get(`/api/v1/notices/branch/${branchA1Id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // Should include tenant-wide notices (empty targetBranches)
      // and notices targeting branchA1
      res.body.forEach((notice: any) => {
        const targets = notice.targetBranches || [];
        const isTenantWide = targets.length === 0;
        const targetsBranchA1 = targets.includes(branchA1Id);
        expect(isTenantWide || targetsBranchA1).toBe(true);
      });
    });

    it('should NOT include notices targeted only at Branch A2 when querying Branch A1', async () => {
      // Create a notice targeting only Branch A2
      const branchA2Notice = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Branch A2 Only Notice',
          content: 'Only for Branch A2.',
          targetBranches: [branchA2Id],
          targetRoles: [],
          isPublished: true,
        })
        .expect(201);
      createdNoticeIds.push(branchA2Notice.body.id);

      // Query Branch A1 — should NOT see the Branch A2-only notice
      const res = await request(app)
        .get(`/api/v1/notices/branch/${branchA1Id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      const branchA2OnlyNoticeInResult = res.body.find(
        (n: any) => n.id === branchA2Notice.body.id,
      );
      expect(branchA2OnlyNoticeInResult).toBeUndefined();
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/notices/my-notices — User-scoped notices
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/notices/my-notices', () => {
    let publishedTenantWideId: string;
    let publishedBranch1OnlyId: string;
    let publishedStaffOnlyId: string;
    let unpublishedId: string;
    let expiredId: string;

    beforeAll(async () => {
      // Create various notices for my-notices testing
      const tenantWide = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'My-Notices: Tenant Wide',
          content: 'For everyone.',
          targetBranches: [],
          targetRoles: [],
          isPublished: true,
        });
      publishedTenantWideId = tenantWide.body.id;
      createdNoticeIds.push(publishedTenantWideId);

      const branch1Only = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'My-Notices: Branch A1 Only',
          content: 'For Branch A1 only.',
          targetBranches: [branchA1Id],
          targetRoles: [],
          isPublished: true,
        });
      publishedBranch1OnlyId = branch1Only.body.id;
      createdNoticeIds.push(publishedBranch1OnlyId);

      const staffOnly = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'My-Notices: Staff Only',
          content: 'For staff only.',
          targetBranches: [],
          targetRoles: ['staff'],
          isPublished: true,
        });
      publishedStaffOnlyId = staffOnly.body.id;
      createdNoticeIds.push(publishedStaffOnlyId);

      const unpublished = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'My-Notices: Unpublished',
          content: 'Draft notice.',
          targetBranches: [],
          targetRoles: [],
          isPublished: false,
        });
      unpublishedId = unpublished.body.id;
      createdNoticeIds.push(unpublishedId);

      const expired = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'My-Notices: Expired',
          content: 'Already expired.',
          targetBranches: [],
          targetRoles: [],
          isPublished: true,
          expiresAt: '2020-01-01',
        });
      expiredId = expired.body.id;
      createdNoticeIds.push(expiredId);
    });

    it('should return tenant-wide published notices for admin', async () => {
      const res = await request(app)
        .get('/api/v1/notices/my-notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const ids = res.body.map((n: any) => n.id);
      expect(ids).toContain(publishedTenantWideId);
    });

    it('should NOT return unpublished notices', async () => {
      const res = await request(app)
        .get('/api/v1/notices/my-notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      const ids = res.body.map((n: any) => n.id);
      expect(ids).not.toContain(unpublishedId);
    });

    it('should NOT return expired notices', async () => {
      const res = await request(app)
        .get('/api/v1/notices/my-notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      const ids = res.body.map((n: any) => n.id);
      expect(ids).not.toContain(expiredId);
    });

    it('should return branch-specific notices when user branches are provided', async () => {
      const res = await request(app)
        .get(`/api/v1/notices/my-notices?branches=${branchA1Id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      const ids = res.body.map((n: any) => n.id);
      expect(ids).toContain(publishedBranch1OnlyId);
    });

    it('should return notices for all assigned branches of multi-branch staff', async () => {
      // Create a notice for BranchA2
      const branchA2Notice = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'My-Notices: Branch A2 Staff',
          content: 'For Branch A2.',
          targetBranches: [branchA2Id],
          targetRoles: [],
          isPublished: true,
        });
      createdNoticeIds.push(branchA2Notice.body.id);

      // Query with both branches
      const res = await request(app)
        .get(`/api/v1/notices/my-notices?branches=${branchA1Id},${branchA2Id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      const ids = res.body.map((n: any) => n.id);
      // Should see both branch-specific notices
      expect(ids).toContain(publishedBranch1OnlyId);
      expect(ids).toContain(branchA2Notice.body.id);
      // And tenant-wide
      expect(ids).toContain(publishedTenantWideId);
    });

    it('should enforce tenant isolation — Tenant B my-notices does NOT include Tenant A notices', async () => {
      const res = await request(app)
        .get('/api/v1/notices/my-notices')
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .expect(200);

      res.body.forEach((notice: any) => {
        expect(notice.tenantId).not.toBe(tenantAId);
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  PATCH /api/v1/notices/:id — Update notice
  // ═══════════════════════════════════════════════════════
  describe('PATCH /api/v1/notices/:id', () => {
    it('should update a notice title', async () => {
      const noticeId = createdNoticeIds[0];
      const res = await request(app)
        .patch(`/api/v1/notices/${noticeId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({ title: 'Updated Annual Day Celebration' })
        .expect(200);

      expect(res.body.title).toBe('Updated Annual Day Celebration');
    });

    it('should update targetBranches', async () => {
      const noticeId = createdNoticeIds[0];
      const res = await request(app)
        .patch(`/api/v1/notices/${noticeId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({ targetBranches: [branchA1Id, branchA2Id] })
        .expect(200);

      expect(res.body.targetBranches).toEqual(
        expect.arrayContaining([branchA1Id, branchA2Id]),
      );
    });

    it('should update targetRoles', async () => {
      const noticeId = createdNoticeIds[0];
      const res = await request(app)
        .patch(`/api/v1/notices/${noticeId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({ targetRoles: ['student', 'parent'] })
        .expect(200);

      expect(res.body.targetRoles).toEqual(
        expect.arrayContaining(['student', 'parent']),
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  DELETE /api/v1/notices/:id — Remove notice
  // ═══════════════════════════════════════════════════════
  describe('DELETE /api/v1/notices/:id', () => {
    it('should soft-delete a notice', async () => {
      // Create a notice specifically for deletion
      const created = await request(app)
        .post('/api/v1/notices')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Notice To Delete',
          content: 'Will be deleted.',
          targetBranches: [],
          targetRoles: [],
          isPublished: false,
        })
        .expect(201);

      await request(app)
        .delete(`/api/v1/notices/${created.body.id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(204);

      // Verify it's no longer accessible
      await request(app)
        .get(`/api/v1/notices/${created.body.id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(404);
    });
  });
});
