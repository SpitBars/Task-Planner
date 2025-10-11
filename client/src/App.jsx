import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import AgendaColumn from './components/AgendaColumn.jsx';
import SyncControls from './components/SyncControls.jsx';
import { useAuth } from './hooks/useAuth.js';
import './styles/app.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function sortEvents(events) {
  return [...events].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
}

export default function App() {
  const { auth, loading: authLoading, refreshAuth } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const groupedEvents = useMemo(() => {
    const groups = new Map();
    for (const event of sortEvents(events)) {
      const dayKey = dayjs(event.start).format('YYYY-MM-DD');
      if (!groups.has(dayKey)) {
        groups.set(dayKey, []);
      }
      groups.get(dayKey).push(event);
    }
    return groups;
  }, [events]);

  useEffect(() => {
    if (auth.authenticated) {
      fetchEvents();
    } else {
      setEvents([]);
    }
  }, [auth.authenticated]);

  useEffect(() => {
    if (window.location.pathname.startsWith('/auth/')) {
      if (window.location.pathname.endsWith('/error')) {
        setError('Google sign-in failed. Please try again.');
      }
      window.history.replaceState(null, '', '/');
      refreshAuth();
    }
  }, [refreshAuth]);

  async function fetchEvents() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Unable to load events');
      }
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function syncEvents() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/events/sync`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Unable to sync events');
      }
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Failed to sync events');
    } finally {
      setLoading(false);
    }
  }

  async function createQuickEvent(form) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        throw new Error('Unable to create event');
      }
      const data = await response.json();
      setEvents((prev) => sortEvents([...prev.filter((e) => e.id !== data.event.id), data.event]));
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  async function beginLogin() {
    setError('');
    try {
      const response = await fetch(`${API_BASE}/auth/google`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Unable to start Google sign-in');
      }
      const { url } = await response.json();
      window.location.assign(url);
    } catch (err) {
      setError(err.message || 'Unable to start Google sign-in');
    }
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1>Task Planner</h1>
        <SyncControls
          auth={auth}
          onLogin={beginLogin}
          onLogout={async () => {
            try {
              const response = await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
              });
              if (!response.ok && response.status !== 204) {
                throw new Error('Unable to sign out');
              }
            } catch (err) {
              setError(err.message || 'Unable to sign out');
            } finally {
              refreshAuth();
              setEvents([]);
            }
          }}
          onSync={syncEvents}
          onQuickAdd={createQuickEvent}
          syncing={loading}
          disabled={!auth.authenticated || loading}
        />
      </header>
      <main className="content">
        <section className="agenda-wrapper">
          {error && <div className="error-banner">{error}</div>}
          {!auth.authenticated && !authLoading && (
            <div className="empty-state">
              <p>Sign in with Google to import your calendar events.</p>
            </div>
          )}
          {auth.authenticated && (
            <AgendaColumn
              groupedEvents={groupedEvents}
              loading={loading}
            />
          )}
        </section>
      </main>
    </div>
  );
}
