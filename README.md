# au-admin-dashboard

Vue 3 + TypeScript + Vite + Tailwind CSS v4 + ECharts + AntV G6 (placeholder). Dark “Ops Center” shell for **agentUniverse** admin APIs (Phase 2).

## Dev

```bash
npm install
npm run dev
```

## Backend API

Overview cards call `GET /api/v1/admin/resources/summary` (agentUniverse `admin_blueprint`).

Vite dev server proxies `/api` → `http://127.0.0.1:8000` (adjust `vite.config.ts` if your gateway port differs). Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` only if you call the API without the proxy.

---

Vue 3 `<script setup>`: [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup).
