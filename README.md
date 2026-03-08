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
