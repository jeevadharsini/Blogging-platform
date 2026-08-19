# BlogSpace — Full-Stack Blogging Platform (PostgreSQL edition)

A complete, working blogging platform built with vanilla HTML/CSS/JavaScript on the
frontend and Node.js + Express + **PostgreSQL** on the backend. Posts are persisted in a
real relational database — nothing is stored in `localStorage` or lost on refresh.

Built to satisfy **Internship Task 5: Blogging Platform** — create, edit, publish,
search, and filter blog posts with a responsive, modern UI.

> This project originally used MongoDB. It was switched to PostgreSQL, which connects
> over a plain TCP address instead of DNS SRV lookups — avoiding the ISP/DNS issues
> some networks have with `mongodb+srv://` connection strings.

---

## Features

- Create, edit, delete, and publish blog posts
- View all posts on a searchable, filterable home page
- View a single post on its own page
- Live search by title, author, or category
- Category filtering (Technology, Education, Lifestyle, Travel, Programming, Other)
- Client-side form validation with inline error messages
- Loading states and success/error messages for every action
- Delete confirmation dialog
- Fully responsive: desktop, tablet, and mobile (with a hamburger menu)
- Posts persist permanently in PostgreSQL
- Seed script with 3 ready-made sample posts
- Table is created automatically on first run — no manual SQL needed
- Single Express server serves both the API and the frontend (simple deployment)

---

## Technologies Used

**Frontend:** HTML5, CSS3, Vanilla JavaScript (fetch API)
**Backend:** Node.js, Express.js
**Database:** PostgreSQL (via the `pg` driver, raw parameterized SQL — no ORM)
**Other:** dotenv (env vars), cors

---

## Folder Structure

```
blogging-platform/
│
├── backend/
│   ├── server.js              # Express app entry point, serves API + frontend
│   ├── db.js                   # PostgreSQL connection pool + auto schema setup
│   ├── schema.sql               # Table definition (posts) + updated_at trigger
│   ├── seed.js                  # Inserts 3 sample posts into PostgreSQL
│   ├── routes/
│   │   └── postRoutes.js       # /api/posts routes
│   └── controllers/
│       └── postController.js   # Route handler logic (CRUD, raw SQL)
│
├── frontend/
│   ├── index.html              # Home page: grid, search, filter
│   ├── create.html             # Create post form
│   ├── edit.html                # Edit post form
│   ├── post.html                # Single post view
│   ├── about.html               # About page
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js               # Home page logic + shared nav
│       ├── create.js
│       ├── edit.js
│       └── post.js
│
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

---

## Step 1 — Install dependencies

Open the project folder in your terminal (VS Code terminal works fine) and run:

```bash
npm install
```

This installs Express, `pg` (the PostgreSQL driver), cors, dotenv, and nodemon.

---

## Step 2 — PostgreSQL setup

You have two easy options. Pick whichever is simpler for you.

### Option A — Local PostgreSQL (fully offline, no signup)

1. Download and install PostgreSQL from [postgresql.org/download](https://www.postgresql.org/download/) (choose Windows). During setup, set a password for the `postgres` user and remember it.
2. Open **pgAdmin** (installed alongside Postgres) or the `psql` command line, and create a database:
   ```sql
   CREATE DATABASE blogspace;
   ```
3. In the project root, copy `.env.example` to a new file named **`.env`** and set:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/blogspace
   PORT=5000
   ```
   Replace `YOUR_PASSWORD` with the password you set during installation.

You do **not** need to manually run `schema.sql` — the server creates the `posts` table automatically the first time it starts.

### Option B — Hosted PostgreSQL (Render, Neon, or Supabase — free tiers available)

1. Create a free Postgres database on [Render](https://render.com) (New + → PostgreSQL), [Neon](https://neon.tech), or [Supabase](https://supabase.com).
2. Copy the connection string it gives you (often called "External Database URL" or "Connection string"). It looks like:
   ```
   postgresql://user:password@host:5432/dbname
   ```
3. Paste it into your `.env` file as `DATABASE_URL`.

Hosted Postgres connects over a normal port (5432), so there's no DNS SRV lookup involved — this avoids the earlier MongoDB Atlas connectivity issue entirely.

---

## Step 3 — Run locally (Windows / VS Code terminal)

```bash
npm run dev
```

This starts the server with nodemon on `http://localhost:5000`. You should see:

```
PostgreSQL connected successfully
Database schema is ready
Server running on http://localhost:5000
```

Open `http://localhost:5000` in your browser — the frontend is served by the same server.

**Optional — load sample posts:**

```bash
npm run seed
```

This clears existing posts and inserts 3 sample posts (Web Development, Java Programming, Artificial Intelligence).

---

## Step 4 — Test checklist

- [ ] **Create**: Go to "Create Post", fill the form, click Publish → redirected to home, new post appears
- [ ] **Read**: Click "Read More" on any post → full post page loads correctly
- [ ] **Edit**: Click the edit icon on a card → form is pre-filled → change something → Update → change reflects on home page
- [ ] **Delete**: Click the delete icon → confirm in the dialog → post disappears and a success message shows
- [ ] **Search**: Type part of a title, author, or category in the search bar → results update
- [ ] **Filter**: Click a category chip → only matching posts show
- [ ] **Refresh**: Reload the browser → all posts are still there (proves PostgreSQL persistence)
- [ ] **Mobile**: Resize the browser (or open dev tools device mode) → hamburger menu appears and works, cards stack in one column, no horizontal scroll
- [ ] **Validation**: Try submitting the create form empty → inline error messages appear
- [ ] **Empty state**: Delete/search until no posts match → friendly empty-state message appears

---

## API Endpoints

| Method | Endpoint          | Description                          |
|--------|-------------------|---------------------------------------|
| GET    | `/api/posts`      | Get all posts (supports `?search=` and `?category=`) |
| GET    | `/api/posts/:id`  | Get a single post by ID              |
| POST   | `/api/posts`      | Create a new post                    |
| PUT    | `/api/posts/:id`  | Update an existing post              |
| DELETE | `/api/posts/:id`  | Delete a post                        |

All responses follow the shape: `{ success: boolean, data / message }`.

---

## Step 5 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: BlogSpace blogging platform (PostgreSQL)"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

(Create an empty repository on GitHub first, then use the URL it gives you.)

---

## Step 6 — Deploy on Render

1. In your Render dashboard, click **New +** → **PostgreSQL**, give it a name, and create it. Once ready, copy its **Internal Database URL** (for use by a service in the same Render project) or **External Database URL** (works from anywhere).
2. Click **New +** → **Web Service** → select your GitHub repo.
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Under **Environment Variables**, add:
   - `DATABASE_URL` = the connection string from step 1
   - `PORT` = `5000`
5. Click **Create Web Service**. Render will build and deploy automatically, and the `posts` table will be created on first boot.
6. Once deployed, your site (frontend + API together) is live at the Render URL Render gives you — no separate frontend hosting needed, since Express serves both.

---

## Screenshots

_Add screenshots here after running the project locally:_

- Home page (desktop)
- Home page (mobile)
- Create post form
- Individual post page
- Edit post form

---

## Future Improvements

- User authentication (login/signup) so only the author can edit/delete their posts
- Pagination or infinite scroll for large numbers of posts
- Image upload (instead of image URL) using a service like Cloudinary
- Rich text editor for post content
- Comments on posts
- Tags in addition to categories
- Dark mode toggle

---

## Notes for Explaining This Project in an Interview

- **Architecture**: Simple 3-tier setup — vanilla JS frontend talks to an Express REST API, which talks to PostgreSQL using parameterized SQL queries (no ORM), so every query is visible and easy to reason about.
- **Why no framework**: Keeps the JS transparent and easy to explain line-by-line — every `fetch()` call and DOM update is visible, not abstracted by a framework.
- **Why PostgreSQL over MongoDB**: Blog posts are naturally tabular/relational data with a fixed shape, which fits SQL well. It also connects over a standard TCP port instead of relying on DNS SRV lookups, which some networks block.
- **Persistence**: Data lives in a real Postgres database, so it survives refreshes, browser changes, and different devices.
- **Validation**: Done twice — client-side (`create.js`/`edit.js`) for instant feedback, and server-side (controller + a `CHECK` constraint on `category` in the schema) so the API can never be sent bad data even if someone bypasses the UI.
- **SQL injection protection**: Every query uses parameterized placeholders (`$1`, `$2`, …) instead of string concatenation, so user input can never be interpreted as SQL code.
- **Error handling**: Every API call is wrapped in try/catch; the controller distinguishes between validation errors (400), not-found errors (404), and server errors (500).
- **Deployment simplicity**: `server.js` serves the `frontend/` folder as static files, so one Render service hosts everything — no CORS issues between separate frontend/backend deployments.
