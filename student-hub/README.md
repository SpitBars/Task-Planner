# Student Productivity Hub (Custom GPT backend)

A FastAPI backend that aggregates Google Calendar, Notion tasks, Canvas assignments, and iCal feeds into a single Action endpoint for a Custom GPT. It also exposes privacy/terms pages and an optional webhook to receive Samsung Reminder payloads via phone automation.

## Features

- Google Calendar OAuth (read/write events)
- Notion database tasks (create/read/update)
- Canvas assignments via personal access token
- iCal timetable feeds (multiple URLs)
- Daily overview endpoint combining all sources
- API key protection for GPT Action calls
- Encrypted token storage with SQLite + Fernet

## Quickstart

1. Install Python 3.11+.
2. Copy `.env.example` to `.env` and fill in the values (Google, Notion, Canvas, iCal URLs, `HUB_API_KEY`, `MASTER_KEY`).
3. Generate a Fernet key for `MASTER_KEY`:
   ```bash
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```
4. (For Google) download your OAuth client JSON as `client_secret.json` and place it next to this README.
5. Install dependencies and start the API:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
6. Visit `http://localhost:8000/health` to confirm the server is running.
7. Connect Google Calendar by opening `http://localhost:8000/connect/google/start` in a browser and completing the OAuth flow.

## Docker

Build and run with Docker:
```bash
docker build -t student-hub .
docker run -p 8000:8000 --env-file .env -v $(pwd)/student_hub.sqlite:/app/student_hub.sqlite student-hub
```

## Key Endpoints

- `GET /health` — health check
- `GET /overview/daily?dateStr=YYYY-MM-DD` — aggregated events/tasks/academic items
- `GET/POST/PATCH/DELETE /calendar/events` — Google Calendar CRUD
- `GET/POST/PATCH /notion/tasks` — Notion task CRUD
- `GET /wu/canvas/academic-items` — Canvas upcoming assignments
- `GET /wu/vvz/academic-items` — iCal timetable items
- `POST /webhooks/samsung/reminders` — optional webhook to ingest phone reminders (requires `ALLOW_WEBHOOKS=true`)

## Custom GPT Action setup

Use `X-API-Key` header with your `HUB_API_KEY`. Point the Action to your public domain (via tunnel/hosting) and supply the included OpenAPI schema from the original instructions.

## Notes

- Tokens are encrypted at rest in `student_hub.sqlite` using `MASTER_KEY`.
- All third-party calls stay server-side; the GPT only interacts with this API.
- Use HTTPS and keep your keys secret when exposing the server publicly.
