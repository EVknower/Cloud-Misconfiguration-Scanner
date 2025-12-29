# 🚀 Quick Start Guide - Cloud Misconfiguration Scanner

## ⚡ Running the Scanner (Easy Mode)

### Option 1: Using Full Path (Works Immediately!)

If you get "command not found" errors, use the full paths below:

```powershell
# Navigate to the scanner directory
cd "d:\REPOS\Cloud Misconfiguration Scanner\scanner"

# Run AWS scan
& "C:\Program Files\Go\bin\go.exe" run main.go

# Run Azure scan
& "C:\Program Files\Go\bin\go.exe" run main.go -provider azure

# Run GCP scan
& "C:\Program Files\Go\bin\go.exe" run main.go -provider gcp

# Custom output file
& "C:\Program Files\Go\bin\go.exe" run main.go -provider aws -output my_scan.json

# All scan types
& "C:\Program Files\Go\bin\go.exe" run main.go -types storage,networking,iam
```

### Option 2: Fix PATH (One-Time Setup)

Add Go to your PowerShell session PATH:

```powershell
# Temporary (current session only)
$env:Path += ";C:\Program Files\Go\bin"

# Now you can use 'go' directly
cd "d:\REPOS\Cloud Misconfiguration Scanner\scanner"
go run main.go -provider aws
```

To make it permanent:
1. Open **System Properties** → **Environment Variables**
2. Add `C:\Program Files\Go\bin` to your PATH
3. Restart your terminal

---

## 📋 Scanner Command Options

### Basic Syntax
```powershell
go run main.go [OPTIONS]
```

### Available Options

| Option | Default | Description | Example |
|--------|---------|-------------|---------|
| `-provider` | `aws` | Cloud provider | `-provider azure` |
| `-types` | `storage,networking,iam` | Scan types | `-types storage,iam` |
| `-output` | `scan_result.json` | Output file | `-output results.json` |

### Provider Options
- `aws` - Amazon Web Services
- `azure` - Microsoft Azure
- `gcp` - Google Cloud Platform

### Scan Types
- `storage` - S3 buckets, blob storage
- `networking` - Security groups, firewalls
- `iam` - Identity and access management

---

## 🌐 Running the Full Application

### Start Backend + Frontend Together

```powershell
# From project root
cd "d:\REPOS\Cloud Misconfiguration Scanner"
run_all.bat
```

This will start:
- 🐍 **Backend** on http://localhost:8000
- ⚛️ **Frontend** on http://localhost:3000

### Start Components Separately

#### Backend (Python)
```powershell
cd "d:\REPOS\Cloud Misconfiguration Scanner\backend"
pip install -r requirements.txt
python main.py
```

#### Frontend (React)
```powershell
cd "d:\REPOS\Cloud Misconfiguration Scanner\frontend"
npm install
npm start
```

---

## 📊 Example Workflows

### 1. Quick AWS Scan
```powershell
cd "d:\REPOS\Cloud Misconfiguration Scanner\scanner"
& "C:\Program Files\Go\bin\go.exe" run main.go
# View results in console
# Check scan_result.json for JSON output
```

### 2. Scan All Cloud Providers
```powershell
cd "d:\REPOS\Cloud Misconfiguration Scanner\scanner"
& "C:\Program Files\Go\bin\go.exe" run main.go -provider aws -output aws_scan.json
& "C:\Program Files\Go\bin\go.exe" run main.go -provider azure -output azure_scan.json
& "C:\Program Files\Go\bin\go.exe" run main.go -provider gcp -output gcp_scan.json
```

### 3. Full Dashboard Demo
```powershell
# Terminal 1: Start backend
cd "d:\REPOS\Cloud Misconfiguration Scanner\backend"
python main.py

# Terminal 2: Start frontend
cd "d:\REPOS\Cloud Misconfiguration Scanner\frontend"
npm start

# Browser: Open http://localhost:3000
# Click "Start Scan" to run scans from the web interface
```

---

## 🔍 Viewing Results

### Console Output
The scanner displays formatted results in your terminal with:
- 🚀 Scan start message
- 📊 Summary statistics
- 🔍 Detailed findings with severity icons
- ✅ Remediation recommendations

### JSON Output
```powershell
# View the JSON file
cat scan_result.json

# Or open in your favorite editor
code scan_result.json
```

### Web Dashboard
Open http://localhost:3000 after starting the frontend to see:
- Real-time scan results
- Visual severity indicators
- Compliance scoring
- Interactive findings explorer

---

## 🐛 Troubleshooting

### "Go command not found"
**Solution:** Use the full path or add Go to PATH (see Option 1 above)

### "Python not found"
**Solution:** Install Python 3.11+ from https://www.python.org/downloads/

### "npm not found"
**Solution:** Install Node.js from https://nodejs.org/

### "Module not found" errors
**Solution:** Install dependencies first:
```powershell
# For backend
cd backend
pip install -r requirements.txt

# For frontend
cd frontend
npm install
```

### Port already in use
**Solution:** Kill processes using ports 3000 or 8000:
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

---

## 📁 Quick Reference: File Locations

| Component | Main File | Location |
|-----------|-----------|----------|
| Go Scanner | `main.go` | `scanner/main.go` |
| Backend API | `main.py` | `backend/main.py` |
| Frontend App | `App.js` | `frontend/src/App.js` |
| Scan Results | `scan_result.json` | `scanner/scan_result.json` |

---

## ⏱️ Estimated Run Times

- Scanner CLI: ~2-3 seconds per scan
- Backend startup: ~5 seconds
- Frontend startup: ~15-30 seconds (first time may take longer)

---

## 📚 Additional Resources

- Full documentation: `README.md`
- Setup instructions: `START_HERE.md`
- API documentation: http://localhost:8000/docs (when backend is running)

---

**Need help?** Check the main `README.md` or the troubleshooting section above!
