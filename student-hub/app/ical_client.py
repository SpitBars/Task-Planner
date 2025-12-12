import os
from datetime import datetime
from typing import List, Optional

import requests
from dateutil import tz
from icalendar import Calendar

from .models import AcademicItem


def _ical_urls() -> List[str]:
    raw = os.getenv("WU_ICAL_URLS", "")
    urls = [u.strip() for u in raw.split(",") if u.strip()]
    return urls


def list_ical_items(from_dt: Optional[datetime], to_dt: Optional[datetime]) -> List[AcademicItem]:
    items: List[AcademicItem] = []
    for url in _ical_urls():
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        cal = Calendar.from_ical(r.text)

        for comp in cal.walk():
            if comp.name != "VEVENT":
                continue
            uid = str(comp.get("UID", ""))
            summary = str(comp.get("SUMMARY", "(no title)"))
            dtstart = comp.get("DTSTART").dt
            dtend = comp.get("DTEND").dt if comp.get("DTEND") else None
            if isinstance(dtstart, datetime):
                start = dtstart
            else:
                start = datetime(dtstart.year, dtstart.month, dtstart.day, tzinfo=tz.UTC)
            if dtend:
                if isinstance(dtend, datetime):
                    end = dtend
                else:
                    end = datetime(dtend.year, dtend.month, dtend.day, tzinfo=tz.UTC)
            else:
                end = None

            if from_dt and start < from_dt:
                continue
            if to_dt and start > to_dt:
                continue

            items.append(
                AcademicItem(
                    id=f"wu_ical:{uid}",
                    title=summary,
                    type="timetable",
                    start=start,
                    end=end,
                    source="wu_vvz",
                    url=url,
                    status=None,
                    metadata={},
                )
            )
    return items
