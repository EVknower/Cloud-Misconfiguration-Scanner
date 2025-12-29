import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('aws');
    const [severityFilter, setSeverityFilter] = useState('all');

    // Fetch scans on component mount
    useEffect(() => {
        fetchScans();
    }, []);

    const fetchScans = async () => {
        try {
            const response = await fetch('http://localhost:8000/scans');
            const data = await response.json();
            setScans(data);
        } catch (error) {
            console.error('Error fetching scans:', error);
            // Load demo data if backend is unavailable
            loadDemoData();
        }
    };

    const loadDemoData = () => {
        const demoScans = [
            {
                id: 'scan_demo_001',
                provider: 'aws',
                timestamp: new Date().toISOString(),
                status: 'completed',
                critical_count: 3,
                high_count: 5,
                medium_count: 8,
                findings: [
                    {
                        id: 'finding_1',
                        rule_id: 'CIS-AWS-1.2',
                        rule_name: 'Public S3 Bucket Detected',
                        resource_type: 'S3 Bucket',
                        resource_id: 'production-data-bucket',
                        description: 'S3 bucket allows public read access which may expose sensitive data',
                        severity: 'critical'
                    },
                    {
                        id: 'finding_2',
                        rule_id: 'CIS-AWS-2.1',
                        rule_name: 'Security Group Allows 0.0.0.0/0',
                        resource_type: 'Security Group',
                        resource_id: 'sg-0123456789',
                        description: 'Security group allows unrestricted access from any IP address',
                        severity: 'high'
                    },
                    {
                        id: 'finding_3',
                        rule_id: 'CIS-AWS-3.5',
                        rule_name: 'IAM Policy with Wildcard Permissions',
                        resource_type: 'IAM Policy',
                        resource_id: 'policy-admin-*',
                        description: 'IAM policy grants excessive permissions using wildcards',
                        severity: 'medium'
                    }
                ]
            }
        ];
        setScans(demoScans);
    };

    const startScan = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: selectedProvider,
                    scan_types: ['storage', 'networking', 'iam']
                })
            });
            const data = await response.json();
            setScans([data, ...scans]);
        } catch (error) {
            console.error('Error starting scan:', error);
            // Add demo scan on error
            const demoScan = {
                id: 'scan_' + Date.now(),
                provider: selectedProvider,
                timestamp: new Date().toISOString(),
                status: 'completed',
                critical_count: 2,
                high_count: 3,
                medium_count: 5,
                findings: [
                    {
                        id: 'finding_new',
                        rule_id: 'CIS-' + selectedProvider.toUpperCase() + '-1.1',
                        rule_name: 'Sample Misconfiguration',
                        resource_type: 'Sample Resource',
                        resource_id: 'resource-001',
                        description: 'This is a sample finding for demonstration',
                        severity: 'high'
                    }
                ]
            };
            setScans([demoScan, ...scans]);
        }
        setLoading(false);
    };

    const generateReport = async (scanId) => {
        try {
            const response = await fetch(`http://localhost:8000/scans/${scanId}/report`, {
                method: 'POST'
            });
            const data = await response.json();

            // Download PDF
            const downloadUrl = `/reports/${data.pdf_file}`;
            const link = document.createElement('a');
            link.href = `http://localhost:8000${downloadUrl}`;
            link.download = data.pdf_file;
            link.click();

            alert(`✅ Report Generated!\n\nCIS Compliance: ${data.cis_compliance}%\nDownloading PDF...`);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Report generation feature requires backend connection.');
        }
    };

    // Calculate stats
    const totalScans = scans.length;
    const totalFindings = scans.reduce((sum, scan) =>
        sum + (scan.critical_count || 0) + (scan.high_count || 0) + (scan.medium_count || 0), 0
    );
    const criticalFindings = scans.reduce((sum, scan) => sum + (scan.critical_count || 0), 0);
    const complianceScore = totalFindings > 0 ? Math.max(0, 100 - (criticalFindings * 10)) : 100;

    // Get all findings with filter
    const allFindings = scans.flatMap(scan =>
        scan.findings.map(finding => ({ ...finding, scanId: scan.id, provider: scan.provider }))
    );
    const filteredFindings = severityFilter === 'all'
        ? allFindings
        : allFindings.filter(f => f.severity === severityFilter);

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="sidebar-logo-icon">🛡️</span>
                        <div className="sidebar-logo-text">
                            <h2>CloudGuard</h2>
                            <p>Security Scanner</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div
                        className={`sidebar-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveView('dashboard')}
                    >
                        <span className="sidebar-nav-item-icon">📊</span>
                        <span>Dashboard</span>
                    </div>
                    <div
                        className={`sidebar-nav-item ${activeView === 'misconfigurations' ? 'active' : ''}`}
                        onClick={() => setActiveView('misconfigurations')}
                    >
                        <span className="sidebar-nav-item-icon">⚠️</span>
                        <span>Misconfigurations</span>
                    </div>
                    <div
                        className={`sidebar-nav-item ${activeView === 'compliance' ? 'active' : ''}`}
                        onClick={() => setActiveView('compliance')}
                    >
                        <span className="sidebar-nav-item-icon">✅</span>
                        <span>Compliance</span>
                    </div>
                    <div
                        className={`sidebar-nav-item ${activeView === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveView('reports')}
                    >
                        <span className="sidebar-nav-item-icon">📄</span>
                        <span>Reports</span>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <p>Version 1.0.0</p>
                    <p>© 2025 CloudGuard</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="content-header">
                    <div className="content-header-top">
                        <div className="content-header-title">
                            <h1>
                                {activeView === 'dashboard' && '📊 Security Dashboard'}
                                {activeView === 'misconfigurations' && '⚠️ Misconfiguration Findings'}
                                {activeView === 'compliance' && '✅ Compliance Overview'}
                                {activeView === 'reports' && '📄 Security Reports'}
                            </h1>
                        </div>
                        <div className="content-header-actions">
                            <select
                                value={selectedProvider}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="aws">AWS</option>
                                <option value="azure">Azure</option>
                                <option value="gcp">Google Cloud</option>
                            </select>
                            <button
                                className="btn btn-primary"
                                onClick={startScan}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <span>🔍</span>
                                        Start Scan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="content-header-stats">
                        <div className="header-stat">
                            <span className="header-stat-label">Total Scans</span>
                            <span className="header-stat-value">{totalScans}</span>
                        </div>
                        <div className="header-stat">
                            <span className="header-stat-label">Total Findings</span>
                            <span className="header-stat-value">{totalFindings}</span>
                        </div>
                        <div className="header-stat">
                            <span className="header-stat-label">Critical Issues</span>
                            <span className="header-stat-value">{criticalFindings}</span>
                        </div>
                        <div className="header-stat">
                            <span className="header-stat-label">Compliance Score</span>
                            <span className="header-stat-value">{complianceScore}%</span>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="content-body">
                    {/* Dashboard View */}
                    {activeView === 'dashboard' && (
                        <div className="fade-in">
                            <div className="stats-grid">
                                <div className="stat-card stat-card-primary">
                                    <div className="stat-card-header">
                                        <span className="stat-card-icon">📊</span>
                                    </div>
                                    <div className="stat-card-body">
                                        <h3>Total Scans</h3>
                                        <div className="stat-card-value">{totalScans}</div>
                                    </div>
                                    <div className="stat-card-footer">
                                        Across all cloud providers
                                    </div>
                                </div>

                                <div className="stat-card stat-card-danger">
                                    <div className="stat-card-header">
                                        <span className="stat-card-icon">🔴</span>
                                    </div>
                                    <div className="stat-card-body">
                                        <h3>Critical Issues</h3>
                                        <div className="stat-card-value">{criticalFindings}</div>
                                    </div>
                                    <div className="stat-card-footer">
                                        Require immediate attention
                                    </div>
                                </div>

                                <div className="stat-card stat-card-success">
                                    <div className="stat-card-header">
                                        <span className="stat-card-icon">✅</span>
                                    </div>
                                    <div className="stat-card-body">
                                        <h3>Compliance Score</h3>
                                        <div className="stat-card-value">{complianceScore}%</div>
                                    </div>
                                    <div className="stat-card-footer">
                                        CIS Benchmark compliance
                                    </div>
                                </div>

                                <div className="stat-card stat-card-warning">
                                    <div className="stat-card-header">
                                        <span className="stat-card-icon">⚡</span>
                                    </div>
                                    <div className="stat-card-body">
                                        <h3>Total Findings</h3>
                                        <div className="stat-card-value">{totalFindings}</div>
                                    </div>
                                    <div className="stat-card-footer">
                                        All severity levels
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h2>Recent Security Scans</h2>
                                </div>
                                <div className="card-body">
                                    {scans.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-state-icon">🔍</div>
                                            <h3>No scans yet</h3>
                                            <p>Click "Start Scan" to begin your first security scan</p>
                                        </div>
                                    ) : (
                                        <div className="data-table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Scan ID</th>
                                                        <th>Provider</th>
                                                        <th>Date</th>
                                                        <th>Critical</th>
                                                        <th>High</th>
                                                        <th>Medium</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {scans.map(scan => (
                                                        <tr key={scan.id}>
                                                            <td><code>{scan.id}</code></td>
                                                            <td>
                                                                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                                                    {scan.provider === 'aws' && '☁️ AWS'}
                                                                    {scan.provider === 'azure' && '🔷 Azure'}
                                                                    {scan.provider === 'gcp' && '🔸 GCP'}
                                                                </span>
                                                            </td>
                                                            <td>{new Date(scan.timestamp).toLocaleDateString()}</td>
                                                            <td>
                                                                {scan.critical_count > 0 && (
                                                                    <span className="severity-badge severity-critical">
                                                                        {scan.critical_count}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {scan.high_count > 0 && (
                                                                    <span className="severity-badge severity-high">
                                                                        {scan.high_count}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {scan.medium_count > 0 && (
                                                                    <span className="severity-badge severity-medium">
                                                                        {scan.medium_count}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-outline"
                                                                    onClick={() => generateReport(scan.id)}
                                                                >
                                                                    Generate Report
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Misconfigurations View */}
                    {activeView === 'misconfigurations' && (
                        <div className="fade-in">
                            <div className="tabs">
                                <button
                                    className={`tab ${severityFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setSeverityFilter('all')}
                                >
                                    All ({allFindings.length})
                                </button>
                                <button
                                    className={`tab ${severityFilter === 'critical' ? 'active' : ''}`}
                                    onClick={() => setSeverityFilter('critical')}
                                >
                                    Critical ({allFindings.filter(f => f.severity === 'critical').length})
                                </button>
                                <button
                                    className={`tab ${severityFilter === 'high' ? 'active' : ''}`}
                                    onClick={() => setSeverityFilter('high')}
                                >
                                    High ({allFindings.filter(f => f.severity === 'high').length})
                                </button>
                                <button
                                    className={`tab ${severityFilter === 'medium' ? 'active' : ''}`}
                                    onClick={() => setSeverityFilter('medium')}
                                >
                                    Medium ({allFindings.filter(f => f.severity === 'medium').length})
                                </button>
                            </div>

                            {filteredFindings.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">✨</div>
                                    <h3>No {severityFilter !== 'all' ? severityFilter : ''} misconfigurations found</h3>
                                    <p>Great! Your cloud infrastructure looks secure.</p>
                                </div>
                            ) : (
                                filteredFindings.map(finding => (
                                    <div
                                        key={finding.id}
                                        className={`finding-item finding-${finding.severity}`}
                                    >
                                        <div className="finding-item-header">
                                            <div>
                                                <div className="finding-item-title">
                                                    [{finding.rule_id}] {finding.rule_name}
                                                </div>
                                                <div className="finding-item-meta">
                                                    {finding.resource_type}: <code>{finding.resource_id}</code>
                                                </div>
                                            </div>
                                            <span className={`severity-badge severity-${finding.severity}`}>
                                                {finding.severity}
                                            </span>
                                        </div>
                                        <div className="finding-item-description">
                                            {finding.description}
                                        </div>
                                        <div className="finding-item-footer">
                                            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                                                Provider: {finding.provider?.toUpperCase()}
                                            </span>
                                            <button className="btn btn-sm btn-primary">
                                                View Remediation
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Compliance View */}
                    {activeView === 'compliance' && (
                        <div className="fade-in">
                            <div className="card">
                                <div className="card-header">
                                    <h2>CIS Benchmark Compliance</h2>
                                </div>
                                <div className="card-body">
                                    <div style={{ marginBottom: '32px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 600 }}>Overall Compliance Score</span>
                                            <span style={{ fontWeight: 700, fontSize: '20px', color: complianceScore >= 80 ? 'var(--color-green-success)' : 'var(--color-red-critical)' }}>
                                                {complianceScore}%
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className={`progress-bar-fill ${complianceScore >= 80 ? 'progress-success' : 'progress-danger'}`}
                                                style={{ width: `${complianceScore}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <h3 style={{ marginBottom: '16px' }}>Compliance Categories</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>Identity & Access Management</span>
                                                <span style={{ fontWeight: 600 }}>85%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar-fill progress-success" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>Storage & Data Protection</span>
                                                <span style={{ fontWeight: 600 }}>62%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar-fill progress-warning" style={{ width: '62%' }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>Network Security</span>
                                                <span style={{ fontWeight: 600 }}>78%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar-fill progress-success" style={{ width: '78%' }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span>Logging & Monitoring</span>
                                                <span style={{ fontWeight: 600 }}>92%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar-fill progress-success" style={{ width: '92%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button className="btn btn-primary">
                                        Export Compliance Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reports View */}
                    {activeView === 'reports' && (
                        <div className="fade-in">
                            <div className="card">
                                <div className="card-header">
                                    <h2>Generated Security Reports</h2>
                                </div>
                                <div className="card-body">
                                    {scans.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📄</div>
                                            <h3>No reports available</h3>
                                            <p>Run a security scan first to generate reports</p>
                                        </div>
                                    ) : (
                                        <div className="data-table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Report ID</th>
                                                        <th>Provider</th>
                                                        <th>Date Generated</th>
                                                        <th>Findings</th>
                                                        <th>Compliance</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {scans.map(scan => {
                                                        const scanCompliance = Math.max(0, 100 - (scan.critical_count * 10));
                                                        return (
                                                            <tr key={scan.id}>
                                                                <td><code>{scan.id}</code></td>
                                                                <td style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                                                    {scan.provider}
                                                                </td>
                                                                <td>{new Date(scan.timestamp).toLocaleString()}</td>
                                                                <td>
                                                                    {(scan.critical_count || 0) + (scan.high_count || 0) + (scan.medium_count || 0)} issues
                                                                </td>
                                                                <td>
                                                                    <span style={{
                                                                        color: scanCompliance >= 80 ? 'var(--color-green-success)' : 'var(--color-red-critical)',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        {scanCompliance}%
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() => generateReport(scan.id)}
                                                                        style={{ marginRight: '8px' }}
                                                                    >
                                                                        📥 Download PDF
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline">
                                                                        👁️ View
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;