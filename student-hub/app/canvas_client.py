import os
from datetime import datetime
from typing import List, Optional

import requests

from .models import AcademicItem


def _base() -> str:
    b = os.getenv("CANVAS_BASE_URL", "").rstrip("/")
    if not b:
        raise RuntimeError("CANVAS_BASE_URL missing")
    return b


def _headers() -> dict:
    t = os.getenv("CANVAS_TOKEN", "")
    if not t:
        raise RuntimeError("CANVAS_TOKEN missing")
    return {"Authorization": f"Bearer {t}"}


def _get(path: str, params: dict | None = None):
    url = _base() + path
    r = requests.get(url, headers=_headers(), params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def list_upcoming_assignments(
    due_after: Optional[datetime], due_before: Optional[datetime], limit: int = 50
) -> List[AcademicItem]:
    courses = _get("/api/v1/courses", params={"enrollment_state": "active", "per_page": 100})
    items: List[AcademicItem] = []

    for c in courses:
        course_id = c.get("id")
        course_code = c.get("course_code") or c.get("name")
        if not course_id:
            continue

        assigns = _get(
            f"/api/v1/courses/{course_id}/assignments", params={"bucket": "upcoming", "per_page": 50}
        )
        for a in assigns:
            due_at = a.get("due_at")
            due_dt = datetime.fromisoformat(due_at.replace("Z", "+00:00")) if due_at else None
            if due_dt and due_after and due_dt < due_after:
                continue
            if due_dt and due_before and due_dt > due_before:
                continue

            items.append(
                AcademicItem(
                    id=f"canvas_assignment:{a.get('id')}",
                    title=a.get("name", "(no title)"),
                    type="assignment",
                    courseCode=str(course_code) if course_code else None,
                    dueDate=due_dt,
                    source="wu_canvas",
                    url=a.get("html_url"),
                    status="open",
                    metadata={"points_possible": a.get("points_possible")},
                )
            )

    return items[: max(1, limit)]
