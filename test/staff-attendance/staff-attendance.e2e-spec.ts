import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

/**
 * Staff Attendance E2E Tests
 *
 * Covers:
 * - Check-in / Check-out with branch tracking
 * - Tenant isolation for attendance records
 * - Leave application within tenant
 * - Leave balance per tenant
 * - Attendance reports scoped by tenant and branch
 * - Leave approval / rejection workflow
 */
describe('Staff Attendance (e2e)', () => {
  const app = APP_URL;
  let apiToken: string;
  let tenantAToken: string;
  let tenantBToken: string;

  // IDs captured during tests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let attendanceId: number;
  let leaveId: number;

  // Assumed tenant / branch / staff UUIDs (seeded)
  const TENANT_A_ID = '00000000-0000-0000-0000-000000000001';
  const TENANT_B_ID = '00000000-0000-0000-0000-000000000002';
  const BRANCH_A1_ID = '00000000-0000-0000-0000-0000000000a1';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const BRANCH_A2_ID = '00000000-0000-0000-0000-0000000000a2';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const BRANCH_B1_ID = '00000000-0000-0000-0000-0000000000b1';

  // Staff IDs from staff_mgmt table (integer PKs, seeded)
  const STAFF_A1_ID = 1;
  const STAFF_A2_ID = 2;

  beforeAll(async () => {
    // Login as admin
    const loginRes = await request(app)
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    apiToken = loginRes.body.token;

    // Select tenant A
    const tenantARes = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(apiToken, { type: 'bearer' })
      .send({ tenantId: TENANT_A_ID });

    tenantAToken = tenantARes.body.token ?? apiToken;

    // Select tenant B
    const tenantBRes = await request(app)
      .post('/api/v1/auth/tenant/select')
      .auth(apiToken, { type: 'bearer' })
      .send({ tenantId: TENANT_B_ID });

    tenantBToken = tenantBRes.body.token ?? apiToken;
  });

  // ═══════════════════════════════════════════════════════
  //  Check-In
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/staff/attendance/check-in', () => {
    it('should check in staff at specific branch', async () => {
      const res = await request(app)
        .post('/api/v1/staff/attendance/check-in')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          staffId: STAFF_A1_ID,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.tenantId).toBe(TENANT_A_ID);
      expect(res.body.branchId).toBe(BRANCH_A1_ID);
      expect(res.body.staffId).toBe(STAFF_A1_ID);
      expect(res.body.checkInTime).toBeDefined();
      expect(res.body.date).toBeDefined();
      expect(res.body.status).toBe('present');

      attendanceId = res.body.id;
    });

    it('should prevent duplicate check-in on same day', async () => {
      await request(app)
        .post('/api/v1/staff/attendance/check-in')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          staffId: STAFF_A1_ID,
        })
        .expect(409); // Conflict — already checked in
    });

    it('should allow check-in for different staff on same day', async () => {
      const res = await request(app)
        .post('/api/v1/staff/attendance/check-in')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          staffId: STAFF_A2_ID,
        })
        .expect(201);

      expect(res.body.staffId).toBe(STAFF_A2_ID);
    });

    it('should enforce tenant isolation — tenant B cannot see tenant A attendance', async () => {
      const res = await request(app)
        .get('/api/v1/staff/attendance/reports')
        .auth(tenantBToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_B_ID)
        .expect(200);

      const tenantARecords = (res.body.data || res.body).filter(
        (r: any) => r.tenantId === TENANT_A_ID,
      );
      expect(tenantARecords.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Check-Out
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/staff/attendance/check-out', () => {
    it('should check out staff', async () => {
      const res = await request(app)
        .post('/api/v1/staff/attendance/check-out')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          staffId: STAFF_A1_ID,
        })
        .expect(200);

      expect(res.body.checkOutTime).toBeDefined();
    });

    it('should return 404 when no check-in exists for check-out', async () => {
      await request(app)
        .post('/api/v1/staff/attendance/check-out')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          staffId: 9999,
        })
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Attendance Reports
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/staff/attendance/reports', () => {
    it('should return attendance for current tenant only', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get('/api/v1/staff/attendance/reports')
        .query({ startDate: today, endDate: today })
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      const records = res.body.data || res.body;
      expect(Array.isArray(records)).toBe(true);
      records.forEach((r: any) => {
        expect(r.tenantId).toBe(TENANT_A_ID);
      });
    });

    it('should filter by branch', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get('/api/v1/staff/attendance/reports')
        .query({ branchId: BRANCH_A1_ID, startDate: today, endDate: today })
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      const records = res.body.data || res.body;
      expect(Array.isArray(records)).toBe(true);
      records.forEach((r: any) => {
        expect(r.branchId).toBe(BRANCH_A1_ID);
      });
    });

    it('should filter by staff', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get('/api/v1/staff/attendance/reports')
        .query({ staffId: STAFF_A1_ID, startDate: today, endDate: today })
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      const records = res.body.data || res.body;
      expect(records.length).toBeGreaterThanOrEqual(1);
      records.forEach((r: any) => {
        expect(r.staffId).toBe(STAFF_A1_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Leave Application
  // ═══════════════════════════════════════════════════════
  describe('POST /api/v1/staff/leaves', () => {
    it('should apply leave within current tenant', async () => {
      const res = await request(app)
        .post('/api/v1/staff/leaves')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          staffId: STAFF_A1_ID,
          fromDate: '2026-03-01',
          toDate: '2026-03-03',
          leaveType: 'casual',
          reason: 'Family event',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.tenantId).toBe(TENANT_A_ID);
      expect(res.body.staffId).toBe(STAFF_A1_ID);
      expect(res.body.status).toBe('pending');

      leaveId = res.body.id;
    });

    it('should reject overlapping leave application', async () => {
      await request(app)
        .post('/api/v1/staff/leaves')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          staffId: STAFF_A1_ID,
          fromDate: '2026-03-02',
          toDate: '2026-03-04',
          leaveType: 'casual',
          reason: 'Overlapping',
        })
        .expect(409);
    });

    it('should list leaves for current tenant', async () => {
      const res = await request(app)
        .get('/api/v1/staff/leaves')
        .query({ staffId: STAFF_A1_ID })
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      res.body.forEach((l: any) => {
        expect(l.tenantId).toBe(TENANT_A_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Leave Balance
  // ═══════════════════════════════════════════════════════
  describe('GET /api/v1/staff/leaves/balance', () => {
    it('should return balance per tenant', async () => {
      const res = await request(app)
        .get('/api/v1/staff/leaves/balance')
        .query({ staffId: STAFF_A1_ID })
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((b: any) => {
        expect(b.tenantId).toBe(TENANT_A_ID);
        expect(b.staffId).toBe(STAFF_A1_ID);
        expect(b.totalDays).toBeDefined();
        expect(b.usedDays).toBeDefined();
        expect(b.year).toBeDefined();
      });
    });

    it('should filter balance by leave type', async () => {
      const res = await request(app)
        .get('/api/v1/staff/leaves/balance')
        .query({ staffId: STAFF_A1_ID, leaveType: 'casual' })
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((b: any) => {
        expect(b.leaveType).toBe('casual');
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Leave Approval / Rejection
  // ═══════════════════════════════════════════════════════
  describe('PATCH /api/v1/staff/leaves/:id/approve', () => {
    it('should approve a pending leave', async () => {
      const res = await request(app)
        .patch(`/api/v1/staff/leaves/${leaveId}/approve`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({ adminRemarks: 'Approved by admin' })
        .expect(200);

      expect(res.body.status).toBe('approved');
      expect(res.body.adminRemarks).toBe('Approved by admin');
    });

    it('should deduct from leave balance after approval', async () => {
      const res = await request(app)
        .get('/api/v1/staff/leaves/balance')
        .query({ staffId: STAFF_A1_ID, leaveType: 'casual' })
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .expect(200);

      // After approving 3 days (Mar 1-3), usedDays should increase
      const casualBalance = res.body.find((b: any) => b.leaveType === 'casual');
      if (casualBalance) {
        expect(Number(casualBalance.usedDays)).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('PATCH /api/v1/staff/leaves/:id/reject', () => {
    it('should reject a pending leave', async () => {
      // Apply new leave first
      const applyRes = await request(app)
        .post('/api/v1/staff/leaves')
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .set('X-Branch-ID', BRANCH_A1_ID)
        .send({
          tenantId: TENANT_A_ID,
          branchId: BRANCH_A1_ID,
          staffId: STAFF_A1_ID,
          fromDate: '2026-04-10',
          toDate: '2026-04-11',
          leaveType: 'sick',
          reason: 'Doctor appointment',
        })
        .expect(201);

      const newLeaveId = applyRes.body.id;

      const res = await request(app)
        .patch(`/api/v1/staff/leaves/${newLeaveId}/reject`)
        .auth(tenantAToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_A_ID)
        .send({ adminRemarks: 'Insufficient documentation' })
        .expect(200);

      expect(res.body.status).toBe('rejected');
      expect(res.body.adminRemarks).toBe('Insufficient documentation');
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Tenant Isolation — Leave Balance
  // ═══════════════════════════════════════════════════════
  describe('Tenant isolation for leave balance', () => {
    it('should have independent leave balance from tenant A (tenant B)', async () => {
      const res = await request(app)
        .get('/api/v1/staff/leaves/balance')
        .query({ staffId: STAFF_A1_ID })
        .auth(tenantBToken, { type: 'bearer' })
        .set('X-Tenant-ID', TENANT_B_ID)
        .expect(200);

      // Tenant B should not see tenant A's balance
      const tenantABalances = res.body.filter(
        (b: any) => b.tenantId === TENANT_A_ID,
      );
      expect(tenantABalances.length).toBe(0);
    });
  });
});
