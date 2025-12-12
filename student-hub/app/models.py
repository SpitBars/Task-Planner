from datetime import datetime, date
from typing import Optional, List, Literal, Any, Dict
from pydantic import BaseModel, Field


class CalendarEvent(BaseModel):
    id: str
    summary: str
    description: Optional[str] = None
    start: datetime
    end: datetime
    location: Optional[str] = None
    source: Literal["google"] = "google"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CalendarEventCreate(BaseModel):
    summary: str
    description: Optional[str] = None
    start: datetime
    end: datetime
    location: Optional[str] = None


class CalendarEventPatch(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    location: Optional[str] = None


class NotionTask(BaseModel):
    id: str
    title: str
    status: str
    dueDate: Optional[datetime] = None
    estMinutes: Optional[int] = None
    courseCode: Optional[str] = None
    source: Literal["notion"] = "notion"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class NotionTaskCreate(BaseModel):
    title: str
    status: str = "Todo"
    dueDate: Optional[datetime] = None
    estMinutes: Optional[int] = None
    courseCode: Optional[str] = None
    notes: Optional[str] = None


class NotionTaskPatch(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    dueDate: Optional[datetime] = None
    estMinutes: Optional[int] = None
    courseCode: Optional[str] = None
    notes: Optional[str] = None


class AcademicItem(BaseModel):
    id: str
    title: str
    type: str
    courseCode: Optional[str] = None
    dueDate: Optional[datetime] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    source: str
    url: Optional[str] = None
    status: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DailyOverview(BaseModel):
    date: date
    calendarEvents: List[CalendarEvent] = Field(default_factory=list)
    notionTasks: List[NotionTask] = Field(default_factory=list)
    academicItems: List[AcademicItem] = Field(default_factory=list)
    summaryText: str = ""
