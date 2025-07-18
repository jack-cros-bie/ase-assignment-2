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
The following command can be run to install all packages in one go:
```bash
npm install -D typescript @types/node @types/pg @types/bcrypt @types/jsonwebtoken tailwindcss postcss autoprefixer swr next-themes
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

- `npm run dev`: Start the development server (Webpack HMR).
- `npm run build`: Build the production app.
- `npm start`: Run the production build.

# Automated Tests

We’ve added comprehensive Jest‑based tests for our key API routes. All tests live alongside your code under the `__tests__/` folder and mock external dependencies (`bcrypt`, `jsonwebtoken`, and our `query` function) to isolate logic.

---

### Test Suites

| Test File                                                                                     | Description                                                                                               |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| `__tests__/api/admin/create-user-route.test.ts`                                               | **Create User API** (`POST /api/admin/create-user`)
- 400 on missing username/password
- 200 on success (password hashing + DB insert)
- 500 on DB failure |
| `__tests__/api/auth/login-route.test.ts`                                                      | **Login API** (`POST /api/auth/login`)
- 401 on nonexistent user
- 401 on bad password
- 200 on success (JWT issuance + cookie set) |
| `__tests__/api/employees/information-route.test.ts`                                           | **Employee Info API** (`GET /api/employees/information?userid=…`)
- 400 if `userid` missing or invalid
- 404 if no record found
- 200 on success (returns the row)
- 500 on DB error |

---

### Setup & Run Instructions

1. **Install dev dependencies**
   ```bash
   npm install --save-dev jest ts-jest @types/jest
   ```
2. **Ensure Jest is configured** in your `jest.config.js`:
   ```js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' }
   };
   ```
3. **Add test scripts** to your `package.json`:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:unit": "jest --coverage"
     }
   }
   ```
4. **Run all tests**:
   ```bash
   npm test
   ```
5. **Run a single suite** (e.g. the login tests):
   ```bash
   npx jest __tests__/api/auth/login-route.test.ts
   ```
6. **View coverage report** (after running `npm run test:unit`):
   - Open `coverage/lcov-report/index.html` in your browser for detailed metrics.

---

With these tests in place, you’ll catch regressions early, verify all edge‑cases, and have confidence that your API routes behave as expected.

