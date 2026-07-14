# BeautyBook Admin Dashboard Frontend

A Next.js-based admin dashboard for managing the BeautyBook CM salon marketplace platform.

## Features

- **Dashboard Overview** - Key metrics and platform statistics
- **Salon Management** - View, approve, and suspend partner salons
- **Customer Management** - Monitor customer accounts and activity
- **Bookings** - Track all bookings across the platform
- **Payment Processing** - Manage transactions and releases
- **Dispute Resolution** - Handle customer-salon disputes
- **Advertisement Management** - Manage featured ad slots
- **Analytics & Reports** - Comprehensive platform analytics
- **Admin Settings** - Profile, security, and platform configuration

## Tech Stack

- **Framework:** Next.js 14.0.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Client:** Mock service (no network requests needed)
- **Icons:** Lucide React
- **Authentication:** JWT with js-cookie

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) No backend configuration is required – the app uses built-in mock data for all features.

*All API calls are simulated locally; you can run the dashboard completely offline.*

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── (auth)/                 # Authentication routes
│   ├── login/             # Admin login page
│   └── layout.tsx         # Auth layout wrapper
├── (dashboard)/           # Protected dashboard routes
│   ├── dashboard/         # Main dashboard overview
│   ├── salons/            # Salon management
│   ├── customers/         # Customer management
│   ├── bookings/          # Booking management
│   ├── payments/          # Payment management
│   ├── disputes/          # Dispute resolution
│   ├── advertisements/    # Ad management
│   ├── reports/           # Analytics & reports
│   ├── settings/          # Admin settings
│   └── layout.tsx         # Dashboard layout with sidebar
├── globals.css            # Global styles
└── layout.tsx             # Root layout

components/
├── Sidebar.tsx            # Navigation sidebar
├── Topbar.tsx             # Top navigation bar
└── StatsCard.tsx          # Reusable stats card component

context/
├── AuthContext.tsx        # Zustand auth store + React context

services/
└── api.ts                 # Mock API service (no network calls)

types/
└── index.ts               # TypeScript types and interfaces

middleware.ts             # Route protection middleware
```

## Authentication Flow

1. Admin visits `/login`
2. Enters credentials (email & password)
3. API returns JWT token
4. Token stored in `admin_token` cookie
5. Middleware redirects to `/dashboard` on success
6. Token automatically added to all API requests
7. 401 responses trigger logout and redirect to login

## API Integration

This frontend is deliberately disconnected from any real backend. All network requests are intercepted by a mock service (`services/api.ts`) which returns hard‑coded data and simulates success/failure states. There is no need to run or configure a server – the admin portal works entirely on mock data.

Developers working on a real API can replace the contents of `services/api.ts` with a proper HTTP client later.

## Protected Routes

The following routes are protected and require authentication:

- `/dashboard`
- `/salons`
- `/customers`
- `/bookings`
- `/payments`
- `/disputes`
- `/advertisements`
- `/reports`
- `/settings`

Unauthenticated users are redirected to `/login`.

## Demo Credentials

For testing purposes, use:
- **Email:** admin@beautybook.com
- **Password:** password123

**Note:** These are placeholder credentials. Replace with real authentication in production.

## Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Advanced data visualization with Recharts
- [ ] Bulk actions for salon/customer management
- [ ] Email notifications integration
- [ ] Audit logging for admin actions
- [ ] Role-based access control (RBAC)
- [ ] API request rate limiting
- [ ] Dark/light theme toggle

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/admin

# Production
NEXT_PUBLIC_API_URL=https://api.beautybook.cm/api/admin
```

## Development Guidelines

1. **Components** - Keep components small and reusable
2. **Types** - Always use TypeScript interfaces for API responses
3. **Error Handling** - Display user-friendly error messages
4. **API Calls** - Use the `apiService` singleton for all HTTP requests
5. **State** - Use Zustand for global state (auth, admin data)
6. **Styling** - Follow Tailwind CSS conventions and use the custom color palette

## Color Palette

- **Primary (Purple):** `#6D28D9` / `#7C3AED`
- **Secondary (Gold):** `#F59E0B` / `#D97706`
- **Dark:** `#1F2937` (gray-800), `#0F172A` (slate-900)
- **Light:** `#F3F4F6` (gray-100)

## Troubleshooting

### Login fails
- Verify API endpoint in `.env.local`
- Check backend API is running
- Ensure credentials are correct

### Routes redirect to login
- Clear browser cookies (`admin_token`)
- Check if token is expired
- Verify middleware configuration

### API errors
- Check API server is running
- Verify `NEXT_PUBLIC_API_URL` configuration
- Review browser console for error details

## License

Proprietary - BeautyBook CM 2024
