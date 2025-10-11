# Task Planner

A lightweight task planning board built with React and Vite. Tasks are organised by weekday columns, include subtasks, time estimates, and custom tags. Drag and drop tasks to reorder them within a day or move them to a new column. All data is persisted locally via `localStorage`.

## Features

- 🗂️ **Weekly board** with dedicated columns for each day.
- ✅ **Task management** with completion tracking, descriptions, and per-task time estimates.
- 🧩 **Subtask editor** to add, edit, estimate, and mark sub items complete.
- 🏷️ **Tag manager** to create and customise coloured tags and assign them to tasks.
- 🧲 **Drag-and-drop** interactions for reordering and moving tasks between days.
- 💾 **Local persistence** using the browser's `localStorage` to keep data between sessions.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Available scripts

- `npm run dev` – start the Vite development server.
- `npm run build` – create an optimised production build.
- `npm run preview` – preview the production build locally.

> **Note:** This repository does not bundle dependencies. Run `npm install` before starting the dev server.

## Project structure

```
├── src
│   ├── components      # UI building blocks (board, modals, editors)
│   ├── hooks           # Reusable hooks (future expansion)
│   ├── lib             # Lightweight drag-and-drop adapter
│   ├── state           # React context for tasks, tags, and persistence
│   ├── styles          # Global styles
│   └── utils           # Utility helpers
├── index.html          # Vite entry point
├── package.json
└── vite.config.ts
```

## Drag and drop implementation

The app uses a small in-house abstraction that mimics the `react-beautiful-dnd` API, making it easy to swap in the official library in a connected environment. The custom adapter relies on native HTML5 drag events and provides the minimal pieces needed by the board: `DragDropContext`, `Droppable`, `Draggable`, and the standard `DropResult` payload.

## Persistence

All task, subtask, and tag data is stored in `localStorage` under the key `task-planner-state-v1`. Clearing browser storage resets the planner to its default empty state.
A full-stack demo that showcases an AI-assisted task planning experience. The backend proxies OpenAI's Chat Completions API while the frontend surfaces AI guidance widgets inside an interactive planner UI.
Full-stack task planner that syncs with Google Calendar.

## Prerequisites

- Node.js 18+
- An OpenAI API key stored in a `.env` file at the project root (optional for UI testing, required to reach the real API)

```
OPENAI_API_KEY=sk-...
CLIENT_ORIGIN=http://localhost:5173
```

## Getting started

Install dependencies for the server and client:

```
cd server && npm install
cd ../client && npm install
```

### Running the development stack

Start the backend proxy:

```
cd server
npm run start
```

In a separate terminal, start the frontend:

```
cd client
npm run dev
```

The Vite dev server runs at [http://localhost:5173](http://localhost:5173) and proxies API calls to the Express server on port `4000`.

### Available API endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/ai/daily-suggestions` | POST | Generates daily focus suggestions using current tasks, notes, and preferences. |
| `/api/ai/smart-schedule` | POST | Returns a JSON schedule tailored to working hours, focus blocks, and tasks. |
| `/api/ai/recap` | POST | Produces an end-of-day recap with wins, lessons, and plans for tomorrow. |
| `/health` | GET | Health check used to confirm the proxy is online. |

Each AI endpoint accepts a `userId` (defaults to `"default"`) and keeps a short conversation history to provide richer responses without leaking API credentials to the browser.

### Frontend highlights

- Sidebar widgets render AI responses for suggestions, scheduling, and recaps.
- Editing a task or updating preferences triggers new AI suggestions.
- A modal allows users to send contextual prompts about the currently selected task.

## Production build

Create an optimised build of the frontend:

```
cd client
npm run build
```

The generated assets will be located in `client/dist/`.
- Google Cloud project with OAuth 2.0 credentials (web application)

## Setup

1. Copy `server/.env.example` to `server/.env` and fill in credentials.
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Start the backend and frontend in separate terminals:
   ```bash
   npm run dev:server
   npm run dev:client
   ```

The frontend runs on <http://localhost:5173> and proxies API requests to the backend on <http://localhost:4000>.
A structured planner that supports daily and weekly rituals. The application offers dedicated views for daily planning, shutdown, highlights, as well as weekly planning and reviews. Each workspace surfaces curated prompts, checklists, task summaries, and the ability to import/export tasks as JSON or CSV.

## Getting started

```bash
npm install
npm run dev
```

The development server defaults to [http://localhost:5173](http://localhost:5173).

## Available scripts

- `npm run dev` – start a Vite development server.
- `npm run build` – type-check and build the production bundle.
- `npm run preview` – preview the production build locally.

## Task import/export

Use the **Export JSON** or **Export CSV** buttons to download the current task state in either format. Use **Import tasks** to upload a `.json` or `.csv` file that conforms to the schema below.

### Task schema

| Field        | Type      | Notes                                           |
| ------------ | --------- | ----------------------------------------------- |
| `id`         | `string`  | Unique identifier                               |
| `module`     | `string`  | One of `daily-planning`, `daily-shutdown`, `daily-highlights`, `weekly-planning`, `weekly-review` |
| `title`      | `string`  | Required title                                  |
| `description`| `string`  | Optional supporting detail                      |
| `dueDate`    | `string`  | ISO date string (optional)                      |
| `status`     | `string`  | `not-started`, `in-progress`, or `done`          |
| `highlighted`| `boolean` | Marks the task as a highlight                    |
