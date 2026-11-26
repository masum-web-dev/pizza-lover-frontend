# PizzaHub — Pizza Ordering & Delivery Platform (Frontend)

A role-based full-stack pizza ordering and delivery platform where customers order pizzas, vendors manage menus and orders, and admins oversee the platform.

## Live & Repository Links
- **Live Website:** https://pizza-lover-frontend.vercel.app
- **Backend API:** https://pizza-lover-backend.vercel.app
- **Client Repo:** `https://github.com/YOUR_USERNAME/pizzahub-frontend`
- **Server Repo:** `https://github.com/YOUR_USERNAME/pizzahub-backend`

## Technologies & Packages Used
- **Core:** Next.js (App Router), React, TypeScript
- **UI & Styling:** Tailwind CSS, ShadCN UI, Lucide React
- **Animations & Alerts:** Framer Motion, React Hot Toast
- **Authentication:** Better Auth (`better-auth`, `@better-auth/mongo-adapter`) with Email/Password & Google OAuth
- **Third-Party Integrations:** ImgBB API (menu image upload), Stripe Checkout (vendor subscription)

## What's Inside (Project Highlights)
- **3 Role-Based Dashboards:** Separate sidebar dashboards for **Customer**, **Vendor**, and **Admin**.
- **Menu & Ordering:** Search, category/location filters, price sorting, item details, and order placement/tracking.
- **Vendor Tools:** Menu CRUD (Free plan up to 3 active items, unlimited on Premium), order accept/reject, and Stripe subscription upgrade.
- **Admin Controls:** User management, menu item approval/rejection, and transaction logs.

## Environment Variables
```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
BETTER_AUTH_DB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_IMGBB_API_KEY=
