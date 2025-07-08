# StreamlineCorp Web App

This README guides you through the installation and setup of the StreamlineCorp web application, built with Next.js, React, and PostgreSQL.

---

## Prerequisites

- **Node.js** (v16 or higher) and **npm**
- A running **PostgreSQL** instance with the database schema applied
- Environment variables configured (see below)

---

## Environment Variables

Create a `.env.local` file in the project root with the following entries:

```env
# PostgreSQL connection string
database_url=postgres://<DatabaseUserNameRedacted>:<DatabaseUserPasswordRedacted>@<DatabaseHost/IP>:5432/humanresources

# JWT secret for signing tokens
JWT_SECRET=<your-strong-random-string>
```

---

## Installation

1. **Clone the repository**
   ```bash
   ```

git clone [https://github.com/jack-cros-bie/ase-assignment-2.git](https://github.com/jack-cros-bie/ase-assignment-2.git)

````

2. **Install dependencies**
   ```bash
npm install
````

3. **Install Tailwind CSS**

   The project uses Tailwind for styling. If you need to regenerate the config files:
   ```bash
   ```

npx tailwindcss init -p

````

4. **Run database migrations**

   Ensure your PostgreSQL schema is up to date. For example, using a migration tool or running the SQL scripts:
   ```bash
psql $DATABASE_URL -f ./migrations/init.sql
````

5. **Start the development server**
   ```bash
   ```

npm run dev

````

   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Key npm Packages

| Package                | Purpose                                    |
|------------------------|--------------------------------------------|
| `next`                 | Next.js framework (App Router)             |
| `react` & `react-dom`  | UI components                              |
| `pg`                   | PostgreSQL client                          |
| `bcrypt`               | Password hashing                           |
| `jsonwebtoken`         | JWT token creation & verification          |
| `tailwindcss`          | Utility-first CSS framework                |
| `autoprefixer`         | PostCSS plugin for vendor prefixes         |
| `postcss`              | CSS processor                              |

### Dev Dependencies (TypeScript)

If using TypeScript, also install:

```bash
npm install -D typescript @types/node @types/react @types/bcrypt @types/jsonwebtoken
````

---

## Available Scripts
Cd to your install directory (default /var/www/html)
- `npm run dev` - Starts Next.js in development mode
- `npm run build` - Builds the application for production
- `npm start` - Runs the production build

---

## Folder Structure

```
/streamlinecorp
├─ app/                Application routes & pages
├─ components/         Reusable React components
├─ lib/                Shared utilities (e.g., sqlHandler)
├─ public/             Static assets (media folder)
├─ styles/             Global CSS and Tailwind config
├─ migrations/         Database SQL scripts
├─ .env.local          Environment variables
├─ package.json        npm configuration
└─ README.md           This file
```
