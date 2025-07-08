# StreamlineCorp Web Application

This is the StreamlineCorp web application built with Next.js, React, and PostgreSQL, providing user authentication and management features for their timesheets.

## Prerequisites

- **Node.js** (v16 or later) and **npm** installed.
- A **PostgreSQL** database instance. You should have your connection URL (e.g., `postgres://user:pass@host:port/dbname`).

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jack-cros-bie/ase-assignment-2.git
   cd ase-assignment-2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install and initialize Tailwind CSS** (if not already configured)

   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

## Required npm Packages

### Production dependencies

```bash
npm install next react react-dom pg bcrypt jsonwebtoken
```

- **next**: React framework for production.
- **react** & **react-dom**: UI library.
- **pg**: PostgreSQL client.
- **bcrypt**: Password hashing.
- **jsonwebtoken**: JWT creation & verification.

### Development dependencies

```bash
npm install -D typescript @types/node @types/pg @types/bcrypt @types/jsonwebtoken tailwindcss postcss autoprefixer
```

- **typescript**: Static typing for JS.
- **@types/**: Type declarations for Node, pg, bcrypt, and jsonwebtoken.
- **tailwindcss**, **postcss**, **autoprefixer**: Utility-first CSS framework.

## Environment Variables

Create a `.env.local` file at the project root and add:

```bash
DATABASE_URL=postgres://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_NAME>
JWT_SECRET=<your-jwt-secret>
```

- `DATABASE_URL`: Connection string for your PostgreSQL database.
- `JWT_SECRET`: A strong secret for signing JWTs (e.g., `openssl rand -hex 32`).

## Available npm Scripts

- ``: Start the development server (Webpack HMR).
- ``: Build the production app.
- ``: Run the production build.

