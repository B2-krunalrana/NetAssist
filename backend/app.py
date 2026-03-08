from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Any, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
# allow cross‑origin requests from the frontend development server
CORS(app)


def send_ticket_email(ticket_data: Dict[str, Any], ticket_id: str):
    """Send a professional HTML email with ticket details."""
    # SMTP configuration (replace with your actual settings)
    SMTP_SERVER = 'smtp.gmail.com'  # or your SMTP server
    SMTP_PORT = 587
    SENDER_EMAIL = 'work.krunalrana@gmail.com'  # replace
    SENDER_PASSWORD = 'xxx xxx xxx xxx'  # replace with app password
    RECEIVER_EMAIL = ticket_data.get('email', 'user@example.com')

    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'ACT Fibernet Support Ticket #{ticket_id}'
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECEIVER_EMAIL

    # HTML content with clean white theme and branding
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

    # Attach HTML
    part = MIMEText(html, 'html')
    msg.attach(part)

    try:
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        server.quit()
        print(f"Email sent successfully to {RECEIVER_EMAIL}")
    except Exception as e:
        print(f"Failed to send email: {e}")


def handler(event: Dict[str, Any]) -> Dict[str, Any]:
    """Process an incoming event (ticket form data).

    The function logs the contents, sends an email with ticket details,
    and returns the ticket ID.
    """
    print("\n--- lambda_function.handler called ---")
    print(event)
    print("--- end of event ---\n")

    # Get ticket ID from event
    ticket_id = event['ticketId']

    # Send email with ticket details
    send_ticket_email(event, ticket_id)

    # Return ticket ID and status
    return {"status": "received", "ticket_id": ticket_id, "received": event}


@app.route("/api/ticket", methods=["POST"])
def ticket():
    """Receive ticket data from the frontend and forward to the lambda handler."""
    data = request.get_json(force=True)
    result = handler(data)
    return jsonify(result)


if __name__ == "__main__":
    # listen on all interfaces for network access
    app.run(host="0.0.0.0", port=5000, debug=True)
