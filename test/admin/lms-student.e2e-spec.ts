import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('LMS Student Module (e2e)', () => {
  const app = APP_URL;
  let apiToken: string;

  beforeAll(async () => {
    await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .then(({ body }) => {
        apiToken = body.token;
      });
  });

  // ─── Student ──────────────────────────────────────────
  describe('Student CRUD', () => {
    let studentId: number;

    it('should create a student (POST /api/v1/lms/students)', () => {
      return request(app)
        .post('/api/v1/lms/students')
        .auth(apiToken, { type: 'bearer' })
        .send({
          firstName: 'E2E',
          lastName: `Student-${Date.now()}`,
          dateOfBirth: '2010-01-15',
          gender: 'male',
          enrollmentDate: '2025-09-01',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          studentId = body.id;
        });
    });

    it('should return all students (GET /api/v1/lms/students)', () => {
      return request(app)
        .get('/api/v1/lms/students')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one student (GET /api/v1/lms/students/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/students/${studentId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(studentId);
        });
    });

    it('should update a student (PATCH /api/v1/lms/students/:id)', () => {
      return request(app)
        .patch(`/api/v1/lms/students/${studentId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ firstName: 'UpdatedFirst' })
        .expect(200);
    });

    it('should return 404 (GET /api/v1/lms/students/999999)', () => {
      return request(app)
        .get('/api/v1/lms/students/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('should delete a student (DELETE /api/v1/lms/students/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/students/${studentId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Admission Enquiry ────────────────────────────────
  describe('Admission Enquiry CRUD', () => {
    let enquiryId: number;

    it('should create (POST /api/v1/lms/admission-enquiries)', () => {
      return request(app)
        .post('/api/v1/lms/admission-enquiries')
        .auth(apiToken, { type: 'bearer' })
        .send({
          studentName: 'E2E Enquiry Student',
          parentName: 'E2E Parent',
          phone: '03001234567',
          email: `e2e-${Date.now()}@test.com`,
          status: 'pending',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          enquiryId = body.id;
        });
    });

    it('should return all (GET /api/v1/lms/admission-enquiries)', () => {
      return request(app)
        .get('/api/v1/lms/admission-enquiries')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one (GET /api/v1/lms/admission-enquiries/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/admission-enquiries/${enquiryId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should return 404 for non-existent enquiry (GET /api/v1/lms/admission-enquiries/999999)', () => {
      return request(app)
        .get('/api/v1/lms/admission-enquiries/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('should delete (DELETE /api/v1/lms/admission-enquiries/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/admission-enquiries/${enquiryId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Leave Request ────────────────────────────────────
  describe('Leave Request CRUD', () => {
    let leaveRequestId: number;

    it('should create (POST /api/v1/lms/leave-requests)', () => {
      return request(app)
        .post('/api/v1/lms/leave-requests')
        .auth(apiToken, { type: 'bearer' })
        .send({
          studentId: 1,
          reason: 'E2E Test Leave',
          fromDate: '2026-03-01',
          toDate: '2026-03-03',
          status: 'pending',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          leaveRequestId = body.id;
        });
    });

    it('should return all (GET /api/v1/lms/leave-requests)', () => {
      return request(app)
        .get('/api/v1/lms/leave-requests')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one (GET /api/v1/lms/leave-requests/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/leave-requests/${leaveRequestId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should delete (DELETE /api/v1/lms/leave-requests/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/leave-requests/${leaveRequestId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Fee Structure ────────────────────────────────────
  describe('Fee Structure CRUD', () => {
    let feeStructureId: number;

    it('should create (POST /api/v1/lms/fee-structures)', () => {
      return request(app)
        .post('/api/v1/lms/fee-structures')
        .auth(apiToken, { type: 'bearer' })
        .send({
          name: `E2E Fee ${Date.now()}`,
          amount: 15000,
          frequency: 'monthly',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          feeStructureId = body.id;
        });
    });

    it('should return all (GET /api/v1/lms/fee-structures)', () => {
      return request(app)
        .get('/api/v1/lms/fee-structures')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one (GET /api/v1/lms/fee-structures/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/fee-structures/${feeStructureId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should delete (DELETE /api/v1/lms/fee-structures/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/fee-structures/${feeStructureId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Fee Challan ──────────────────────────────────────
  describe('Fee Challan CRUD', () => {
    let feeChallanId: number;

    it('should create (POST /api/v1/lms/fee-challans)', () => {
      return request(app)
        .post('/api/v1/lms/fee-challans')
        .auth(apiToken, { type: 'bearer' })
        .send({
          studentId: 1,
          amount: 15000,
          dueDate: '2026-04-01',
          status: 'unpaid',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          feeChallanId = body.id;
        });
    });

    it('should return all (GET /api/v1/lms/fee-challans)', () => {
      return request(app)
        .get('/api/v1/lms/fee-challans')
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should return one (GET /api/v1/lms/fee-challans/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/fee-challans/${feeChallanId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should delete (DELETE /api/v1/lms/fee-challans/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/fee-challans/${feeChallanId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Fee Payment ──────────────────────────────────────
  describe('Fee Payment CRUD', () => {
    let feePaymentId: number;

    it('should create (POST /api/v1/lms/fee-payments)', () => {
      return request(app)
        .post('/api/v1/lms/fee-payments')
        .auth(apiToken, { type: 'bearer' })
        .send({
          challanId: 1,
          amount: 15000,
          paymentDate: '2026-03-15',
          paymentMethod: 'cash',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          feePaymentId = body.id;
        });
    });

    it('should return all (GET /api/v1/lms/fee-payments)', () => {
      return request(app)
        .get('/api/v1/lms/fee-payments')
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should return one (GET /api/v1/lms/fee-payments/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/fee-payments/${feePaymentId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should delete (DELETE /api/v1/lms/fee-payments/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/fee-payments/${feePaymentId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Exam ─────────────────────────────────────────────
  describe('Exam CRUD', () => {
    let examId: number;

    it('should create (POST /api/v1/lms/exams)', () => {
      return request(app)
        .post('/api/v1/lms/exams')
        .auth(apiToken, { type: 'bearer' })
        .send({
          name: `E2E Exam ${Date.now()}`,
          startDate: '2026-06-01',
          endDate: '2026-06-15',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          examId = body.id;
        });
    });

    it('should return all (GET /api/v1/lms/exams)', () => {
      return request(app)
        .get('/api/v1/lms/exams')
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should return one (GET /api/v1/lms/exams/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/exams/${examId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should delete (DELETE /api/v1/lms/exams/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/exams/${examId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Exam Result ──────────────────────────────────────
  describe('Exam Result CRUD', () => {
    let examResultId: number;

    it('should create (POST /api/v1/lms/exam-results)', () => {
      return request(app)
        .post('/api/v1/lms/exam-results')
        .auth(apiToken, { type: 'bearer' })
        .send({
          examId: 1,
          studentId: 1,
          subjectId: 1,
          marksObtained: 85,
          totalMarks: 100,
          grade: 'A',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          examResultId = body.id;
        });
    });

    it('should return all (GET /api/v1/lms/exam-results)', () => {
      return request(app)
        .get('/api/v1/lms/exam-results')
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should return one (GET /api/v1/lms/exam-results/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/exam-results/${examResultId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should delete (DELETE /api/v1/lms/exam-results/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/exam-results/${examResultId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Course Material ──────────────────────────────────
  describe('Course Material CRUD', () => {
    let courseMaterialId: number;

    it('should create (POST /api/v1/lms/course-materials)', () => {
      return request(app)
        .post('/api/v1/lms/course-materials')
        .auth(apiToken, { type: 'bearer' })
        .send({
          title: `E2E Material ${Date.now()}`,
          description: 'Test material',
          subjectId: 1,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          courseMaterialId = body.id;
        });
    });

    it('should return all (GET /api/v1/lms/course-materials)', () => {
      return request(app)
        .get('/api/v1/lms/course-materials')
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should return one (GET /api/v1/lms/course-materials/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/course-materials/${courseMaterialId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should delete (DELETE /api/v1/lms/course-materials/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/course-materials/${courseMaterialId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });
});
