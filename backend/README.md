# NetAssist Backend – Setup & Deployment Guide

This directory contains the Python Flask backend for the ACT Fibernet Support Ticket System. It handles incoming ticket submissions, sends confirmation emails via SMTP, and triggers voice calls via Bolna.ai API.

## Quick Start (Local Development)

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. **Create a virtual environment**
   ```bash
   cd backend
   python -m venv .venv
   ```

2. **Activate the virtual environment**
   - **Windows** (PowerShell/CMD):
     ```bash
     .\.venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source .venv/bin/activate
     ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

Before running the server, update the following in `app.py`:

- **SMTP Settings** (for email notifications):
  ```python
  SMTP_SERVER = 'smtp.gmail.com'      # Your SMTP server
  SMTP_PORT = 587                     # Port (587 for TLS)
  SENDER_EMAIL = 'your-email@gmail.com'
  SENDER_PASSWORD = 'your-app-password'  # Gmail: Use app password (not account password)
  ```

- **Bolna.ai API Credentials** (for voice calls):
  ```python
  "agent_id": "your-agent-id"
  "Authorization": "Bearer your-bolna-api-key"
  ```

### Run Locally

```bash
python app.py
```

The server will start on `http://0.0.0.0:5000` and is accessible from:
- `http://localhost:5000` (local machine)
- `http://192.168.1.x:5000` (network IP)

### Test the Endpoint

```bash
curl -X POST http://localhost:5000/api/ticket \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "phoneNumber": "9824085934",
    "email": "user@example.com",
    "wifiId": "085934",
    "city": "Nadiad",
    "selectedIssues": ["Internet Not Working"],
    "otherIssueDetails": "",
    "remarks": "Urgent",
    "ticketId": "ACT-2026-12345"
  }'
```

---

## Deploying to AWS Lambda

### Architecture Overview

AWS Lambda allows you to run this backend without managing servers. The handler signature needs to be adapted to work with AWS API Gateway.

### Prerequisites for AWS

- AWS account with appropriate permissions
- AWS CLI configured with credentials
- SAM CLI (optional, for easier management)

### Deployment Steps

#### 1. Prepare the Lambda Package

Create a new file `lambda_handler.py` with the AWS Lambda adapter:

```python
import json
from app import handler as ticket_handler

def lambda_handler(event, context):
    """AWS Lambda entry point."""
    try:
        # Extract body from API Gateway event
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        # Call the handler
        result = ticket_handler(body)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

#### 2. Create a Deployment Package

```bash
# Install dependencies to package folder
pip install -r requirements.txt -t package/

# Copy application files
cp app.py package/
cp lambda_handler.py package/

# Create ZIP file
cd package
zip -r ../lambda_deployment.zip .
cd ..
```

#### 3. Deploy to AWS Lambda

**Using AWS CLI:**

```bash
aws lambda create-function \
  --function-name netassist-ticket-handler \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR-ACCOUNT-ID:role/lambda-execution-role \
  --handler lambda_handler.lambda_handler \
  --zip-file fileb://lambda_deployment.zip \
  --timeout 60 \
  --environment Variables="{SENDER_EMAIL=your-email@gmail.com,SENDER_PASSWORD=your-app-password,BOLNA_API_KEY=your-key}"
```

**Using AWS Console:**

1. Go to AWS Lambda console
2. Click "Create function" → "Author from scratch"
3. Set runtime to Python 3.11
4. Upload the `lambda_deployment.zip` file
5. Set the handler to `lambda_handler.lambda_handler`

#### 4. Set Up API Gateway

1. Go to API Gateway in AWS Console
2. Create a new REST API
3. Create a POST resource `/api/ticket`
4. Set integration type to Lambda
5. Select your Lambda function
6. Deploy to a stage (e.g., `prod`)

#### 5. Update Frontend URL

Update the API endpoint in `src/App.tsx`:

```typescript
// Before (development)
const res = await fetch('http://localhost:5000/api/ticket', {

// After (AWS Lambda)
const res = await fetch('https://your-api-id.execute-api.region.amazonaws.com/prod/api/ticket', {
```

#### 6. Configure Environment Variables

In Lambda console, add environment variables:

| Variable | Value |
|----------|-------|
| `SENDER_EMAIL` | your-email@gmail.com |
| `SENDER_PASSWORD` | your-app-password |
| `BOLNA_AGENT_ID` | your-agent-id |
| `BOLNA_API_KEY` | your-bolna-api-key |

Update `app.py` to read from environment:

```python
import os

SENDER_EMAIL = os.getenv('SENDER_EMAIL')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
BOLNA_AGENT_ID = os.getenv('BOLNA_AGENT_ID')
BOLNA_API_KEY = os.getenv('BOLNA_API_KEY')
```

### Troubleshooting

**Issue**: Lambda timeout
- **Solution**: Increase timeout to 60 seconds in Lambda settings

**Issue**: "Module not found" errors
- **Solution**: Ensure all dependencies are in the deployment package

**Issue**: CORS errors
- **Solution**: Add CORS headers in API Gateway or Lambda response

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SMTP_SERVER` | Email server (smtp.gmail.com) |
| `SMTP_PORT` | Email port (587) |
| `SENDER_EMAIL` | From email address |
| `SENDER_PASSWORD` | App password / SMTP password |
| `BOLNA_AGENT_ID` | Bolna.ai agent identifier |
| `BOLNA_API_KEY` | Bolna.ai API authentication |

---

## Project Structure

```
backend/
├── app.py                 # Main Flask application + handlers
├── lambda_handler.py      # AWS Lambda adapter (optional)
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

---

## API Endpoint

### POST `/api/ticket`

**Request Body:**
```json
{
  "customerName": "string",
  "phoneNumber": "string",
  "email": "string",
  "wifiId": "string",
  "city": "string",
  "selectedIssues": ["string"],
  "otherIssueDetails": "string",
  "remarks": "string",
  "ticketId": "string"
}
```

**Response:**
```json
{
  "status": "received",
  "ticket_id": "ACT-2026-12345",
  "bolna_response": {...},
  "received": {...}
}
```

---

## Features

- ✅ Email notifications with branded HTML templates
- ✅ Bolna.ai voice call integration
- ✅ CORS-enabled for frontend integration
- ✅ Production-ready error handling
- ✅ AWS Lambda compatible

---

**Created by**: Krunal Rana  
**Powered by**: [bolna.ai](https://bolna.ai/)
