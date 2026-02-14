import request from 'supertest';
import {
  APP_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  TESTER_EMAIL,
  TESTER_PASSWORD,
} from '../utils/constants';

describe('Examination & Results (e2e)', () => {
  const app = APP_URL;
  let adminToken: string;
  let userToken: string;

  // IDs populated through tests
  let gradingScaleId: number;
  let examScheduleId: number;
  let examSubjectId: number;

  const termId = 1;
  const subjectId = 1;
  const studentId = 1;

  beforeAll(async () => {
    // Login as admin
    const adminRes = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminRes.body.token;

    // Login as regular user
    const userRes = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: TESTER_EMAIL, password: TESTER_PASSWORD });
    userToken = userRes.body.token;
  });

  // ════════════ GRADING SCALES ════════════

  describe('POST /api/v1/exams/grading-scales', () => {
    it('should create a grading scale', async () => {
      const res = await request(app)
        .post('/api/v1/exams/grading-scales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Standard Grading',
          grades: [
            {
              minPercentage: 90,
              maxPercentage: 100,
              grade: 'A+',
              gradePoint: 10,
              description: 'Outstanding',
            },
            {
              minPercentage: 80,
              maxPercentage: 89.99,
              grade: 'A',
              gradePoint: 9,
              description: 'Excellent',
            },
            {
              minPercentage: 70,
              maxPercentage: 79.99,
              grade: 'B+',
              gradePoint: 8,
              description: 'Very Good',
            },
            {
              minPercentage: 60,
              maxPercentage: 69.99,
              grade: 'B',
              gradePoint: 7,
              description: 'Good',
            },
            {
              minPercentage: 50,
              maxPercentage: 59.99,
              grade: 'C',
              gradePoint: 6,
              description: 'Average',
            },
            {
              minPercentage: 40,
              maxPercentage: 49.99,
              grade: 'D',
              gradePoint: 5,
              description: 'Below Average',
            },
            {
              minPercentage: 0,
              maxPercentage: 39.99,
              grade: 'F',
              gradePoint: 0,
              description: 'Fail',
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Standard Grading');
      expect(res.body.grades).toHaveLength(7);
      gradingScaleId = res.body.id;
    });

    it('should reject duplicate grading scale name', async () => {
      const res = await request(app)
        .post('/api/v1/exams/grading-scales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Standard Grading',
          grades: [
            {
              minPercentage: 0,
              maxPercentage: 100,
              grade: 'P',
              gradePoint: 10,
            },
          ],
        });

      expect(res.status).toBe(409);
    });

    it('should reject overlapping percentage ranges', async () => {
      const res = await request(app)
        .post('/api/v1/exams/grading-scales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Scale',
          grades: [
            {
              minPercentage: 50,
              maxPercentage: 100,
              grade: 'A',
              gradePoint: 10,
            },
            { minPercentage: 40, maxPercentage: 60, grade: 'B', gradePoint: 8 },
          ],
        });

      expect(res.status).toBe(422);
    });

    it('should deny access for non-admin users', async () => {
      const res = await request(app)
        .post('/api/v1/exams/grading-scales')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Another Scale',
          grades: [
            {
              minPercentage: 0,
              maxPercentage: 100,
              grade: 'P',
              gradePoint: 10,
            },
          ],
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/exams/grading-scales', () => {
    it('should list all grading scales', async () => {
      const res = await request(app)
        .get('/api/v1/exams/grading-scales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/exams/grading-scales/:id', () => {
    it('should return grading scale by id', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/grading-scales/${gradingScaleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(gradingScaleId);
      expect(res.body.grades).toHaveLength(7);
    });

    it('should return 404 for non-existent scale', async () => {
      const res = await request(app)
        .get('/api/v1/exams/grading-scales/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ════════════ EXAM SCHEDULE ════════════

  describe('POST /api/v1/exams/schedules', () => {
    it('should create an exam schedule with subjects', async () => {
      const res = await request(app)
        .post('/api/v1/exams/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          termId,
          name: 'Mid-Term Examination 2026',
          type: 'midterm',
          startDate: '2026-03-15',
          endDate: '2026-03-25',
          description: 'Mid-term exams for all subjects',
          subjects: [
            {
              subjectId,
              examDate: '2026-03-15',
              totalMarks: 100,
              passingMarks: 35,
            },
            {
              subjectId: 2,
              examDate: '2026-03-17',
              totalMarks: 100,
              passingMarks: 35,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Mid-Term Examination 2026');
      expect(res.body.status).toBe('scheduled');
      expect(res.body.subjects).toHaveLength(2);
      examScheduleId = res.body.id;
      examSubjectId = res.body.subjects[0].id;
    });

    it('should reject exam with endDate before startDate', async () => {
      const res = await request(app)
        .post('/api/v1/exams/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          termId,
          name: 'Bad Exam',
          type: 'midterm',
          startDate: '2026-03-25',
          endDate: '2026-03-15',
          subjects: [],
        });

      expect(res.status).toBe(422);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/exams/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete Exam' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/exams/schedules/:id', () => {
    it('should return exam schedule with subjects', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/schedules/${examScheduleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(examScheduleId);
      expect(res.body.subjects).toBeDefined();
    });
  });

  describe('PATCH /api/v1/exams/schedules/:id/status', () => {
    it('should update exam status to in_progress', async () => {
      const res = await request(app)
        .patch(`/api/v1/exams/schedules/${examScheduleId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('in_progress');
    });

    it('should update exam status to completed', async () => {
      const res = await request(app)
        .patch(`/api/v1/exams/schedules/${examScheduleId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });
  });

  // ════════════ MARKS ENTRY ════════════

  describe('POST /api/v1/exams/marks', () => {
    it('should enter marks for students', async () => {
      const res = await request(app)
        .post('/api/v1/exams/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examSubjectId,
          results: [
            { studentId, marksObtained: 85, isAbsent: false },
            { studentId: 2, marksObtained: 72, isAbsent: false },
            {
              studentId: 3,
              marksObtained: null,
              isAbsent: true,
              remarks: 'Medical leave',
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('entered');
      expect(res.body.entered).toBe(3);
    });

    it('should reject marks exceeding total marks', async () => {
      const res = await request(app)
        .post('/api/v1/exams/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examSubjectId,
          results: [{ studentId: 4, marksObtained: 150, isAbsent: false }],
        });

      expect(res.status).toBe(422);
    });

    it('should reject negative marks', async () => {
      const res = await request(app)
        .post('/api/v1/exams/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examSubjectId,
          results: [{ studentId: 4, marksObtained: -5, isAbsent: false }],
        });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/exams/marks/bulk', () => {
    it('should import marks in bulk from array data', async () => {
      const res = await request(app)
        .post('/api/v1/exams/marks/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examSubjectId,
          data: [
            { studentId: 4, marksObtained: 91 },
            { studentId: 5, marksObtained: 45 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('imported');
      expect(res.body.imported).toBe(2);
    });
  });

  describe('GET /api/v1/exams/marks/:examSubjectId', () => {
    it('should return all marks for an exam subject', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/marks/${examSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ════════════ RESULT PUBLICATION ════════════

  describe('PATCH /api/v1/exams/:examId/publish', () => {
    it('should publish results with grading', async () => {
      const res = await request(app)
        .patch(`/api/v1/exams/${examScheduleId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ gradingScaleId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('published');
      expect(res.body.published).toBe(true);
      expect(res.body.status).toBe('results_published');
      expect(res.body).toHaveProperty('totalResults');
    });

    it('should reject publishing already published exam', async () => {
      const res = await request(app)
        .patch(`/api/v1/exams/${examScheduleId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ gradingScaleId });

      expect(res.status).toBe(409);
    });
  });

  // ════════════ STUDENT RESULTS ════════════

  describe('GET /api/v1/exams/results/student/:studentId', () => {
    it('should return all exam results for a student', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/results/student/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/exams/results/student/:studentId/exam/:examId', () => {
    it('should return detailed student results for a specific exam', async () => {
      const res = await request(app)
        .get(
          `/api/v1/exams/results/student/${studentId}/exam/${examScheduleId}`,
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('student');
      expect(res.body).toHaveProperty('exam');
      expect(res.body).toHaveProperty('subjects');
      expect(res.body).toHaveProperty('totalMarks');
      expect(res.body).toHaveProperty('obtainedMarks');
      expect(res.body).toHaveProperty('percentage');
      expect(res.body).toHaveProperty('overallGrade');
      expect(res.body).toHaveProperty('rank');
    });
  });

  // ════════════ REPORT CARD (PDF) ════════════

  describe('GET /api/v1/exams/results/student/:studentId/exam/:examId/report-card', () => {
    it('should generate a PDF report card', async () => {
      const res = await request(app)
        .get(
          `/api/v1/exams/results/student/${studentId}/exam/${examScheduleId}/report-card`,
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.body).toBeInstanceOf(Buffer);
    });

    it('should return 404 for non-published exam', async () => {
      const res = await request(app)
        .get(
          `/api/v1/exams/results/student/${studentId}/exam/99999/report-card`,
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ════════════ RESULT ANALYTICS ════════════

  describe('GET /api/v1/exams/analytics/exam/:examId', () => {
    it('should return exam-level analytics', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/analytics/exam/${examScheduleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('examId');
      expect(res.body).toHaveProperty('totalStudents');
      expect(res.body).toHaveProperty('passCount');
      expect(res.body).toHaveProperty('failCount');
      expect(res.body).toHaveProperty('averagePercentage');
      expect(res.body).toHaveProperty('highestPercentage');
      expect(res.body).toHaveProperty('lowestPercentage');
      expect(res.body).toHaveProperty('gradeDistribution');
      expect(res.body).toHaveProperty('subjectWise');
    });
  });

  describe('GET /api/v1/exams/analytics/subject/:examSubjectId', () => {
    it('should return subject-level analytics', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/analytics/subject/${examSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('examSubjectId');
      expect(res.body).toHaveProperty('totalStudents');
      expect(res.body).toHaveProperty('passCount');
      expect(res.body).toHaveProperty('failCount');
      expect(res.body).toHaveProperty('averageMarks');
      expect(res.body).toHaveProperty('highestMarks');
      expect(res.body).toHaveProperty('lowestMarks');
      expect(res.body).toHaveProperty('gradeDistribution');
    });

    it('should return 404 for non-existent exam subject', async () => {
      const res = await request(app)
        .get('/api/v1/exams/analytics/subject/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
