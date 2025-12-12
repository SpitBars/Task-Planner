import os
import secrets
from datetime import datetime, date, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import PlainTextResponse, RedirectResponse

from .canvas_client import list_upcoming_assignments
from .db import init_db, kv_get, kv_set
from .google_calendar import create_event, delete_event, get_flow, list_events, patch_event, save_token
from .ical_client import list_ical_items
from .models import (
    AcademicItem,
    CalendarEvent,
    CalendarEventCreate,
    CalendarEventPatch,
    DailyOverview,
    NotionTask,
    NotionTaskCreate,
    NotionTaskPatch,
)
from .notion_tasks import create_task, list_tasks, patch_task

load_dotenv()
init_db()

app = FastAPI(title="Student Productivity Hub", version="1.0.0")


def require_api_key(x_api_key: str = Header(default="", alias="X-API-Key")):
    expected = os.getenv("HUB_API_KEY", "")
    if not expected:
        raise RuntimeError("HUB_API_KEY missing")
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")


@app.get("/health", response_class=PlainTextResponse)
def health():
    return "ok"


@app.get("/privacy", response_class=PlainTextResponse)
def privacy():
    with open("static/privacy.md", "r", encoding="utf-8") as f:
        return f.read()


@app.get("/terms", response_class=PlainTextResponse)
def terms():
    with open("static/terms.md", "r", encoding="utf-8") as f:
        return f.read()


@app.get("/connect/google/start")
def connect_google_start():
    flow = get_flow()
    state = secrets.token_urlsafe(24)
    kv_set("google_oauth_state", state)
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    return RedirectResponse(auth_url)


@app.get("/connect/google/callback")
def connect_google_callback(code: str, state: str):
    expected = kv_get("google_oauth_state")
    if not expected or state != expected:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    flow = get_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    save_token(creds)
    return PlainTextResponse("Google Calendar connected! You can close this tab and use the GPT.")


@app.get("/calendar/events", response_model=list[CalendarEvent], dependencies=[Depends(require_api_key)])
def calendar_list(
    timeMin: Optional[datetime] = None, timeMax: Optional[datetime] = None, maxResults: int = 20
):
    return list_events(timeMin, timeMax, maxResults)


@app.post(
    "/calendar/events",
    response_model=CalendarEvent,
    status_code=201,
    dependencies=[Depends(require_api_key)],
)
def calendar_create(body: CalendarEventCreate):
    return create_event(body)


@app.patch(
    "/calendar/events/{eventId}", response_model=CalendarEvent, dependencies=[Depends(require_api_key)]
)
def calendar_patch(eventId: str, body: CalendarEventPatch):
    return patch_event(eventId, body)


@app.delete("/calendar/events/{eventId}", status_code=204, dependencies=[Depends(require_api_key)])
def calendar_delete(eventId: str):
    delete_event(eventId)
    return None


@app.get("/notion/tasks", response_model=list[NotionTask], dependencies=[Depends(require_api_key)])
def notion_list(
    status: Optional[str] = None, dueBefore: Optional[datetime] = None, dueAfter: Optional[datetime] = None, limit: int = 50
):
    return list_tasks(status=status, due_before=dueBefore, due_after=dueAfter, limit=limit)


@app.post(
    "/notion/tasks",
    response_model=NotionTask,
    status_code=201,
    dependencies=[Depends(require_api_key)],
)
def notion_create(body: NotionTaskCreate):
    return create_task(body)


@app.patch(
    "/notion/tasks/{taskId}", response_model=NotionTask, dependencies=[Depends(require_api_key)]
)
def notion_patch(taskId: str, body: NotionTaskPatch):
    return patch_task(taskId, body)


@app.get(
    "/wu/canvas/academic-items",
    response_model=list[AcademicItem],
    dependencies=[Depends(require_api_key)],
)
def canvas_items(dueBefore: Optional[datetime] = None, dueAfter: Optional[datetime] = None, limit: int = 50):
    return list_upcoming_assignments(due_after=dueAfter, due_before=dueBefore, limit=limit)


@app.get(
    "/wu/vvz/academic-items",
    response_model=list[AcademicItem],
    dependencies=[Depends(require_api_key)],
)
def vvz_items(from_: Optional[datetime] = None, to: Optional[datetime] = None):
    return list_ical_items(from_dt=from_, to_dt=to)


@app.get("/overview/daily", response_model=DailyOverview, dependencies=[Depends(require_api_key)])
def overview_daily(dateStr: str):
    d = date.fromisoformat(dateStr)
    start = datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    cal = []
    try:
        cal = list_events(start, end, max_results=50)
    except Exception:
        cal = []

    notion = []
    try:
        notion = list_tasks(status=None, due_before=end, due_after=start, limit=100)
    except Exception:
        notion = []

    acad = []
    try:
        acad.extend(list_upcoming_assignments(due_after=start, due_before=end, limit=100))
    except Exception:
        pass
    try:
        acad.extend(list_ical_items(from_dt=start, to_dt=end))
    except Exception:
        pass

    summary = f"{len(cal)} calendar events, {len(notion)} Notion tasks, {len(acad)} academic items."
    return DailyOverview(
        date=d, calendarEvents=cal, notionTasks=notion, academicItems=acad, summaryText=summary
    )


@app.post("/webhooks/samsung/reminders", dependencies=[Depends(require_api_key)])
def webhook_samsung(payload: dict):
    if os.getenv("ALLOW_WEBHOOKS", "false").lower() != "true":
        raise HTTPException(status_code=403, detail="Webhooks disabled")
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Missing title")
    try:
        due = payload.get("dueDate")
        est = payload.get("estMinutes")
        course = payload.get("courseCode")
        body = NotionTaskCreate(title=title, dueDate=due, estMinutes=est, courseCode=course)
        task = create_task(body)
        return {"ok": True, "createdIn": "notion", "taskId": task.id}
    except Exception:
        return {"ok": True, "createdIn": "none"}
