import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('LMS Staff Module (e2e)', () => {
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

  // ─── Notice ───────────────────────────────────────────
  describe('Notice CRUD', () => {
    let noticeId: number;

    it('should create a notice (POST /api/v1/lms/notices)', () => {
      return request(app)
        .post('/api/v1/lms/notices')
        .auth(apiToken, { type: 'bearer' })
        .send({
          institutionId: 1,
          title: `E2E Notice ${Date.now()}`,
          content: 'Test content',
          isActive: true,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          noticeId = body.id;
        });
    });

    it('should return all notices (GET /api/v1/lms/notices)', () => {
      return request(app)
        .get('/api/v1/lms/notices')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one notice (GET /api/v1/lms/notices/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/notices/${noticeId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(noticeId);
        });
    });

    it('should update a notice (PATCH /api/v1/lms/notices/:id)', () => {
      return request(app)
        .patch(`/api/v1/lms/notices/${noticeId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ title: 'Updated Notice' })
        .expect(200);
    });

    it('should return 404 (GET /api/v1/lms/notices/999999)', () => {
      return request(app)
        .get('/api/v1/lms/notices/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('should delete a notice (DELETE /api/v1/lms/notices/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/notices/${noticeId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Salary Slip ─────────────────────────────────────
  describe('Salary Slip CRUD', () => {
    let salarySlipId: number;

    it('should create a salary slip (POST /api/v1/lms/salary-slips)', () => {
      return request(app)
        .post('/api/v1/lms/salary-slips')
        .auth(apiToken, { type: 'bearer' })
        .send({
          staffId: 1,
          month: 'January',
          year: 2026,
          basicSalary: 50000,
          totalDeductions: 5000,
          netSalary: 45000,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          salarySlipId = body.id;
        });
    });

    it('should return all salary slips (GET /api/v1/lms/salary-slips)', () => {
      return request(app)
        .get('/api/v1/lms/salary-slips')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one salary slip (GET /api/v1/lms/salary-slips/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/salary-slips/${salarySlipId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should delete a salary slip (DELETE /api/v1/lms/salary-slips/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/salary-slips/${salarySlipId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });
});
