import request from 'supertest';
import {
  APP_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  TESTER_EMAIL,
  TESTER_PASSWORD,
} from '../utils/constants';

describe('Attendance Management (E2E)', () => {
  const app = APP_URL;
  let adminToken: string;
  let userToken: string;
  let testInstitutionId: number;
  let testStudentId: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let testSectionId: number;
  let testLeaveId: number;
  let testStaffLeaveId: number;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminLogin.body.token;

    // Login as regular user (student role)
    const userLogin = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: TESTER_EMAIL, password: TESTER_PASSWORD });
    userToken = userLogin.body.token;

    // Create institution for tests
    const instRes = await request(app)
      .post('/api/v1/lms/institutions')
      .auth(adminToken, { type: 'bearer' })
      .send({
        name: `Attendance E2E Inst ${Date.now()}`,
        address: '123 Test St',
        phone: '+1555000001',
        email: `att-inst-${Date.now()}@test.com`,
      });
    testInstitutionId = instRes.body.id;

    // Register a student
    const studentRes = await request(app)
      .post('/api/v1/student-registration')
      .auth(adminToken, { type: 'bearer' })
      .send({
        firstName: 'AttendanceTest',
        lastName: 'Student',
        email: `att-student-${Date.now()}@test.com`,
        password: 'Secret123!',
        institutionId: testInstitutionId,
        dateOfBirth: '2012-05-15',
        gender: 'male',
        guardianName: 'Parent',
        guardianPhone: '+1555000099',
      });
    testStudentId = studentRes.body.id;
  });

  afterAll(async () => {
    if (testInstitutionId) {
      await request(app)
        .delete(`/api/v1/lms/institutions/${testInstitutionId}`)
        .auth(adminToken, { type: 'bearer' });
    }
  });

  // ═════════════════════════════════════════════════════════════
  // POST /api/v1/attendance/mark — Individual Attendance Marking
  // ═════════════════════════════════════════════════════════════
  describe('POST /api/v1/attendance/mark', () => {
    it('should mark individual student attendance as present', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/mark')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          date: '2025-12-01',
          status: 'present',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('present');
      expect(res.body.attendableType).toBe('student');
    });

    it('should mark student attendance with various statuses (absent, late, half_day, excused)', async () => {
      for (const status of ['absent', 'late', 'half_day', 'excused']) {
        const dateOffset = ['absent', 'late', 'half_day', 'excused'].indexOf(
          status,
        );
        const res = await request(app)
          .post('/api/v1/attendance/mark')
          .auth(adminToken, { type: 'bearer' })
          .send({
            attendableType: 'student',
            attendableId: testStudentId,
            date: `2025-12-0${2 + dateOffset}`,
            status,
          })
          .expect(201);

        expect(res.body.status).toBe(status);
      }
    });

    it('should mark staff attendance with check-in/check-out times', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/mark')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'staff',
          attendableId: 1,
          date: '2025-12-01',
          status: 'present',
          checkIn: '08:00',
          checkOut: '16:00',
        })
        .expect(201);

      expect(res.body.checkIn).toBe('08:00');
      expect(res.body.checkOut).toBe('16:00');
    });

    it('should prevent duplicate attendance for same person+date', async () => {
      // First mark
      await request(app)
        .post('/api/v1/attendance/mark')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          date: '2025-11-10',
          status: 'present',
        })
        .expect(201);

      // Duplicate
      await request(app)
        .post('/api/v1/attendance/mark')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          date: '2025-11-10',
          status: 'absent',
        })
        .expect(409);
    });

    it('should reject invalid status enum', async () => {
      await request(app)
        .post('/api/v1/attendance/mark')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          date: '2025-12-20',
          status: 'invalid_status',
        })
        .expect(422);
    });

    it('should require teacher/admin authorization', async () => {
      await request(app)
        .post('/api/v1/attendance/mark')
        .auth(userToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          date: '2025-12-21',
          status: 'present',
        })
        .expect(403);
    });

    it('should reject future dates', async () => {
      await request(app)
        .post('/api/v1/attendance/mark')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          date: '2099-12-01',
          status: 'present',
        })
        .expect(422);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app)
        .post('/api/v1/attendance/mark')
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          date: '2025-12-22',
          status: 'present',
        })
        .expect(401);
    });
  });

  // ═════════════════════════════════════════════════════════════
  // POST /api/v1/attendance/bulk — Bulk Attendance Marking
  // ═════════════════════════════════════════════════════════════
  describe('POST /api/v1/attendance/bulk', () => {
    it('should bulk mark attendance for multiple students', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/bulk')
        .auth(adminToken, { type: 'bearer' })
        .send({
          date: '2025-11-15',
          sectionId: 1,
          records: [
            {
              attendableType: 'student',
              attendableId: testStudentId,
              status: 'present',
            },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('marked');
      expect(res.body.marked).toBeGreaterThanOrEqual(1);
    });

    it('should reject bulk marking with future dates', async () => {
      await request(app)
        .post('/api/v1/attendance/bulk')
        .auth(adminToken, { type: 'bearer' })
        .send({
          date: '2099-06-01',
          sectionId: 1,
          records: [
            {
              attendableType: 'student',
              attendableId: testStudentId,
              status: 'present',
            },
          ],
        })
        .expect(422);
    });

    it('should require admin/teacher authorization for bulk marking', async () => {
      await request(app)
        .post('/api/v1/attendance/bulk')
        .auth(userToken, { type: 'bearer' })
        .send({
          date: '2025-11-16',
          sectionId: 1,
          records: [],
        })
        .expect(403);
    });
  });

  // ═════════════════════════════════════════════════════════════
  // GET /api/v1/attendance — Query Attendance Records
  // ═════════════════════════════════════════════════════════════
  describe('GET /api/v1/attendance', () => {
    it('should return attendance records with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/attendance')
        .auth(adminToken, { type: 'bearer' })
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('hasNextPage');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/v1/attendance')
        .auth(adminToken, { type: 'bearer' })
        .query({ startDate: '2025-12-01', endDate: '2025-12-31' })
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/v1/attendance')
        .auth(adminToken, { type: 'bearer' })
        .query({ status: 'present' })
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by attendableType (student/staff)', async () => {
      const res = await request(app)
        .get('/api/v1/attendance')
        .auth(adminToken, { type: 'bearer' })
        .query({ attendableType: 'student' })
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app).get('/api/v1/attendance').expect(401);
    });
  });

  // ═════════════════════════════════════════════════════════════
  // GET /api/v1/attendance/reports/summary — Attendance Summary
  // ═════════════════════════════════════════════════════════════
  describe('GET /api/v1/attendance/reports/summary', () => {
    it('should return attendance percentage summary', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/reports/summary')
        .auth(adminToken, { type: 'bearer' })
        .query({
          attendableType: 'student',
          attendableId: testStudentId,
          startDate: '2025-12-01',
          endDate: '2025-12-31',
        })
        .expect(200);

      expect(res.body).toHaveProperty('percentage');
      expect(res.body).toHaveProperty('totalDays');
      expect(res.body).toHaveProperty('presentDays');
      expect(res.body).toHaveProperty('absentDays');
      expect(res.body).toHaveProperty('leaveDays');
      expect(typeof res.body.percentage).toBe('number');
    });

    it('should support monthly summary breakdown', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/reports/summary')
        .auth(adminToken, { type: 'bearer' })
        .query({
          attendableType: 'student',
          attendableId: testStudentId,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          groupBy: 'month',
        })
        .expect(200);

      expect(res.body).toHaveProperty('percentage');
    });
  });

  // ═════════════════════════════════════════════════════════════
  // POST /api/v1/attendance/leaves — Leave Application
  // ═════════════════════════════════════════════════════════════
  describe('POST /api/v1/attendance/leaves', () => {
    it('should create a leave application for a student', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/leaves')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          fromDate: '2025-12-10',
          toDate: '2025-12-12',
          reason: 'Family event',
          leaveType: 'casual',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('pending');
      testLeaveId = res.body.id;
    });

    it('should create a leave application for staff', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/leaves')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'staff',
          attendableId: 1,
          fromDate: '2025-12-15',
          toDate: '2025-12-16',
          reason: 'Medical appointment',
          leaveType: 'sick',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      testStaffLeaveId = res.body.id;
    });

    it('should reject leave with invalid date range (from > to)', async () => {
      await request(app)
        .post('/api/v1/attendance/leaves')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          fromDate: '2025-12-15',
          toDate: '2025-12-10',
          reason: 'Invalid dates',
          leaveType: 'casual',
        })
        .expect(422);
    });

    it('should prevent overlapping leave applications', async () => {
      // Create first leave
      await request(app)
        .post('/api/v1/attendance/leaves')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          fromDate: '2025-11-20',
          toDate: '2025-11-22',
          reason: 'Holiday',
          leaveType: 'casual',
        })
        .expect(201);

      // Overlapping leave
      await request(app)
        .post('/api/v1/attendance/leaves')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          fromDate: '2025-11-21',
          toDate: '2025-11-23',
          reason: 'Overlap attempt',
          leaveType: 'casual',
        })
        .expect(409);
    });

    it('should validate leave type', async () => {
      await request(app)
        .post('/api/v1/attendance/leaves')
        .auth(adminToken, { type: 'bearer' })
        .send({
          attendableType: 'student',
          attendableId: testStudentId,
          fromDate: '2025-12-25',
          toDate: '2025-12-26',
          reason: 'Bad type',
          leaveType: 'INVALID_TYPE',
        })
        .expect(422);
    });
  });

  // ═════════════════════════════════════════════════════════════
  // PATCH /api/v1/attendance/leaves/:id/approve — Leave Approval
  // ═════════════════════════════════════════════════════════════
  describe('PATCH /api/v1/attendance/leaves/:id/approve', () => {
    it('should approve a pending leave request', async () => {
      const res = await request(app)
        .patch(`/api/v1/attendance/leaves/${testLeaveId}/approve`)
        .auth(adminToken, { type: 'bearer' })
        .send({ adminRemarks: 'Approved' })
        .expect(200);

      expect(res.body.status).toBe('approved');
    });

    it('should prevent double approval', async () => {
      await request(app)
        .patch(`/api/v1/attendance/leaves/${testLeaveId}/approve`)
        .auth(adminToken, { type: 'bearer' })
        .send({ adminRemarks: 'Already approved' })
        .expect(409);
    });

    it('should require admin authorization', async () => {
      await request(app)
        .patch(`/api/v1/attendance/leaves/${testStaffLeaveId}/approve`)
        .auth(userToken, { type: 'bearer' })
        .send({ adminRemarks: 'No auth' })
        .expect(403);
    });
  });

  // ═════════════════════════════════════════════════════════════
  // PATCH /api/v1/attendance/leaves/:id/reject — Leave Rejection
  // ═════════════════════════════════════════════════════════════
  describe('PATCH /api/v1/attendance/leaves/:id/reject', () => {
    it('should reject a pending leave request with reason', async () => {
      const res = await request(app)
        .patch(`/api/v1/attendance/leaves/${testStaffLeaveId}/reject`)
        .auth(adminToken, { type: 'bearer' })
        .send({ adminRemarks: 'Insufficient staff coverage' })
        .expect(200);

      expect(res.body.status).toBe('rejected');
      expect(res.body.adminRemarks).toBe('Insufficient staff coverage');
    });

    it('should not reject an already-processed leave', async () => {
      await request(app)
        .patch(`/api/v1/attendance/leaves/${testStaffLeaveId}/reject`)
        .auth(adminToken, { type: 'bearer' })
        .send({ adminRemarks: 'Too late' })
        .expect(409);
    });
  });

  // ═════════════════════════════════════════════════════════════
  // GET /api/v1/attendance/alerts — Low Attendance Alerts
  // ═════════════════════════════════════════════════════════════
  describe('GET /api/v1/attendance/alerts', () => {
    it('should return low attendance alerts', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/alerts')
        .auth(adminToken, { type: 'bearer' })
        .query({
          threshold: 75,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should support filtering by attendableType', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/alerts')
        .auth(adminToken, { type: 'bearer' })
        .query({
          threshold: 75,
          attendableType: 'student',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should require admin/teacher authorization', async () => {
      await request(app)
        .get('/api/v1/attendance/alerts')
        .auth(userToken, { type: 'bearer' })
        .query({ threshold: 75 })
        .expect(403);
    });
  });

  // ═════════════════════════════════════════════════════════════
  // GET /api/v1/attendance/reports/detailed — Detailed Report
  // ═════════════════════════════════════════════════════════════
  describe('GET /api/v1/attendance/reports/detailed', () => {
    it('should return detailed attendance report for a student', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/reports/detailed')
        .auth(adminToken, { type: 'bearer' })
        .query({
          attendableType: 'student',
          attendableId: testStudentId,
          startDate: '2025-12-01',
          endDate: '2025-12-31',
        })
        .expect(200);

      expect(res.body).toHaveProperty('records');
      expect(res.body).toHaveProperty('summary');
      expect(Array.isArray(res.body.records)).toBe(true);
    });

    it('should include leave details in the report', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/reports/detailed')
        .auth(adminToken, { type: 'bearer' })
        .query({
          attendableType: 'student',
          attendableId: testStudentId,
          startDate: '2025-12-01',
          endDate: '2025-12-31',
        })
        .expect(200);

      expect(res.body).toHaveProperty('leaves');
    });
  });
});
