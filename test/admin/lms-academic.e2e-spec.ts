import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('LMS Academic Module (e2e)', () => {
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

  // ─── Academic Year ────────────────────────────────────
  describe('Academic Year CRUD', () => {
    let academicYearId: number;

    it('should create an academic year (POST /api/v1/lms/academic-years)', () => {
      return request(app)
        .post('/api/v1/lms/academic-years')
        .auth(apiToken, { type: 'bearer' })
        .send({
          institutionId: 1,
          name: `AY-${Date.now()}`,
          startDate: '2025-04-01',
          endDate: '2026-03-31',
          isCurrent: true,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          academicYearId = body.id;
        });
    });

    it('should return all academic years (GET /api/v1/lms/academic-years)', () => {
      return request(app)
        .get('/api/v1/lms/academic-years')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one academic year (GET /api/v1/lms/academic-years/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/academic-years/${academicYearId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(academicYearId);
        });
    });

    it('should update an academic year (PATCH /api/v1/lms/academic-years/:id)', () => {
      return request(app)
        .patch(`/api/v1/lms/academic-years/${academicYearId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Updated AY' })
        .expect(200);
    });

    it('should return 404 (GET /api/v1/lms/academic-years/999999)', () => {
      return request(app)
        .get('/api/v1/lms/academic-years/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('should delete an academic year (DELETE /api/v1/lms/academic-years/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/academic-years/${academicYearId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Term ─────────────────────────────────────────────
  describe('Term CRUD', () => {
    let academicYearId: number;
    let termId: number;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/lms/academic-years')
        .auth(apiToken, { type: 'bearer' })
        .send({
          institutionId: 1,
          name: `Term-AY-${Date.now()}`,
          startDate: '2025-04-01',
          endDate: '2026-03-31',
          isCurrent: false,
        });
      academicYearId = res.body.id;
    });

    it('should create a term (POST /api/v1/lms/terms)', () => {
      return request(app)
        .post('/api/v1/lms/terms')
        .auth(apiToken, { type: 'bearer' })
        .send({
          academicYearId,
          name: 'Term 1',
          startDate: '2025-04-01',
          endDate: '2025-09-30',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          termId = body.id;
        });
    });

    it('should return all terms (GET /api/v1/lms/terms)', () => {
      return request(app)
        .get('/api/v1/lms/terms')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one term (GET /api/v1/lms/terms/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/terms/${termId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should update a term (PATCH /api/v1/lms/terms/:id)', () => {
      return request(app)
        .patch(`/api/v1/lms/terms/${termId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Term 2' })
        .expect(200);
    });

    it('should delete a term (DELETE /api/v1/lms/terms/:id)', () => {
      return request(app)
        .delete(`/api/v1/lms/terms/${termId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });

    afterAll(async () => {
      await request(app)
        .delete(`/api/v1/lms/academic-years/${academicYearId}`)
        .auth(apiToken, { type: 'bearer' });
    });
  });
});
