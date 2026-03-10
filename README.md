# Kryvexis OS Workspace

This package restructures Kryvexis OS into a safer long-term layout:

- `frontend/` = Vite + React app shell
- `backend/` = Express API starter
- root `package.json` = workspace scripts so you can install once from the root

## Fresh start

Delete the old mixed-root app files, then extract this ZIP into the empty folder.

## Install

```bash
npm install
```

## Run both frontend and backend

```bash
npm run dev
```

## Run only frontend

```bash
npm run dev:frontend
```

## Run only backend

```bash
npm run dev:backend
```

## Build frontend

```bash
npm run build
```

## Vercel note

For Vercel, set the project **Root Directory** to `frontend`.
The backend can be kept local for now or deployed separately later.
