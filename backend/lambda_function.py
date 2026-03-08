import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

# Environment variables (set in Lambda configuration)
SENDER_PASSWORD = os.environ.get('SENDER_PASSWORD')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')
AGENT_ID = os.environ.get('AGENT_ID')
BOLNA_AUTHORIZATION = os.environ.get('BOLNA_AUTHORIZATION')

def send_ticket_email(ticket_data, ticket_id):
    """Send a professional HTML email with ticket details."""
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    RECEIVER_EMAIL = ticket_data.get('email', 'user@example.com')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'ACT Fibernet Support Ticket #{ticket_id}'
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECEIVER_EMAIL

    # HTML content – copy your full HTML from the original code
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Ticket Confirmation</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
            }}
            .header {{
                background-color: #ec5b13;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }}
            .content {{
                padding: 30px;
                color: #333333;
            }}
            .ticket-details {{
                background-color: #f8f8f8;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                background-color: #f1f1f1;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666666;
            }}
            .branding {{
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ACT Fibernet Support</h1>
                <p>NetAssist Support Ticket System</p>
            </div>
            <div class="content">
                <h2>Thank you for submitting your support ticket!</h2>
                <p>Here are the details you shared:</p>
                <div class="ticket-details">
                    <p><strong>Ticket ID:</strong> {ticket_id}</p>
                    <p><strong>Customer Name:</strong> {ticket_data.get('customerName', 'N/A')}</p>
                    <p><strong>Phone Number:</strong> {ticket_data.get('phoneNumber', 'N/A')}</p>
                    <p><strong>Email:</strong> {ticket_data.get('email', 'N/A')}</p>
                    <p><strong>WiFi ID:</strong> {ticket_data.get('wifiId', 'N/A')}</p>
                    <p><strong>City:</strong> {ticket_data.get('city', 'N/A')}</p>
                    <p><strong>Issues:</strong> {', '.join(ticket_data.get('selectedIssues', []))}</p>
                    <p><strong>Other Details:</strong> {ticket_data.get('otherIssueDetails', 'N/A')}</p>
                    <p><strong>Remarks:</strong> {ticket_data.get('remarks', 'N/A')}</p>
                </div>
                <p>
                <b>I am currently using a Bolna trial account, which can only make calls to verified phone numbers.</b><br>
                If you would like to receive a call, please reply to this email with your phone number. I will verify it so you can test this feature.
                </p>
                <p>Our technical team will review your ticket and get back to you shortly. You can track the status using your Ticket ID.</p>
                <div class="branding">
                    <p><strong>Made by Krunal Rana</strong></p>
                    <p><strong>Powered by bolna.ai</strong></p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; 2026 ACT Fibernet. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    part = MIMEText(html, 'html')
    msg.attach(part)

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        server.quit()
        print(f"Email sent to {RECEIVER_EMAIL}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def trigger_bolna_call(phone_number):
    """Trigger a voice call via Bolna.ai API."""
    url = "https://api.bolna.ai/call"
    payload = {
        "agent_id": AGENT_ID,
        "recipient_phone_number": phone_number
    }
    headers = {
        "Authorization": BOLNA_AUTHORIZATION,
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Bolna API response: {response.text}")
        return response.json()
    except Exception as e:
        print(f"Failed to trigger Bolna call: {e}")
        return None

def lambda_handler(event, context):
    """
    Handle incoming HTTP requests via Lambda Function URL or API Gateway.
    Expected: POST /api/ticket with JSON body.
    """
    # 1. Parse the HTTP method and path (optional – you can ignore if only one endpoint)
    http_method = event.get('requestContext', {}).get('http', {}).get('method')
    path = event.get('requestContext', {}).get('http', {}).get('path')

    # 2. Only accept POST requests to /api/ticket (adjust if your Function URL is already scoped)
    if http_method != 'POST' or path != '/api/ticket':
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # Enable CORS
            },
            'body': json.dumps({'error': 'Not found'})
        }

    # 3. Parse the request body
    try:
        if 'body' in event:
            # If using API Gateway REST API, body is a string
            if event.get('isBase64Encoded', False):
                import base64
                body = base64.b64decode(event['body']).decode('utf-8')
            else:
                body = event['body']
            data = json.loads(body)
        else:
            # For Lambda Function URL, body is already parsed? Actually Function URL provides raw string.
            # Safer to check type.
            data = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON body'})
        }

    # 4. Process the ticket (same logic as before)
    ticket_id = data.get('ticketId')
    if not ticket_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing ticketId'})
        }

    phone_number = data.get('phoneNumber', '')
    send_ticket_email(data, ticket_id)

    bolna_response = None
    if phone_number:
        formatted_phone = phone_number if phone_number.startswith('+') else f"+91{phone_number}"
        bolna_response = trigger_bolna_call(formatted_phone)

    # 5. Return success response
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',   # Enable CORS
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        'body': json.dumps({
            'status': 'received',
            'ticket_id': ticket_id,
            'bolna_response': bolna_response,
            'received': data
        })
    }


"""
In test case we can use belwo as input json 

{
  "version": "2.0",
  "routeKey": "POST /api/ticket",
  "rawPath": "/api/ticket",
  "rawQueryString": "",
  "headers": {
    "content-type": "application/json"
  },
  "requestContext": {
    "http": {
      "method": "POST",
      "path": "/api/ticket",
      "protocol": "HTTP/1.1"
    }
  },
  "body": "{\"ticketId\":\"TEST123\",\"customerName\":\"John Doe\",\"phoneNumber\":\"9824085934\",\"email\":\"ranakrunal2704@gmail.com\",\"wifiId\":\"270485\",\"city\":\"Mumbai\",\"selectedIssues\":[\"No connectivity\"],\"otherIssueDetails\":\"\",\"remarks\":\"Test ticket\"}",
  "isBase64Encoded": false
}

"""