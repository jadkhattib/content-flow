# BigQuery Setup for Perception Flow

## Current Configuration

- **Project**: `discovery-flow`
- **Dataset**: `content_df`
- **Service Account**: `/Users/jadkhattib/v4 perception/discovery-flow-service-account.json`
- **Project**: `discovery-flow`

## Table Structure

### Main Analysis Table
The application uses the table `discovery-flow.content_df.perception` with the following schema:

| Field Name | Type | Mode | Description |
|------------|------|------|-------------|
| client_name | STRING | REQUIRED | Client or organization name (defaults to "Perception.Flow") |
| analysis | STRING | REQUIRED | Complete JSON analysis results |
| created_at | TIMESTAMP | REQUIRED | Analysis creation timestamp |
| brand_name | STRING | NULLABLE | Brand name analyzed |
| category | STRING | NULLABLE | Brand category |
| website | STRING | NULLABLE | Brand website |

## Features

### 📊 **Automatic Saving**
- Every Gemini analysis result is automatically saved to BigQuery
- Non-blocking: analysis continues even if BigQuery is temporarily unavailable
- Includes complete analysis data with metadata

### 📋 **Analysis History**
- Browse all previous analyses at `/history`
- Search and filter by brand name, category, or client
- View analysis previews and load complete results
- Chronological listing with timestamps

### 🔍 **Search & Filter**
- **Brand Name**: Find analyses for specific brands
- **Category**: Filter by industry/category
- **Client**: Filter by client organization
- **Date Range**: Filter by creation date

## Usage

1. **Automatic**: Every successful Gemini analysis is saved automatically
2. **Manual Browse**: Visit `/history` to browse saved analyses
3. **Search**: Use the search filters to find specific analyses
4. **Load**: Click any analysis to view the complete results

## Environment Variables (Optional)

You can customize the client name by adding to your `.env.local`:

```bash
# Default client name for BigQuery records
DEFAULT_CLIENT_NAME="Your Organization Name"
```

If not set, defaults to "Perception.Flow".

## Troubleshooting

✅ **Service Account**: Already configured  
✅ **Permissions**: Service account has BigQuery Data Editor role  
✅ **Table**: Properly structured and accessible  

If you encounter any issues, check the server logs for BigQuery operation status. 