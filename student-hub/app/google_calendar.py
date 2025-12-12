import json
import os
from datetime import datetime, timezone
from typing import List, Optional

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

from .crypto import encrypt_text, decrypt_text
from .db import kv_get, kv_set
from .models import CalendarEvent, CalendarEventCreate, CalendarEventPatch

TOKEN_KEY = "google_token"


def _scopes() -> List[str]:
    raw = os.getenv("GOOGLE_SCOPES", "")
    return [s.strip() for s in raw.split() if s.strip()]


def get_flow() -> Flow:
    client_secrets = os.getenv("GOOGLE_CLIENT_SECRETS", "client_secret.json")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/connect/google/callback")
    flow = Flow.from_client_secrets_file(client_secrets, scopes=_scopes())
    flow.redirect_uri = redirect_uri
    return flow


def save_token(creds: Credentials) -> None:
    data = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes,
    }
    kv_set(TOKEN_KEY, encrypt_text(json.dumps(data)))


def load_credentials() -> Optional[Credentials]:
    enc = kv_get(TOKEN_KEY)
    if not enc:
        return None
    data = json.loads(decrypt_text(enc))
    creds = Credentials(**data)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        save_token(creds)
    return creds


def _svc():
    creds = load_credentials()
    if not creds:
        raise RuntimeError("Google not connected. Visit /connect/google/start in a browser.")
    return build("calendar", "v3", credentials=creds)


def list_events(time_min: Optional[datetime], time_max: Optional[datetime], max_results: int) -> List[CalendarEvent]:
    svc = _svc()
    cal_id = os.getenv("GOOGLE_CALENDAR_ID", "primary")

    params = {"calendarId": cal_id, "singleEvents": True, "orderBy": "startTime", "maxResults": max_results}
    if time_min:
        params["timeMin"] = time_min.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    if time_max:
        params["timeMax"] = time_max.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    resp = svc.events().list(**params).execute()
    items = []
    for e in resp.get("items", []):
        start = e.get("start", {}).get("dateTime") or e.get("start", {}).get("date")
        end = e.get("end", {}).get("dateTime") or e.get("end", {}).get("date")
        if "T" not in start:
            start_dt = datetime.fromisoformat(start).replace(tzinfo=timezone.utc)
            end_dt = datetime.fromisoformat(end).replace(tzinfo=timezone.utc)
        else:
            start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
            end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))
        items.append(
            CalendarEvent(
                id=e["id"],
                summary=e.get("summary", "(no title)"),
                description=e.get("description"),
                start=start_dt,
                end=end_dt,
                location=e.get("location"),
                metadata={"htmlLink": e.get("htmlLink")},
            )
        )
    return items


def create_event(body: CalendarEventCreate) -> CalendarEvent:
    svc = _svc()
    cal_id = os.getenv("GOOGLE_CALENDAR_ID", "primary")
    ev = {
        "summary": body.summary,
        "description": body.description,
        "location": body.location,
        "start": {"dateTime": body.start.isoformat()},
        "end": {"dateTime": body.end.isoformat()},
    }
    created = svc.events().insert(calendarId=cal_id, body=ev).execute()
    return CalendarEvent(
        id=created["id"],
        summary=created.get("summary", body.summary),
        description=created.get("description"),
        start=datetime.fromisoformat(created["start"]["dateTime"].replace("Z", "+00:00")),
        end=datetime.fromisoformat(created["end"]["dateTime"].replace("Z", "+00:00")),
        location=created.get("location"),
        metadata={"htmlLink": created.get("htmlLink")},
    )


def patch_event(event_id: str, body: CalendarEventPatch) -> CalendarEvent:
    svc = _svc()
    cal_id = os.getenv("GOOGLE_CALENDAR_ID", "primary")
    ev = svc.events().get(calendarId=cal_id, eventId=event_id).execute()
    if body.summary is not None:
        ev["summary"] = body.summary
    if body.description is not None:
        ev["description"] = body.description
    if body.location is not None:
        ev["location"] = body.location
    if body.start is not None:
        ev["start"] = {"dateTime": body.start.isoformat()}
    if body.end is not None:
        ev["end"] = {"dateTime": body.end.isoformat()}
    updated = svc.events().update(calendarId=cal_id, eventId=event_id, body=ev).execute()
    return CalendarEvent(
        id=updated["id"],
        summary=updated.get("summary", "(no title)"),
        description=updated.get("description"),
        start=datetime.fromisoformat(updated["start"]["dateTime"].replace("Z", "+00:00")),
        end=datetime.fromisoformat(updated["end"]["dateTime"].replace("Z", "+00:00")),
        location=updated.get("location"),
        metadata={"htmlLink": updated.get("htmlLink")},
    )


def delete_event(event_id: str) -> None:
    svc = _svc()
    cal_id = os.getenv("GOOGLE_CALENDAR_ID", "primary")
    svc.events().delete(calendarId=cal_id, eventId=event_id).execute()
