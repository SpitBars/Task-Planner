import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const storePath = path.join(dataDir, 'store.json');

let store = {
  users: {},
  tokens: {},
  events: {}
};

function load() {
  if (fs.existsSync(storePath)) {
    try {
      const raw = fs.readFileSync(storePath, 'utf8');
      store = { ...store, ...JSON.parse(raw) };
    } catch (error) {
      console.error('Failed to load store, continuing with empty store', error);
    }
  }
}

function persist() {
  const tmpPath = `${storePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2));
  fs.renameSync(tmpPath, storePath);
}

load();

export function getUserByEmail(email) {
  return Object.values(store.users).find((user) => user.email === email) || null;
}

export function upsertUser(user) {
  store.users[user.id] = {
    id: user.id,
    email: user.email,
    display_name: user.display_name || user.name || ''
  };
  persist();
  return store.users[user.id];
}

export function updateUser(userId, updates) {
  if (!store.users[userId]) return null;
  store.users[userId] = { ...store.users[userId], ...updates };
  persist();
  return store.users[userId];
}

export function saveTokens(userId, tokenPayload) {
  store.tokens[userId] = tokenPayload;
  persist();
}

export function getTokens(userId) {
  return store.tokens[userId] || null;
}

export function setEventsForUser(userId, events) {
  store.events[userId] = {};
  for (const event of events) {
    store.events[userId][event.id] = event;
  }
  persist();
}

export function getEventsForUser(userId) {
  const bucket = store.events[userId] || {};
  return Object.values(bucket).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
}

export function saveEventForUser(userId, event) {
  if (!store.events[userId]) {
    store.events[userId] = {};
  }
  store.events[userId][event.id] = event;
  persist();
}

export function deleteEventForUser(userId, eventId) {
  if (store.events[userId]) {
    delete store.events[userId][eventId];
    persist();
  }
}
