#!/bin/bash

echo "🚀 Cloud Security Scanner - Demo Script"
echo "========================================"

# Start services
echo "1. Starting services..."
docker-compose up -d
sleep 5

echo "2. Running Go scanner..."
cd scanner
go build -o cloud-scanner
./cloud-scanner --provider aws --types "storage,networking" --output scan_aws.json
./cloud-scanner --provider azure --output scan_azure.json

echo "3. Testing API..."
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{"provider": "aws", "scan_types": ["storage", "iam"]}'

echo ""
echo "4. Getting all scans..."
curl http://localhost:8000/scans

echo ""
echo "✅ Demo setup complete!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Go Scanner: ./scanner/cloud-scanner"