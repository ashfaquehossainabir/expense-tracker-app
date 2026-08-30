# Ledger — Expense Tracker

A full-stack expense tracker: React (Vite) frontend + Express/MongoDB backend, with full CRUD
for both expenses and income, a sidebar of user-defined **tabs** that each keep their own
independent set of income/expense entries, modal-based add/edit/delete flows, JWT
authentication (register/login), and a running Total Balance (income minus expenses). Fully
responsive from desktop down to small mobile screens.

```
expense-tracker/
├── backend/     Express API + Mongoose models (User, Tab, Expense, Income) + JWT auth
└── frontend/    React app (Vite) with login/register pages and protected routes
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set a real JWT_SECRET, and your MongoDB URI if it differs
npm run dev        # nodemon, or `npm start` for a plain node run
```

Set `JWT_SECRET` to a long random string (e.g. `openssl rand -hex 32`). If you leave it unset,
the server falls back to an insecure dev-only value and logs a warning — fine for playing
around locally, not for anything real.

Requires a running MongoDB instance. Either:
- Local: install MongoDB Community Server and leave `MONGO_URI` pointing at
  `mongodb://127.0.0.1:27017/expense-tracker`, or
- Cloud: create a free MongoDB Atlas cluster and paste its connection string into `MONGO_URI`.

The API starts on `http://localhost:5000` by default. Health check: `GET /api/health`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# edit VITE_API_URL if your backend isn't on localhost:5000
npm run dev
```

Opens on `http://localhost:5173`. You'll land on `/login` until you register or log in.

## Tabs

Every income/expense entry belongs to a **tab**. Tabs live in the sidebar and let one account
keep several completely separate registers — e.g. "Personal", "Freelance", "Trip to Japan" —
each with its own entries, totals, and counts. New accounts get a "General" tab automatically;
accounts that existed before this feature get one created (and their existing entries moved
into it) the first time they load the app after upgrading, so nothing is lost.

- Click a tab in the sidebar to switch to it — the summary card, income list, and expense list
  all reload scoped to that tab.
- Hover (or tap, on touch devices) a tab to reveal its **rename** (✎) and **delete** (✕) icons.
  Rename edits in place. Delete asks for confirmation first, since it **permanently removes
  the tab and every expense/income entry filed under it**.
- **+ New Tab** at the bottom of the sidebar adds another one.
- On phones and tablets the sidebar is a slide-in drawer opened with the ☰ button in the
  header; on laptop/desktop screens (≥1024px) it's a fixed column that's always visible.

## API reference

### Auth

| Method | Route             | Auth required | Description                          |
|--------|-------------------|----------------|---------------------------------------|
| POST   | /api/auth/register| No             | Create an account, returns a JWT      |
| POST   | /api/auth/login    | No            | Log in, returns a JWT                 |
| GET    | /api/auth/me       | Yes           | Get the logged-in user's profile      |

Register/login body: `{ "name": "...", "email": "...", "password": "..." }` (name only on register).
Response: `{ "token": "...", "user": { "id", "name", "email" } }`.

### Tabs (all require `Authorization: Bearer <token>`)

| Method | Route          | Description                                                    |
|--------|----------------|------------------------------------------------------------------|
| GET    | /api/tabs      | List the user's tabs, each with `expenseCount`/`incomeCount`     |
| POST   | /api/tabs      | Create a tab — body: `{ "name": "Trip to Japan" }`               |
| PATCH  | /api/tabs/:id  | Rename a tab — body: `{ "name": "New name" }`                    |
| DELETE | /api/tabs/:id  | Delete a tab **and every expense/income filed under it**         |

### Expenses (all require `Authorization: Bearer <token>`)

| Method | Route               | Description                    |
|--------|---------------------|----------------------------------|
| GET    | /api/expenses?tab=:tabId | List the user's expenses, optionally scoped to one tab |
| GET    | /api/expenses/:id   | Get one of the user's expenses     |
| POST   | /api/expenses       | Create an expense for the user     |
| PUT    | /api/expenses/:id   | Update the user's own expense      |
| DELETE | /api/expenses/:id   | Delete the user's own expense      |

Expense shape:

```json
{
  "title": "Grocery run",
  "amount": 42.5,
  "category": "Food",
  "date": "2026-08-10",
  "note": "optional",
  "tab": "<tab id — required when creating>"
}
```

`category` is one of: Food, Transport, Housing, Utilities, Entertainment, Health, Shopping, Other.

### Income (all require `Authorization: Bearer <token>`)

| Method | Route              | Description                       |
|--------|--------------------|-------------------------------------|
| GET    | /api/income?tab=:tabId | List the user's income, optionally scoped to one tab |
| GET    | /api/income/:id     | Get one income entry                |
| POST   | /api/income        | Create an income entry              |
| PUT    | /api/income/:id     | Update the user's own income entry  |
| DELETE | /api/income/:id     | Delete the user's own income entry  |

Income shape:

```json
{
  "title": "August paycheck",
  "amount": 3200,
  "source": "Salary",
  "date": "2026-08-01",
  "note": "optional",
  "tab": "<tab id — required when creating>"
}
```

`source` is one of: Salary, Freelance, Business, Investment, Gift, Other.

## How the UI works

- Visiting the app while logged out redirects to `/login`. New users go to `/register`.
- On successful login/register, a JWT is stored in `localStorage` and attached to every API
  call automatically. If the token expires or is rejected, the app logs the user out and
  returns them to `/login`.
- **Add Income** and **Add Expense** each open their own modal (title, amount,
  category/source, date, note).
- Each row — income or expense — has an edit (✎) and delete (✕) icon. Edit opens the same
  modal pre-filled with that entry's data; delete opens a shared confirmation modal first.
- The top "receipt" card shows **Total Balance** (all income minus all expenses), plus running
  totals for income and expenses separately, calculated live from the current lists.
- **Log out** in the header clears the session and returns to `/login`.

## Notes

- CORS is restricted to `CLIENT_ORIGIN` in `backend/.env` (defaults to the Vite dev server).
- Passwords are hashed with bcrypt before storage; the password field is never returned by the API.
- Every expense **and income entry** is scoped to its owning user at the database query level,
  not just hidden in the UI. Every expense/income is additionally scoped to a tab (`tab` is a
  required, indexed reference on both models), and a tab can only be created for, renamed, or
  deleted by the user who owns it.
- Form validation happens client-side (required fields, password length/match, amount > 0, valid
  date) and again on the server via the Mongoose schemas.
- The app is responsive down to small mobile widths (see the media queries in `index.css`).

