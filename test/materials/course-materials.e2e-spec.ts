import request from 'supertest';
import {
  APP_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  TESTER_EMAIL,
  TESTER_PASSWORD,
} from '../utils/constants';

describe('Course Materials Management (E2E)', () => {
  const app = APP_URL;
  let adminTokenTenantA: string;
  let adminTokenTenantB: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userToken: string;
  let tenantAId: string;
  let tenantBId: string;
  let branchAId: string;
  let testSubjectId: number;
  let testInstitutionId: number;
  let testDepartmentId: number;

  // Created resource IDs for cleanup
  let createdMaterialId: number;
  let createdBranchMaterialId: number;
  let createdTenantWideMaterialId: number;
  let createdAssignmentId: number;
  let createdSubmissionId: number;

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

    // ── Create Tenant A ──
    const tenantARes = await request(app)
      .post('/api/v1/tenants')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({
        name: `E2E Materials Tenant A ${Date.now()}`,
        slug: `e2e-mat-a-${Date.now()}`,
        contactEmail: `mat-a-${Date.now()}@test.com`,
        isActive: true,
      });
    tenantAId = tenantARes.body.id;

    // ── Create Tenant B ──
    const tenantBRes = await request(app)
      .post('/api/v1/tenants')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({
        name: `E2E Materials Tenant B ${Date.now()}`,
        slug: `e2e-mat-b-${Date.now()}`,
        contactEmail: `mat-b-${Date.now()}@test.com`,
        isActive: true,
      });
    tenantBId = tenantBRes.body.id;

    // ── Create Branch for Tenant A ──
    const branchRes = await request(app)
      .post('/api/v1/branches')
      .auth(baseAdminToken, { type: 'bearer' })
      .set('X-Tenant-ID', tenantAId)
      .send({
        name: 'Materials Test Branch',
        code: `MAT-BR-${Date.now()}`,
        isActive: true,
      });
    branchAId = branchRes.body.id;

    // ── Select Tenant A for admin ──
    const selectA = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({ tenantId: tenantAId });
    adminTokenTenantA = selectA.body.token || baseAdminToken;
    // Fallback: use header-based tenant resolution
    if (!selectA.body.token) {
      adminTokenTenantA = baseAdminToken;
    }

    // ── Select Tenant B for comparison ──
    const selectB = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({ tenantId: tenantBId });
    adminTokenTenantB = selectB.body.token || baseAdminToken;

    // ── Create test institution for Tenant A ──
    const instRes = await request(app)
      .post('/api/v1/lms/institutions')
      .auth(adminTokenTenantA, { type: 'bearer' })
      .set('X-Tenant-ID', tenantAId)
      .send({
        name: `E2E Mat Institution ${Date.now()}`,
        address: '123 Material St',
        phone: '+1555000200',
        email: `mat-inst-${Date.now()}@test.com`,
      });
    testInstitutionId = instRes.body.id;

    // ── Create test department ──
    const deptRes = await request(app)
      .post('/api/v1/lms/departments')
      .auth(adminTokenTenantA, { type: 'bearer' })
      .set('X-Tenant-ID', tenantAId)
      .send({
        institutionId: testInstitutionId,
        name: 'Materials Test Dept',
        code: `MTD-${Date.now()}`,
      });
    testDepartmentId = deptRes.body.id;

    // ── Create test subject ──
    const subjRes = await request(app)
      .post('/api/v1/lms/subjects')
      .auth(adminTokenTenantA, { type: 'bearer' })
      .set('X-Tenant-ID', tenantAId)
      .send({
        departmentId: testDepartmentId,
        name: 'Materials Test Subject',
        code: `MTS-${Date.now()}`,
      });
    testSubjectId = subjRes.body.id;
  });

  afterAll(async () => {
    // Cleanup created resources (in reverse order)
    const token = adminTokenTenantA;
    const headers = { 'X-Tenant-ID': tenantAId };

    if (createdSubmissionId) {
      await request(app)
        .delete(`/api/v1/materials/submissions/${createdSubmissionId}`)
        .auth(token, { type: 'bearer' })
        .set(headers);
    }
    if (createdAssignmentId) {
      await request(app)
        .delete(`/api/v1/materials/assignments/${createdAssignmentId}`)
        .auth(token, { type: 'bearer' })
        .set(headers);
    }
    if (createdMaterialId) {
      await request(app)
        .delete(`/api/v1/materials/${createdMaterialId}`)
        .auth(token, { type: 'bearer' })
        .set(headers);
    }
    if (createdBranchMaterialId) {
      await request(app)
        .delete(`/api/v1/materials/${createdBranchMaterialId}`)
        .auth(token, { type: 'bearer' })
        .set(headers);
    }
    if (createdTenantWideMaterialId) {
      await request(app)
        .delete(`/api/v1/materials/${createdTenantWideMaterialId}`)
        .auth(token, { type: 'bearer' })
        .set(headers);
    }
    if (testSubjectId) {
      await request(app)
        .delete(`/api/v1/lms/subjects/${testSubjectId}`)
        .auth(token, { type: 'bearer' })
        .set(headers);
    }
    if (testDepartmentId) {
      await request(app)
        .delete(`/api/v1/lms/departments/${testDepartmentId}`)
        .auth(token, { type: 'bearer' })
        .set(headers);
    }
    if (testInstitutionId) {
      await request(app)
        .delete(`/api/v1/lms/institutions/${testInstitutionId}`)
        .auth(token, { type: 'bearer' })
        .set(headers);
    }
  });

  // ═══════════════════════════════════════════════════════
  //  POST /api/v1/materials — Upload materials
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/materials', () => {
    it('should upload a material for the current tenant', async () => {
      const res = await request(app)
        .post('/api/v1/materials')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          subjectId: testSubjectId,
          title: 'Algebra Chapter 1 Notes',
          description: 'Introduction to algebra',
          type: 'document',
          filePath: `${tenantAId}/materials/algebra-ch1.pdf`,
          fileSize: 1024000,
          externalUrl: null,
          isActive: true,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.tenantId).toBe(tenantAId);
      expect(res.body.title).toBe('Algebra Chapter 1 Notes');
      expect(res.body.filePath).toContain(tenantAId);
      createdMaterialId = res.body.id;
    });

    it('should store file in tenant-specific S3 folder (tenant_id/materials/)', async () => {
      const res = await request(app)
        .post('/api/v1/materials')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          subjectId: testSubjectId,
          title: 'Geometry Notes',
          type: 'document',
          filePath: `${tenantAId}/materials/geometry-notes.pdf`,
          fileSize: 512000,
          isActive: true,
        })
        .expect(201);

      expect(res.body.filePath).toMatch(new RegExp(`^${tenantAId}/materials/`));
      createdTenantWideMaterialId = res.body.id;
    });

    it('should create branch-specific material when branch_id is set', async () => {
      const res = await request(app)
        .post('/api/v1/materials')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchAId)
        .send({
          subjectId: testSubjectId,
          title: 'Branch Specific Lab Manual',
          type: 'document',
          filePath: `${tenantAId}/materials/lab-manual.pdf`,
          fileSize: 2048000,
          branchId: branchAId,
          isActive: true,
        })
        .expect(201);

      expect(res.body.branchId).toBe(branchAId);
      createdBranchMaterialId = res.body.id;
    });

    it('should create tenant-wide material when branch_id is null', async () => {
      expect(createdTenantWideMaterialId).toBeDefined();
      const res = await request(app)
        .get(`/api/v1/materials/${createdTenantWideMaterialId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body.branchId).toBeNull();
    });

    it('should enforce tenant isolation — tenant A cannot see tenant B data', async () => {
      // Create a material under Tenant B
      const tenantBMaterial = await request(app)
        .post('/api/v1/materials')
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .send({
          subjectId: testSubjectId,
          title: 'Tenant B Private Material',
          type: 'document',
          filePath: `${tenantBId}/materials/private-doc.pdf`,
          fileSize: 100000,
          isActive: true,
        });

      const tenantBMaterialId = tenantBMaterial.body.id;

      // Tenant A should NOT be able to access Tenant B's material
      if (tenantBMaterialId) {
        await request(app)
          .get(`/api/v1/materials/${tenantBMaterialId}`)
          .auth(adminTokenTenantA, { type: 'bearer' })
          .set('X-Tenant-ID', tenantAId)
          .expect(404);
      }
    });

    it('should reject upload if tenant storage quota is exceeded', async () => {
      // Attempt to upload a very large file exceeding quota
      const res = await request(app)
        .post('/api/v1/materials')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          subjectId: testSubjectId,
          title: 'Massive File',
          type: 'video',
          filePath: `${tenantAId}/materials/huge-video.mp4`,
          fileSize: 99999999999, // ~100 GB — exceeds typical 10 GB quota
          isActive: true,
        })
        .expect(400);

      expect(res.body.message).toContain('quota');
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/materials — List materials
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/materials', () => {
    it('should list materials for the current tenant only', async () => {
      const res = await request(app)
        .get('/api/v1/materials')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((material: any) => {
        expect(material.tenantId).toBe(tenantAId);
      });
    });

    it('should filter by branch when X-Branch-ID header is set', async () => {
      const res = await request(app)
        .get('/api/v1/materials')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      // Should include branch-specific AND tenant-wide (branchId=null) materials
      res.body.forEach((material: any) => {
        expect(
          material.branchId === branchAId || material.branchId === null,
        ).toBe(true);
      });
    });

    it('should support filtering by subject', async () => {
      const res = await request(app)
        .get(`/api/v1/materials?subjectId=${testSubjectId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((material: any) => {
        expect(material.subjectId).toBe(testSubjectId);
      });
    });

    it('should support filtering by type', async () => {
      const res = await request(app)
        .get('/api/v1/materials?type=document')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((material: any) => {
        expect(material.type).toBe('document');
      });
    });

    it('should support search by title', async () => {
      const res = await request(app)
        .get('/api/v1/materials?search=Algebra')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(
          res.body.some((m: any) => m.title.toLowerCase().includes('algebra')),
        ).toBe(true);
      }
    });

    it('should verify tenant isolation — tenant B list does NOT include tenant A materials', async () => {
      const res = await request(app)
        .get('/api/v1/materials')
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .expect(200);

      res.body.forEach((material: any) => {
        expect(material.tenantId).not.toBe(tenantAId);
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/materials/:id — Get single material
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/materials/:id', () => {
    it('should retrieve a material by ID for the current tenant', async () => {
      const res = await request(app)
        .get(`/api/v1/materials/${createdMaterialId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body.id).toBe(createdMaterialId);
      expect(res.body.tenantId).toBe(tenantAId);
    });

    it('should return 404 for material from different tenant', async () => {
      await request(app)
        .get(`/api/v1/materials/${createdMaterialId}`)
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/materials/:id/download — Download tracking
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/materials/:id/download', () => {
    it('should track download for the current tenant', async () => {
      const res = await request(app)
        .get(`/api/v1/materials/${createdMaterialId}/download`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body.filePath).toBeDefined();
      expect(res.body.downloadCount).toBeGreaterThanOrEqual(1);
    });

    it('should not allow downloading material from another tenant', async () => {
      await request(app)
        .get(`/api/v1/materials/${createdMaterialId}/download`)
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .expect(404);
    });

    it('should increment download count on each download', async () => {
      // First download
      const res1 = await request(app)
        .get(`/api/v1/materials/${createdMaterialId}/download`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      const count1 = res1.body.downloadCount;

      // Second download
      const res2 = await request(app)
        .get(`/api/v1/materials/${createdMaterialId}/download`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res2.body.downloadCount).toBe(count1 + 1);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  POST /api/v1/materials/assignments — Create assignment
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/materials/assignments', () => {
    it('should create an assignment for the current tenant', async () => {
      const res = await request(app)
        .post('/api/v1/materials/assignments')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          subjectId: testSubjectId,
          title: 'Algebra Homework 1',
          description: 'Solve exercises 1-20',
          dueDate: '2026-03-15T23:59:59Z',
          totalMarks: 100,
          isActive: true,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.tenantId).toBe(tenantAId);
      expect(res.body.title).toBe('Algebra Homework 1');
      createdAssignmentId = res.body.id;
    });

    it('should create branch-specific assignment', async () => {
      const res = await request(app)
        .post('/api/v1/materials/assignments')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchAId)
        .send({
          subjectId: testSubjectId,
          title: 'Branch-Specific Lab Assignment',
          description: 'Lab exercise for branch',
          dueDate: '2026-03-20T23:59:59Z',
          totalMarks: 50,
          branchId: branchAId,
          isActive: true,
        })
        .expect(201);

      expect(res.body.branchId).toBe(branchAId);
    });

    it('should enforce tenant isolation on assignments', async () => {
      const res = await request(app)
        .get('/api/v1/materials/assignments')
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .expect(200);

      res.body.forEach((assignment: any) => {
        expect(assignment.tenantId).not.toBe(tenantAId);
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  POST /api/v1/materials/assignments/:id/submit — Submit assignment
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/materials/assignments/:id/submit', () => {
    it('should submit to current tenant assignment', async () => {
      const res = await request(app)
        .post(`/api/v1/materials/assignments/${createdAssignmentId}/submit`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          studentId: 1,
          filePath: `${tenantAId}/submissions/homework1-solution.pdf`,
          fileSize: 256000,
          remarks: 'Completed all exercises',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.tenantId).toBe(tenantAId);
      expect(res.body.assignmentId).toBe(createdAssignmentId);
      expect(res.body.filePath).toContain(tenantAId);
      createdSubmissionId = res.body.id;
    });

    it('should store submission in tenant-specific folder', async () => {
      const res = await request(app)
        .get(`/api/v1/materials/submissions/${createdSubmissionId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body.filePath).toMatch(
        new RegExp(`^${tenantAId}/submissions/`),
      );
    });

    it('should not allow submitting to another tenant assignment', async () => {
      await request(app)
        .post(`/api/v1/materials/assignments/${createdAssignmentId}/submit`)
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .send({
          studentId: 1,
          filePath: `${tenantBId}/submissions/hack-attempt.pdf`,
          fileSize: 1000,
        })
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/materials/quota — Storage quota
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/materials/quota', () => {
    it('should return current tenant storage quota information', async () => {
      const res = await request(app)
        .get('/api/v1/materials/quota')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body.tenantId).toBe(tenantAId);
      expect(res.body.quotaBytes).toBeDefined();
      expect(res.body.usedBytes).toBeDefined();
      expect(res.body.availableBytes).toBeDefined();
      expect(typeof res.body.quotaBytes).toBe('number');
      expect(typeof res.body.usedBytes).toBe('number');
      expect(res.body.availableBytes).toBe(
        res.body.quotaBytes - res.body.usedBytes,
      );
    });

    it('should reflect accurate used storage after uploads', async () => {
      const res = await request(app)
        .get('/api/v1/materials/quota')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(res.body.usedBytes).toBeGreaterThan(0);
    });

    it('should return separate quota per tenant', async () => {
      const resA = await request(app)
        .get('/api/v1/materials/quota')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      const resB = await request(app)
        .get('/api/v1/materials/quota')
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .expect(200);

      expect(resA.body.tenantId).toBe(tenantAId);
      expect(resB.body.tenantId).toBe(tenantBId);
      // Tenant A should have used storage, Tenant B may have less or different
      expect(resA.body.usedBytes).not.toBe(resB.body.usedBytes);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  PATCH /api/v1/materials/:id — Update material (version control)
  // ═══════════════════════════════════════════════════════
  describe('PATCH /api/v1/materials/:id', () => {
    it('should update material and increment version', async () => {
      const res = await request(app)
        .patch(`/api/v1/materials/${createdMaterialId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          title: 'Algebra Chapter 1 Notes (Revised)',
          filePath: `${tenantAId}/materials/algebra-ch1-v2.pdf`,
          fileSize: 1100000,
        })
        .expect(200);

      expect(res.body.title).toBe('Algebra Chapter 1 Notes (Revised)');
      expect(res.body.version).toBeGreaterThanOrEqual(2);
    });

    it('should not allow updating material from another tenant', async () => {
      await request(app)
        .patch(`/api/v1/materials/${createdMaterialId}`)
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .send({ title: 'Hijacked Title' })
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  DELETE /api/v1/materials/:id — Soft delete
  // ═══════════════════════════════════════════════════════
  describe('DELETE /api/v1/materials/:id', () => {
    it('should not allow deleting material from another tenant', async () => {
      await request(app)
        .delete(`/api/v1/materials/${createdMaterialId}`)
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .expect(404);
    });

    it('should soft-delete material for the current tenant', async () => {
      // Create a disposable material
      const createRes = await request(app)
        .post('/api/v1/materials')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({
          subjectId: testSubjectId,
          title: 'To Be Deleted',
          type: 'document',
          filePath: `${tenantAId}/materials/delete-me.pdf`,
          fileSize: 1000,
          isActive: true,
        })
        .expect(201);

      await request(app)
        .delete(`/api/v1/materials/${createRes.body.id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(204);

      // Verify it's gone from listing
      await request(app)
        .get(`/api/v1/materials/${createRes.body.id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(404);
    });
  });
});
