# AdminHub

Angular 20+ admin dashboard with Signals, RxJS, and a custom SCSS design system. No Tailwind or Bootstrap — just standalone components, reactive forms, and light/dark theme support.

## Screenshots

| Login | Dashboard |
|:-----:|:---------:|
| ![Login](screenshots/Login.png) | ![Dashboard](screenshots/Dashboard.png) |
| **Users** | **Dark Mode** |
| ![Users](screenshots/Users.png) | ![Dark Mode](screenshots/DarkMode.png) |

## Getting Started

```bash
cd admin-dashboard
npm install
ng serve
```

Open http://localhost:4200. Use any email and password (min 6 chars), then pick Admin or Editor role.

**Build for production:** `ng build`

## What's Included

- **Auth** — Mock login with role selection, guards, session in localStorage
- **Dashboard** — Stats cards, SVG revenue chart, recent activity feed
- **Users** — Full CRUD with search. Editors can't delete users.
- **Products** — CRUD with pagination and category filter. Data stored in localStorage.
- **Settings** — Theme toggle, preferences, saved to localStorage

Tech: Angular 20, standalone components, Signals for state, RxJS for async, OnPush everywhere, `takeUntilDestroyed` for subscriptions. Custom UI components (button, card, table, modal, input, toast, spinner).

## Project Structure

```
src/app/
├── core/          # services, guards, interceptors
├── features/      # auth, dashboard, users, products, settings (lazy-loaded)
├── layout/        # shell, sidebar, navbar
├── shared/        # reusable UI components
├── models/
└── utils/
```

## Deployment

**Vercel / Netlify:** Run `ng build`, deploy the `dist/admin-dashboard/browser` folder, add SPA rewrite: `/*` → `/index.html`.

**Docker:**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/dist/admin-dashboard/browser /usr/share/nginx/html
EXPOSE 80
```

Add `try_files $uri $uri/ /index.html;` to your nginx config for client-side routing.
