# Task Planner

Full-stack task planner that syncs with Google Calendar.

## Prerequisites

- Node.js 18+
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
