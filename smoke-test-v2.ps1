# Smoke Test Script for LMS API - v2 (corrected routes)
# Credentials: admin@example.com / secret

$ErrorActionPreference = "Continue"

# Login
Write-Host "`n=== STEP 1: LOGIN ===" -ForegroundColor Cyan
$loginBody = '{"email":"admin@example.com","password":"secret"}'
try {
    $loginResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/email/login" -Method POST -Body $loginBody -Headers @{"Content-Type"="application/json"} -TimeoutSec 10
    $TOKEN = $loginResult.token
    $userId = $loginResult.user.id
    Write-Host "  LOGIN OK - User: $($loginResult.user.firstName) $($loginResult.user.lastName) (ID: $userId, Role: $($loginResult.user.role.name))" -ForegroundColor Green
} catch {
    Write-Host "  LOGIN FAILED: $_" -ForegroundColor Red
    exit 1
}

$AUTH = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

# Helper function
$script:pass = 0
$script:fail = 0
$script:warn = 0

function Smoke($method, $path, $label, $body) {
    try {
        $uri = "http://localhost:3000$path"
        $params = @{ Uri = $uri; Method = $method; Headers = $AUTH; UseBasicParsing = $true; TimeoutSec = 10 }
        if ($body) { $params.Body = $body }
        $r = Invoke-WebRequest @params
        $statusCode = [int]$r.StatusCode
        $bodyLen = $r.Content.Length
        Write-Host "  $statusCode OK  | $label ($bodyLen bytes)" -ForegroundColor Green
        $script:pass++
        return $r.Content
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
        $color = if ($code -eq 403 -or $code -eq 404) { "Yellow" } else { "Red" }
        Write-Host "  $code FAIL | $label" -ForegroundColor $color
        if ($code -eq 403 -or $code -eq 404) { $script:warn++ } else { $script:fail++ }
        return $null
    }
}

# Select tenant 
Write-Host "`n=== STEP 2: TENANT SELECTION ===" -ForegroundColor Cyan
# First get user's tenants via correct endpoint
$tenantsJson = Smoke "GET" "/api/v1/tenant-users/user/$userId" "TenantUsers: Get user tenants"
if ($tenantsJson) {
    $tenantList = $tenantsJson | ConvertFrom-Json
    if ($tenantList.Count -gt 0) {
        $tenantId = $tenantList[0].tenantId
        $tenantName = $tenantList[0].tenantName
        Write-Host "  Found $($tenantList.Count) tenant(s). Selecting: $tenantName ($tenantId)" -ForegroundColor Cyan
        
        $selectBody = @{ tenantId = $tenantId } | ConvertTo-Json -Compress
        Write-Host "  Select body: $selectBody" -ForegroundColor Gray
        $resultJson = Smoke "POST" "/api/v1/auth/tenant/select" "Auth: Select tenant" $selectBody
        if ($resultJson) {
            $selectResult = $resultJson | ConvertFrom-Json
            $TOKEN = $selectResult.token
            $AUTH = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }
            Write-Host "  Tenant selected. New token received." -ForegroundColor Green
        }
    }
}

Write-Host "`n=== STEP 3: AUTH & USERS ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/auth/me" "Auth: Get current user" | Out-Null
Smoke "GET" "/api/v1/users?page=1&limit=5" "Users: List" | Out-Null

Write-Host "`n=== STEP 4: MULTI-TENANCY ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/tenants" "Tenants: List all" | Out-Null
Smoke "GET" "/api/v1/tenant-users/user/$userId" "TenantUsers: By user" | Out-Null
Smoke "GET" "/api/v1/branches/tenant/$tenantId" "Branches: By tenant" | Out-Null
Smoke "GET" "/api/v1/auth/tenants" "Auth: Get user tenants" | Out-Null

Write-Host "`n=== STEP 5: ACADEMICS ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/lms/institutions?page=1&limit=5" "Institutions: List" | Out-Null
Smoke "GET" "/api/v1/lms/departments?page=1&limit=5" "Departments: List" | Out-Null
Smoke "GET" "/api/v1/lms/grade-classes?page=1&limit=5" "Grade Classes: List" | Out-Null
Smoke "GET" "/api/v1/lms/sections?page=1&limit=5" "Sections: List" | Out-Null
Smoke "GET" "/api/v1/lms/subjects?page=1&limit=5" "Subjects: List" | Out-Null
Smoke "GET" "/api/v1/lms/academic-years?page=1&limit=5" "Academic Years: List" | Out-Null
Smoke "GET" "/api/v1/lms/terms?page=1&limit=5" "Terms: List" | Out-Null
Smoke "GET" "/api/v1/lms/exam-subjects?page=1&limit=5" "Exam Subjects: List" | Out-Null

Write-Host "`n=== STEP 6: STUDENT REGISTRATION ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/student-registration?page=1&limit=5" "Student Reg: List" | Out-Null

Write-Host "`n=== STEP 7: ATTENDANCE ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/attendance?page=1&limit=5" "Attendance: List records" | Out-Null
Smoke "GET" "/api/v1/attendance/alerts" "Attendance: Alerts" | Out-Null
# Summary & detailed need required params
Smoke "GET" "/api/v1/attendance/reports/summary?attendableType=student&attendableId=1&startDate=2025-01-01&endDate=2025-12-31" "Attendance: Summary report" | Out-Null
Smoke "GET" "/api/v1/attendance/reports/detailed?attendableType=student&attendableId=1&startDate=2025-01-01&endDate=2025-12-31" "Attendance: Detailed report" | Out-Null

Write-Host "`n=== STEP 8: FEES ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/fees/reports/collection" "Fee Reports: Collection" | Out-Null
Smoke "GET" "/api/v1/fees/reports/pending" "Fee Reports: Pending" | Out-Null
Smoke "GET" "/api/v1/fees/reports/defaulters" "Fee Reports: Defaulters" | Out-Null

Write-Host "`n=== STEP 9: EXAMS ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/exams/grading-scales?page=1&limit=5" "Exams: Grading scales" | Out-Null

Write-Host "`n=== STEP 10: STAFF MANAGEMENT ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/staff-management?page=1&limit=5" "Staff Mgmt: List" | Out-Null
Smoke "GET" "/api/v1/staff-management/my-branches" "Staff Mgmt: My branches" | Out-Null

Write-Host "`n=== STEP 11: STAFF ATTENDANCE ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/staff/attendance/reports" "Staff Attendance: Reports" | Out-Null

Write-Host "`n=== STEP 12: STAFF LEAVES ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/staff/leaves?page=1&limit=5" "Staff Leaves: List" | Out-Null
Smoke "GET" "/api/v1/staff/leaves/balance" "Staff Leaves: Balance" | Out-Null

Write-Host "`n=== STEP 13: NOTICES ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/notices?page=1&limit=5" "Notices: List" | Out-Null

Write-Host "`n=== STEP 14: TIMETABLES ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/timetables?page=1&limit=5" "Timetables: List" | Out-Null

Write-Host "`n=== STEP 15: PAYROLL ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/payroll/structures?page=1&limit=5" "Payroll: Structures list" | Out-Null
Smoke "GET" "/api/v1/payroll/slips?page=1&limit=5" "Payroll: Slips list" | Out-Null

Write-Host "`n=== STEP 16: ACCOUNTS ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/income?page=1&limit=5" "Income: List" | Out-Null
Smoke "GET" "/api/v1/expenses?page=1&limit=5" "Expenses: List" | Out-Null

Write-Host "`n=== STEP 17: MATERIALS ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/materials?page=1&limit=5" "Materials: List" | Out-Null
Smoke "GET" "/api/v1/materials/assignments?page=1&limit=5" "Materials: Assignments" | Out-Null
Smoke "GET" "/api/v1/materials/quota" "Materials: Quota" | Out-Null

Write-Host "`n=== STEP 18: FINANCIAL DASHBOARD ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/financial-dashboard" "Financial Dashboard: Summary" | Out-Null
Smoke "GET" "/api/v1/financial-dashboard/profit-loss" "Financial Dashboard: P/L" | Out-Null
Smoke "GET" "/api/v1/financial-dashboard/balance-sheet" "Financial Dashboard: BS" | Out-Null
Smoke "GET" "/api/v1/financial-dashboard/cash-flow" "Financial Dashboard: CF" | Out-Null

Write-Host "`n=== STEP 19: PORTALS ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/portals/student/dashboard" "Portal: Student Dashboard" | Out-Null
Smoke "GET" "/api/v1/portals/staff/dashboard" "Portal: Staff Dashboard" | Out-Null

Write-Host "`n=== STEP 20: LMS LEGACY ===" -ForegroundColor Cyan
Smoke "GET" "/api/v1/lms/students?page=1&limit=5" "LMS: Students" | Out-Null
Smoke "GET" "/api/v1/lms/staff?page=1&limit=5" "LMS: Staff" | Out-Null
Smoke "GET" "/api/v1/lms/admission-enquiries?page=1&limit=5" "LMS: Enquiries" | Out-Null

Write-Host "`n==============================" -ForegroundColor Cyan
Write-Host "SMOKE TEST RESULTS" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "  PASS: $($script:pass)" -ForegroundColor Green
Write-Host "  FAIL: $($script:fail)" -ForegroundColor $(if ($script:fail -eq 0) { "Green" } else { "Red" })
Write-Host "  WARN (4xx): $($script:warn)" -ForegroundColor Yellow
Write-Host "  TOTAL: $($script:pass + $script:fail + $script:warn)" -ForegroundColor White
Write-Host ""
