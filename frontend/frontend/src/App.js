import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import {
    Security,
    Cloud,
    Warning,
    CheckCircle,
    Error,
    Timeline,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import axios from 'axios';
import './App.css';

function App() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('aws');
    const [activeTab, setActiveTab] = useState(0);
    const [dashboardStats, setDashboardStats] = useState(null);

    useEffect(() => {
        fetchScans();
        fetchDashboardStats();
    }, []);

    const fetchScans = async () => {
        try {
            const response = await axios.get('/scans');
            setScans(response.data);
        } catch (error) {
            console.error('Error fetching scans:', error);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const response = await axios.get('/dashboard/stats');
            setDashboardStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const startScan = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/scan', {
                provider: selectedProvider,
                scan_types: ['storage', 'networking', 'iam']
            });
            setScans([response.data, ...scans]);
        } catch (error) {
            console.error('Error starting scan:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (scanId) => {
        try {
            const response = await axios.post(`/scans/${scanId}/report`);
            alert(`Compliance Report Generated!\nCIS Compliance: ${response.data.cis_compliance}%`);
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#d32f2f';
            case 'high': return '#f57c00';
            case 'medium': return '#fbc02d';
            default: return '#388e3c';
        }
    };

    const getProviderIcon = (provider) => {
        switch (provider) {
            case 'aws': return '☁️';
            case 'azure': return '🔷';
            case 'gcp': return '🔸';
            default: return '☁️';
        }
    };

    return (
        <Container maxWidth="xl" className="app-container">
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 2 }}>
                <Security sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                    Cloud Security Scanner
                </Typography>
                <Chip icon={<DashboardIcon />} label="MVP v1.0" color="primary" />
            </Box>

            {/* Dashboard Stats */}
            {dashboardStats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Scans
                                </Typography>
                                <Typography variant="h4">
                                    {dashboardStats.total_scans}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Findings
                                </Typography>
                                <Typography variant="h4" color="error">
                                    {dashboardStats.total_findings}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    AWS Scans
                                </Typography>
                                <Typography variant="h4">
                                    {dashboardStats.providers.aws}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Multi-Cloud
                                </Typography>
                                <Typography variant="h4">
                                    3
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Control Panel */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        New Security Scan
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Cloud Provider</InputLabel>
                                <Select
                                    value={selectedProvider}
                                    onChange={(e) => setSelectedProvider(e.target.value)}
                                    label="Cloud Provider"
                                >
                                    <MenuItem value="aws">AWS</MenuItem>
                                    <MenuItem value="azure">Azure</MenuItem>
                                    <MenuItem value="gcp">Google Cloud</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="textSecondary">
                                Scans for: Public buckets, Open security groups, IAM misconfigurations
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={startScan}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <Cloud />}
                            >
                                {loading ? 'Scanning...' : 'Start Scan'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
                <Tab label="Recent Scans" />
                <Tab label="Findings Dashboard" />
                <Tab label="Compliance Reports" />
            </Tabs>

            {/* Recent Scans Tab */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {scans.map((scan) => (
                        <Grid item xs={12} key={scan.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ mr: 2 }}>
                                                {getProviderIcon(scan.provider)} {scan.provider.toUpperCase()} Scan
                                            </Typography>
                                            <Chip
                                                label={scan.timestamp.split('T')[0]}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Box>
                                            {scan.critical_count > 0 && (
                                                <Chip
                                                    label={`${scan.critical_count} Critical`}
                                                    color="error"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                />
                                            )}
                                            {scan.high_count > 0 && (
                                                <Chip
                                                    label={`${scan.high_count} High`}
                                                    color="warning"
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                />
                                            )}
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => generateReport(scan.id)}
                                            >
                                                Generate Report
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Scan ID: {scan.id}
                                    </Typography>

                                    {/* Findings List */}
                                    {scan.findings.map((finding, idx) => (
                                        <Alert
                                            key={idx}
                                            severity={finding.severity === 'critical' ? 'error' : 'warning'}
                                            sx={{ mb: 1 }}
                                            icon={finding.severity === 'critical' ? <Error /> : <Warning />}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="subtitle2">
                                                        [{finding.rule_id}] {finding.rule_name}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {finding.resource_type}: {finding.resource_id}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {finding.description}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={finding.severity.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: getSeverityColor(finding.severity),
                                                        color: 'white'
                                                    }}
                                                />
                                            </Box>
                                        </Alert>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Findings Dashboard Tab */}
            {activeTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Security Findings Overview
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Severity Distribution
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {['critical', 'high', 'medium', 'low'].map((severity) => (
                                                <Box key={severity} sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box sx={{
                                                        width: 100,
                                                        height: 20,
                                                        backgroundColor: getSeverityColor(severity),
                                                        mr: 2
                                                    }} />
                                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                        {severity}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Top Misconfigurations
                                        </Typography>
                                        <ul style={{ paddingLeft: 20 }}>
                                            <li><Typography variant="body2">Public S3/Storage Buckets</Typography></li>
                                            <li><Typography variant="body2">Overly Permissive Security Groups</Typography></li>
                                            <li><Typography variant="body2">Missing Encryption</Typography></li>
                                            <li><Typography variant="body2">IAM Policy Wildcards</Typography></li>
                                            <li><Typography variant="body2">Disabled Logging</Typography></li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Footer */}
            <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="textSecondary" align="center">
                    Cloud Security Scanner MVP | CIS Benchmarks | Multi-Cloud Support
                </Typography>
            </Box>
        </Container>
    );
}

export default App