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

    it('POST /api/v1/lms/notices - should create a notice', () => {
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

    it('GET /api/v1/lms/notices - should return all notices', () => {
      return request(app)
        .get('/api/v1/lms/notices')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('GET /api/v1/lms/notices/:id - should return one notice', () => {
      return request(app)
        .get(`/api/v1/lms/notices/${noticeId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(noticeId);
        });
    });

    it('PATCH /api/v1/lms/notices/:id - should update a notice', () => {
      return request(app)
        .patch(`/api/v1/lms/notices/${noticeId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ title: 'Updated Notice' })
        .expect(200);
    });

    it('GET /api/v1/lms/notices/999999 - should return 404', () => {
      return request(app)
        .get('/api/v1/lms/notices/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('DELETE /api/v1/lms/notices/:id - should delete a notice', () => {
      return request(app)
        .delete(`/api/v1/lms/notices/${noticeId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Salary Slip ─────────────────────────────────────
  describe('Salary Slip CRUD', () => {
    let salarySlipId: number;

    it('POST /api/v1/lms/salary-slips - should create a salary slip', () => {
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

    it('GET /api/v1/lms/salary-slips - should return all salary slips', () => {
      return request(app)
        .get('/api/v1/lms/salary-slips')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('GET /api/v1/lms/salary-slips/:id - should return one salary slip', () => {
      return request(app)
        .get(`/api/v1/lms/salary-slips/${salarySlipId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('DELETE /api/v1/lms/salary-slips/:id - should delete a salary slip', () => {
      return request(app)
        .delete(`/api/v1/lms/salary-slips/${salarySlipId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });
});
