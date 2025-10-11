# Task Planner

Full-stack task planner that syncs with Google Calendar.

## Prerequisites

- Node.js 18+
- Google Cloud project with OAuth 2.0 credentials (web application)

## Setup

1. Copy `server/.env.example` to `server/.env` and fill in credentials.
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Start the backend and frontend in separate terminals:
   ```bash
   npm run dev:server
   npm run dev:client
   ```

The frontend runs on <http://localhost:5173> and proxies API requests to the backend on <http://localhost:4000>.
