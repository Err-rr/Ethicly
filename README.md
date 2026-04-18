# Ethicly

Ethicly is a React web app for AI fairness audits. It lets teams upload a CSV, preview records, and review fairness scores, bias detection results, and group comparison charts.

## Tech Stack

- React with functional components and hooks
- React Router
- react-dropzone
- Recharts
- Tailwind CSS
- Vite

## Getting Started

```bash
npm install
npm start
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

## CSV Tips

Ethicly looks for group-like columns such as `group`, `gender`, `race`, `segment`, or `region`, and outcome-like columns such as `outcome`, `approved`, `prediction`, `label`, `score`, or `target`.

If those names are not present, it falls back to the first column for groups and the last column for outcomes.

## Production Build

```bash
npm run build
```

The compiled app is emitted to `dist/`.
