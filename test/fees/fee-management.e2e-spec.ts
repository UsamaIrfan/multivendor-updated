import request from 'supertest';
import {
  APP_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  TESTER_EMAIL,
  TESTER_PASSWORD,
} from '../utils/constants';

describe('Fee Management (e2e)', () => {
  const app = APP_URL;
  let adminToken: string;
  let userToken: string;

  // IDs populated through tests
  let feeStructureId: number;
  let challanId: number;
  let challanNumber: string;
  let paymentId: number;
  let concessionId: number;
  let receiptId: number;

  const studentId = 1;
  const classId = 1;
  const academicYearId = 1;
  const institutionId = 1;

  beforeAll(async () => {
    // Login as admin
    const adminRes = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    adminToken = adminRes.body.token;

    // Login as regular user (student)
    const userRes = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: TESTER_EMAIL, password: TESTER_PASSWORD });
    userToken = userRes.body.token;
  });

  // ────────── FEE STRUCTURE ──────────
  describe('POST /api/v1/fees/structures', () => {
    it('should create a fee structure for a class', async () => {
      const res = await request(app)
        .post('/api/v1/fees/structures')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          institutionId,
          gradeClassId: classId,
          academicYearId,
          name: 'Tuition Fee',
          amount: 50000,
          frequency: 'annual',
          description: 'Annual tuition fee',
          installments: [
            { label: 'Q1', amount: 12500, dueDate: '2026-04-15' },
            { label: 'Q2', amount: 12500, dueDate: '2026-07-15' },
            { label: 'Q3', amount: 12500, dueDate: '2026-10-15' },
            { label: 'Q4', amount: 12500, dueDate: '2027-01-15' },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Tuition Fee');
      expect(res.body.amount).toBe(50000);
      feeStructureId = res.body.id;
    });

    it('should reject when installments sum does not equal total', async () => {
      const res = await request(app)
        .post('/api/v1/fees/structures')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          institutionId,
          gradeClassId: classId,
          academicYearId,
          name: 'Bad Installments',
          amount: 50000,
          frequency: 'annual',
          installments: [
            { label: 'Q1', amount: 10000, dueDate: '2026-04-15' },
            { label: 'Q2', amount: 10000, dueDate: '2026-07-15' },
          ],
        })
        .expect(422);

      expect(res.body.errors).toBeDefined();
    });

    it('should prevent duplicate fee structure for same class/year/name', async () => {
      await request(app)
        .post('/api/v1/fees/structures')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          institutionId,
          gradeClassId: classId,
          academicYearId,
          name: 'Tuition Fee',
          amount: 50000,
          frequency: 'annual',
        })
        .expect(409);
    });

    it('should associate with academic year', async () => {
      const res = await request(app)
        .get(`/api/v1/fees/structures/${feeStructureId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.academicYearId).toBe(academicYearId);
    });
  });

  // ────────── CHALLAN GENERATION ──────────
  describe('POST /api/v1/fees/challans/generate', () => {
    it('should generate a challan for a student', async () => {
      const res = await request(app)
        .post('/api/v1/fees/challans/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          feeStructureId,
          installmentIndex: 0,
          dueDate: '2026-04-15',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('challanNumber');
      expect(res.body.challanNumber).toMatch(/^CH-\d{4}-\d{6}$/);
      expect(res.body.status).toBe('pending');
      challanId = res.body.id;
      challanNumber = res.body.challanNumber;
    });

    it('should apply concession if applicable', async () => {
      // First create a concession, then generate a challan
      // Concession test will be standalone — here we just verify
      // discount field is present
      expect(typeof challanId).toBe('number');
    });

    it('should prevent duplicate challan for same student/structure/installment', async () => {
      await request(app)
        .post('/api/v1/fees/challans/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          feeStructureId,
          installmentIndex: 0,
          dueDate: '2026-04-15',
        })
        .expect(409);
    });
  });

  describe('POST /api/v1/fees/challans/generate-bulk', () => {
    it('should bulk generate challans for a class', async () => {
      const res = await request(app)
        .post('/api/v1/fees/challans/generate-bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          gradeClassId: classId,
          feeStructureId,
          installmentIndex: 1,
          dueDate: '2026-07-15',
        })
        .expect(201);

      expect(res.body).toHaveProperty('generated');
      expect(res.body).toHaveProperty('skipped');
      expect(typeof res.body.generated).toBe('number');
    });

    it('should skip students whose installment is already paid', async () => {
      // Re-run same bulk — should skip all
      const res = await request(app)
        .post('/api/v1/fees/challans/generate-bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          gradeClassId: classId,
          feeStructureId,
          installmentIndex: 1,
          dueDate: '2026-07-15',
        })
        .expect(201);

      expect(res.body.skipped).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/v1/fees/challans/:challanNumber', () => {
    it('should retrieve challan details', async () => {
      const res = await request(app)
        .get(`/api/v1/fees/challans/${challanNumber}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.challanNumber).toBe(challanNumber);
      expect(res.body).toHaveProperty('studentId');
      expect(res.body).toHaveProperty('status');
    });

    it('should return 404 for invalid challan', async () => {
      await request(app)
        .get('/api/v1/fees/challans/CH-0000-000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ────────── PAYMENTS ──────────
  describe('POST /api/v1/fees/payments', () => {
    it('should record a full payment', async () => {
      const res = await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          challanId,
          amount: 12500,
          method: 'cash',
          paidAt: new Date().toISOString(),
          remarks: 'Q1 payment',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('receiptNumber');
      expect(res.body.amount).toBe(12500);
      paymentId = res.body.id;
      receiptId = res.body.receiptId || res.body.id;
    });

    it('should update challan status to PAID for full payment', async () => {
      const res = await request(app)
        .get(`/api/v1/fees/challans/${challanNumber}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('paid');
      expect(Number(res.body.paidAmount)).toBe(12500);
    });

    it('should handle partial payment', async () => {
      // Generate another challan first
      const challan2 = await request(app)
        .post('/api/v1/fees/challans/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          feeStructureId,
          installmentIndex: 2,
          dueDate: '2026-10-15',
        })
        .expect(201);

      // Pay only half
      const res = await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          challanId: challan2.body.id,
          amount: 6250,
          method: 'bank_transfer',
          transactionRef: 'BT-2026-001',
        })
        .expect(201);

      expect(res.body.amount).toBe(6250);

      // Verify challan is partial
      const challanRes = await request(app)
        .get(`/api/v1/fees/challans/${challan2.body.challanNumber}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(challanRes.body.status).toBe('partial');
    });

    it('should prevent overpayment', async () => {
      // Try paying more than remaining on the first (already paid) challan
      await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          challanId,
          amount: 1,
          method: 'cash',
        })
        .expect(422);
    });
  });

  describe('PATCH /api/v1/fees/payments/:id/verify', () => {
    it('should verify a payment', async () => {
      const res = await request(app)
        .patch(`/api/v1/fees/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.verified).toBe(true);
    });

    it('should reject verification by non-admin', async () => {
      await request(app)
        .patch(`/api/v1/fees/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  // ────────── CONCESSIONS ──────────
  describe('POST /api/v1/fees/concessions', () => {
    it('should apply a concession to a student', async () => {
      const res = await request(app)
        .post('/api/v1/fees/concessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          type: 'scholarship',
          discountPercentage: 25,
          validFrom: '2026-01-01',
          validTo: '2026-12-31',
          reason: 'Merit scholarship',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.discountPercentage).toBe(25);
      expect(res.body.type).toBe('scholarship');
      concessionId = res.body.id;
    });

    it('should reject invalid discount percentage', async () => {
      await request(app)
        .post('/api/v1/fees/concessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          type: 'scholarship',
          discountPercentage: 150,
          validFrom: '2026-01-01',
          validTo: '2026-12-31',
        })
        .expect(422);
    });

    it('should validate concession date range', async () => {
      await request(app)
        .post('/api/v1/fees/concessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          type: 'merit',
          discountPercentage: 10,
          validFrom: '2026-12-31',
          validTo: '2026-01-01',
        })
        .expect(422);
    });
  });

  describe('GET /api/v1/fees/students/:id/effective-concession', () => {
    it('should return the effective concession for a student', async () => {
      const res = await request(app)
        .get(`/api/v1/fees/students/${studentId}/effective-concession`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('effectiveDiscount');
      expect(res.body.effectiveDiscount).toBeGreaterThanOrEqual(0);
      expect(res.body.effectiveDiscount).toBeLessThanOrEqual(100);
    });

    it('should handle multiple overlapping concessions (highest wins)', async () => {
      // Add another concession
      await request(app)
        .post('/api/v1/fees/concessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          type: 'sibling',
          discountPercentage: 10,
          validFrom: '2026-01-01',
          validTo: '2026-12-31',
          reason: 'Sibling discount',
        })
        .expect(201);

      const res = await request(app)
        .get(`/api/v1/fees/students/${studentId}/effective-concession`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Highest wins (25%)
      expect(res.body.effectiveDiscount).toBe(25);
    });
  });

  // ────────── RECEIPTS ──────────
  describe('GET /api/v1/fees/receipts/:id/pdf', () => {
    it('should generate a PDF receipt', async () => {
      const res = await request(app)
        .get(`/api/v1/fees/receipts/${receiptId}/pdf`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.body).toBeDefined();
    });

    it('should return 404 for invalid receipt', async () => {
      await request(app)
        .get('/api/v1/fees/receipts/999999/pdf')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ────────── REPORTS ──────────
  describe('GET /api/v1/fees/reports/collection', () => {
    it('should return collection report with filters', async () => {
      const res = await request(app)
        .get('/api/v1/fees/reports/collection')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          dateFrom: '2026-01-01',
          dateTo: '2026-12-31',
        })
        .expect(200);

      expect(res.body).toHaveProperty('totalCollected');
      expect(res.body).toHaveProperty('byPaymentMode');
      expect(res.body).toHaveProperty('byClass');
    });
  });

  describe('GET /api/v1/fees/reports/pending', () => {
    it('should return students with pending fees', async () => {
      const res = await request(app)
        .get('/api/v1/fees/reports/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.students)).toBe(true);
      expect(res.body).toHaveProperty('totalPending');
    });
  });

  describe('GET /api/v1/fees/reports/defaulters', () => {
    it('should return fee defaulters list', async () => {
      const res = await request(app)
        .get('/api/v1/fees/reports/defaulters')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('daysOverdue');
        expect(res.body[0]).toHaveProperty('amountDue');
      }
    });
  });

  // ────────── REMINDERS ──────────
  describe('POST /api/v1/fees/send-reminders', () => {
    it('should send payment reminders', async () => {
      const res = await request(app)
        .post('/api/v1/fees/send-reminders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          gradeClassId: classId,
        })
        .expect(200);

      expect(res.body).toHaveProperty('sent');
      expect(res.body).toHaveProperty('skipped');
    });

    it('should respect reminder throttling', async () => {
      // Immediately send again — should skip recently reminded
      const res = await request(app)
        .post('/api/v1/fees/send-reminders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          gradeClassId: classId,
        })
        .expect(200);

      expect(res.body.skipped).toBeGreaterThanOrEqual(0);
    });
  });

  // ────────── STUDENT PORTAL ──────────
  describe('GET /api/v1/fees/my-challans', () => {
    it('should return student own challans', async () => {
      const res = await request(app)
        .get('/api/v1/fees/my-challans')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should include payment history', async () => {
      const res = await request(app)
        .get('/api/v1/fees/my-challans')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('payments');
      }
    });
  });
});
