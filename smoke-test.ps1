# Smoke Test Script for LMS API
# Credentials: admin@example.com / secret

$ErrorActionPreference = "Continue"

# Login
Write-Host "`n=== STEP 1: LOGIN ===" -ForegroundColor Cyan
$loginBody = '{"email":"admin@example.com","password":"secret"}'
try {
    $loginResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/email/login" -Method POST -Body $loginBody -Headers @{"Content-Type"="application/json"} -TimeoutSec 10
    $TOKEN = $loginResult.token
    Write-Host "LOGIN OK - User: $($loginResult.user.firstName) $($loginResult.user.lastName) (Role: $($loginResult.user.role.name))" -ForegroundColor Green
} catch {
    Write-Host "LOGIN FAILED: $_" -ForegroundColor Red
    exit 1
}

$AUTH = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

# Helper function
function Smoke($method, $path, $label) {
    try {
        $uri = "http://localhost:3000$path"
        $params = @{ Uri = $uri; Method = $method; Headers = $AUTH; UseBasicParsing = $true; TimeoutSec = 10 }
        $r = Invoke-WebRequest @params
        $statusCode = [int]$r.StatusCode
        $bodyLen = $r.Content.Length
        Write-Host "  $statusCode | $label ($bodyLen bytes)" -ForegroundColor Green
        return $true
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
        Write-Host "  $code | $label" -ForegroundColor $(if ($code -eq 403 -or $code -eq 404) { "Yellow" } else { "Red" })
        return $false
    }
}

$pass = 0; $fail = 0; $warn = 0

function Track($result) {
    if ($result -eq $true) { $script:pass++ } else { $script:fail++ }
}

# Select tenant first (needed for tenant-scoped endpoints)
Write-Host "`n=== STEP 2: TENANT SELECTION ===" -ForegroundColor Cyan
try {
    $tenants = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tenant-users/my-tenants" -Method GET -Headers $AUTH -TimeoutSec 10
    if ($tenants -and $tenants.Count -gt 0) {
        $tenantId = $tenants[0].tenantId
        Write-Host "  Found $($tenants.Count) tenant(s). Selecting: $tenantId" -ForegroundColor Green
        $selectBody = "{`"tenantId`":`"$tenantId`"}"
        $selectResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/tenant/select" -Method POST -Body $selectBody -Headers $AUTH -TimeoutSec 10
        $TOKEN = $selectResult.token
        $AUTH = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }
        Write-Host "  Tenant selected. New token received." -ForegroundColor Green
    } else {
        Write-Host "  No tenants found - skipping tenant selection" -ForegroundColor Yellow
    }
} catch {
    $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
    Write-Host "  $code | Tenant selection: $_" -ForegroundColor Yellow
}

Write-Host "`n=== STEP 3: AUTH & USERS ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/auth/me" "Auth: Get current user")
Track(Smoke "GET" "/api/v1/users?page=1&limit=5" "Users: List")

Write-Host "`n=== STEP 4: MULTI-TENANCY ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/tenants" "Tenants: List")
Track(Smoke "GET" "/api/v1/tenant-users/my-tenants" "TenantUsers: My tenants")
Track(Smoke "GET" "/api/v1/branches" "Branches: List")

Write-Host "`n=== STEP 5: ACADEMICS ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/lms/institutions?page=1&limit=5" "Institutions: List")
Track(Smoke "GET" "/api/v1/lms/departments?page=1&limit=5" "Departments: List")
Track(Smoke "GET" "/api/v1/lms/grade-classes?page=1&limit=5" "Grade Classes: List")
Track(Smoke "GET" "/api/v1/lms/sections?page=1&limit=5" "Sections: List")
Track(Smoke "GET" "/api/v1/lms/subjects?page=1&limit=5" "Subjects: List")
Track(Smoke "GET" "/api/v1/lms/class-subjects?page=1&limit=5" "Class Subjects: List")
Track(Smoke "GET" "/api/v1/lms/academic-years?page=1&limit=5" "Academic Years: List")
Track(Smoke "GET" "/api/v1/lms/terms?page=1&limit=5" "Terms: List")
Track(Smoke "GET" "/api/v1/lms/exam-subjects?page=1&limit=5" "Exam Subjects: List")

Write-Host "`n=== STEP 6: STUDENT REGISTRATION ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/student-registration?page=1&limit=5" "Student Reg: List")

Write-Host "`n=== STEP 7: ATTENDANCE ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/attendance?page=1&limit=5" "Attendance: List")
Track(Smoke "GET" "/api/v1/attendance/reports/summary" "Attendance: Summary report")
Track(Smoke "GET" "/api/v1/attendance/reports/detailed" "Attendance: Detailed report")
Track(Smoke "GET" "/api/v1/attendance/alerts" "Attendance: Alerts")

Write-Host "`n=== STEP 8: FEES ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/fees/structures?page=1&limit=5" "Fee Structures: List")
Track(Smoke "GET" "/api/v1/fees/reports/collection" "Fee Reports: Collection")
Track(Smoke "GET" "/api/v1/fees/reports/pending" "Fee Reports: Pending")
Track(Smoke "GET" "/api/v1/fees/reports/defaulters" "Fee Reports: Defaulters")

Write-Host "`n=== STEP 9: EXAMS ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/exams/grading-scales?page=1&limit=5" "Exams: Grading scales")

Write-Host "`n=== STEP 10: STAFF MANAGEMENT ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/staff-management?page=1&limit=5" "Staff Mgmt: List")
Track(Smoke "GET" "/api/v1/staff-management/my-branches" "Staff Mgmt: My branches")

Write-Host "`n=== STEP 11: STAFF ATTENDANCE ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/staff/attendance/reports" "Staff Attendance: Reports")

Write-Host "`n=== STEP 12: STAFF LEAVES ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/staff/leaves?page=1&limit=5" "Staff Leaves: List")
Track(Smoke "GET" "/api/v1/staff/leaves/balance" "Staff Leaves: Balance")

Write-Host "`n=== STEP 13: NOTICES ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/notices?page=1&limit=5" "Notices: List")

Write-Host "`n=== STEP 14: TIMETABLES ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/timetables?page=1&limit=5" "Timetables: List")

Write-Host "`n=== STEP 15: PAYROLL ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/payroll/structures?page=1&limit=5" "Payroll: Structures list")
Track(Smoke "GET" "/api/v1/payroll/slips?page=1&limit=5" "Payroll: Slips list")

Write-Host "`n=== STEP 16: ACCOUNTS ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/income?page=1&limit=5" "Income: List")
Track(Smoke "GET" "/api/v1/expenses?page=1&limit=5" "Expenses: List")

Write-Host "`n=== STEP 17: MATERIALS ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/materials?page=1&limit=5" "Materials: List")
Track(Smoke "GET" "/api/v1/materials/assignments?page=1&limit=5" "Materials: Assignments list")
Track(Smoke "GET" "/api/v1/materials/quota" "Materials: Quota")

Write-Host "`n=== STEP 18: FINANCIAL DASHBOARD ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/financial-dashboard" "Financial Dashboard: Summary")
Track(Smoke "GET" "/api/v1/financial-dashboard/profit-loss" "Financial Dashboard: Profit/Loss")
Track(Smoke "GET" "/api/v1/financial-dashboard/balance-sheet" "Financial Dashboard: Balance Sheet")
Track(Smoke "GET" "/api/v1/financial-dashboard/cash-flow" "Financial Dashboard: Cash Flow")

Write-Host "`n=== STEP 19: PORTALS ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/portals/admin-dashboard" "Portal: Admin Dashboard")
Track(Smoke "GET" "/api/v1/portals/student-dashboard" "Portal: Student Dashboard")
Track(Smoke "GET" "/api/v1/portals/staff-dashboard" "Portal: Staff Dashboard")

Write-Host "`n=== STEP 20: LMS LEGACY ===" -ForegroundColor Cyan
Track(Smoke "GET" "/api/v1/lms/students?page=1&limit=5" "LMS: Students list")
Track(Smoke "GET" "/api/v1/lms/staff?page=1&limit=5" "LMS: Staff list")
Track(Smoke "GET" "/api/v1/lms/admission-enquiries?page=1&limit=5" "LMS: Admission Enquiries")

Write-Host "`n==============================" -ForegroundColor Cyan
Write-Host "SMOKE TEST RESULTS" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "  PASS: $pass" -ForegroundColor Green
Write-Host "  FAIL: $fail" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "  TOTAL: $($pass + $fail)" -ForegroundColor White
Write-Host ""
