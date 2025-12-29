# ☁️ Cloud Misconfiguration Scanner

A multi-cloud security scanning tool that detects misconfigurations across AWS, Azure, and Google Cloud Platform (GCP).

## 🏗️ Architecture

This project consists of three components:

1. **Backend** (Python FastAPI) - REST API server
2. **Frontend** (React + Material-UI) - Web dashboard
3. **Scanner** (Go CLI) - Standalone command-line scanner

## 📁 Project Structure

```
Cloud Misconfiguration Scanner/
├── backend/              # Python FastAPI REST API
│   ├── main.py          # API server (193 lines)
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile       # Container configuration
│
├── frontend/            # React web dashboard
│   ├── src/
│   │   ├── App.js      # Main dashboard (368 lines)
│   │   ├── App.css     # Styles
│   │   └── index.js    # React entry point
│   ├── package.json    # Node dependencies
│   └── public/         # Static assets
│
├── scanner/            # Go CLI scanner
│   ├── main.go        # Scanner implementation (217 lines)
│   └── docker-compose.yml
│
└── run_all.bat        # Startup script for all services
```

## ⚡ Quick Start

### Option 1: Run Everything (Recommended)

```bash
# Windows
run_all.bat

# This will start:
# - Backend on http://localhost:8000
# - Frontend on http://localhost:3000
```

### Option 2: Run Components Separately

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Go Scanner:**
```bash
cd scanner
go run main.go --provider aws --types storage,networking,iam --output scan_result.json
```

## 🎯 Features

### Backend API
- **5 REST endpoints** for scanning and reporting
- **Multi-cloud support**: AWS, Azure, GCP
- **CIS Benchmark** compliance scoring
- **Auto-generated API docs** at `/docs`

### Frontend Dashboard
- **Material-UI** professional interface
- **Real-time scan results** display
- **Severity-based color coding**:
  - 🔴 Critical (red)
  - 🟠 High (orange)
  - 🟡 Medium (yellow)
- **Three tabs**: Recent Scans, Findings Dashboard, Compliance Reports
- **Provider selection**: AWS, Azure, GCP

### Go Scanner
- **Command-line interface** for automation
- **JSON output** for integration
- **Beautiful console formatting** with emojis
- **Configurable scan types**

## 📊 Example Findings

The scanner detects:
- 🪣 **Public S3/Storage buckets**
- 🔓 **Overly permissive security groups**
- 🔑 **IAM misconfigurations**
- 📝 **Missing encryption**
- 📊 **Disabled logging**

## 🔌 API Endpoints

- `GET /` - Health check
- `POST /scan` - Start new security scan
- `GET /scans` - List all scans
- `GET /scans/{scan_id}` - Get specific scan
- `POST /scans/{scan_id}/report` - Generate compliance report
- `GET /dashboard/stats` - Dashboard statistics

## 🎬 Demo Script (Hackathon Ready!)

### 1. Show the Dashboard
```bash
# Open browser to http://localhost:3000
# Click "Start Security Scan"
# Switch between tabs to show features
```

### 2. Show the API
```bash
# Open http://localhost:8000/docs
# Try the interactive Swagger UI
curl http://localhost:8000/dashboard/stats
```

### 3. Show the CLI Scanner
```bash
cd scanner
go run main.go --provider aws
# Shows formatted findings in terminal
cat scan_result.json
# Shows JSON output
```

### 4. Multi-Cloud Demo
```bash
# Scan AWS
go run scanner/main.go --provider aws

# Scan Azure
go run scanner/main.go --provider azure

# Scan GCP
go run scanner/main.go --provider gcp
```

## 🛠️ Technology Stack

| Component | Technology | Lines of Code |
|-----------|-----------|---------------|
| Backend | Python 3.11 + FastAPI | 193 |
| Frontend | React 18 + Material-UI | 368 |
| Scanner | Go | 217 |
| **Total** | | **778** |

## 📦 Dependencies

**Backend:**
- FastAPI, Uvicorn, Pydantic
- boto3 (AWS), azure-identity, google-cloud-storage

**Frontend:**
- React, Material-UI, Axios
- @emotion/react, @emotion/styled

**Scanner:**
- Standard Go library only

## 🐳 Docker Support

```bash
# Start with Docker Compose
cd scanner
docker-compose up
```

## 🎓 For Hackathon Judges

**Key Highlights:**
- ✅ **Full-stack application** (Backend + Frontend + CLI)
- ✅ **Multi-cloud support** (AWS, Azure, GCP)
- ✅ **CIS Benchmark** compliance
- ✅ **Professional UI** with Material-UI
- ✅ **RESTful API** with auto-generated docs
- ✅ **Containerized** with Docker support
- ✅ **Clean architecture** and separation of concerns

**Demo Flow:**
1. Show professional React dashboard
2. Run security scan and display findings
3. Show REST API documentation
4. Run CLI scanner for automation demo
5. Show multi-cloud support

## 📝 License

Built for educational and hackathon purposes.

## 🚀 Future Enhancements

- Real cloud API integrations (AWS SDK, Azure SDK, GCP SDK)
- Database persistence (PostgreSQL)
- User authentication
- Scheduled scans
- Email notifications
- Custom rule engine
- Detailed remediation guides
