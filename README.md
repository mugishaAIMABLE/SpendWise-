# SpendWise

A personal expense-tracking web app built with Vue 3 and Vite. Track spending, view summaries, and manage expenses with role-based access (user and admin).

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite** – build tool and dev server
- **Vue Router** – client-side routing
- **Pinia** – state management (auth, expenses)

## Features

- **Authentication** – Login and register; protected routes
- **Dashboard** – Add, view, and manage expenses with categories
- **Summary** – Overview of spending and totals
- **Admin dashboard** – Admin-only area for managing the app
- **Role-based access** – Different views for regular users and admins

## Project Setup

### Prerequisites

- Node.js (v18+ recommended)

### Install dependencies

```bash
npm install
```

### Development

Run the dev server with hot reload:

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Project Structure

- `src/views/` – Page components (Dashboard, Summary, Login, Register, AdminDashboard)
- `src/components/` – Reusable UI (ExpenseForm, ExpenseTable)
- `src/stores/` – Pinia stores (authStore, expenseStore)
- `src/composables/` – Shared logic (useAuth, useExpenses)
- `src/router/` – Route definitions and navigation guards

## License

Private project.
