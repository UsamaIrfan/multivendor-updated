import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('LMS Courses Module (e2e)', () => {
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

  // ─── Institution ──────────────────────────────────────
  describe('Institution CRUD', () => {
    let institutionId: number;

    it('POST /api/v1/lms/institutions - should create an institution', () => {
      return request(app)
        .post('/api/v1/lms/institutions')
        .auth(apiToken, { type: 'bearer' })
        .send({ name: `E2E School ${Date.now()}`, type: 'school' })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          institutionId = body.id;
        });
    });

    it('GET /api/v1/lms/institutions - should return all institutions', () => {
      return request(app)
        .get('/api/v1/lms/institutions')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('GET /api/v1/lms/institutions/:id - should return one institution', async () => {
      return request(app)
        .get(`/api/v1/lms/institutions/${institutionId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(institutionId);
        });
    });

    it('PATCH /api/v1/lms/institutions/:id - should update an institution', () => {
      return request(app)
        .patch(`/api/v1/lms/institutions/${institutionId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Updated School' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.name).toBe('Updated School');
        });
    });

    it('GET /api/v1/lms/institutions/999999 - should return 404 for non-existent', () => {
      return request(app)
        .get('/api/v1/lms/institutions/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('DELETE /api/v1/lms/institutions/:id - should delete an institution', () => {
      return request(app)
        .delete(`/api/v1/lms/institutions/${institutionId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });
  });

  // ─── Department ───────────────────────────────────────
  describe('Department CRUD', () => {
    let institutionId: number;
    let departmentId: number;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/lms/institutions')
        .auth(apiToken, { type: 'bearer' })
        .send({ name: `Dept Test School ${Date.now()}`, type: 'school' });
      institutionId = res.body.id;
    });

    it('POST /api/v1/lms/departments - should create a department', () => {
      return request(app)
        .post('/api/v1/lms/departments')
        .auth(apiToken, { type: 'bearer' })
        .send({ institutionId, name: 'Science' })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          departmentId = body.id;
        });
    });

    it('GET /api/v1/lms/departments - should return all departments', () => {
      return request(app)
        .get('/api/v1/lms/departments')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('GET /api/v1/lms/departments/:id - should return one department', () => {
      return request(app)
        .get(`/api/v1/lms/departments/${departmentId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('PATCH /api/v1/lms/departments/:id - should update a department', () => {
      return request(app)
        .patch(`/api/v1/lms/departments/${departmentId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Mathematics' })
        .expect(200);
    });

    it('DELETE /api/v1/lms/departments/:id - should delete a department', () => {
      return request(app)
        .delete(`/api/v1/lms/departments/${departmentId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });

    afterAll(async () => {
      await request(app)
        .delete(`/api/v1/lms/institutions/${institutionId}`)
        .auth(apiToken, { type: 'bearer' });
    });
  });

  // ─── Grade Class ──────────────────────────────────────
  describe('Grade Class CRUD', () => {
    let institutionId: number;
    let gradeClassId: number;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/lms/institutions')
        .auth(apiToken, { type: 'bearer' })
        .send({ name: `GC Test School ${Date.now()}`, type: 'school' });
      institutionId = res.body.id;
    });

    it('POST /api/v1/lms/grade-classes - should create a grade class', () => {
      return request(app)
        .post('/api/v1/lms/grade-classes')
        .auth(apiToken, { type: 'bearer' })
        .send({ institutionId, name: 'Grade 1' })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          gradeClassId = body.id;
        });
    });

    it('GET /api/v1/lms/grade-classes - should return all grade classes', () => {
      return request(app)
        .get('/api/v1/lms/grade-classes')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('GET /api/v1/lms/grade-classes/:id - should return one grade class', () => {
      return request(app)
        .get(`/api/v1/lms/grade-classes/${gradeClassId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('PATCH /api/v1/lms/grade-classes/:id - should update a grade class', () => {
      return request(app)
        .patch(`/api/v1/lms/grade-classes/${gradeClassId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Grade 2' })
        .expect(200);
    });

    it('DELETE /api/v1/lms/grade-classes/:id - should delete a grade class', () => {
      return request(app)
        .delete(`/api/v1/lms/grade-classes/${gradeClassId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });

    afterAll(async () => {
      await request(app)
        .delete(`/api/v1/lms/institutions/${institutionId}`)
        .auth(apiToken, { type: 'bearer' });
    });
  });

  // ─── Subject ──────────────────────────────────────────
  describe('Subject CRUD', () => {
    let institutionId: number;
    let departmentId: number;
    let subjectId: number;

    beforeAll(async () => {
      const instRes = await request(app)
        .post('/api/v1/lms/institutions')
        .auth(apiToken, { type: 'bearer' })
        .send({ name: `Subj Test School ${Date.now()}`, type: 'school' });
      institutionId = instRes.body.id;

      const deptRes = await request(app)
        .post('/api/v1/lms/departments')
        .auth(apiToken, { type: 'bearer' })
        .send({ institutionId, name: 'Science' });
      departmentId = deptRes.body.id;
    });

    it('POST /api/v1/lms/subjects - should create a subject', () => {
      return request(app)
        .post('/api/v1/lms/subjects')
        .auth(apiToken, { type: 'bearer' })
        .send({ departmentId, name: 'Physics' })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          subjectId = body.id;
        });
    });

    it('GET /api/v1/lms/subjects - should return all subjects', () => {
      return request(app)
        .get('/api/v1/lms/subjects')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('GET /api/v1/lms/subjects/:id - should return one subject', () => {
      return request(app)
        .get(`/api/v1/lms/subjects/${subjectId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('PATCH /api/v1/lms/subjects/:id - should update a subject', () => {
      return request(app)
        .patch(`/api/v1/lms/subjects/${subjectId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Chemistry' })
        .expect(200);
    });

    it('DELETE /api/v1/lms/subjects/:id - should delete a subject', () => {
      return request(app)
        .delete(`/api/v1/lms/subjects/${subjectId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(204);
    });

    afterAll(async () => {
      await request(app)
        .delete(`/api/v1/lms/departments/${departmentId}`)
        .auth(apiToken, { type: 'bearer' });
      await request(app)
        .delete(`/api/v1/lms/institutions/${institutionId}`)
        .auth(apiToken, { type: 'bearer' });
    });
  });
});
