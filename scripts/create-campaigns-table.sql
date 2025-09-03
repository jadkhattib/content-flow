-- BigQuery Campaigns Table Setup
-- This script creates the campaigns table for storing campaign data

-- Prerequisites:
-- 1. Ensure you have BigQuery Admin permissions
-- 2. Select your project: discovery-flow
-- 3. Navigate to BigQuery in Google Cloud Console

-- Create the campaigns table
-- Run this in BigQuery Console:

CREATE TABLE IF NOT EXISTS `discovery-flow.content_df.campaigns` (
  id STRING NOT NULL,
  brand_name STRING NOT NULL,
  campaign_title STRING,
  campaign_description STRING,
  target_audience STRING,
  key_messages ARRAY<STRING>,
  channels ARRAY<STRING>,
  budget_range STRING,
  timeline STRING,
  success_metrics ARRAY<STRING>,
  additional_notes STRING,
  status STRING DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY brand_name, status;

-- Verify the table was created
SELECT table_name, ddl
FROM `discovery-flow.content_df.INFORMATION_SCHEMA.TABLES`
WHERE table_name = 'campaigns';

-- Optional: Add some sample data
-- Uncomment and modify as needed:

-- INSERT INTO `discovery-flow.content_df.campaigns` ( 