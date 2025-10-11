import { google } from 'googleapis';
import { getAuthorizedClient } from '../googleAuth.js';
import {
  deleteEventForUser,
  getEventsForUser,
  saveEventForUser,
  setEventsForUser
} from '../storage.js';

function mapEventData(event) {
  return {
    id: event.id,
    summary: event.summary || 'Untitled event',
    description: event.description || '',
    start: event.start?.dateTime || event.start?.date || null,
    end: event.end?.dateTime || event.end?.date || null,
    updated: event.updated,
    html_link: event.htmlLink,
    color: event.colorId || null
  };
}

export async function syncEventsForUser(userId) {
  const auth = await getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  const { data } = await calendar.events.list({
    calendarId: 'primary',
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
    timeMin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  });

  const events = data.items || [];
  const mapped = events.map(mapEventData);
  setEventsForUser(userId, mapped);
  return mapped;
}

export async function getEvents(userId) {
  return getEventsForUser(userId);
}

export async function createEvent(userId, payload) {
  const auth = await getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: payload.summary,
      description: payload.description,
      start: payload.start,
      end: payload.end,
      colorId: payload.color || undefined
    }
  });
  const mapped = mapEventData(data);
  saveEventForUser(userId, mapped);
  return mapped;
}

export async function updateEvent(userId, eventId, payload) {
  const auth = await getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  const { data } = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: {
      summary: payload.summary,
      description: payload.description,
      start: payload.start,
      end: payload.end,
      colorId: payload.color || undefined
    }
  });
  const mapped = mapEventData(data);
  saveEventForUser(userId, mapped);
  return mapped;
}

export async function deleteEvent(userId, eventId) {
  const auth = await getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId: 'primary', eventId });
  deleteEventForUser(userId, eventId);
}
