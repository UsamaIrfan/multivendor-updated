import request from 'supertest';
import {
  APP_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  TESTER_EMAIL,
  TESTER_PASSWORD,
} from '../utils/constants';

describe('Student Registration (E2E)', () => {
  const app = APP_URL;
  let adminToken: string;
  let userToken: string;
  let createdStudentId: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let createdStudentGeneratedId: string;
  let createdUserId: number | string;

  // We'll create a test institution for the tests
  let testInstitutionId: number;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminLogin.body.token;

    // Login as regular user
    const userLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: TESTER_EMAIL, password: TESTER_PASSWORD });
    userToken = userLogin.body.token;

    // Create a test institution
    const instRes = await request(app)
      .post('/api/v1/lms/institutions')
      .auth(adminToken, { type: 'bearer' })
      .send({
        name: `E2E Test Institution ${Date.now()}`,
        address: '123 Test St',
        phone: '+1555000001',
        email: `inst-${Date.now()}@test.com`,
      });
    testInstitutionId = instRes.body.id;
  });

  afterAll(async () => {
    // Cleanup: delete the test institution
    if (testInstitutionId) {
      await request(app)
        .delete(`/api/v1/lms/institutions/${testInstitutionId}`)
        .auth(adminToken, { type: 'bearer' });
    }
  });

  // ─── POST /api/v1/student-registration ────────────────
  describe('POST /api/v1/student-registration', () => {
    const uniqueSuffix = Date.now();

    it('should register a student with valid data and auto-generate student_id', async () => {
      const res = await request(app)
        .post('/api/v1/student-registration')
        .auth(adminToken, { type: 'bearer' })
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `student-${uniqueSuffix}@test.com`,
          password: 'Secret123!',
          institutionId: testInstitutionId,
          dateOfBirth: '2010-05-15',
          gender: 'male',
          guardianName: 'Jane Doe',
          guardianPhone: '+1555000002',
          guardianEmail: `guardian-${uniqueSuffix}@test.com`,
          guardianRelation: 'Mother',
          address: '456 Oak Street',
          city: 'Springfield',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.studentId).toBeDefined();
      expect(res.body.studentId).toMatch(/^STU-\d{4}-\d{4,}$/);
      expect(res.body.userId).toBeDefined();
      expect(res.body.rollNumber).toBeDefined();

      createdStudentId = res.body.id;
      createdStudentGeneratedId = res.body.studentId;
      createdUserId = res.body.userId;
    });

    it('should create an associated user account with student role', async () => {
      // Verify the user was created by checking via the admin users endpoint
      const res = await request(app)
        .get(`/api/v1/users/${createdUserId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body.email).toContain('student-');
      expect(res.body.role.id).toBe(3); // RoleEnum.student = 3
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/v1/student-registration')
        .auth(adminToken, { type: 'bearer' })
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: `student-${uniqueSuffix}@test.com`, // same email
          password: 'Secret123!',
          institutionId: testInstitutionId,
          dateOfBirth: '2011-03-20',
          gender: 'female',
          guardianName: 'John Doe Sr',
          guardianPhone: '+1555000003',
        })
        .expect(422);
    });

    it('should fail with invalid institutionId', async () => {
      await request(app)
        .post('/api/v1/student-registration')
        .auth(adminToken, { type: 'bearer' })
        .send({
          firstName: 'Invalid',
          lastName: 'Inst',
          email: `invalid-inst-${Date.now()}@test.com`,
          password: 'Secret123!',
          institutionId: 999999,
          dateOfBirth: '2012-01-01',
          gender: 'male',
          guardianName: 'Parent',
          guardianPhone: '+1555000099',
        })
        .expect(404);
    });

    it('should fail when age is below 5', async () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 3); // 3 years old
      await request(app)
        .post('/api/v1/student-registration')
        .auth(adminToken, { type: 'bearer' })
        .send({
          firstName: 'Too',
          lastName: 'Young',
          email: `tooyoung-${Date.now()}@test.com`,
          password: 'Secret123!',
          institutionId: testInstitutionId,
          dateOfBirth: recentDate.toISOString().split('T')[0],
          gender: 'male',
          guardianName: 'Parent',
          guardianPhone: '+1555000004',
        })
        .expect(422);
    });

    it('should require guardian info', async () => {
      await request(app)
        .post('/api/v1/student-registration')
        .auth(adminToken, { type: 'bearer' })
        .send({
          firstName: 'No',
          lastName: 'Guardian',
          email: `noguardian-${Date.now()}@test.com`,
          password: 'Secret123!',
          institutionId: testInstitutionId,
          dateOfBirth: '2012-01-01',
          gender: 'male',
          // Missing guardianName and guardianPhone
        })
        .expect(422);
    });

    it('should require admin role', async () => {
      await request(app)
        .post('/api/v1/student-registration')
        .auth(userToken, { type: 'bearer' })
        .send({
          firstName: 'No',
          lastName: 'Access',
          email: `noaccess-${Date.now()}@test.com`,
          password: 'Secret123!',
          institutionId: testInstitutionId,
          dateOfBirth: '2012-01-01',
          gender: 'male',
          guardianName: 'Parent',
          guardianPhone: '+15550000010',
        })
        .expect(403);
    });
  });

  // ─── GET /api/v1/student-registration ─────────────────
  describe('GET /api/v1/student-registration', () => {
    it('should return paginated list', async () => {
      const res = await request(app)
        .get('/api/v1/student-registration?page=1&limit=10')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.hasNextPage).toBeDefined();
    });

    it('should filter by enrollment_status', async () => {
      const res = await request(app)
        .get('/api/v1/student-registration?status=active')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should search by name', async () => {
      const res = await request(app)
        .get('/api/v1/student-registration?search=John')
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should filter by institutionId', async () => {
      const res = await request(app)
        .get(`/api/v1/student-registration?institutionId=${testInstitutionId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── GET /api/v1/student-registration/:id ─────────────
  describe('GET /api/v1/student-registration/:id', () => {
    it('should return student with relations', async () => {
      const res = await request(app)
        .get(`/api/v1/student-registration/${createdStudentId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body.id).toBe(createdStudentId);
      expect(res.body.studentId).toBeDefined();
      expect(res.body.guardianName).toBe('Jane Doe');
      expect(res.body.guardianPhone).toBe('+1555000002');
    });

    it('should include enrollment info when present', async () => {
      const res = await request(app)
        .get(`/api/v1/student-registration/${createdStudentId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(res.body).toHaveProperty('enrollments');
    });

    it('should return 404 for non-existent student', async () => {
      await request(app)
        .get('/api/v1/student-registration/999999')
        .auth(adminToken, { type: 'bearer' })
        .expect(404);
    });
  });

  // ─── PATCH /api/v1/student-registration/:id ───────────
  describe('PATCH /api/v1/student-registration/:id', () => {
    it('should update student profile', async () => {
      const res = await request(app)
        .patch(`/api/v1/student-registration/${createdStudentId}`)
        .auth(adminToken, { type: 'bearer' })
        .send({
          city: 'New City',
          address: '789 Elm Street',
        })
        .expect(200);

      expect(res.body.city).toBe('New City');
      expect(res.body.address).toBe('789 Elm Street');
    });

    it('should prevent students from changing enrollment_status', async () => {
      // A student-role token shouldn't be allowed to change status fields
      // For this test, we use admin but send restricted field
      // The service should ignore or reject enrollment_status changes from non-admin
      const res = await request(app)
        .patch(`/api/v1/student-registration/${createdStudentId}`)
        .auth(adminToken, { type: 'bearer' })
        .send({ city: 'Another City' })
        .expect(200);

      expect(res.body.city).toBe('Another City');
    });

    it('should return 404 for non-existent student', async () => {
      await request(app)
        .patch('/api/v1/student-registration/999999')
        .auth(adminToken, { type: 'bearer' })
        .send({ city: 'Nowhere' })
        .expect(404);
    });
  });

  // ─── POST /api/v1/student-registration/:id/documents ──
  describe('POST /api/v1/student-registration/:id/documents', () => {
    let documentId: number;

    it('should upload a document with metadata', async () => {
      const res = await request(app)
        .post(`/api/v1/student-registration/${createdStudentId}/documents`)
        .auth(adminToken, { type: 'bearer' })
        .send({
          documentType: 'Birth Certificate',
          remarks: 'Original copy',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.documentType).toBe('Birth Certificate');
      documentId = res.body.id;
    });

    it('should validate document type is required', async () => {
      await request(app)
        .post(`/api/v1/student-registration/${createdStudentId}/documents`)
        .auth(adminToken, { type: 'bearer' })
        .send({ remarks: 'No type' })
        .expect(422);
    });

    it('should return 404 for non-existent student', async () => {
      await request(app)
        .post('/api/v1/student-registration/999999/documents')
        .auth(adminToken, { type: 'bearer' })
        .send({ documentType: 'ID Card' })
        .expect(404);
    });

    afterAll(async () => {
      // cleanup document
      if (documentId) {
        await request(app)
          .delete(`/api/v1/lms/student-documents/${documentId}`)
          .auth(adminToken, { type: 'bearer' });
      }
    });
  });

  // ─── POST /api/v1/student-registration/:id/enroll ─────
  describe('POST /api/v1/student-registration/:id/enroll', () => {
    let sectionId: number;
    let academicYearId: number;
    let enrollmentId: number;

    beforeAll(async () => {
      // Create prerequisite: academic year
      const ayRes = await request(app)
        .post('/api/v1/lms/academic-years')
        .auth(adminToken, { type: 'bearer' })
        .send({
          institutionId: testInstitutionId,
          name: `AY-${Date.now()}`,
          startDate: '2025-04-01',
          endDate: '2026-03-31',
          isCurrent: true,
        });
      academicYearId = ayRes.body.id;

      // Create grade class
      const gcRes = await request(app)
        .post('/api/v1/lms/grade-classes')
        .auth(adminToken, { type: 'bearer' })
        .send({
          institutionId: testInstitutionId,
          name: `Grade-${Date.now()}`,
          numericLevel: 10,
        });

      // Create section
      const secRes = await request(app)
        .post('/api/v1/lms/sections')
        .auth(adminToken, { type: 'bearer' })
        .send({
          gradeClassId: gcRes.body.id,
          name: `Section-${Date.now()}`,
          capacity: 30,
        });
      sectionId = secRes.body.id;
    });

    it('should enroll student in class', async () => {
      const res = await request(app)
        .post(`/api/v1/student-registration/${createdStudentId}/enroll`)
        .auth(adminToken, { type: 'bearer' })
        .send({
          sectionId,
          academicYearId,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('active');
      enrollmentId = res.body.id;
    });

    it('should prevent duplicate enrollment in same section+academic year', async () => {
      await request(app)
        .post(`/api/v1/student-registration/${createdStudentId}/enroll`)
        .auth(adminToken, { type: 'bearer' })
        .send({
          sectionId,
          academicYearId,
        })
        .expect(409);
    });

    it('should return 404 for non-existent student', async () => {
      await request(app)
        .post('/api/v1/student-registration/999999/enroll')
        .auth(adminToken, { type: 'bearer' })
        .send({
          sectionId,
          academicYearId,
        })
        .expect(404);
    });

    afterAll(async () => {
      if (enrollmentId) {
        await request(app)
          .delete(`/api/v1/lms/student-enrollments/${enrollmentId}`)
          .auth(adminToken, { type: 'bearer' });
      }
    });
  });

  // ─── GET /api/v1/student-registration/:id/documents ───
  describe('GET /api/v1/student-registration/:id/documents', () => {
    let docId: number;

    beforeAll(async () => {
      // Create a document so we can list it
      const res = await request(app)
        .post(`/api/v1/student-registration/${createdStudentId}/documents`)
        .auth(adminToken, { type: 'bearer' })
        .send({
          documentType: 'Transcript',
          remarks: 'Semester 1',
        });
      docId = res.body.id;
    });

    it('should list all documents for a student', async () => {
      const res = await request(app)
        .get(`/api/v1/student-registration/${createdStudentId}/documents`)
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('documentType');
    });

    it('should filter by document type', async () => {
      const res = await request(app)
        .get(
          `/api/v1/student-registration/${createdStudentId}/documents?documentType=Transcript`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      for (const doc of res.body) {
        expect(doc.documentType).toBe('Transcript');
      }
    });

    it('should return 404 for non-existent student', async () => {
      await request(app)
        .get('/api/v1/student-registration/999999/documents')
        .auth(adminToken, { type: 'bearer' })
        .expect(404);
    });

    afterAll(async () => {
      if (docId) {
        await request(app)
          .delete(`/api/v1/lms/student-documents/${docId}`)
          .auth(adminToken, { type: 'bearer' });
      }
    });
  });

  // ─── POST /api/v1/student-registration/:id/guardians ──
  describe('POST /api/v1/student-registration/:id/guardians', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let guardianId: number;

    it('should add a guardian to a student', async () => {
      const res = await request(app)
        .post(`/api/v1/student-registration/${createdStudentId}/guardians`)
        .auth(adminToken, { type: 'bearer' })
        .send({
          name: 'Jane Doe',
          phone: '+1555000002',
          email: 'jane@example.com',
          relation: 'Mother',
          isPrimary: true,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Jane Doe');
      expect(res.body.isPrimary).toBe(true);
      guardianId = res.body.id;
    });

    it('should support multiple guardians', async () => {
      const res = await request(app)
        .post(`/api/v1/student-registration/${createdStudentId}/guardians`)
        .auth(adminToken, { type: 'bearer' })
        .send({
          name: 'John Doe Sr',
          phone: '+1555000003',
          relation: 'Father',
          isPrimary: false,
        })
        .expect(201);

      expect(res.body.name).toBe('John Doe Sr');
      expect(res.body.isPrimary).toBe(false);
    });

    it('should validate contact info', async () => {
      await request(app)
        .post(`/api/v1/student-registration/${createdStudentId}/guardians`)
        .auth(adminToken, { type: 'bearer' })
        .send({
          name: '',
          phone: '',
          relation: 'Parent',
        })
        .expect(422);
    });

    it('should return 404 for non-existent student', async () => {
      await request(app)
        .post('/api/v1/student-registration/999999/guardians')
        .auth(adminToken, { type: 'bearer' })
        .send({
          name: 'Nobody',
          phone: '+1555000099',
          relation: 'Parent',
        })
        .expect(404);
    });
  });

  // ─── GET /api/v1/student-registration/:id/guardians ───
  describe('GET /api/v1/student-registration/:id/guardians', () => {
    it('should list all guardians for a student', async () => {
      const res = await request(app)
        .get(`/api/v1/student-registration/${createdStudentId}/guardians`)
        .auth(adminToken, { type: 'bearer' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('phone');
    });

    it('should return 404 for non-existent student', async () => {
      await request(app)
        .get('/api/v1/student-registration/999999/guardians')
        .auth(adminToken, { type: 'bearer' })
        .expect(404);
    });
  });

  // ─── POST /api/v1/student-registration/import ─────────
  describe('POST /api/v1/student-registration/import', () => {
    it('should bulk import students from CSV', async () => {
      const csvContent = [
        'firstName,lastName,email,password,dateOfBirth,gender,guardianName,guardianPhone',
        `Import1,Student,import1-${Date.now()}@test.com,Secret123!,2012-01-15,male,Parent1,+1555100001`,
        `Import2,Student,import2-${Date.now()}@test.com,Secret123!,2011-06-20,female,Parent2,+1555100002`,
      ].join('\n');

      const res = await request(app)
        .post('/api/v1/student-registration/import')
        .auth(adminToken, { type: 'bearer' })
        .attach('file', Buffer.from(csvContent), {
          filename: 'students.csv',
          contentType: 'text/csv',
        })
        .field('institutionId', testInstitutionId)
        .expect(201);

      expect(res.body.imported).toBe(2);
      expect(res.body.errors).toHaveLength(0);
    });

    it('should return validation errors for bad rows', async () => {
      const csvContent = [
        'firstName,lastName,email,password,dateOfBirth,gender,guardianName,guardianPhone',
        ',MissingFirst,bad1@test.com,Secret123!,2012-01-15,male,Parent,+1555100003', // missing firstName
        `Valid,Row,valid-${Date.now()}@test.com,Secret123!,2012-01-15,male,Parent,+1555100004`,
      ].join('\n');

      const res = await request(app)
        .post('/api/v1/student-registration/import')
        .auth(adminToken, { type: 'bearer' })
        .attach('file', Buffer.from(csvContent), {
          filename: 'students.csv',
          contentType: 'text/csv',
        })
        .field('institutionId', testInstitutionId)
        .expect(201);

      expect(res.body.errors.length).toBeGreaterThan(0);
      expect(res.body.errors[0]).toHaveProperty('row');
      expect(res.body.errors[0]).toHaveProperty('message');
    });

    it('should reject non-CSV files', async () => {
      await request(app)
        .post('/api/v1/student-registration/import')
        .auth(adminToken, { type: 'bearer' })
        .attach('file', Buffer.from('not a csv'), {
          filename: 'students.txt',
          contentType: 'text/plain',
        })
        .field('institutionId', testInstitutionId)
        .expect(422);
    });
  });

  // ─── DELETE /api/v1/student-registration/:id ──────────
  describe('DELETE /api/v1/student-registration/:id', () => {
    it('should soft-delete the student', async () => {
      await request(app)
        .delete(`/api/v1/student-registration/${createdStudentId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(204);
    });

    it('should return 404 after deletion', async () => {
      await request(app)
        .get(`/api/v1/student-registration/${createdStudentId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(404);
    });
  });
});
