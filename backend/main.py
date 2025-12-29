from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import json
from datetime import datetime

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

@app.post("/scans/{scan_id}/report", response_model=ComplianceReport)
async def generate_report(scan_id: str):
    """Generate compliance report for a scan"""
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans_db[scan_id]
    
    # Calculate CIS compliance score (simulated)
    total_checks = 20
    failed_checks = len(scan['findings'])
    compliance_score = max(0, ((total_checks - failed_checks) / total_checks) * 100)
    
    report = ComplianceReport(
        scan_id=scan_id,
        cis_compliance=round(compliance_score, 2),
        misconfigurations=scan['findings'],
        recommendations=[
            "Enable S3 bucket versioning",
            "Restrict security group ingress rules",
            "Enable CloudTrail logging",
            "Use IAM roles instead of access keys"
        ]
    )
    
    reports_db[scan_id] = report.dict()
    return report

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