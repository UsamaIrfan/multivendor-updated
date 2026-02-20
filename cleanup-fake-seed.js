const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');

const client = new Client({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  ssl:
    process.env.DATABASE_SSL_ENABLED === 'true'
      ? {
          rejectUnauthorized:
            process.env.DATABASE_REJECT_UNAUTHORIZED !== 'false',
        }
      : false,
});

(async () => {
  await client.connect();

  // Find the institution id
  const res = await client.query(
    'SELECT id FROM institution WHERE code = \'FAKE-SEED\' AND "deletedAt" IS NULL',
  );
  if (res.rows.length === 0) {
    console.log('No FAKE-SEED institution found – nothing to clean up');
    await client.end();
    return;
  }
  const instId = res.rows[0].id;
  console.log('Found FAKE-SEED institution id:', instId);

  const tid = '00000000-0000-0000-0000-000000000001';

  // Delete in reverse dependency order (camelCase column names - TypeORM default)
  const deletes = [
    // Feature module tables (new modules)
    `DELETE FROM student_guardian WHERE "tenantId" = '${tid}'`,
    `DELETE FROM download_record WHERE "tenantId" = '${tid}'`,
    `DELETE FROM assignment_submission WHERE "tenantId" = '${tid}'`,
    `DELETE FROM assignment WHERE "tenantId" = '${tid}'`,
    `DELETE FROM material WHERE "tenantId" = '${tid}'`,
    `DELETE FROM payroll_slip WHERE "tenantId" = '${tid}'`,
    `DELETE FROM salary_structure WHERE "tenantId" = '${tid}'`,
    `DELETE FROM branch_expense WHERE "tenantId" = '${tid}'`,
    `DELETE FROM branch_income WHERE "tenantId" = '${tid}'`,
    `DELETE FROM timetables WHERE "tenantId" = '${tid}'`,
    `DELETE FROM timetable_slot WHERE "tenantId" = '${tid}'`,
    `DELETE FROM notices WHERE "tenantId" = '${tid}'`,
    `DELETE FROM notice WHERE "tenantId" = '${tid}'`,
    `DELETE FROM staff_leave_balance WHERE "tenantId" = '${tid}'`,
    `DELETE FROM staff_leave_application WHERE "tenantId" = '${tid}'`,
    `DELETE FROM staff_attendance_record WHERE "tenantId" = '${tid}'`,
    `DELETE FROM staff_branch_assignment`,
    `DELETE FROM staff_mgmt WHERE "tenantId" = '${tid}'`,
    `DELETE FROM fee_concession WHERE "tenantId" = '${tid}'`,
    `DELETE FROM fee_receipt WHERE "tenantId" = '${tid}'`,
    `DELETE FROM grading_scale WHERE "tenantId" = '${tid}'`,
    // LMS tables
    `DELETE FROM exam_result WHERE "tenantId" = '${tid}'`,
    `DELETE FROM exam_subject WHERE "tenantId" = '${tid}'`,
    `DELETE FROM exam WHERE "tenantId" = '${tid}'`,
    `DELETE FROM fee_payment WHERE "tenantId" = '${tid}'`,
    `DELETE FROM fee_challan WHERE "tenantId" = '${tid}'`,
    `DELETE FROM fee_structure WHERE "tenantId" = '${tid}'`,
    `DELETE FROM course_material WHERE "tenantId" = '${tid}'`,
    `DELETE FROM student_leave_request WHERE "tenantId" = '${tid}'`,
    `DELETE FROM student_attendance WHERE "tenantId" = '${tid}'`,
    `DELETE FROM student_enrollment WHERE "tenantId" = '${tid}'`,
    `DELETE FROM student_document WHERE "tenantId" = '${tid}'`,
    `DELETE FROM admission_enquiry WHERE "tenantId" = '${tid}'`,
    `DELETE FROM salary_slip WHERE "tenantId" = '${tid}'`,
    `DELETE FROM staff_leave WHERE "tenantId" = '${tid}'`,
    `DELETE FROM staff_attendance WHERE "tenantId" = '${tid}'`,
    `DELETE FROM expense WHERE "tenantId" = '${tid}'`,
    `DELETE FROM income WHERE "tenantId" = '${tid}'`,
    `DELETE FROM staff WHERE "tenantId" = '${tid}'`,
    `DELETE FROM student WHERE "tenantId" = '${tid}'`,
    `DELETE FROM term WHERE "tenantId" = '${tid}'`,
    `DELETE FROM academic_year WHERE "tenantId" = '${tid}'`,
    `DELETE FROM subject WHERE "tenantId" = '${tid}'`,
    `DELETE FROM section WHERE "tenantId" = '${tid}'`,
    `DELETE FROM grade_class WHERE "tenantId" = '${tid}'`,
    `DELETE FROM department WHERE "tenantId" = '${tid}'`,
    `DELETE FROM institution WHERE id = ${instId}`,
  ];

  for (const sql of deletes) {
    try {
      const r = await client.query(sql);
      if (r.rowCount > 0) {
        const table = sql.match(/FROM (\S+)/)?.[1] || '?';
        console.log(`  Deleted ${r.rowCount} from ${table}`);
      }
    } catch (e) {
      const table = sql.match(/FROM (\S+)/)?.[1] || '?';
      console.log(`  SKIP ${table}: ${e.message.substring(0, 100)}`);
    }
  }

  // Delete fake users by email pattern
  try {
    const userDel = await client.query(
      "DELETE FROM \"user\" WHERE email LIKE 'fake-%@example.com'",
    );
    console.log(`  Deleted ${userDel.rowCount} fake users`);
  } catch (e) {
    console.log(`  SKIP users: ${e.message.substring(0, 100)}`);
  }

  await client.end();
  console.log('Cleanup done!');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
