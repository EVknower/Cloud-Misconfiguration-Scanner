package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

type ScanConfig struct {
	Provider   string   `json:"provider"`
	ScanTypes  []string `json:"scan_types"`
	OutputFile string   `json:"output_file"`
}

type Finding struct {
	ID           string `json:"id"`
	ResourceType string `json:"resource_type"`
	ResourceID   string `json:"resource_id"`
	RuleID       string `json:"rule_id"`
	RuleName     string `json:"rule_name"`
	Description  string `json:"description"`
	Severity     string `json:"severity"`
	Status       string `json:"status"`
	Remediation  string `json:"remediation"`
}

type ScanResult struct {
	ID           string    `json:"id"`
	Provider     string    `json:"provider"`
	Timestamp    time.Time `json:"timestamp"`
	Findings     []Finding `json:"findings"`
	Status       string    `json:"status"`
	CriticalCount int      `json:"critical_count"`
	HighCount    int      `json:"high_count"`
	MediumCount  int      `json:"medium_count"`
}

func main() {
	// Command line flags
	provider := flag.String("provider", "aws", "Cloud provider (aws, azure, gcp)")
	scanTypes := flag.String("types", "storage,networking,iam", "Comma-separated scan types")
	output := flag.String("output", "scan_result.json", "Output file")
	flag.Parse()

	// Parse scan types
	var types []string
	for _, t := range strings.Split(*scanTypes, ",") {
		types = append(types, strings.TrimSpace(t))
	}

	// Create scan config
	config := ScanConfig{
		Provider:   *provider,
		ScanTypes:  types,
		OutputFile: *output,
	}

	fmt.Printf("🚀 Starting Cloud Security Scan\n")
	fmt.Printf("   Provider: %s\n", config.Provider)
	fmt.Printf("   Scan Types: %v\n", config.ScanTypes)
	fmt.Printf("   Output: %s\n\n", config.OutputFile)

	// Perform scan
	result := performScan(config)

	// Save results
	saveResults(result, config.OutputFile)

	// Print summary
	printSummary(result)
}

func performScan(config ScanConfig) ScanResult {
	// Simulate scanning delay
	time.Sleep(2 * time.Second)

	// Generate sample findings based on provider
	var findings []Finding
	
	switch config.Provider {
	case "aws":
		findings = []Finding{
			{
				ID:           "aws-s3-001",
				ResourceType: "S3 Bucket",
				ResourceID:   "production-data-bucket",
				RuleID:       "CIS-AWS-1.2",
				RuleName:     "S3 Bucket Public Access",
				Description:  "S3 bucket allows public read access",
				Severity:     "critical",
				Status:       "open",
				Remediation:  "Apply bucket policy to restrict public access",
			},
			{
				ID:           "aws-sg-001",
				ResourceType: "Security Group",
				ResourceID:   "sg-12345678",
				RuleID:       "CIS-AWS-4.1",
				RuleName:     "Overly Permissive Security Group",
				Description:  "Security group allows SSH from 0.0.0.0/0",
				Severity:     "high",
				Status:       "open",
				Remediation:  "Restrict SSH access to specific IP ranges",
			},
		}
	case "azure":
		findings = []Finding{
			{
				ID:           "azure-storage-001",
				ResourceType: "Storage Account",
				ResourceID:   "storageprod123",
				RuleID:       "CIS-Azure-3.1",
				RuleName:     "Storage Account Anonymous Access",
				Description:  "Storage account allows anonymous blob access",
				Severity:     "critical",
				Status:       "open",
				Remediation:  "Disallow anonymous access to storage containers",
			},
		}
	case "gcp":
		findings = []Finding{
			{
				ID:           "gcp-bucket-001",
				ResourceType: "Cloud Storage",
				ResourceID:   "gcp-prod-data",
				RuleID:       "CIS-GCP-1.1",
				RuleName:     "Public Cloud Storage Bucket",
				Description:  "Cloud Storage bucket is publicly accessible",
				Severity:     "critical",
				Status:       "open",
				Remediation:  "Update bucket IAM policies",
			},
		}
	}

	// Count findings by severity
	criticalCount := 0
	highCount := 0
	mediumCount := 0
	
	for _, f := range findings {
		switch f.Severity {
		case "critical":
			criticalCount++
		case "high":
			highCount++
		case "medium":
			mediumCount++
		}
	}

	return ScanResult{
		ID:            fmt.Sprintf("scan_%d", time.Now().Unix()),
		Provider:      config.Provider,
		Timestamp:     time.Now(),
		Findings:      findings,
		Status:        "completed",
		CriticalCount: criticalCount,
		HighCount:     highCount,
		MediumCount:   mediumCount,
	}
}

func saveResults(result ScanResult, filename string) {
	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		log.Fatalf("Failed to marshal results: %v", err)
	}

	err = os.WriteFile(filename, data, 0644)
	if err != nil {
		log.Fatalf("Failed to write results to file: %v", err)
	}

	fmt.Printf("✅ Results saved to %s\n", filename)
}

func printSummary(result ScanResult) {
	fmt.Println("\n📊 Scan Summary:")
	fmt.Printf("   Scan ID: %s\n", result.ID)
	fmt.Printf("   Provider: %s\n", result.Provider)
	fmt.Printf("   Timestamp: %s\n", result.Timestamp.Format("2006-01-02 15:04:05"))
	fmt.Printf("   Status: %s\n", result.Status)
	fmt.Printf("   Total Findings: %d\n", len(result.Findings))
	
	if result.CriticalCount > 0 {
		fmt.Printf("   🔴 Critical: %d\n", result.CriticalCount)
	}
	if result.HighCount > 0 {
		fmt.Printf("   🟠 High: %d\n", result.HighCount)
	}
	if result.MediumCount > 0 {
		fmt.Printf("   🟡 Medium: %d\n", result.MediumCount)
	}

	fmt.Println("\n🔍 Findings:")
	for i, finding := range result.Findings {
		severityIcon := "⚠️"
		switch finding.Severity {
		case "critical":
			severityIcon = "🔴"
		case "high":
			severityIcon = "🟠"
		case "medium":
			severityIcon = "🟡"
		}
		
		fmt.Printf("\n   %d. %s [%s] %s\n", i+1, severityIcon, finding.RuleID, finding.RuleName)
		fmt.Printf("      Resource: %s (%s)\n", finding.ResourceID, finding.ResourceType)
		fmt.Printf("      Description: %s\n", finding.Description)
		fmt.Printf("      Remediation: %s\n", finding.Remediation)
	}
}