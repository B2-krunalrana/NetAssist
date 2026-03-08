# ACT Fibernet Support Ticket System

This application is a robust support ticket management system designed for ACT Fibernet customers. It allows users to raise technical support tickets quickly and efficiently.

## Features

- **Support Ticket Form**: Collects customer name, phone number, WiFi ID, city, and issue description.
- **Validation**: Ensures WiFi ID is exactly 6 digits and phone number is 10 digits.
- **Success Screen**: Provides immediate feedback with a generated Ticket ID.
- **Dashboard Redirection**: Seamlessly redirects users to the official ACT Fibernet dashboard.
- **Logging**: Integrated console logging for all user interactions to facilitate future trigger implementations.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **React**: UI library.
- **Tailwind CSS**: Styling.
- **Lucide React**: Iconography.
- **Motion**: Fluid animations and transitions.

## Attribution

- **Created by**: Krunal Rana
- **Powered by**: [bolna.ai](https://bolna.ai/)

## Development

The application logs all form values and button clicks to the console. This is intended to help developers easily add webhooks or API triggers for backend integration.

To see the logs, open your browser's Developer Tools (F12) and check the Console tab.

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/act-fibernet-support.git
   cd act-fibernet-support
   ```

2. **Frontend setup**
   - Install Node dependencies:
     ```bash
     npm install          # or yarn install
     ```
   - Run the development server:
     ```bash
     npm run dev          # starts Vite on http://localhost:3000
     ```

3. **Backend (Python) setup**
   - Create a virtual environment and install requirements:
     ```bash
     cd backend
     python -m venv .venv
     .\.venv\Scripts\activate      # Windows PowerShell/CLI
     pip install -r requirements.txt
     ```
   - Start the local API server:
     ```bash
     python app.py          # listens on http://localhost:5000
     ```

   Currently the backend is a simple Flask application with a single
   endpoint (`POST /api/ticket`) that forwards the incoming JSON payload
   to a `lambda_function.handler` routine.  That handler logs the received
   data and returns an acknowledgement.  Later this can be replaced by an
   actual AWS/Azure/GCP Lambda or any other processing logic.

4. **Workflow**
   - Fill out the support ticket form in the React frontend. On submit the
     form data is logged to the browser console *and* sent as a JSON
     request to `http://localhost:5000/api/ticket`.
   - The Python backend prints all received values to the terminal via the
     `lambda_function` module (see `backend/lambda_function.py`).
   - After successful submission the UI shows a mock ticket ID and a
     redirect button to the ACT dashboard.


## Architecture Overview

This repository is structured as a simple full‑stack prototype:

- **`src/`** – React + TypeScript + Tailwind frontend.  Handles user input,
  form validation, geolocation and a lightweight workflow.
- **`backend/`** – Python service acting as a placeholder for an
  eventual serverless lambda or API gateway.  It currently uses Flask to
  expose one endpoint and delegate processing to a `lambda_function`.

The two parts communicate over HTTP (`fetch` from the frontend to the
backend).  In a production environment the backend could be deployed as a
cloud lambda, and the URL in the frontend would be reconfigured
environmentally.

Feel free to extend the backend handler to persist data, trigger other
services, or validate input.  Any form field that is added in
`App.tsx` will automatically be forwarded to the Python code thanks to
`JSON.stringify(formData)`.

---

*Keep the above documentation up‑to‑date when adding more endpoints or
migrating to a real serverless architecture.*
