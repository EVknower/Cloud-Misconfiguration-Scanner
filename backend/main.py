from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import json
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

app = FastAPI(title="Cloud Security Scanner API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ScanRequest(BaseModel):
    provider: str = "aws"
    scan_types: List[str] = ["storage", "networking", "iam"]
    credentials: Optional[Dict] = None

class ScanResult(BaseModel):
    id: str
    provider: str
    timestamp: str
    findings: List[Dict]
    status: str = "completed"
    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0

class ComplianceReport(BaseModel):
    scan_id: str
    cis_compliance: float
    misconfigurations: List[Dict]
    recommendations: List[str]

# In-memory storage for demo
scans_db = {}
reports_db = {}

@app.get("/")
async def root():
    return {"message": "Cloud Security Scanner API", "status": "running"}

@app.post("/scan", response_model=ScanResult)
async def start_scan(request: ScanRequest):
    """Start a new security scan"""
    scan_id = f"scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Generate sample findings
    findings = generate_sample_findings(request.provider)
    
    # Count severity levels
    critical = len([f for f in findings if f['severity'] == 'critical'])
    high = len([f for f in findings if f['severity'] == 'high'])
    medium = len([f for f in findings if f['severity'] == 'medium'])
    
    scan_result = ScanResult(
        id=scan_id,
        provider=request.provider,
        timestamp=datetime.now().isoformat(),
        findings=findings,
        critical_count=critical,
        high_count=high,
        medium_count=medium
    )
    
    scans_db[scan_id] = scan_result.dict()
    return scan_result

@app.get("/scans", response_model=List[ScanResult])
async def get_all_scans():
    """Get all scan results"""
    return list(scans_db.values())

@app.get("/scans/{scan_id}", response_model=ScanResult)
async def get_scan(scan_id: str):
    """Get specific scan result"""
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans_db[scan_id]

@app.post("/scans/{scan_id}/report")
async def generate_report(scan_id: str):
    """Generate compliance report for a scan and save as PDF"""
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans_db[scan_id]
    
    # Calculate CIS compliance score (simulated)
    total_checks = 20
    failed_checks = len(scan['findings'])
    compliance_score = max(0, ((total_checks - failed_checks) / total_checks) * 100)
    
    report_data = {
        'scan_id': scan_id,
        'cis_compliance': round(compliance_score, 2),
        'misconfigurations': scan['findings'],
        'recommendations': [
            "Enable S3 bucket versioning",
            "Restrict security group ingress rules",
            "Enable CloudTrail logging",
            "Use IAM roles instead of access keys"
        ]
    }
    
    # Generate PDF
    pdf_filename = f"compliance_report_{scan_id}.pdf"
    pdf_path = os.path.join("backend", "reports", pdf_filename)
    
    # Ensure reports directory exists
    os.makedirs(os.path.join("backend", "reports"), exist_ok=True)
    
    generate_pdf_report(pdf_path, scan, report_data)
    
    reports_db[scan_id] = report_data
    
    return {
        "scan_id": scan_id,
        "cis_compliance": report_data['cis_compliance'],
        "pdf_file": pdf_filename,
        "pdf_path": pdf_path,
        "message": f"Report generated successfully at {pdf_path}"
    }

@app.get("/reports/{filename}")
async def download_report(filename: str):
    """Download a generated PDF report"""
    pdf_path = os.path.join("backend", "reports", filename)
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Report not found")
    
    return FileResponse(
        path=pdf_path,
        media_type='application/pdf',
        filename=filename
    )

def generate_pdf_report(pdf_path: str, scan: dict, report_data: dict):
    """Generate a PDF compliance report"""
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1976d2'),
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1976d2'),
        spaceAfter=12
    )
    
    # Title
    story.append(Paragraph("Cloud Security Compliance Report", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Report Info
    info_data = [
        ['Scan ID:', scan['id']],
        ['Provider:', scan['provider'].upper()],
        ['Timestamp:', scan['timestamp']],
        ['CIS Compliance Score:', f"{report_data['cis_compliance']}%"],
        ['Total Findings:', str(len(scan['findings']))],
        ['Critical:', str(scan['critical_count'])],
        ['High:', str(scan['high_count'])],
        ['Medium:', str(scan['medium_count'])]
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    
    story.append(info_table)
    story.append(Spacer(1, 0.5*inch))
    
    # Findings Section
    story.append(Paragraph("Security Findings", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    for idx, finding in enumerate(scan['findings'], 1):
        # Severity color
        severity_color = colors.red if finding['severity'] == 'critical' else \
                        colors.orange if finding['severity'] == 'high' else \
                        colors.yellow
        
        finding_data = [
            [f"Finding #{idx}", ''],
            ['Rule ID:', finding['rule_id']],
            ['Rule Name:', finding['rule_name']],
            ['Severity:', finding['severity'].upper()],
            ['Resource Type:', finding['resource_type']],
            ['Resource ID:', finding['resource_id']],
            ['Description:', finding['description']],
            ['Remediation:', finding['remediation']]
        ]
        
        finding_table = Table(finding_data, colWidths=[2*inch, 4*inch])
        finding_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), severity_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f5f5f5')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        
        story.append(finding_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Recommendations Section
    story.append(Paragraph("Recommendations", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    for idx, rec in enumerate(report_data['recommendations'], 1):
        story.append(Paragraph(f"{idx}. {rec}", styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    # Footer
    story.append(Spacer(1, 0.5*inch))
    footer_text = f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Cloud Security Scanner v1.0"
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(story)

@app.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_scans = len(scans_db)
    total_findings = sum(len(scan['findings']) for scan in scans_db.values())
    
    return {
        "total_scans": total_scans,
        "total_findings": total_findings,
        "providers": {
            "aws": len([s for s in scans_db.values() if s['provider'] == 'aws']),
            "azure": len([s for s in scans_db.values() if s['provider'] == 'azure']),
            "gcp": len([s for s in scans_db.values() if s['provider'] == 'gcp'])
        }
    }

def generate_sample_findings(provider: str):
    """Generate sample findings for demo"""
    samples = {
        "aws": [
            {
                "id": "aws-s3-001",
                "resource_type": "S3 Bucket",
                "resource_id": "production-data-bucket",
                "rule_id": "CIS-AWS-1.2",
                "rule_name": "S3 Bucket Public Access",
                "description": "S3 bucket allows public read access",
                "severity": "critical",
                "status": "open",
                "remediation": "Apply bucket policy to restrict public access"
            },
            {
                "id": "aws-sg-001",
                "resource_type": "Security Group",
                "resource_id": "sg-12345678",
                "rule_id": "CIS-AWS-4.1",
                "rule_name": "Overly Permissive Security Group",
                "description": "Security group allows SSH from 0.0.0.0/0",
                "severity": "high",
                "status": "open",
                "remediation": "Restrict SSH access to specific IP ranges"
            }
        ],
        "azure": [
            {
                "id": "azure-storage-001",
                "resource_type": "Storage Account",
                "resource_id": "storageprod123",
                "rule_id": "CIS-Azure-3.1",
                "rule_name": "Storage Account Anonymous Access",
                "description": "Storage account allows anonymous blob access",
                "severity": "critical",
                "status": "open",
                "remediation": "Disallow anonymous access to storage containers"
            }
        ],
        "gcp": [
            {
                "id": "gcp-bucket-001",
                "resource_type": "Cloud Storage",
                "resource_id": "gcp-prod-data",
                "rule_id": "CIS-GCP-1.1",
                "rule_name": "Public Cloud Storage Bucket",
                "description": "Cloud Storage bucket is publicly accessible",
                "severity": "critical",
                "status": "open",
                "remediation": "Update bucket IAM policies"
            }
        ]
    }
    
    return samples.get(provider, samples["aws"])

if __name__ == "__main__":
    print("Starting Cloud Security Scanner API...")
    print("API Documentation: http://localhost:8000/docs")
    print("Frontend: http://localhost:3000")
    uvicorn.run(app, host="0.0.0.0", port=8000)