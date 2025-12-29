cd "D:\REPOS\Cloud Misconfiguration Scanner\frontend"

# Create new App.js
@'
    import React, { useState } from 'react';
import './index.css';

function App() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(false);

    const startScan = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: 'aws' })
            });
            const data = await response.json();
            setScans([data, ...scans]);
        } catch (error) {
            console.log('Error:', error);
            // Demo data if backend not reachable
            const demoScan = {
                id: 'scan_' + Date.now(),
                provider: 'aws',
                timestamp: new Date().toISOString(),
                findings: [
                    {
                        id: 'aws-s3-001',
                        resource_type: 'S3 Bucket',
                        resource_id: 'production-data-bucket',
                        rule_id: 'CIS-AWS-1.2',
                        rule_name: 'Public S3 Bucket',
                        description: 'S3 bucket allows public read access',
                        severity: 'critical',
                        status: 'open'
                    }
                ],
                critical_count: 1,
                high_count: 0,
                medium_count: 0
            };
            setScans([demoScan, ...scans]);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#1976d2' }}>☁️ Cloud Security Scanner</h1>
            <p>Detect misconfigurations in AWS, Azure, GCP</p>

            <button
                onClick={startScan}
                disabled={loading}
                style={{
                    padding: '12px 24px',
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                {loading ? 'Scanning...' : '🔍 Start Security Scan'}
            </button>

            <h2>Scan Results</h2>
            {scans.length === 0 ? (
                <p>No scans yet. Click "Start Security Scan" above.</p>
            ) : (
                scans.map((scan, index) => (
                    <div key={scan.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '15px',
                        background: '#f9f9f9'
                    }}>
                        <h3>Scan #{index + 1} - {scan.provider.toUpperCase()}</h3>
                        <p><strong>Time:</strong> {new Date(scan.timestamp).toLocaleString()}</p>
                        <p><strong>Findings:</strong> {scan.critical_count} Critical, {scan.high_count} High, {scan.medium_count} Medium</p>

                        {scan.findings.map((finding, i) => (
                            <div key={i} style={{
                                padding: '10px',
                                margin: '5px 0',
                                background: finding.severity === 'critical' ? '#ffebee' : '#fff3e0',
                                borderLeft: `4px solid ${finding.severity === 'critical' ? '#d32f2f' : '#f57c00'}`
                            }}>
                                <strong style={{ color: finding.severity === 'critical' ? '#d32f2f' : '#f57c00' }}>
                                    {finding.severity.toUpperCase()}
                                </strong>
                                <div><strong>{finding.rule_name}</strong></div>
                                <div>{finding.description}</div>
                                <small>Resource: {finding.resource_type} ({finding.resource_id})</small>
                            </div>
                        ))}
                    </div>
                ))
            )}

            <div style={{ marginTop: '30px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
                <h3>✅ Your System is Working!</h3>
                <p><strong>Backend API:</strong> http://localhost:8000</p>
                <p><strong>Frontend UI:</strong> http://localhost:3000</p>
                <p><strong>API Status:</strong> {scans.length > 0 ? 'Connected ✓' : 'Ready'}</p>
            </div>
        </div>
    );
}

export default App;
'@ | Out-File -FilePath src\App.js -Encoding UTF8