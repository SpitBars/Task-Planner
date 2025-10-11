import { useEffect, useMemo, useState } from 'react';
import { AIGuidanceSidebar } from './components/AIGuidanceSidebar.jsx';
import { AIAssistantModal } from './components/AIAssistantModal.jsx';
import { useAiAssistant } from './hooks/useAiAssistant.js';

const initialTasks = [
  {
    id: 'task-1',
    title: 'Prepare quarterly planning deck',
    dueDate: '2024-06-30',
    priority: 'High',
    status: 'In progress',
    estimate: 180,
    notes: 'Need slides for product roadmap and hiring plan.'
  },
  {
    id: 'task-2',
    title: 'Customer success sync',
    dueDate: '2024-06-20',
    priority: 'Medium',
    status: 'Not started',
    estimate: 60,
    notes: 'Gather feedback from the beta cohort.'
  },
];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTask, setEditingTask] = useState(initialTasks[0]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [preferences, setPreferences] = useState({ workStyle: 'Deep work mornings', breaks: 'Short walks' });
  const [accomplishments, setAccomplishments] = useState(['Closed onboarding checklist for ACME Co.']);
  const [reflections, setReflections] = useState('Need more time for strategic work.');

  const { responses, loading, error, getDailySuggestions, getSmartSchedule, getRecap } = useAiAssistant({ userId: 'demo-user' });

  useEffect(() => {
    if (!tasks.length) return;
    const timer = setTimeout(() => {
      getDailySuggestions({ tasks, preferences });
    }, 600);
    return () => clearTimeout(timer);
  }, [tasks, preferences, getDailySuggestions]);

  const taskMap = useMemo(() => Object.fromEntries(tasks.map((task) => [task.id, task])), [tasks]);

  const handleTaskChange = (field, value) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              [field]: value,
            }
          : task
      )
    );
    setEditingTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: 'New task',
      dueDate: '',
      priority: 'Low',
      status: 'Not started',
      estimate: 30,
      notes: '',
    };
    setTasks((prev) => [...prev, newTask]);
    setEditingTask(newTask);
  };

  const handleSelectTask = (taskId) => {
    setEditingTask(taskMap[taskId]);
  };

  const triggerRequest = async (key) => {
    if (key === 'dailySuggestions') {
      await getDailySuggestions({ tasks, preferences });
    } else if (key === 'smartSchedule') {
      await getSmartSchedule({
        tasks,
        dayStart: '09:00',
        dayEnd: '17:00',
        focusBlocks: [
          { start: '09:00', end: '11:00', label: 'Deep work' },
          { start: '13:00', end: '15:00', label: 'Collaboration window' },
        ],
      });
    } else if (key === 'recap') {
      await getRecap({ tasks, accomplishments, reflections });
    }
  };

  const handleTaskPrompt = async ({ prompt }) => {
    await getDailySuggestions({
      tasks,
      preferences,
      notes: `Focus specifically on task: ${editingTask.title}. ${prompt}`,
    });
    setModalOpen(false);
  };

  const handleAccomplishmentChange = (value) => {
    setAccomplishments(value.split('\n').filter(Boolean));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <h1 className="app-title">Task Planner</h1>
            <p className="app-subtitle">Plan your day with AI assisted routines.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleAddTask}>
            Add task
          </button>
        </div>
      </header>

      <main className="app-layout">
        <section className="tasks-panel">
          <div className="panel">
            <header className="panel__header">
              <div>
                <h2 className="panel__title">Tasks</h2>
                <p className="panel__subtitle">Select a task to edit and request AI support.</p>
              </div>
              <button type="button" className="btn btn-outline" onClick={() => triggerRequest('smartSchedule')}>
                Generate schedule
              </button>
            </header>
            <div className="tasks-grid">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className={`task-card ${editingTask?.id === task.id ? 'task-card--active' : ''}`}
                  onClick={() => handleSelectTask(task.id)}
                >
                  <h3 className="task-card__title">{task.title}</h3>
                  <dl className="task-card__meta">
                    <div>
                      <dt>Status</dt>
                      <dd>{task.status || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt>Priority</dt>
                      <dd>{task.priority || 'None'}</dd>
                    </div>
                    <div>
                      <dt>Due</dt>
                      <dd>{task.dueDate || 'No date'}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>

          {editingTask && (
            <div className="panel">
              <header className="panel__header">
                <h2 className="panel__title">Task details</h2>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(true)}>
                  Ask AI about this task
                </button>
              </header>
              <div className="panel__content">
                <div className="field-group">
                  <label className="field-label">Title</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(event) => handleTaskChange('title', event.target.value)}
                    className="field-input"
                  />
                </div>
                <div className="field-grid">
                  <div className="field-group">
                    <label className="field-label">Due date</label>
                    <input
                      type="date"
                      value={editingTask.dueDate}
                      onChange={(event) => handleTaskChange('dueDate', event.target.value)}
                      className="field-input"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Priority</label>
                    <select
                      value={editingTask.priority}
                      onChange={(event) => handleTaskChange('priority', event.target.value)}
                      className="field-input"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Status</label>
                    <select
                      value={editingTask.status}
                      onChange={(event) => handleTaskChange('status', event.target.value)}
                      className="field-input"
                    >
                      <option value="Not started">Not started</option>
                      <option value="In progress">In progress</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Estimate (mins)</label>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={editingTask.estimate}
                      onChange={(event) => handleTaskChange('estimate', Number(event.target.value))}
                      className="field-input"
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Notes</label>
                  <textarea
                    value={editingTask.notes}
                    onChange={(event) => handleTaskChange('notes', event.target.value)}
                    rows={4}
                    className="field-input"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="panel">
            <header className="panel__header">
              <h2 className="panel__title">Daily reflection</h2>
              <button type="button" className="btn btn-ghost" onClick={() => triggerRequest('recap')}>
                Generate recap
              </button>
            </header>
            <div className="panel__content">
              <div className="field-group">
                <label className="field-label">Work preferences</label>
                <input
                  type="text"
                  value={preferences.workStyle}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, workStyle: event.target.value }))}
                  className="field-input"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Break ideas</label>
                <input
                  type="text"
                  value={preferences.breaks}
                  onChange={(event) => setPreferences((prev) => ({ ...prev, breaks: event.target.value }))}
                  className="field-input"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Accomplishments</label>
                <textarea
                  value={accomplishments.join('\n')}
                  onChange={(event) => handleAccomplishmentChange(event.target.value)}
                  rows={3}
                  className="field-input"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Reflections</label>
                <textarea
                  value={reflections}
                  onChange={(event) => setReflections(event.target.value)}
                  rows={3}
                  className="field-input"
                />
              </div>
            </div>
          </div>
        </section>

        <AIGuidanceSidebar responses={responses} loading={loading} onRequest={triggerRequest} />
      </main>

      {error && <div className="toast toast--error">{error}</div>}

      <AIAssistantModal open={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleTaskPrompt} task={editingTask} />
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
