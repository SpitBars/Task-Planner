import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createEvent,
  deleteEvent,
  getEvents,
  syncEventsForUser,
  updateEvent
} from '../services/calendarService.js';
import { requireAuth } from '../utils/requireAuth.js';

const router = express.Router();

const eventsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many event requests, please try again later.'
});

router.use(requireAuth, eventsLimiter);

router.get('/', async (req, res) => {
  try {
    await syncEventsForUser(req.session.userId);
    const events = await getEvents(req.session.userId);
    res.json({ events });
  } catch (error) {
    console.error('Fetch events error', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const events = await syncEventsForUser(req.session.userId);
    res.json({ events });
  } catch (error) {
    console.error('Manual sync error', error);
    res.status(500).json({ error: 'Failed to sync events' });
  }
});

router.post('/', async (req, res) => {
  const { summary, description, start, end, color } = req.body;
  if (!summary || !start || !end) {
    return res.status(400).json({ error: 'summary, start, and end are required' });
  }
  try {
    const event = await createEvent(req.session.userId, {
      summary,
      description,
      start,
      end,
      color
    });
    res.status(201).json({ event });
  } catch (error) {
    console.error('Create event error', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { summary, description, start, end, color } = req.body;
  if (!summary || !start || !end) {
    return res.status(400).json({ error: 'summary, start, and end are required' });
  }
  try {
    const event = await updateEvent(req.session.userId, eventId, {
      summary,
      description,
      start,
      end,
      color
    });
    res.json({ event });
  } catch (error) {
    console.error('Update event error', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/:eventId', async (req, res) => {
  const { eventId } = req.params;
  try {
    await deleteEvent(req.session.userId, eventId);
    res.status(204).end();
  } catch (error) {
    console.error('Delete event error', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
