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
