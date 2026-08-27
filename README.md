# Heritage Tales - Storefront

A modern, high-performance e-commerce storefront built with Next.js 14, Tailwind CSS, and a powerful serverless backend.

## Tech Stack & Integrations

This project is fully integrated with top-tier serverless services to handle authentication, payments, emails, and database management.

### 1. Authentication: Clerk
- **Account Used:** `mallamrakeshkumar@gmail.com`
- **Purpose:** Handles secure user authentication, social logins, and guest checkout sessions.
- **Admin Setup:** The admin dashboard is protected via Clerk. The `ADMIN_USER_ID` environment variable is checked to ensure only authorized owners can access `/admin`.

### 2. Payments: Stripe
- **Account Used:** `mallamrakesh@gmail.com`
- **Purpose:** Securely processes credit card payments, calculates totals, and handles webhook events for order fulfillment.
- **Implementation:** Uses Stripe Checkout Sessions for a seamless and highly-converting checkout experience.

### 3. Transactional Emails: Resend
- **Account Used:** `mallamrakeshkumar@gmail.com`
- **Purpose:** Sends order confirmation emails to customers and abandoned cart recovery emails.
- **Templates:** Styled with React Email components.

### 4. Database: Vercel Postgres (Neon)
- **Purpose:** The core relational database storing products, orders, wishlists, reviews, blog posts, and store settings.
- **Management:** Managed directly inside the Vercel dashboard.

### 5. Object Storage: Vercel Blob
- **Purpose:** Stores product images and blog cover photos. 
- **Important:** The Blob Store *must* be configured with **Public** access so that customers can view the images on the storefront.

---

## Environment Variables (.env.local)

To run this project locally, create a `.env.local` file in the root directory and populate it with the following secrets:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ADMIN_USER_ID=user_2...

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Resend Emails
RESEND_API_KEY=re_...

# Vercel Postgres Database
POSTGRES_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## Setup & Deployment

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Database Migrations:**
   After connecting a fresh Postgres database, you must navigate to `http://localhost:3000/api/setup` (or your production URL `https://your-domain.com/api/setup`) to automatically create all the necessary SQL tables (items, orders, wishlists, reviews, etc.).

4. **Production Deployment:**
   The easiest way to deploy this Next.js app is to connect your GitHub repository directly to [Vercel](https://vercel.com/new). Vercel will automatically configure the Postgres and Blob storage addons for you.
