# BeautyBook CM 💅

**Cameroon's premier beauty booking platform** — connecting clients with top-rated salons across Bamenda, Buea, Douala, Yaounde & Bafoussam.

## Stack

| Layer | Technology |
|---|---|
| Customer Frontend | React 18 + Vite + TypeScript + Tailwind |
| Admin Frontend | Next.js 14 + TypeScript + Tailwind |
| Backend | Django 6 + Django REST Framework |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | Token-based (DRF) + Google OAuth |

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in your values
python manage.py migrate
python manage.py create_admin
python manage.py runserver
```

### Customer Frontend
```bash
npm install
cp .env.local.example .env.local   # add VITE_GOOGLE_CLIENT_ID
npm run dev                         # http://localhost:8080
```

### Admin Frontend
```bash
cd admin-frontend
npm install
cp .env.local.example .env.local
npm run dev                         # http://localhost:3000
```

## PWA

The customer frontend is a Progressive Web App. After `npm run build`:
- Install prompt appears on Android Chrome & Samsung Internet
- iOS: use Safari Share → Add to Home Screen
- Runs in standalone mode (no browser chrome)

## Deployment

- Backend: any server running Python (Railway, Render, VPS)
- Frontend: Vercel / Netlify / static hosting
- Set `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and database in `.env`

## Features

- 🔍 Search salons by service type and city
- 📅 Real-time booking with approve/decline/reschedule workflow
- 💳 Payment gateway ready (MoMo/Flutterwave hooks)
- 🔔 In-app notifications for salon owners and customers
- ⭐ Reviews and testimonials
- 📱 PWA — installable on Android and iOS
- 🎥 Featured salon video advertisements

## License

Private — © 2026 BeautyBook CM. All rights reserved.
