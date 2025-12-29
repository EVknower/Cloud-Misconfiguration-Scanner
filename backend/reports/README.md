# PDF Reports - Information

## 📁 Location
All compliance reports are saved in:
```
backend/reports/
```

## 📄 Naming Convention
```
compliance_report_<scan_id>.pdf
```

Example: `compliance_report_scan_20251229_223000.pdf`

## 🎨 PDF Contents

Each PDF report includes:

### 1. Report Header
- Cloud Security Compliance Report title
- Professional blue color scheme (#1976d2)

### 2. Scan Summary Table
- Scan ID
- Cloud Provider (AWS/Azure/GCP)
- Timestamp
- CIS Compliance Score (%)
- Total Findings
- Critical/High/Medium counts

### 3. Detailed Findings
Each finding includes:
- **Color-coded severity header** (Red=Critical, Orange=High, Yellow=Medium)
- Rule ID (e.g., CIS-AWS-1.2)
- Rule Name
- Resource Type & ID
- Description
- Remediation steps

### 4. Recommendations Section
- Best practice recommendations
- Numbered list format

### 5. Footer
- Generation timestamp
- Application version

## 💾 How to Generate

### From Frontend:
1. Start a security scan
2. Click "Generate Report" button
3. PDF automatically downloads
4. PDF also saved to `backend/reports/`

### From API:
```bash
# Start a scan
curl -X POST http://localhost:8000/scan -H "Content-Type: application/json" -d '{"provider":"aws"}'

# Generate report (replace scan_id)
curl -X POST http://localhost:8000/scans/scan_20251229_223000/report

# Download report
curl http://localhost:8000/reports/compliance_report_scan_20251229_223000.pdf -o report.pdf
```

## 🔍 Viewing Reports

### Option 1: Auto-download
- Reports automatically download when generated from frontend

### Option 2: Manual access
- Navigate to `backend/reports/` folder
- Open any PDF file

### Option 3: API endpoint
```
GET http://localhost:8000/reports/<filename>
```

## 📊 Features
- ✅ Professional formatting with tables
- ✅ Color-coded severity levels
- ✅ Structured layout
- ✅ Full finding details
- ✅ Actionable recommendations
- ✅ Timestamp tracking

## 🔄 Persistence
- PDFs persist between backend restarts
- Each scan generates a unique PDF
- Old reports are preserved

## 📋 Notes
- Reports require the backend to be running
- `reportlab` library must be installed
- Reports folder is auto-created if missing
