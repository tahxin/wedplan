# WedPlan — Wedding Planning Platform (Client)

WedPlan is a role-based wedding planning web application where couples can discover wedding services, submit booking inquiries, and manage their reservations. Wedding vendors can publish catalog offerings, respond to client inquiries, and upgrade to Premium through Stripe Checkout. Administrators moderate users, approve or reject published services, and monitor transactions.

- **Live Application:** [https://wedplan-ice.vercel.app/](https://wedplan-ice.vercel.app/)
- **Live Backend API:** [https://wedplan-backend.vercel.app/](https://wedplan-backend.vercel.app/)
- **Client Repository:** [https://github.com/tahxin/wedplan](https://github.com/tahxin/wedplan)
- **Server Repository:** [https://github.com/tahxin/wedplan-backend](https://github.com/tahxin/wedplan-backend)

---

## Important Features

### Customer
- **Service Discovery**: Filter wedding packages by 6 core categories (Photography & Videography, Venues, Florists, Catering, Makeup & Styling, Fashion), location, and keyword.
- **Price Sorting**: Real-time sorting by price ascending and descending.
- **Package Inquiries**: Request direct wedding bookings with event date, venue location, and custom vision notes.
- **Inquiry Management**: Dedicated dashboard tracking request statuses (Pending, Accepted, Declined, Cancelled) with one-click cancellation for pending inquiries.

### Vendor
- **Showcase Management**: Publish and manage wedding packages with multi-photo uploads via ImgBB.
- **Availability Toggle**: Pause or reactivate listings at any time.
- **Client Requests**: Review incoming customer requests with one-click Accept or Decline actions.
- **Subscription Tiers**: Free tier (maximum 3 active services) and Premium Partner tier ($20 one-time via Stripe Checkout) for unlimited service listings.

### Admin
- **User Moderation**: Filter registered accounts by role, inspect profiles, and block/unblock users (instantly invalidating active sessions).
- **Service Queue**: Review pending vendor submissions to approve or reject them before public listing.
- **Transaction Logs**: Read-only ledger of platform subscription payments.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript
- **Styling & UI**: Tailwind CSS v4, Lucide React, Sonner (Toasts)
- **Authentication**: Better Auth with MongoDB adapter & Google OAuth
- **Image Hosting**: ImgBB API
- **Deployment**: Vercel

---

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
IMAGEBB_API_KEY=
STRIPE_API_KEY=
```

---

## Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tahxin/wedplan.git
   cd wedplan
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and populate with your credentials.

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

Open [http://localhost:3000](http://localhost:3000) to view the client.
