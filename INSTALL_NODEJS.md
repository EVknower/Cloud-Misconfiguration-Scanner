# Node.js Installation Guide

## Step 1: Download Node.js ✅ (In Progress)

Visit: https://nodejs.org/
- Download the **LTS (Long Term Support)** version
- This includes npm automatically

## Step 2: Install Node.js

1. Run the downloaded installer (.msi file)
2. Click "Next" through the wizard
3. **Important**: Keep "Add to PATH" checkbox CHECKED
4. Complete the installation

## Step 3: Verify Installation

Open a **NEW** terminal (PowerShell or CMD) and run:

```powershell
node --version
npm --version
```

You should see version numbers like:
```
v20.x.x
10.x.x
```

## Step 4: Install Frontend Dependencies

```powershell
cd "D:\REPOS\Cloud Misconfiguration Scanner\frontend"
npm install
```

This will install:
- React
- Material-UI
- Axios
- All other dependencies

## Step 5: Start Everything

```powershell
cd "D:\REPOS\Cloud Misconfiguration Scanner"
run_all.bat
```

Or start manually:

**Terminal 1 - Backend:**
```powershell
cd backend
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

## URLs After Starting:
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend UI: http://localhost:3000

---

## Troubleshooting

### If npm still not found after installation:
1. Close ALL terminals
2. Open a brand new terminal
3. Try `npm --version` again

### If installation is taking too long:
Node.js installer is about 30MB and takes 2-5 minutes to install.

---

**Once installed, ping me and I'll help you run the frontend!**
