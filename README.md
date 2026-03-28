# baby-tracker

Simple baby tracking MVP built with **React + Vite + TypeScript + Tailwind CSS**.

## Features

- Dashboard with today summary:
  - Total sleep
  - Number of feeds
  - Number of stools
  - Last wake window
- Quick Add buttons:
  - Add Sleep
  - Add Feed
  - Add Stool
  - Add Tummy Time
- Timeline grouped by day with clean event cards
- Calendar date picker to browse/log entries for any day
- Remove button on timeline entries for quick correction
- Local storage persistence using unified event model
- Sample events seeded on first load
- AI Assistant sidebar (mock) using `analyzeBabyData(events)`
- Utility `calculateWakeWindows(events)`
- Dark mode toggle (persisted in localStorage)

## Event model

```ts
{
  id,
  type,
  timestamp,
  duration,
  metadata,
}
```

## Setup

```bash
npm install
npm run dev
```

## GitHub Actions + GitHub Pages deployment

This project includes a workflow at:

`/.github/workflows/deploy-pages.yml`

### One-time setup

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### How it works

- On every push to `main`, GitHub Actions will:
  - install dependencies with `npm ci`
  - run `npm run build`
  - deploy the `dist/` artifact to GitHub Pages

The Vite config automatically sets the correct base path in CI using `GITHUB_REPOSITORY`.

## Optional backend scaffold

An optional Express + SQLite scaffold is included in `/server`.

### Run backend

```bash
cd server
npm install
npm run dev
```

Or from project root after server deps are installed:

```bash
npm run dev:server
```
