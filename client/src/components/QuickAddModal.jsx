import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

function toLocalInput(date) {
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
}

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function QuickAddModal({ open, onClose, onSubmit }) {
  const defaultTimes = useMemo(() => {
    const start = dayjs().minute(0).second(0);
    const end = start.add(1, 'hour');
    return { start, end };
  }, [open]);

  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState(() => toLocalInput(defaultTimes.start));
  const [end, setEnd] = useState(() => toLocalInput(defaultTimes.end));
  const [color, setColor] = useState('');

  useEffect(() => {
    if (open) {
      setSummary('');
      setDescription('');
      setColor('');
      setStart(toLocalInput(defaultTimes.start));
      setEnd(toLocalInput(defaultTimes.end));
    }
  }, [open, defaultTimes]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!summary.trim()) return;
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    if (!endDate.isAfter(startDate)) {
      return;
    }
    onSubmit({
      summary: summary.trim(),
      description: description.trim(),
      start: { dateTime: startDate.toISOString(), timeZone: timezone },
      end: { dateTime: endDate.toISOString(), timeZone: timezone },
      color: color || undefined
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal" onSubmit={handleSubmit}>
        <header>
          <h2>Quick event</h2>
        </header>
        <label>
          Title
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="grid">
          <label>
            Start
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </label>
          <label>
            End
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Accent color
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            <option value="">Default</option>
            <option value="1">Lavender</option>
            <option value="2">Sage</option>
            <option value="3">Grape</option>
            <option value="4">Flamingo</option>
            <option value="5">Banana</option>
            <option value="6">Tangerine</option>
            <option value="7">Peacock</option>
            <option value="8">Graphite</option>
            <option value="9">Blueberry</option>
            <option value="10">Basil</option>
            <option value="11">Tomato</option>
          </select>
        </label>
        <footer>
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Create
          </button>
        </footer>
      </form>
    </div>
  );
}
