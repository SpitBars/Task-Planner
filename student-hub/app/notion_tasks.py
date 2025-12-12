import os
from datetime import datetime
from typing import List, Optional

from notion_client import Client

from .models import NotionTask, NotionTaskCreate, NotionTaskPatch


def _client() -> Client:
    token = os.getenv("NOTION_TOKEN", "")
    if not token:
        raise RuntimeError("NOTION_TOKEN missing")
    return Client(auth=token)


def _db_id() -> str:
    db = os.getenv("NOTION_DATABASE_ID", "")
    if not db:
        raise RuntimeError("NOTION_DATABASE_ID missing")
    return db


def _props():
    return {
        "title": os.getenv("NOTION_PROP_TITLE", "Name"),
        "status": os.getenv("NOTION_PROP_STATUS", "Status"),
        "due": os.getenv("NOTION_PROP_DUE", "Due"),
        "est": os.getenv("NOTION_PROP_EST_MIN", "Est (min)"),
        "course": os.getenv("NOTION_PROP_COURSE", "Course"),
    }


def _extract_text_title(page: dict, prop_name: str) -> str:
    prop = page["properties"].get(prop_name, {})
    title = prop.get("title", [])
    return "".join([t.get("plain_text", "") for t in title]) if title else "(no title)"


def _extract_select(page: dict, prop_name: str) -> str:
    prop = page["properties"].get(prop_name, {})
    sel = prop.get("select")
    return sel.get("name", "Todo") if sel else "Todo"


def _extract_date(page: dict, prop_name: str) -> Optional[datetime]:
    prop = page["properties"].get(prop_name, {})
    d = prop.get("date")
    if not d or not d.get("start"):
        return None
    s = d["start"]
    if "T" in s:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    return datetime.fromisoformat(s + "T00:00:00+00:00")


def _extract_number(page: dict, prop_name: str) -> Optional[int]:
    prop = page["properties"].get(prop_name, {})
    n = prop.get("number")
    return int(n) if n is not None else None


def _extract_richtext(page: dict, prop_name: str) -> Optional[str]:
    prop = page["properties"].get(prop_name, {})
    rt = prop.get("rich_text", [])
    if not rt:
        return None
    return "".join([t.get("plain_text", "") for t in rt])


def list_tasks(
    status: Optional[str] = None,
    due_before: Optional[datetime] = None,
    due_after: Optional[datetime] = None,
    limit: int = 50,
) -> List[NotionTask]:
    c = _client()
    db = _db_id()
    p = _props()

    filters = []
    if status:
        filters.append({"property": p["status"], "select": {"equals": status}})
    if due_before:
        filters.append({"property": p["due"], "date": {"before": due_before.isoformat()}})
    if due_after:
        filters.append({"property": p["due"], "date": {"after": due_after.isoformat()}})

    q = {"database_id": db, "page_size": min(max(limit, 1), 100)}
    if filters:
        q["filter"] = {"and": filters} if len(filters) > 1 else filters[0]

    resp = c.databases.query(**q)
    tasks: List[NotionTask] = []
    for page in resp.get("results", []):
        tasks.append(
            NotionTask(
                id=page["id"],
                title=_extract_text_title(page, p["title"]),
                status=_extract_select(page, p["status"]),
                dueDate=_extract_date(page, p["due"]),
                estMinutes=_extract_number(page, p["est"]),
                courseCode=_extract_richtext(page, p["course"]),
                metadata={"url": page.get("url")},
            )
        )
    return tasks


def create_task(body: NotionTaskCreate) -> NotionTask:
    c = _client()
    db = _db_id()
    p = _props()

    props = {
        p["title"]: {"title": [{"text": {"content": body.title}}]},
        p["status"]: {"select": {"name": body.status}},
    }
    if body.dueDate:
        props[p["due"]] = {"date": {"start": body.dueDate.isoformat()}}
    if body.estMinutes is not None:
        props[p["est"]] = {"number": int(body.estMinutes)}
    if body.courseCode:
        props[p["course"]] = {"rich_text": [{"text": {"content": body.courseCode}}]}

    page = c.pages.create(parent={"database_id": db}, properties=props)
    return NotionTask(
        id=page["id"],
        title=body.title,
        status=body.status,
        dueDate=body.dueDate,
        estMinutes=body.estMinutes,
        courseCode=body.courseCode,
        metadata={"url": page.get("url")},
    )


def patch_task(task_id: str, body: NotionTaskPatch) -> NotionTask:
    c = _client()
    p = _props()

    props = {}
    if body.title is not None:
        props[p["title"]] = {"title": [{"text": {"content": body.title}}]}
    if body.status is not None:
        props[p["status"]] = {"select": {"name": body.status}}
    if body.dueDate is not None:
        props[p["due"]] = {"date": {"start": body.dueDate.isoformat()}}
    if body.estMinutes is not None:
        props[p["est"]] = {"number": int(body.estMinutes)}
    if body.courseCode is not None:
        props[p["course"]] = {"rich_text": [{"text": {"content": body.courseCode}}]}

    updated = c.pages.update(page_id=task_id, properties=props)
    title = _extract_text_title(updated, p["title"])
    status = _extract_select(updated, p["status"])
    due = _extract_date(updated, p["due"])
    est = _extract_number(updated, p["est"])
    course = _extract_richtext(updated, p["course"])
    return NotionTask(
        id=task_id,
        title=title,
        status=status,
        dueDate=due,
        estMinutes=est,
        courseCode=course,
        metadata={"url": updated.get("url")},
    )
