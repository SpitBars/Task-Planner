import React from 'react';
import dayjs from 'dayjs';

const palette = {
  default: '#3b82f6',
  '1': '#7986cb',
  '2': '#33b679',
  '3': '#8e24aa',
  '4': '#e67c73',
  '5': '#f6c026',
  '6': '#f5511d',
  '7': '#039be5',
  '8': '#616161',
  '9': '#3f51b5',
  '10': '#0b8043',
  '11': '#d60000'
};

function EventCard({ event }) {
  const color = palette[event.color] || palette.default;
  const start = dayjs(event.start).format('MMM D, HH:mm');
  const end = dayjs(event.end).format('HH:mm');

  return (
    <article className="event-card" style={{ borderLeftColor: color }}>
      <header>
        <h3>{event.summary}</h3>
        <span className="time-range">
          {start} – {end}
        </span>
      </header>
      {event.description && <p>{event.description}</p>}
      <footer>
        <span className="event-dot" style={{ backgroundColor: color }} aria-hidden="true" />
        <a href={event.html_link} target="_blank" rel="noreferrer">
          Open in Google Calendar
        </a>
      </footer>
    </article>
  );
}

export default function AgendaColumn({ groupedEvents, loading }) {
  if (loading) {
    return (
      <div className="agenda-loading">
        <span className="spinner" aria-hidden />
        <p>Syncing your calendar…</p>
      </div>
    );
  }

  if (!groupedEvents || groupedEvents.size === 0) {
    return (
      <div className="empty-state">
        <p>No events available yet. Try syncing your Google Calendar.</p>
      </div>
    );
  }

  return (
    <div className="agenda">
      {[...groupedEvents.entries()].map(([date, events]) => (
        <section key={date} className="agenda-day">
          <header>
            <h2>{dayjs(date).format('dddd, MMM D')}</h2>
          </header>
          <div className="events">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
