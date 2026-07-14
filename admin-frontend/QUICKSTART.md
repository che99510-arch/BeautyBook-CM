# Quickstart (5 minutes)

This guide helps you spin up the BeautyBook Admin Dashboard using only mock data.
No backend or database is required; everything runs locally.

## 1. Clone & Install

```bash
git clone <repo-url> beautybook-admin-frontend
cd beautybook-admin-frontend
npm install
```

## 2. Run in Development

```bash
npm run dev
```

Point your browser to `http://localhost:3000` and you should see the login page.

## 3. Login with Demo Credentials

Use the built-in mock account:

- **Email:** `admin@beautybook.com`
- **Password:** `password123`

After signing in you can navigate through all sections; all data is generated
by the mock service (`services/api.ts`).

## 4. Build for Production

```bash
npm run build
npm start
```

The production build also uses the same mock data, so you can deploy this
without any backend dependency.

## Notes

- To switch to a real API later, replace the contents of `services/api.ts` with
  a client that performs real HTTP requests and adjust `.env` configuration
  accordingly.
- Mock fixtures live at the top of `services/api.ts` and can be edited for
  custom data during development.
