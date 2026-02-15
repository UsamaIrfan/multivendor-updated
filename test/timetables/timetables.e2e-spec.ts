import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('Timetables Management (E2E)', () => {
  const app = APP_URL;
  let adminTokenTenantA: string;
  let adminTokenTenantB: string;
  let tenantAId: string;
  let tenantBId: string;
  let branchA1Id: string;
  let branchA2Id: string;
  let branchB1Id: string;
  const createdTimetableIds: string[] = [];
  const createdPeriodIds: string[] = [];

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const baseAdminToken = adminLogin.body.token;

    // Create Tenant A
    const tenantARes = await request(app)
      .post('/api/v1/tenants')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({
        name: `E2E Timetable Tenant A ${Date.now()}`,
        slug: `e2e-tt-a-${Date.now()}`,
        contactEmail: `tt-a-${Date.now()}@test.com`,
        isActive: true,
      });
    tenantAId = tenantARes.body.id;

    // Create Tenant B
    const tenantBRes = await request(app)
      .post('/api/v1/tenants')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({
        name: `E2E Timetable Tenant B ${Date.now()}`,
        slug: `e2e-tt-b-${Date.now()}`,
        contactEmail: `tt-b-${Date.now()}@test.com`,
        isActive: true,
      });
    tenantBId = tenantBRes.body.id;

    // Create Branches for Tenant A
    const branchA1Res = await request(app)
      .post('/api/v1/branches')
      .auth(baseAdminToken, { type: 'bearer' })
      .set('X-Tenant-ID', tenantAId)
      .send({
        name: 'TT Branch A1',
        code: `TT-A1-${Date.now()}`,
        isActive: true,
      });
    branchA1Id = branchA1Res.body.id;

    const branchA2Res = await request(app)
      .post('/api/v1/branches')
      .auth(baseAdminToken, { type: 'bearer' })
      .set('X-Tenant-ID', tenantAId)
      .send({
        name: 'TT Branch A2',
        code: `TT-A2-${Date.now()}`,
        isActive: true,
      });
    branchA2Id = branchA2Res.body.id;

    // Create Branch for Tenant B
    const branchB1Res = await request(app)
      .post('/api/v1/branches')
      .auth(baseAdminToken, { type: 'bearer' })
      .set('X-Tenant-ID', tenantBId)
      .send({
        name: 'TT Branch B1',
        code: `TT-B1-${Date.now()}`,
        isActive: true,
      });
    branchB1Id = branchB1Res.body.id;

    // Select tenants
    const selectA = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({ tenantId: tenantAId });
    adminTokenTenantA = selectA.body.token || baseAdminToken;

    const selectB = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(baseAdminToken, { type: 'bearer' })
      .send({ tenantId: tenantBId });
    adminTokenTenantB = selectB.body.token || baseAdminToken;
  });

  afterAll(async () => {
    // Clean up periods first, then timetables
    for (const id of [...createdPeriodIds].reverse()) {
      await request(app)
        .delete(`/api/v1/timetables/periods/${id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId);
    }
    for (const id of [...createdTimetableIds].reverse()) {
      await request(app)
        .delete(`/api/v1/timetables/${id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId);
    }
  });

  // ═══════════════════════════════════════════════════════
  //  POST /api/v1/timetables
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/timetables', () => {
    it('should create a timetable for a specific branch', async () => {
      const classId = '00000000-0000-4000-a000-000000000001';
      const academicYearId = '00000000-0000-4000-a000-000000000002';

      const res = await request(app)
        .post('/api/v1/timetables')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchA1Id)
        .send({
          tenantId: tenantAId,
          branchId: branchA1Id,
          classId,
          academicYearId,
          name: 'Class 10-A Timetable',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.branchId).toBe(branchA1Id);
      expect(res.body.name).toBe('Class 10-A Timetable');
      expect(res.body.isActive).toBe(true);
      createdTimetableIds.push(res.body.id);
    });

    it('should create a timetable for a different branch', async () => {
      const classId = '00000000-0000-4000-a000-000000000003';
      const academicYearId = '00000000-0000-4000-a000-000000000002';

      const res = await request(app)
        .post('/api/v1/timetables')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchA2Id)
        .send({
          tenantId: tenantAId,
          branchId: branchA2Id,
          classId,
          academicYearId,
          name: 'Branch A2 Schedule',
        })
        .expect(201);

      expect(res.body.branchId).toBe(branchA2Id);
      createdTimetableIds.push(res.body.id);
    });

    it('should enforce tenant isolation — Tenant B timetable not visible to Tenant A', async () => {
      const classId = '00000000-0000-4000-a000-000000000004';
      const academicYearId = '00000000-0000-4000-a000-000000000005';

      const res = await request(app)
        .post('/api/v1/timetables')
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId)
        .set('X-Branch-ID', branchB1Id)
        .send({
          tenantId: tenantBId,
          branchId: branchB1Id,
          classId,
          academicYearId,
          name: 'Tenant B Timetable',
        })
        .expect(201);

      const tenantBTtId = res.body.id;

      // Verify Tenant A cannot see it
      const listA = await request(app)
        .get('/api/v1/timetables')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      const foundInA = listA.body.find((tt: any) => tt.id === tenantBTtId);
      expect(foundInA).toBeUndefined();

      // Clean up Tenant B timetable
      await request(app)
        .delete(`/api/v1/timetables/${tenantBTtId}`)
        .auth(adminTokenTenantB, { type: 'bearer' })
        .set('X-Tenant-ID', tenantBId);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/timetables
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/timetables', () => {
    it('should list timetables for the current tenant', async () => {
      const res = await request(app)
        .get('/api/v1/timetables')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/timetables/branch/:branchId
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/timetables/branch/:branchId', () => {
    it('should return only timetables for the specified branch', async () => {
      const res = await request(app)
        .get(`/api/v1/timetables/branch/${branchA1Id}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      for (const tt of res.body) {
        expect(tt.branchId).toBe(branchA1Id);
      }
    });
  });

  // ═══════════════════════════════════════════════════════
  //  POST /api/v1/timetables/:id/periods
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/timetables/:id/periods', () => {
    const subjectId = '00000000-0000-4000-a000-000000000010';
    const teacherIdA1 = '00000000-0000-4000-a000-000000000020';
    const teacherIdA2 = '00000000-0000-4000-a000-000000000021';

    it('should add a period to a timetable', async () => {
      const ttId = createdTimetableIds[0];

      const res = await request(app)
        .post(`/api/v1/timetables/${ttId}/periods`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchA1Id)
        .send({
          timetableId: ttId,
          subjectId,
          teacherId: teacherIdA1,
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '08:45',
          room: 'Room 101',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.timetableId).toBe(ttId);
      expect(res.body.teacherId).toBe(teacherIdA1);
      expect(res.body.dayOfWeek).toBe(1);
      expect(res.body.room).toBe('Room 101');
      createdPeriodIds.push(res.body.id);
    });

    it('should detect teacher time conflict across branches', async () => {
      // Teacher already has a period at 08:00-08:45 on Monday in Branch A1
      // Now try to assign same teacher at overlapping time in Branch A2
      const ttId = createdTimetableIds[1]; // Branch A2 timetable

      const res = await request(app)
        .post(`/api/v1/timetables/${ttId}/periods`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchA2Id)
        .send({
          timetableId: ttId,
          subjectId,
          teacherId: teacherIdA1, // Same teacher
          dayOfWeek: 1, // Same day
          startTime: '08:15', // Overlapping time
          endTime: '09:00',
          room: 'Room 201',
        })
        .expect(409);

      expect(res.body.message).toContain('conflicting');
    });

    it('should allow teacher to teach at non-overlapping times in different branches', async () => {
      const ttId = createdTimetableIds[1]; // Branch A2 timetable

      const res = await request(app)
        .post(`/api/v1/timetables/${ttId}/periods`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchA2Id)
        .send({
          timetableId: ttId,
          subjectId,
          teacherId: teacherIdA1,
          dayOfWeek: 1,
          startTime: '10:00', // Non-overlapping
          endTime: '10:45',
          room: 'Room 201',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      createdPeriodIds.push(res.body.id);
    });

    it('should detect room conflict within the same branch', async () => {
      const ttId = createdTimetableIds[0]; // Branch A1 timetable

      const res = await request(app)
        .post(`/api/v1/timetables/${ttId}/periods`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchA1Id)
        .send({
          timetableId: ttId,
          subjectId,
          teacherId: teacherIdA2, // Different teacher
          dayOfWeek: 1,
          startTime: '08:00', // Same time
          endTime: '08:45',
          room: 'Room 101', // Same room in same branch
        })
        .expect(409);

      expect(res.body.message).toContain('Room');
    });

    it('should allow same room at same time in different branches', async () => {
      const ttId = createdTimetableIds[1]; // Branch A2 timetable

      const res = await request(app)
        .post(`/api/v1/timetables/${ttId}/periods`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchA2Id)
        .send({
          timetableId: ttId,
          subjectId,
          teacherId: teacherIdA2,
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '08:45',
          room: 'Room 101', // Same room name, different branch
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      createdPeriodIds.push(res.body.id);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/timetables/:id/periods
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/timetables/:id/periods', () => {
    it('should list periods for a timetable', async () => {
      const ttId = createdTimetableIds[0];

      const res = await request(app)
        .get(`/api/v1/timetables/${ttId}/periods`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  GET /api/v1/timetables/conflicts
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/timetables/conflicts', () => {
    it('should detect existing conflicts for a teacher', async () => {
      const teacherIdA1 = '00000000-0000-4000-a000-000000000020';

      const res = await request(app)
        .get('/api/v1/timetables/conflicts')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .query({
          teacherId: teacherIdA1,
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '08:45',
        })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when no conflicts', async () => {
      const teacherIdA1 = '00000000-0000-4000-a000-000000000020';

      const res = await request(app)
        .get('/api/v1/timetables/conflicts')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .query({
          teacherId: teacherIdA1,
          dayOfWeek: 5, // Friday — no periods
          startTime: '14:00',
          endTime: '14:45',
        })
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should check conflicts across branches within tenant', async () => {
      const teacherIdA1 = '00000000-0000-4000-a000-000000000020';

      // Teacher has periods in both Branch A1 and A2
      const res = await request(app)
        .get('/api/v1/timetables/conflicts')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .query({
          teacherId: teacherIdA1,
          dayOfWeek: 1,
          startTime: '10:00',
          endTime: '10:45',
        })
        .expect(200);

      // Should find the period in Branch A2
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  PATCH /api/v1/timetables/:id
  // ═══════════════════════════════════════════════════════
  describe('PATCH /api/v1/timetables/:id', () => {
    it('should update a timetable name', async () => {
      const ttId = createdTimetableIds[0];

      const res = await request(app)
        .patch(`/api/v1/timetables/${ttId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({ name: 'Updated Timetable Name' })
        .expect(200);

      expect(res.body.name).toBe('Updated Timetable Name');
    });

    it('should deactivate a timetable', async () => {
      const ttId = createdTimetableIds[0];

      const res = await request(app)
        .patch(`/api/v1/timetables/${ttId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({ isActive: false })
        .expect(200);

      expect(res.body.isActive).toBe(false);

      // Restore active
      await request(app)
        .patch(`/api/v1/timetables/${ttId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .send({ isActive: true });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  DELETE /api/v1/timetables/:id
  // ═══════════════════════════════════════════════════════
  describe('DELETE /api/v1/timetables/:id', () => {
    it('should soft-delete a timetable and return 404 on subsequent GET', async () => {
      // Create a disposable timetable
      const createRes = await request(app)
        .post('/api/v1/timetables')
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .set('X-Branch-ID', branchA1Id)
        .send({
          tenantId: tenantAId,
          branchId: branchA1Id,
          classId: '00000000-0000-4000-a000-000000000099',
          academicYearId: '00000000-0000-4000-a000-000000000099',
          name: 'To be deleted',
        })
        .expect(201);

      const ttId = createRes.body.id;

      await request(app)
        .delete(`/api/v1/timetables/${ttId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(204);

      await request(app)
        .get(`/api/v1/timetables/${ttId}`)
        .auth(adminTokenTenantA, { type: 'bearer' })
        .set('X-Tenant-ID', tenantAId)
        .expect(404);
    });
  });
});
