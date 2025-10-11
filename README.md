# Task Planner

This repository contains a scaffolded React (Vite) application in [`app/`](app/) that renders a three-column planning workspace. The layout matches the provided reference with a sidebar, multi-day planner columns, and a right-hand agenda panel. Static sample data is provided so the UI can be explored without a backend.

## Getting started

```bash
cd app
npm install
npm run dev
```

The development server starts on <http://localhost:5173>. Update the sample data or components under `app/src/` as needed.

## Project structure

- `app/src/routes` – Application routing and page layouts.
- `app/src/components` – Reusable UI components for day columns, tasks, and agenda cards.
- `app/src/data` – Static sample content that mirrors the reference design.
- `app/tailwind.config.js` – Tailwind CSS configuration and theme extensions.

The day columns expose `data-dropzone="true"` placeholders so drag-and-drop interactions can be integrated later.
