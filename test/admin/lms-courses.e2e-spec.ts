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

    it('should create an institution (POST /api/v1/lms/institutions)', () => {
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

    it('should return all institutions (GET /api/v1/lms/institutions)', () => {
      return request(app)
        .get('/api/v1/lms/institutions')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one institution (GET /api/v1/lms/institutions/:id)', async () => {
      return request(app)
        .get(`/api/v1/lms/institutions/${institutionId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(institutionId);
        });
    });

    it('should update an institution (PATCH /api/v1/lms/institutions/:id)', () => {
      return request(app)
        .patch(`/api/v1/lms/institutions/${institutionId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Updated School' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.name).toBe('Updated School');
        });
    });

    it('should return 404 for non-existent (GET /api/v1/lms/institutions/999999)', () => {
      return request(app)
        .get('/api/v1/lms/institutions/999999')
        .auth(apiToken, { type: 'bearer' })
        .expect(404);
    });

    it('should delete an institution (DELETE /api/v1/lms/institutions/:id)', () => {
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

    it('should create a department (POST /api/v1/lms/departments)', () => {
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

    it('should return all departments (GET /api/v1/lms/departments)', () => {
      return request(app)
        .get('/api/v1/lms/departments')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one department (GET /api/v1/lms/departments/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/departments/${departmentId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should update a department (PATCH /api/v1/lms/departments/:id)', () => {
      return request(app)
        .patch(`/api/v1/lms/departments/${departmentId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Mathematics' })
        .expect(200);
    });

    it('should delete a department (DELETE /api/v1/lms/departments/:id)', () => {
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

    it('should create a grade class (POST /api/v1/lms/grade-classes)', () => {
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

    it('should return all grade classes (GET /api/v1/lms/grade-classes)', () => {
      return request(app)
        .get('/api/v1/lms/grade-classes')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one grade class (GET /api/v1/lms/grade-classes/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/grade-classes/${gradeClassId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should update a grade class (PATCH /api/v1/lms/grade-classes/:id)', () => {
      return request(app)
        .patch(`/api/v1/lms/grade-classes/${gradeClassId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Grade 2' })
        .expect(200);
    });

    it('should delete a grade class (DELETE /api/v1/lms/grade-classes/:id)', () => {
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

    it('should create a subject (POST /api/v1/lms/subjects)', () => {
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

    it('should return all subjects (GET /api/v1/lms/subjects)', () => {
      return request(app)
        .get('/api/v1/lms/subjects')
        .auth(apiToken, { type: 'bearer' })
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });

    it('should return one subject (GET /api/v1/lms/subjects/:id)', () => {
      return request(app)
        .get(`/api/v1/lms/subjects/${subjectId}`)
        .auth(apiToken, { type: 'bearer' })
        .expect(200);
    });

    it('should update a subject (PATCH /api/v1/lms/subjects/:id)', () => {
      return request(app)
        .patch(`/api/v1/lms/subjects/${subjectId}`)
        .auth(apiToken, { type: 'bearer' })
        .send({ name: 'Chemistry' })
        .expect(200);
    });

    it('should delete a subject (DELETE /api/v1/lms/subjects/:id)', () => {
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
